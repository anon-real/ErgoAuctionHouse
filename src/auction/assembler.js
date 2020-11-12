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

const url = 'http://95.217.50.117:8080/';

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
    return await post(getUrl(url) + '/follow', request)
        .then((res) => res.json())
        .then((res) => {
            if (res.id !== undefined) {
                let bid = {
                    id: res.id,
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

export async function getP2s(bid, box) {
    let id64 = Buffer.from(box.id, 'hex').toString('base64');
    let script = template
        .replace('$userAddress', getWalletAddress())
        .replace('$bidAmount', bid)
        .replace('$endTime', box.finalBlock)
        .replace('$auctionId', id64)
        .replaceAll('\n', '\\n');
    return p2s(script);
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
                    showMsg(
                        "Your bid is being placed, see 'My Bids' section for more details."
                    );
                    let curBid = bid.info;
                    curBid.tx = out.tx;
                    curBid.txId = out.tx.id;
                    addBid(curBid);
                } else if (out.detail === 'returning') {
                    showMsg(
                        'Your funds are being returned to you.',
                        false,
                        true
                    );
                } else if (out.detail !== 'pending') {
                    retry(bid.id);
                } else newBids.push(bid);
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
