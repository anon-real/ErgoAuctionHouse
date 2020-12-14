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
    auctionFee,
    auctionWithExtensionTree,
    extendNum,
    extendThreshold,
    sendTx, trueAddress,
} from './explorer';
import {decodeNum, decodeString, encodeHex, encodeNum} from './serializer';
import {follow, p2s} from "./assembler";

const template = `{
  val userAddress = PK("$userAddress")
  val bidAmount = $bidAmountL
  val endTime = $endTime
  val placeBid = {
    HEIGHT < endTime && INPUTS(INPUTS.size - 1).id == fromBase64("$auctionId") &&
      OUTPUTS(0).R8[Coll[Byte]].get == userAddress.propBytes && OUTPUTS(0).value == bidAmount
  }
  val returnFunds = {
    val total = INPUTS.fold(0L, {(x:Long, b:Box) => x + b.value}) - 4000000
    OUTPUTS(0).value >= total && OUTPUTS(0).propositionBytes == userAddress.propBytes
  }
  sigmaProp(placeBid || returnFunds)
}`;

export async function registerBid(currentHeight, bidAmount, box, address) {
    let ourAddr = getWalletAddress();
    let tree = new Address(ourAddr).ergoTree;
    let encodedTree = await encodeHex(tree);

    let nextEndTime =
        box.finalBlock - currentHeight <= extendThreshold &&
        box.ergoTree === auctionWithExtensionTree
            ? box.finalBlock + extendNum
            : box.finalBlock;
    if (nextEndTime !== box.finalBlock)
        console.log(
            `extended from ${box.finalBlock} to ${nextEndTime}. height: ${currentHeight}`
        );
    let encodedNextEndTime = await encodeNum(nextEndTime, true);

    let newBox = {
        value: bidAmount,
        address: Address.fromErgoTree(box.ergoTree).address,
        assets: box.assets,
        registers: {
            R4: box.additionalRegisters.R4,
            R5: encodedNextEndTime,
            R6: box.additionalRegisters.R6,
            R7: box.additionalRegisters.R7,
            R8: encodedTree,
            R9: box.additionalRegisters.R9,
        },
    };
    let returnBidder = {
        value: box.value,
        address: box.bidder,
    };
    let request = {
        address: address,
        returnTo: ourAddr,
        startWhen: {
            erg: bidAmount + auctionFee,
        },
        txSpec: {
            requests: [newBox, returnBidder],
            fee: auctionFee,
            inputs: ['$userIns', box.id],
            dataInputs: [additionalData.dataInput.id],
        },
    };
    return await follow(request)
        .then((res) => {
            if (res.id !== undefined) {
                let bid = {
                    id: res.id,
                    msg: "Your bid is being placed by the assembler service, see 'My Bids' section for more details.",
                    info: {
                        token: box.assets[0],
                        boxId: box.id,
                        txId: null,
                        tx: null,
                        prevEndTime: box.finalBlock,
                        shouldExtend:
                            box.ergoTree === auctionWithExtensionTree &&
                            nextEndTime === box.finalBlock,
                        status: 'pending mining',
                        amount: bidAmount,
                        isFirst: false,
                    },
                };
                addAssemblerBid(bid);
            }
            return res;
        });
}

export async function getBidP2s(bid, box) {
    let id64 = Buffer.from(box.id, 'hex').toString('base64');
    let script = template
        .replace('$userAddress', getWalletAddress())
        .replace('$bidAmount', bid)
        .replace('$endTime', box.finalBlock)
        .replace('$auctionId', id64)
        .replaceAll('\n', '\\n');
    return p2s(script);
}

