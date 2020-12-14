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
    showMsg, showStickyMsg,
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

const url = 'https://assembler.ergoauctions.org/';

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

export async function follow(request) {
    return await post(getUrl(url) + '/follow', request).then((res) =>
        res.json()
    );
}

export async function stat(id) {
    return await get(getUrl(url) + '/result/' + id).then((res) => res.json());
}

export async function p2s(request) {
    return await post(getUrl(url) + '/compile', request).then((res) =>
        res.json()
    );
}

function retry(id) {
}

export async function bidFollower() {
    let bids = getAssemblerBids();
    let all = bids.map((cur) => stat(cur.id));
    Promise.all(all).then((res) => {
        let newBids = [];
        res.forEach((out) => {
            if (out.id !== undefined) {
                let bid = bids.find((cur) => cur.id === out.id);
                if (out.detail === 'success') {
                    showStickyMsg(bid.msg);
                    let curBid = bid.info;
                    curBid.tx = out.tx;
                    curBid.txId = out.tx.id;
                    addBid(curBid);
                } else if (out.detail === 'returning') {
                    showStickyMsg(
                        'Your funds are being returned to you.',
                        false
                    );
                } else if (out.detail !== 'pending') {
                    retry(bid.id);
                } else if (out.detail !== 'timeout') newBids.push(bid);
            }
        });
        setAssemblerBids(newBids);
    });
}

export async function assembleFinishedAuctions(boxes) {
    let dataInput = additionalData.dataInput;
    let percentage = await decodeNum(
        dataInput.additionalRegisters.R4,
        true
    );
    let feeTo = Address.fromErgoTree(
        await decodeString(dataInput.additionalRegisters.R5)
    ).address;
    let winnerVal = 1000000;
    boxes
        .filter((box) => box.remBlock === 0)
        .forEach((box) => {
            let feeAmount = box.value / percentage;
            let winner = {
                value: winnerVal,
                address: box.bidder,
                assets: box.assets,
            };
            let seller = {
                value: box.value - feeAmount - auctionFee - winnerVal,
                address: box.seller,
            };
            let feeBox = {
                value: feeAmount,
                address: feeTo,
            };
            let request = {
                address: trueAddress,
                returnTo: trueAddress,
                startWhen: {},
                txSpec: {
                    requests: [winner, seller, feeBox],
                    fee: auctionFee,
                    inputs: [box.id],
                    dataInputs: [dataInput.id],
                }
            };

            return post(getUrl(url) + '/follow', request)
                .then((res) => {
                    res.json()
                }).then(res => {
                    console.log(`Withdrawing finished auction`);
                    console.log(res)
                })

        });

}
