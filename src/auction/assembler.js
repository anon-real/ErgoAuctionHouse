import {get, post} from './rest';
import {addBid, getAssemblerBids, getUrl, setAssemblerBids, showStickyMsg,} from './helpers';
import {Address} from '@coinbarn/ergo-ts';
import {additionalData, assmUrl, trueAddress, txFee} from "./consts";
import {boxById} from "./explorer";
import {getEncodedBoxSer, isP2pkAddr} from "./serializer";

// const assmUrl = 'https://assm.sigmausd.io/';

export async function follow(request) {
    return await post(getUrl(assmUrl) + '/follow', request).then((res) =>
        res.json()
    ).then(res => {
        if (res.success === false) throw new Error()
        return res
    });
}

export async function stat(id) {
    return await get(getUrl(assmUrl) + '/result/' + id).then((res) => res.json());
}

export async function getReturnAddr(addr) {
    return await get(getUrl(assmUrl) + '/returnAddr/' + addr)
        .then((res) => res.json())
        .then(res => res.returnAddr)
}

export async function getEncodedBox(bytes) {
    return await get(getUrl(assmUrl) + '/encodedBox/' + bytes)
        .then((res) => res.json())
        .then(res => res.encodedBox)
}

export async function p2s(request) {
    return await post(getUrl(assmUrl) + '/compile', request).then((res) =>
        res.json()
    ).then(res => {
        if (res.success === false) throw new Error()
        return res
    });
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
                    if (!curBid.boxId) {
                        curBid.boxId = out.tx.outputs[0].id
                    }
                    if (!curBid.token) {
                        curBid.token = out.tx.outputs[0].assets[0]
                    }
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
    const toWithdraw = boxes.filter((box) => box.remTimeTimestamp <= 0 || (box.curBid >= box.instantAmount && box.instantAmount !== -1))
    for (let i = 0; i < toWithdraw.length; i++) {
        const box = toWithdraw[i]
        let request = {}
        if (box.curBid < box.minBid) {
            let seller = {
                value: box.value - txFee,
                address: box.seller,
                assets: box.assets.map(ass => {
                    return {tokenId: ass.tokenId, amount: ass.amount}
                }),
            };
            request = {
                address: box.seller,
                returnTo: box.seller,
                startWhen: {},
                txSpec: {
                    requests: [seller],
                    fee: txFee,
                    inputs: [box.boxId],
                    dataInputs: [additionalData.dataInput.boxId],
                }
            };
        } else {
            const dataInput = additionalData.dataInput;
            const auctionFee = Math.floor(box.curBid / parseInt(dataInput.additionalRegisters.R4.renderedValue))
            const feeTo = Address.fromErgoTree(dataInput.additionalRegisters.R5.renderedValue).address;
            const artistFee = Math.floor(box.curBid / parseInt(dataInput.additionalRegisters.R6.renderedValue))
            const minimalErg = 500000

            let artBox = await boxById(box.assets[0].tokenId)
            const boxEncoded = await getEncodedBoxSer(artBox)
            let winner = {
                value: minimalErg,
                address: box.bidder,
                assets: [{
                    tokenId: box.assets[0].tokenId,
                    amount: box.assets[0].amount
                }],
            };
            let artistAddr = null
            if (!isP2pkAddr(artBox.ergoTree)) artistAddr = await getReturnAddr(artBox.address)

            let seller = {}
            let feeBox = {}
            let realArtistShareBox = {}
            let artistFeeBox = {}
            if (box.assets.length === 1) {
                seller = {
                    value: box.value - txFee * 2 - auctionFee - artistFee - minimalErg,
                    address: box.seller,
                };
                feeBox = {
                    value: auctionFee,
                    address: feeTo,
                    registers: {
                        R4: boxEncoded
                    },
                };
                artistFeeBox = {
                    value: artistFee + txFee,
                    address: artBox.address,
                };
                realArtistShareBox = {
                    value: artistFee,
                    address: artistAddr
                };
            } else {
                seller = {
                    value: box.value - txFee * 2 - minimalErg * 3,
                    address: box.seller,
                    assets: [{
                        tokenId: box.assets[1].tokenId,
                        amount: box.assets[1].amount - auctionFee - artistFee
                    }]
                };
                feeBox = {
                    value: minimalErg,
                    address: feeTo,
                    assets: [{
                        tokenId: box.assets[1].tokenId,
                        amount: auctionFee
                    }],
                    registers: {
                        R4: boxEncoded
                    },
                };
                artistFeeBox = {
                    value: minimalErg + txFee,
                    address: artBox.address,
                    assets: [{
                        tokenId: box.assets[1].tokenId,
                        amount: artistFee
                    }],
                };
                realArtistShareBox = {
                    value: minimalErg,
                    address: artistAddr,
                    assets: [{
                        tokenId: box.assets[1].tokenId,
                        amount: artistFee
                    }]
                };
            }

            request = {
                address: trueAddress,
                returnTo: trueAddress,
                startWhen: {},
                txSpec: {
                    requests: [winner, feeBox, seller, artistFeeBox],
                    fee: txFee,
                    inputs: [box.boxId],
                    dataInputs: [dataInput.boxId],
                }
            };


            if (artistAddr !== null) {
                const artistRealShare = {
                    address: artBox.address,
                    returnTo: artistAddr,
                    startWhen: {erg: 0},
                    txSpec: {
                        requests: [realArtistShareBox],
                        fee: txFee,
                        inputs: ["$userIns"],
                        dataInputs: [],
                    }
                };
                await post(getUrl(assmUrl) + '/follow', artistRealShare)
                    .then((res) => {
                        res.json()
                    }).then(res => {
                        console.log(`registered artist share tx`);
                    })
            }
        }

        if (Object.keys(request).length > 0) post(getUrl(assmUrl) + '/follow', request)
            .then((res) => res.json()).then(res => {
                console.log(`Withdrawing finished auction`, res);
            })


    }


    toWithdraw.forEach((box) => {
    });

}
