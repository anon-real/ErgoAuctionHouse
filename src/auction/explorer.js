import {Explorer, Transaction} from '@coinbarn/ergo-ts';
import {friendlyToken, getMyBids, setMyBids, showStickyMsg,} from './helpers';
import {get} from "./rest";
import {auctionAddresses, auctionTrees} from "./consts";

const explorer = Explorer.mainnet;
export const explorerApi = 'https://api.ergoplatform.com/api/v0'
export const explorerApiV1 = 'https://api.ergoplatform.com/api/v1'

async function getRequest(url, api=explorerApi) {
    return get(api + url).then(res => {
        return {data: res.json()}
    })
}

export async function currentHeight() {
    // return explorer.getCurrentHeight();
    return getRequest('/blocks?limit=1')
        .then(res => res.data)
        .then(res => res.items[0].height)
}

export function unspentBoxesFor(address) {
    return getRequest(`/transactions/boxes/byAddress/unspent/${address}`).then(
        (res) => res.data
    );
}

export function getBoxesForAsset(asset) {
    return getRequest(`/boxes/unspent/byTokenId/${asset}`, explorerApiV1).then(
        (res) => res.data
    );
}

export function getActiveAuctions(addr) {
    return getRequest(`/transactions/boxes/byAddress/unspent/${addr}`)
        .then((res) => res.data)
        .then((boxes) => boxes.filter((box) => box.assets.length > 0));
}

export function getAllActiveAuctions() {
    let all = auctionAddresses.map((addr) => getActiveAuctions(addr));
    return Promise.all(all)
        .then((res) => [].concat.apply([], res))
}

export function getAuctionHistory(limit, offset, auctionAddr) {
    return getRequest(
        `/addresses/${auctionAddr}/transactions?limit=${limit}&offset=${offset}`
    )
        .then((res) => res.data)
        .then((res) => res.items);
}

export async function getCompleteAuctionHistory(limit, offset) {
    let allHistory = auctionAddresses.map(addr => getAuctionHistory(limit, offset, addr))
    return Promise.all(allHistory)
        .then(res => [].concat.apply([], res))
        .then(res => {
            res.sort((a, b) => b.timestamp - a.timestamp)
            return res
        })
}

export function boxById(id) {
    return getRequest(`/transactions/boxes/${id}`).then((res) => res.data);
}

export async function followAuction(id) {
    let cur = await getRequest(`/transactions/boxes/${id}`).then((res) => res.data);
    while (cur.spentTransactionId) {
        let new_cur = (await txById(cur.spentTransactionId)).outputs[0]
        if (auctionTrees.includes(new_cur.ergoTree))
            cur = new_cur
        else break
    }
    return cur
}

export function txById(id) {
    return getRequest(`/transactions/${id}`).then((res) => res.data);
}

export async function getSpendingTx(boxId) {
    const data = getRequest(`/transactions/boxes/${boxId}`);
    return data
        .then((res) => res.data)
        .then((res) => res.spentTransactionId)
        .catch((_) => null);
}

export async function getIssuingBox(tokenId) {
    const data = getRequest(`/assets/${tokenId}/issuingBox`);
    return data
        .then((res) => res.data)
        .catch((_) => null);
}

export function handlePendingBids(height) {
    let bids = getMyBids().filter((bid) => bid.status === 'pending mining');
    if (bids !== null) {
        let res = bids.map((bid) => {
            let txs = bid.tx.inputs
                .map((inp) => inp.boxId)
                .map((id) => getSpendingTx(id));
            return Promise.all(txs).then((res) => {
                let spent = res.filter((txId) => txId !== null && txId !== undefined)
                if (spent.length > 0) {
                    bid.tx = null;
                    if (spent[0] === bid.txId) {
                        bid.status = 'complete';
                        let msg = `Your ${
                            bid.amount / 1e9
                        } ERG bid for ${friendlyToken(
                            bid.token,
                            false,
                            5
                        )} has successfully been placed.`;
                        if (bid.isFirst)
                            msg = `Your auction for ${friendlyToken(
                                bid.token,
                                false,
                                5
                            )} successfully started.`;
                        showStickyMsg(msg);
                    } else {
                        bid.status = 'rejected';
                        let msg = `Your ${
                            bid.amount / 1e9
                        } ERG bid for ${friendlyToken(
                            bid.token,
                            false,
                            5
                        )} is rejected. Potentially because a bid is placed for this auction before yours. You can try again.`;
                        if (bid.isFirst)
                            msg = `Your auction for ${friendlyToken(
                                bid.token,
                                false,
                                5
                            )} is rejected! Somehow the transaction responsible for creating the auction is invalid.`;
                        showStickyMsg(msg, true);
                    }
                } else {
                    // maybe bid was in the mempool for a long time and the endTiem must be extened.
                    if (!bid.isFirst && bid.shouldExtend) {
                        if (bid.prevEndTime - height < 'extendThreshold') { // TODO fix
                            bid.status = 'rejected';
                            bid.tx = null
                            let msg = `Your ${
                                bid.amount / 1e9
                            } ERG bid for ${friendlyToken(
                                bid.token,
                                false,
                                5
                            )} is rejected because the bid's end time must be extended, place your bid again to take that into account!`;
                            showStickyMsg(msg, true);
                        }
                    }
                    try {
                        console.log('broadcasting to explorer...');
                        explorer.broadcastTx(Transaction.formObject(bid.tx));
                    } catch (_) {
                    }
                }
                return bid;
            });
            return getSpendingTx(bid.boxId).then((res) => {
            });
        });
        Promise.all(res).then((res) => {
            let curBids = getMyBids();
            res = res.concat(
                curBids.filter((bid) => !bids.find((x) => x.txId === bid.txId))
            );
            setMyBids(res);
        });
    }
}

export function sendTx(tx) {
    explorer.broadcastTx(tx);
}
