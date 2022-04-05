import {get, post} from './rest';
import {
    addBid,
    addForKey,
    addNotification,
    getAuctionUrl,
    getForKey,
    getTxUrl,
    getUrl,
    removeForKey, updateDataInput,
    updateForKey,
} from './helpers';
import {Address} from '@coinbarn/ergo-ts';
import {additionalData, assmUrl, auctionAddress, remFavNotif, trueAddress, txFee} from "./consts";
import {boxById, currentBlock, followAuction, txByAddress, txById} from "./explorer";
import {decodeAuction, getEncodedBoxSer, isP2pkAddr, longToCurrency} from "./serializer";
import moment from "moment";

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

export async function favArtworks() {
    const favs = getForKey('fav-artworks')
    const block = await currentBlock()
    for (let i = 0; i < favs.length; i++) {
        const newBid = await followAuction(favs[i].boxId)
        let cur = JSON.parse(JSON.stringify(favs[i]))
        if (newBid.id !== favs[i].boxId) {
            if (newBid.address === auctionAddress) {
                cur.boxId = newBid.boxId
                updateForKey('fav-artworks', cur)
                addNotification(`New bid for your favorite auction "${newBid.assets[0].name}"`, getAuctionUrl(newBid.id))
            } else {
                addNotification(`Your favorite auction ${newBid.assets[0].name} has ended`, getAuctionUrl(newBid.id))
                removeForKey('fav-artworks', favs[i].id)
            }
        }
        if (newBid.address === auctionAddress && !favs[i].remNotifDone) {
            const decoded = await decodeAuction(newBid, block)
            const rem = moment.duration(decoded.remTimeTimestamp).asHours();
            if (rem <= remFavNotif) {
                addNotification(`Your favorite auction "${newBid.assets[0].name}" is near the end`, getAuctionUrl(newBid.id))
                cur.remNotifDone = true
                updateForKey('fav-artworks', cur)
            }
        }
    }
}

export async function outBid() {
    const bids = getForKey('my-bids')
    for (let i = 0; i < bids.length; i++) {
        const box = await boxById(bids[i].id)
        if (box.spentTransactionId) {
            removeForKey('my-bids', bids[i].id)
            const tx = await txById(box.spentTransactionId)
            if (tx.outputs[0].address === auctionAddress)
                addNotification(`You've been outbidded for the "${bids[i].name}" auction`, getAuctionUrl(tx.outputs[0].id))
            else
                addNotification(`Congrats! You've won the "${bids[i].name}" auction`, getAuctionUrl(bids[i].id))
        }
    }
}

export async function myAuctionBids() {
    const auctions = getForKey('my-auctions')
    for (let i = 0; i < auctions.length; i++) {
        const newBid = await followAuction(auctions[i].id)
        if (newBid.id !== auctions[i].id) {
            removeForKey('my-auctions', auctions[i].id)
            if (newBid.address === auctionAddress) {
                let cur = JSON.parse(JSON.stringify(auctions[i]))
                cur.id = newBid.id
                addForKey(cur, 'my-auctions')
                let bidAmount = newBid.value
                let currency = 'ERG'
                if (newBid.assets.length > 1) {
                    bidAmount = newBid.assets[1].amount
                    currency = newBid.assets[1].name
                }
                addNotification(`New bid with amount of ${longToCurrency(bidAmount, null, currency)} ${currency} for your auction "${auctions[i].name}" is placed`, getAuctionUrl(newBid.id))
            } else {
                addNotification(`Your auction "${auctions[i].name}" is finished`, getAuctionUrl(newBid.id))
                removeForKey('my-auctions', auctions[i].id)
            }
        }
    }
}

export async function pendings() {
    // handle time
    const bids = getForKey('pending')
    for (let i = 0; i < bids.length; i++) {
        try {
            const addr = bids[i].address
            let bid = JSON.parse(JSON.stringify(bids[i]))

            const txs = (await txByAddress(addr))
            .filter(tx => tx.inputs.map(inp => inp.address).includes(addr) && tx.outputs.length > 2)
            if (txs.length > 0) {
                removeForKey('pending', bid.id)
                const tx = txs[0]
                let msg = 'your auctions is started!'
                if (bid.key === 'bid') {
                    msg = `Your bid for ${longToCurrency(bid.amount, null, bid.box.currency)} ${bid.box.currency} on "${bid.box.tokenName}" is placed`
                    addForKey({
                        name: bid.box.tokenName,
                        id: tx.outputs[0].id
                    }, 'my-bids')
                    addBid({
                        token: tx.outputs[0].assets[0],
                        status: 'complete',
                        amount: (tx.outputs[0].assets.length === 1 ? tx.outputs[0].value : tx.outputs[0].assets[1].amount),
                        txId: tx.id
                    })
                } else {
                    msg = `Your auction has started - ${tx.outputs[0].assets[0].name}`
                    addForKey({
                        name: tx.outputs[0].assets[0].name,
                        id: tx.outputs[0].id
                    }, 'my-auctions')
                }
                addNotification(msg, getAuctionUrl(tx.outputs[0].id))
            } else {

                if (!bid.unc) {
                    const unc = (await stat(bid.id))
                    if (unc.tx) {
                        const tx = unc.tx
                        if (tx.outputs.length === 2) { // refund
                            removeForKey('pending', bid.id)
                            addNotification('Your funds are being returned!',
                                getTxUrl(tx.id), 'error')

                        } else {
                            bid.unc = true
                            let msg = 'Your auction is starting'
                            if (bid.key === 'bid')
                                msg = `Your bid for ${longToCurrency(bid.amount, null, bid.box.currency)} ${bid.box.currency} on "${bid.box.tokenName}" is being placed`
                            addNotification(msg, getTxUrl(tx.id))
                            updateForKey('pending', bid)
                        }
                    }
                }
            }
            const past = moment.duration(moment().diff(moment(bid.time))).asMinutes();
            if (past > 120)
                removeForKey('pending', bid.id)
        } catch (e) {}
    }
}

export async function myArtworks() {
    const artworks = getForKey('my-artworks')
    for (let i = 0; i < artworks.length; i++) {
        try {
            const unc = (await stat(artworks[i].id))
            if (unc.tx) {
                removeForKey('my-artworks', artworks[i].id)
                addNotification(`Your artwork "${artworks[i].name}" is being issued`, getTxUrl(unc.tx.id))
            }
            const past = moment.duration(moment().diff(moment(artworks[i].time))).asMinutes();
            if (past > 120)
                removeForKey('my-artworks', artworks[i].id)
        } catch (e) {}
    }
}

export async function handleAll() {
    try {
        await updateDataInput()
    } catch (e) {
        console.error(e)
    }

    try {
        await pendings()
    } catch (e) {
        console.error(e)
    }
    try {
        await myAuctionBids()
    } catch (e) {
        console.error(e)
    }
    try {
        await outBid()
    } catch (e) {
        console.error(e)
    }
    try {
        await favArtworks()
    } catch (e) {
        console.error(e)
    }
    try {
        await myArtworks()
    } catch (e) {
        console.error(e)
    }
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
            const auctionFee = Math.floor((box.curBid * parseInt(dataInput.additionalRegisters.R4.renderedValue)) / 1000)
            const feeTo = Address.fromErgoTree(dataInput.additionalRegisters.R5.renderedValue).address;
            const artistFee = Math.floor((box.curBid * box.royalty) / 1000)
            const minimalErg = 400000

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
            if (!isP2pkAddr(artBox.ergoTree) && artistFee > 0) artistAddr = await getReturnAddr(artBox.address)

            let seller = {}
            let feeBox = {}
            let realArtistShareBox = {}
            let artistFeeBox = {}
            let sellerErg = box.value - txFee - minimalErg
            if (box.assets.length === 1) {
                seller = {
                    address: box.seller,
                };
                feeBox = {
                    value: auctionFee + 100000,
                    address: feeTo,
                };
                if (box.royalty > 0)
                    feeBox = {
                        value: auctionFee + 100000,
                        address: feeTo,
                        registers: {
                            R4: boxEncoded
                        },
                    };
                sellerErg -= auctionFee + 100000

                artistFeeBox = {
                    value: artistFee + txFee,
                    address: artBox.address,
                };
                realArtistShareBox = {
                    value: artistFee,
                    address: artistAddr
                };
                if (artistFee > 0) sellerErg -= artistFee + txFee
            } else {
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
                if (artistFee > 0) sellerErg -= minimalErg + txFee
                seller = {
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
                };
                if (box.royalty > 0)
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
                sellerErg -= minimalErg
            }

            seller.value = sellerErg
            let outs = [winner, feeBox, seller]
            if (artistFee > 0) outs = outs.concat([artistFeeBox])
            request = {
                address: trueAddress,
                returnTo: trueAddress,
                startWhen: {},
                txSpec: {
                    requests: outs,
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
                console.log(request, artistRealShare)
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

export async function returnFunds(fromAddress, toAddress) {
    const res = await (await get(getUrl(assmUrl) + `/return/${fromAddress}/${toAddress}`)).json()
    if (res.txId !== undefined) return res.txId
    throw new Error()
}