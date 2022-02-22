import {txFee} from "./consts";
import {addNotification, getTxUrl, getWalletAddress, isYoroi, showMsg} from "./helpers";
import {follow, getAssemblerAddress, p2s} from "./assembler";
import {Address} from "@coinbarn/ergo-ts/dist/models/address";
import moment from "moment";
import {yoroiSendFunds} from "./yoroiUtils";
import {currentBlock} from "./explorer";
import {encodeHex, encodeNum} from "./serializer";

const template = `{
    val outputOk = OUTPUTS.size == $outSize && PK("$assemblerAddr")
    val returnFunds = {
        val total = INPUTS.fold(0L, {(x:Long, b:Box) => x + b.value}) - 2000000
        OUTPUTS(0).value >= total && OUTPUTS(0).propositionBytes == fromBase64("$userAddress")
    }
    sigmaProp((outputOk || returnFunds) && HEIGHT < $timestampL)
}`;

export async function distribute(addresses, modal) {
    let outs = []
    for (let i = 0; i < addresses.length; i++) {
        const registers = {
            R4: await encodeNum(addresses[i].royalty * 10, true),
            R5: await encodeHex(new Address(getWalletAddress()).ergoTree),
        }
        outs = outs.concat([
            {
                value: txFee * 2,
                address: addresses[i].address,
                registers: registers
            }
        ])
    }

    const address = (await getDistributeP2s(outs.length + 1)).address
    const ergNeeded = (outs.length * 2 + 1) * txFee
    let request = {
        address: address,
        returnTo: getWalletAddress(),
        startWhen: {
            erg: ergNeeded,
        },
        txSpec: {
            requests: outs,
            fee: txFee,
            inputs: ['$userIns'],
            dataInputs: [],
        },
    };

    const res = await follow(request)
    if (res.id === undefined)
        showMsg('Error while issuing artwork', true)
    else {
        if (isYoroi()) {
            const txId = await yoroiSendFunds({ERG: ergNeeded}, address, await currentBlock(), {}, false)
            if (txId !== undefined && txId.length > 0)
                addNotification(`Your artworks are being issued`, getTxUrl(txId))
        } else {
            modal(address, ergNeeded / 1e9, false)
        }
    }
}

async function getDistributeP2s(outSize) {
    let ourAddr = getWalletAddress();
    let userTreeHex = new Address(ourAddr).ergoTree
    let userTree = Buffer.from(userTreeHex, 'hex').toString('base64');

    let script = template
        .replace('$userAddress', userTree)
        .replace('$assemblerAddr', await getAssemblerAddress())
        .replace('$outSize', outSize)
        .replace('$timestamp', moment().valueOf())
        .replaceAll('\n', '\\n');
    console.log(script)
    return p2s(script);
}

