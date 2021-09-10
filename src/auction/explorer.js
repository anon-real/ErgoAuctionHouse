import {Explorer, Transaction} from '@coinbarn/ergo-ts';
import {friendlyToken, getMyBids, setMyBids, showStickyMsg,} from './helpers';
import {get} from "./rest";
import {auctionAddress, auctionAddresses, auctionTrees} from "./consts";
import {longToCurrency} from "./serializer";

const explorer = Explorer.mainnet;
export const explorerApi = 'https://api.ergoplatform.com/api/v0'
export const explorerApiV1 = 'https://api.ergoplatform.com/api/v1'

function getRequest(url, api = explorerApi) {
    return get(api + url).then(res => res.json())
}

export async function currentHeight() {
    return getRequest('/blocks?limit=1')
        .then(res => {
            return res.items[0].height
        })
}

export async function currentBlock() {
    return getRequest('/blocks?limit=1')
        .then(res => {
            return res.items[0]
        })
}

export function unspentBoxesFor(address) {
    return getRequest(`/transactions/boxes/byAddress/unspent/${address}`)
}

export function getBoxesForAsset(asset) {
    return getRequest(`/boxes/unspent/byTokenId/${asset}`, explorerApiV1)
}

export function getActiveAuctions(addr) {
    return getRequest(`/boxes/unspent/byAddress/${addr}`, explorerApiV1)
        .then(res => res.items)
        .then((boxes) => boxes.filter((box) => box.assets.length > 0));
}

export function getUnconfirmedTxsFor(addr) {
    return getRequest(
        `/transactions/unconfirmed/byAddress/${addr}`
    )
        .then((res) => res.items);
}

export async function getAllActiveAuctions() {
    const spending = (await getUnconfirmedTxsFor(auctionAddress)).filter(s => s.inputs.length > 1)
    let idToNew = {}
    spending.forEach(s => {
        let curId = s.inputs[s.inputs.length - 1].id
        if (idToNew[curId] === undefined || idToNew[curId].value < s.value)
            idToNew[curId] = s.outputs[0]
    })
    const all = auctionAddresses.map((addr) => getActiveAuctions(addr));
    return Promise.all(all)
        .then((res) => [].concat.apply([], res))
        .then(res => {
            return res.map(r => {
                if (idToNew[r.id] !== undefined) return idToNew[r.id]
                else return r
            })
        })
}

export function getAuctionHistory(limit, offset, auctionAddr) {
    return getRequest(
        `/addresses/${auctionAddr}/transactions?limit=${limit}&offset=${offset}`, explorerApiV1
    )
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
    return getRequest(`/transactions/boxes/${id}`)
}

export async function followAuction(id) {
    let cur = await getRequest(`/transactions/boxes/${id}`)
    while (cur.spentTransactionId) {
        let new_cur = (await txById(cur.spentTransactionId)).outputs[0]
        if (auctionTrees.includes(new_cur.ergoTree))
            cur = new_cur
        else break
    }
    return cur
}

export function txById(id) {
    return getRequest(`/transactions/${id}`)
}

export async function getSpendingTx(boxId) {
    const data = getRequest(`/transactions/boxes/${boxId}`);
    return data
        .then((res) => res.spentTransactionId)
        .catch((_) => null);
}

export async function getIssuingBox(tokenId) {
    const data = getRequest(`/assets/${tokenId}/issuingBox`);
    return data
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
                            longToCurrency(bid.amount, -1, bid.currency.name)
                        } ${bid.currency.name} bid for ${friendlyToken(
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
                            longToCurrency(bid.amount, -1, bid.currency.name)
                        } ${bid.currency.name} bid for ${friendlyToken(
                            bid.token,
                            false,
                            5
                        )} is rejected. Potentially you are outbidded, try again!`;
                        if (bid.isFirst)
                            msg = `Your auction for ${friendlyToken(
                                bid.token,
                                false,
                                5
                            )} is rejected, you can try again!`;
                        showStickyMsg(msg, true);
                    }
                } else {
                    // maybe bid was in the mempool for a long time and the endTiem must be extened.
                    if (!bid.isFirst && bid.shouldExtend) {
                        if (bid.prevEndTime - height < 'extendThreshold') { // TODO fix
                            bid.status = 'rejected';
                            bid.tx = null
                            let msg = `Your ${
                                longToCurrency(bid.amount, -1, bid.currency.name)
                            } ${bid.currency.name} bid for ${friendlyToken(
                                bid.token,
                                false,
                                5
                            )} is rejected, please try again!`;
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
