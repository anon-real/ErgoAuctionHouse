import {txFee} from "./consts";
import {addNotification, getTxUrl, getWalletAddress, showMsg} from "./helpers";
import {colTuple, encodeByteArray, encodeHex, encodeNum} from "./serializer";
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

export async function issueArtwork(name, description, quantity, royalty, hash, assetType, url, cover) {
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
        const txId = await yoroiSendFunds({ERG: txFee * 2}, address, await currentBlock(), registers, false)
        if (txId !== undefined && txId.length > 0)
            addNotification(`Your artwork "${name}" is being issued`, getTxUrl(txId))
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
