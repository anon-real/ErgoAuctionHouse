import {post, get} from './rest';
import {
    addAssemblerBid,
    addBid,
    getAssemblerBids,
    getUrl,
    getWalletAddress,
    isAssembler,
    isWalletNode,
    setAssemblerBids,
    showMsg,
} from './helpers';
import {Address, Transaction} from '@coinbarn/ergo-ts';
import {
    additionalData,
    auctionFee, auctionOrdinaryAddr, auctionWithExtensionAddr,
    auctionWithExtensionTree,
    extendNum,
    extendThreshold,
    sendTx, trueAddress,
} from './explorer';
import {decodeNum, decodeString, encodeHex, encodeNum} from './serializer';
import {follow, p2s} from "./assembler";
import {Serializer} from "@coinbarn/ergo-ts/dist/serializer";
import {generateTx} from "./nodeWallet";

const template = `{
  val userAddress = fromBase64("$userAddress")
  val bidAmount = $bidAmountL
  val endTime = $endTime
  val bidDelta = $bidDeltaL
  val startAuction = {
      OUTPUTS(0).tokens.size > 0 && OUTPUTS(0).R4[Coll[Byte]].getOrElse(INPUTS(0).id) == userAddress &&
      OUTPUTS(0).R5[Int].getOrElse(0) == endTime && OUTPUTS(0).R6[Long].getOrElse(0L) == bidDelta &&
      OUTPUTS(0).R8[Coll[Byte]].getOrElse(INPUTS(0).id) == userAddress && OUTPUTS(0).value == bidAmount
  }
  val returnFunds = {
    val total = INPUTS.fold(0L, {(x:Long, b:Box) => x + b.value}) - 4000000
    OUTPUTS(0).value >= total && OUTPUTS(0).propositionBytes == userAddress
  }
  sigmaProp(startAuction || returnFunds)
}`;

export async function registerAuction(
    address,
    initial,
    bidder,
    step,
    start,
    end,
    description,
    autoExtend,
) {
    let tree = new Address(bidder).ergoTree;
    let info = `${initial},${step},${start}`;
    let auctionAddress = auctionWithExtensionAddr
    if (!autoExtend) auctionAddress = auctionOrdinaryAddr
    let reqs =  [
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
                R5: await encodeNum(end, true),
                R6: await encodeNum(step.toString()),
                R7: await encodeHex(Serializer.stringToHex(description)),
                R8: await encodeHex(tree),
                R9: await encodeHex(Serializer.stringToHex(info)),
            },
        },
    ]
    let request = {
        address: address,
        returnTo: bidder,
        startWhen: {
            erg: initial + auctionFee,
        },
        txSpec: {
            requests: reqs,
            fee: auctionFee,
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

