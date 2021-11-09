import {addAssemblerBid, addForKey, getWalletAddress, isAssembler, isYoroi,} from './helpers';
import {Address} from '@coinbarn/ergo-ts';
import {encodeHex, encodeLongTuple, encodeNum, longToCurrency} from './serializer';
import {follow, p2s} from "./assembler";
import {Serializer} from "@coinbarn/ergo-ts/dist/serializer";
import {additionalData, auctionAddress, supportedCurrencies, txFee} from "./consts";
import {currentBlock} from "./explorer";
import {yoroiSendFunds} from "./yoroiUtils";
import moment from "moment";

const template = `{
  val userAddress = fromBase64("$userAddress")
  val implementor = fromBase64("$implementor")
  val auctionAddress = fromBase64("$auctionAddress")
  val bidAmount = $bidAmountL
  val endTime = $endTimeL
  val bidDelta = $bidDeltaL
  val currencyId = fromBase64("$currencyId")
  val buyItNow = $buyItNowL
  val startAuction = {
      OUTPUTS(0).propositionBytes == auctionAddress &&
      OUTPUTS(0).tokens.size > 0 &&
      OUTPUTS(0).R4[Coll[Byte]].getOrElse(INPUTS(0).id) == userAddress &&
      OUTPUTS(0).R5[Coll[Byte]].getOrElse(INPUTS(0).id) == userAddress &&
      OUTPUTS(0).R6[Coll[Long]].get(0) == bidAmount &&
      OUTPUTS(0).R6[Coll[Long]].get(1) == bidDelta &&
      OUTPUTS(0).R7[Long].getOrElse(0L) == endTime &&
      OUTPUTS(0).R8[Long].getOrElse(0L) == buyItNow &&
      (currencyId.size == 0 || (currencyId.size > 0 && OUTPUTS(0).tokens(1)._1 == currencyId)) &&
      OUTPUTS.size == 3 && OUTPUTS(1).propositionBytes == implementor && OUTPUTS(1).value == $startFeeL
  }
  val returnFunds = {
    val total = INPUTS.fold(0L, {(x:Long, b:Box) => x + b.value}) - 2000000
    OUTPUTS(0).value >= total && OUTPUTS(0).propositionBytes == userAddress && OUTPUTS.size == 2
  }
  sigmaProp((startAuction || returnFunds) && HEIGHT < $timestampL)
}`;

export async function registerAuction(
    initial,
    currency,
    buyItNow,
    step,
    end,
    description
) {
    let outs = []
    const block = await currentBlock()
    const p2s = (await getAuctionP2s(initial, end, step, buyItNow, currency)).address
    const bidder = getWalletAddress()
    let tree = new Address(bidder).ergoTree;
    let info = JSON.stringify({
        initialBid: initial,
        startTime: block.timestamp,
        description: description
    })

    let auctionErg = -1
    let auctionAssets = [
        {
            tokenId: "$userIns.token",
            amount: 0,
        },
    ]
    let start = {erg: supportedCurrencies.ERG.minSupported - txFee}
    if (currency.id.length > 0) {
        start[currency.id] = 0
        auctionAssets = [
            {
                tokenId: "$userIns.token",
                amount: 0,
            },
            {
                tokenId: currency.id,
                amount: -1,
            },
        ]
    }

    outs = outs.concat([{
        address: auctionAddress,
        value: auctionErg,
        assets: auctionAssets,
        registers: {
            R4: await encodeHex(tree),
            R5: await encodeHex(tree),
            R6: await encodeLongTuple(initial, step),
            R7: await encodeNum(end.toString()),
            R8: await encodeNum(buyItNow.toString()),
            R9: await encodeHex(Serializer.stringToHex(info)),
        },
    }])

    const dataInput = additionalData.dataInput;
    let auctionStartFee = 0
    if (dataInput.additionalRegisters.R8 !== undefined) {
        auctionStartFee = parseInt(dataInput.additionalRegisters.R8.renderedValue)
        const feeTo = Address.fromErgoTree(dataInput.additionalRegisters.R5.renderedValue).address;
        start.erg += auctionStartFee
        outs = outs.concat([{
            address: feeTo,
            value: auctionStartFee,
        }])
    }

    let request = {
        address: p2s,
        returnTo: bidder,
        startWhen: start,
        txSpec: {
            requests: outs,
            fee: txFee,
            inputs: ['$userIns'],
            dataInputs: [additionalData.dataInput.boxId],
        },
    };
    return await follow(request)
        .then((res) => {
            if (res.id !== undefined) {
                let pending = {
                    id: res.id,
                    address: p2s,
                    time: moment().valueOf(),
                    key: 'auction'
                };
                addForKey(pending, 'pending')
            }
            res.address = p2s
            res.block = block
            res.startFee = auctionStartFee
            return res;
        });
}

export async function getAuctionP2s(initial, end, step, buyItNow, currency) {
    let userAddress = getWalletAddress()
    let userTree = Buffer.from(new Address(userAddress).ergoTree, 'hex').toString('base64');
    let auctionTree = Buffer.from(new Address(auctionAddress).ergoTree, 'hex').toString('base64');
    let currencyID = Buffer.from(currency.id, 'hex').toString('base64');

    const dataInput = additionalData.dataInput;
    const auctionStartFee = parseInt(dataInput.additionalRegisters.R8.renderedValue)
    const feeTo = Address.fromErgoTree(dataInput.additionalRegisters.R5.renderedValue).address;
    let implementorTree = Buffer.from(new Address(feeTo).ergoTree, 'hex').toString('base64');

    let script = template
        .replace('$userAddress', userTree)
        .replace('$auctionAddress', auctionTree)
        .replace('$bidAmount', initial)
        .replace('$endTime', end)
        .replace('$bidDelta', step)
        .replace('$currencyId', currencyID)
        .replace('$buyItNow', buyItNow)
        .replace('$timestamp', moment().valueOf())
        .replace('$implementor', implementorTree)
        .replace('$startFee', auctionStartFee)
        .replaceAll('\n', '\\n');
    return p2s(script);
}

export async function newAuctionHelper(
    initial,
    currency,
    buyItNow,
    step,
    end,
    description,
    selectedToken,
    amount,
    assemblerModal,
) {
    const r = await registerAuction(initial, currency, buyItNow, step, end, description)
    if (r.id === undefined) throw Error("Could not contact the assembler service")
    if (isAssembler()) {
        let toSend = currency.initial
        if (currency.name === 'ERG')
            toSend += r.startFee
        assemblerModal(r.address, longToCurrency(toSend, -1, currency.name), true, currency.name)
    } else if (isYoroi()) {
        let need = {ERG: supportedCurrencies.ERG.initial + r.startFee}
        need[selectedToken.value] = amount
        if (currency.id.length > 0)
            need[currency.id] = currency.initial
        return await yoroiSendFunds(need, r.address, r.block)
    }
}
