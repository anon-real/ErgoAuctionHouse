import {addAssemblerBid, getWalletAddress,} from './helpers';
import {Address} from '@coinbarn/ergo-ts';
import {encodeHex, encodeNum} from './serializer';
import {follow, p2s} from "./assembler";
import {Serializer} from "@coinbarn/ergo-ts/dist/serializer";
import {additionalData, auctionAddress, txFee} from "./consts";

const template = `{
  val userAddress = fromBase64("$userAddress")
  val bidAmount = $bidAmountL
  val endTime = $endTimeL
  val bidDelta = $bidDeltaL
  val currencyId = fromBase64("$currencyId")
  val startAuction = {
      OUTPUTS(0).tokens.size > 0 &&
      OUTPUTS(0).R4[Coll[Byte]].getOrElse(INPUTS(0).id) == userAddress &&
      OUTPUTS(0).R5[Coll[Byte]].getOrElse(INPUTS(0).id) == userAddress &&
      OUTPUTS(0).R6[Long].getOrElse(0L) == bidDelta &&
      OUTPUTS(0).R7[Long].getOrElse(0) == endTime &&
      ((currencyId.size == 0 && OUTPUTS(0).value == bidAmount) ||
         OUTPUTS(0).tokens(1)._1 == currencyID && OUTPUTS(0).tokens(1)._2 == bidAmount)
  }
  val returnFunds = {
    val total = INPUTS.fold(0L, {(x:Long, b:Box) => x + b.value}) - 2000000
    OUTPUTS(0).value >= total && OUTPUTS(0).propositionBytes == userAddress && outputs.size == 2
  }
  sigmaProp(startAuction || returnFunds)
}`;

export async function registerAuction(
    address,
    initial,
    buyItNow,
    bidder,
    step,
    start,
    end,
    description
) {
    let tree = new Address(bidder).ergoTree;
    let info = `${initial},${start},${description}`;
    let reqs = [
        {
            address: auctionAddress,
            value: initial,
            assets: [
                {
                    tokenId: "$userIns.token",
                    amount: 0,
                },
            ],
            registers: {
                R4: await encodeHex(tree),
                R5: await encodeHex(tree),
                R6: await encodeNum(step.toString()),
                R7: await encodeNum(end),
                R8: await encodeHex(buyItNow),
                R9: await encodeHex(Serializer.stringToHex(info)),
            },
        },
    ]
    let request = {
        address: address,
        returnTo: bidder,
        startWhen: {
            erg: initial + txFee,
        },
        txSpec: {
            requests: reqs,
            fee: txFee,
            inputs: ['$userIns'],
            dataInputs: [additionalData.dataInput.id],
        },
    };
    return await follow(request)
        .then((res) => {
            if (res.id !== undefined) {
                let bid = {
                    id: res.id,
                    msg: "Your auction is being started by the assembler service, wait for the transaction to be mined.",
                    info: {
                        token: null,
                        boxId: null,
                        txId: null,
                        tx: null,
                        status: 'pending mining',
                        amount: initial,
                        isFirst: true,
                    },
                };
                addAssemblerBid(bid);
            }
            return res;
        });
}

export async function getAuctionP2s(bid, endTime, delta) {
    let userAddress = getWalletAddress()
    let userTree = Buffer.from(new Address(userAddress).ergoTree, 'hex').toString('base64');

    let script = template
        .replace('$userAddress', userTree)
        .replace('$bidAmount', bid)
        .replace('$endTime', endTime)
        .replace('$bidDelta', delta)
        .replaceAll('\n', '\\n');
    return p2s(script);
}

