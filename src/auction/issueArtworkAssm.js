import {txFee} from "./consts";
import {addForKey, addNotification, getTxUrl, getWalletAddress, isYoroi, showMsg} from "./helpers";
import {colTuple, encodeByteArray, encodeHex, encodeNum, longToCurrency} from "./serializer";
import {Serializer} from "@coinbarn/ergo-ts/dist/serializer";
import {follow, p2s} from "./assembler";
import {Address} from "@coinbarn/ergo-ts/dist/models/address";
import moment from "moment";
import {yoroiSendFunds} from "./yoroiUtils";
import {currentBlock} from "./explorer";

const template = `{
    val outputOk = {
      val assetType = OUTPUTS(0).R7[Coll[Byte]].get
      val artworkHash = OUTPUTS(0).R8[Coll[Byte]].get
      val issued = OUTPUTS(0).tokens.getOrElse(0, (INPUTS(0).id, 0L))
      INPUTS(0).id == issued._1 && issued._2 == $issueAmountL &&
      OUTPUTS(0).value == $ergAmountL &&
      OUTPUTS(0).propositionBytes == fromBase64("$toAddress") &&
      assetType == fromBase64("$artworkType") &&
      artworkHash == fromBase64("$curHash")
    }
    val returnFunds = {
        val total = INPUTS.fold(0L, {(x:Long, b:Box) => x + b.value}) - 4000000
        OUTPUTS(0).value >= total && OUTPUTS(0).propositionBytes == fromBase64("$userAddress")
    }
    sigmaProp(OUTPUTS.size == 2 && (outputOk || returnFunds) && HEIGHT < $timestampL)
}`;

export async function issueArtwork(name, description, quantity, royalty, hash, assetType, url, cover, modal) {
    let outBox = {
        ergValue: txFee,
        amount: quantity,
        address: getWalletAddress(),
        name: name,
        description: description,
        decimals: 0,
        registers: {
            R7: await encodeByteArray(assetType),
            R8: await encodeHex(hash),
        }
    };

    outBox.registers.R9 = await encodeHex(Serializer.stringToHex(url))
    if (cover) outBox.registers.R9 = await colTuple(Serializer.stringToHex(url), Serializer.stringToHex(cover))

    const address = (await getArtworkP2s(txFee, quantity, hash, assetType)).address
    let request = {
        address: address,
        returnTo: getWalletAddress(),
        startWhen: {
            erg: txFee * 2,
        },
        txSpec: {
            requests: [outBox],
            fee: txFee,
            inputs: ['$userIns'],
            dataInputs: [],
        },
    };

    const res = await follow(request)
    if (res.id === undefined)
        showMsg('Error while issuing artwork', true)
    else {
        const registers = {
            R4: await encodeNum(royalty * 10, true),
            R5: await encodeHex(new Address(getWalletAddress()).ergoTree),
        }
        if (isYoroi()) {
            const txId = await yoroiSendFunds({ERG: txFee * 2}, address, await currentBlock(), registers, false)
            if (txId !== undefined && txId.length > 0)
                addNotification(`Your artwork "${name}" is being issued`, getTxUrl(txId))
        } else {
            let request = {
                address: (await getIntermediateArtworkP2s(royalty * 10, getWalletAddress(), address)).address,
                returnTo: getWalletAddress(),
                startWhen: {
                    erg: txFee * 3,
                },
                txSpec: {
                    requests: [{
                        value: -1,
                        address: address,
                        registers: registers
                    }],
                    fee: txFee,
                    inputs: ['$userIns'],
                    dataInputs: [],
                },
            };
            const res2 = await follow(request)
            if (res2.id !== undefined) {
                addForKey({
                    id: res.id,
                    name: name,
                    address: address,
                    time: moment.valueOf()
                }, 'my-artworks')
                modal(request.address, (txFee * 3) / 1e9, false)
            }
            else showMsg('Error while issuing the artwork', true)
        }
    }
}

async function getArtworkP2s(ergAmount, quantity, artworkHash, assetType) {
    let ourAddr = getWalletAddress();

    let userTreeHex = new Address(ourAddr).ergoTree

    let userTree = Buffer.from(userTreeHex, 'hex').toString('base64');
    let artworkHash64 = Buffer.from(artworkHash, 'hex').toString('base64');
    let encodedAssetType = Buffer.from(assetType).toString('base64');

    let script = template
        .replace('$userAddress', userTree)
        .replace('$ergAmount', ergAmount)
        .replace('$toAddress', userTree)
        .replace('$artworkType', encodedAssetType)
        .replace('$curHash', artworkHash64)
        .replace('$issueAmount', quantity)
        .replace('$timestamp', moment().valueOf())
        .replaceAll('\n', '\\n');
    return p2s(script);
}

async function getIntermediateArtworkP2s(royalty, artistAddr, address) {
    let artistTreeHex = new Address(artistAddr).ergoTree
    let artistTree = Buffer.from(artistTreeHex, 'hex').toString('base64');
    let p2sAddr = Buffer.from(new Address(address).ergoTree, 'hex').toString('base64');

    let script = `{
      OUTPUTS(0).R4[Int].get == ${royalty} &&
      OUTPUTS(0).R5[Coll[Byte]].get == fromBase64("${artistTree}") &&
      OUTPUTS(0).propositionBytes == fromBase64("${p2sAddr}") &&
      OUTPUTS.size == 2
    }`
    return p2s(script);
}
