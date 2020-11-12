import { get, post } from './rest';
import {
    additionalData,
    auctionWithExtensionAddr,
    auctionFee,
    auctionWithExtensionTree,
    extendNum,
    extendThreshold,
    sendTx,
    trueAddress, auctionOrdinaryAddr,
} from './explorer';
import { Address, Transaction } from '@coinbarn/ergo-ts';
import { decodeNum, decodeString, encodeNum, encodeHex } from './serializer';
import {addBid, getMyBids, getUrl, getWalletAddress, isWalletNode, isWalletSaved} from './helpers';
import { Serializer } from '@coinbarn/ergo-ts/dist/serializer';

export async function getInfo(url) {
    return get(getUrl(url) + '/info').then((res) => res.json());
}

export async function getAddress(
    url = JSON.parse(sessionStorage.getItem('wallet')).url,
    apiKey = JSON.parse(sessionStorage.getItem('wallet')).apiKey
) {
    return await get(getUrl(url) + '/wallet/addresses', apiKey)
        .then((res) => res.json())
        .then((res) => res[0]);
}

export async function getAssets(
    url = JSON.parse(sessionStorage.getItem('wallet')).url,
    apiKey = JSON.parse(sessionStorage.getItem('wallet')).apiKey
) {
    return await get(getUrl(url) + '/wallet/balances', apiKey).then((res) =>
        res.json()
    );
}

export async function boxToRaw(
    boxId,
    url = JSON.parse(sessionStorage.getItem('wallet')).url
) {
    return await get(getUrl(url) + `/utxo/byIdBinary/${boxId}`)
        .then((res) => res.json())
        .then((res) => res.bytes);
}

export async function broadcast(
    tx,
    url = JSON.parse(sessionStorage.getItem('wallet')).url
) {
    return await post(getUrl(url) + '/transactions', tx).then((res) =>
        res.json()
    );
}

export async function generateTx(
    request,
    url = JSON.parse(sessionStorage.getItem('wallet')).url,
    apiKey = JSON.parse(sessionStorage.getItem('wallet')).apiKey
) {
    return await post(
        getUrl(url) + '/wallet/transaction/generate',
        request,
        apiKey
    ).then((res) => res.json());
}

export async function unspentBoxes(
    amount,
    url = JSON.parse(sessionStorage.getItem('wallet')).url,
    apiKey = JSON.parse(sessionStorage.getItem('wallet')).apiKey
) {
    let req = {
        requests: [
            {
                address: trueAddress,
                value: amount,
            },
        ],
        fee: auctionFee,
    };
    return await post(
        getUrl(url) + '/wallet/transaction/generateUnsigned',
        req,
        apiKey
    )
        .then((res) => res.json())
        .then((res) => res.inputs.map((inp) => inp.boxId))
        .then((res) =>
            res.map((id) =>
                get(getUrl(url) + `/utxo/byId/${id}`).then((res) => res.json())
            )
        )
        .then((res) => Promise.all(res))
        .catch((_) => {
            return get(getUrl(url) + '/wallet/boxes/unspent', apiKey)
                .then((res) => res.json())
                .then((res) => res.sort((a, b) => b.box.value - a.box.value))
                .then((res) => {
                    let needed = amount + auctionFee;
                    let selected = [];
                    for (let i = 0; i < res.length; i++) {
                        selected.push(res[i].box);
                        needed -= res[i].box.value;
                        if (needed <= 0) break;
                    }
                    if (needed > 0) return [];
                    return selected;
                })
                .catch((_) => []);
        });
}

export async function auctionTxRequest(
    initial,
    bidder,
    tokenId,
    tokenAmount,
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
    let req = {
        requests: [
            {
                address: auctionAddress,
                value: initial,
                assets: [
                    {
                        tokenId: tokenId,
                        amount: tokenAmount,
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
        ],
        fee: auctionFee,
    };
    return generateTx(req).then((res) => {
        let tx = Transaction.formObject(res);
        sendTx(tx);
        let bid = {
            token: {
                tokenId: tokenId,
                amount: tokenAmount,
            },
            boxId: tx.inputs[0].boxId,
            txId: tx.id,
            tx: res,
            status: 'pending mining',
            amount: initial,
            isFirst: true,
        };
        addBid(bid);
    });
}

export async function bidTxRequest(box, amount, currentHeight) {
    let ourAddr = getWalletAddress();
    let tree = new Address(ourAddr).ergoTree;
    let encodedTree = await encodeHex(tree);
    let nextEndTime =
        box.finalBlock - currentHeight <= extendThreshold &&
        box.ergoTree === auctionWithExtensionTree
            ? box.finalBlock + extendNum
            : box.finalBlock;
    if (nextEndTime !== box.finalBlock) console.log(`extended from ${box.finalBlock} to ${nextEndTime}. height: ${currentHeight}`)
    let encodedNextEndTime = await encodeNum(nextEndTime, true);
    return unspentBoxes(amount).then((boxes) => {
        if (boxes.length === 0)
            throw new Error(
                'Could not get enough unspent boxes for the bid form your wallet!'
            );
        if (additionalData.dataInput === undefined)
            throw new Error(
                'Data input is not loaded from explorer! Maybe there is some connection issue to the explorer!'
            );
        let ids = boxes.map((box) => box.boxId);
        let raws = ids
            .concat([box.id, additionalData.dataInput.id])
            .map((id) => boxToRaw(id));
        return Promise.all(raws).then((inputsRaw) => {
            let change = {
                address: ourAddr,
                value:
                    boxes.map((box) => box.value).reduce((a, b) => a + b) -
                    amount -
                    auctionFee,
            };
            let changeAsset = {};
            boxes.forEach((box) =>
                box.assets.forEach((asset) => {
                    if (asset.tokenId in changeAsset)
                        changeAsset[asset.tokenId] += asset.amount;
                    else changeAsset[asset.tokenId] = asset.amount;
                })
            );
            change.assets = Object.entries(changeAsset).map((a, _) => {
                return {
                    tokenId: a[0],
                    amount: a[1],
                };
            });
            let newBox = {
                value: amount,
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
                requests: [newBox, returnBidder, change],
                fee: auctionFee,
                inputsRaw: inputsRaw.slice(0, inputsRaw.length - 1),
                dataInputsRaw: [inputsRaw[inputsRaw.length - 1]],
            };

            return generateTx(request).then((res) => {
                let tx = Transaction.formObject(res);
                sendTx(tx);
                let bid = {
                    token: box.assets[0],
                    boxId: box.id,
                    txId: tx.id,
                    tx: res,
                    prevEndTime: box.finalBlock,
                    shouldExtend: (box.ergoTree === auctionWithExtensionTree && nextEndTime === box.finalBlock),
                    status: 'pending mining',
                    amount: amount,
                    isFirst: false,
                };
                addBid(bid);
            });
        });
    });
}

export async function withdrawFinishedAuctions(boxes) {
    if (!isWalletNode()) return;
    let dataInput = additionalData.dataInput;
    let percentage = await decodeNum(dataInput.additionalRegisters.R4, true);
    let feeTo = Address.fromErgoTree(
        await decodeString(dataInput.additionalRegisters.R5)
    ).address;
    let winnerVal = 1000000;
    boxes
        .filter((box) => box.remBlock === 0)
        .forEach((box) => {
            let feeAmount = box.value / percentage;
            let raws = [boxToRaw(box.id), boxToRaw(dataInput.id)];
            Promise.all(raws).then((both) => {
                let res = both[0];
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
                    requests: [winner, seller, feeBox],
                    fee: auctionFee,
                    inputsRaw: [res],
                    dataInputsRaw: [both[1]],
                };

                return generateTx(request)
                    .then((res) => {
                        console.log(`Withdrawing finished auction`);
                        console.log(res);
                        let tx = Transaction.formObject(res);
                        sendTx(tx);
                    })
                    .catch((res) =>
                        console.log(
                            `Error withdrawing finished auction ${res}\n ${request}`
                        )
                    );
            });
        });
}
