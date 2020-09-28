import { Address, Explorer, Transaction } from '@coinbarn/ergo-ts';
import { Serializer } from '@coinbarn/ergo-ts/dist/serializer';
import { encodeLong } from './serializer';
import { friendlyToken, getMyBids, setMyBids, showStickyMsg } from './helpers';

const explorer = Explorer.mainnet;
export const auctionAddress =
    '29VEf3kTBhxWuLWcAWBeqxgGxmtgKsjzJQDXCBPUw4mvKjKMrDFYKq5BJcuZ7KrdtJiyn6fTsmaij6eiHkozJfRqryMQTWMrYVKpMKGX3Hmwn7j6c7FyUJbmZJL1PPRbrEoXrq7MfXWT2wtVfijsofD9weuRfuSU1WTyWhSoSMZVsX5hpwWtcoedTX6eczvx3gz9p8HZJkDpz6qM3VgjdiDsDiE8ZQayaBXfbcoszFmVcHuC7AHv6SHSfozbgGZiu1rehuQ4WoVaU8PqyEo9NCjZxJt6M1mABgRatME11GuwDmJvcDZn7nqU8HeD5Cme39zzuJsdm';
export const trueAddress = '4MQyML64GnzMxZgm';
export const auctionFee = 2000000;

async function getRequest(url) {
    return explorer.apiClient({
        method: 'GET',
        url,
    });
}

export function currentHeight() {
    return explorer.getCurrentHeight();
}
export function getActiveAuctions() {
    return explorer
        .getUnspentOutputs(new Address(auctionAddress))
        .then((boxes) => boxes.filter((box) => box.assets.length > 0))
        .then((boxes) => {
            boxes.sort((a, b) => {
                if (a.assets[0].tokenId > b.assets[0].tokenId) return 1;
                else if (a.assets[0].tokenId < b.assets[0].tokenId) return -1;
                else return a.assets[0].amount - b.assets[0].amount;
            });
            return boxes;
        });
}

export async function getSpendingTx(boxId) {
    const data = getRequest(`/transactions/boxes/${boxId}`);
    return data
        .then((res) => res.data)
        .then((res) => res.spentTransactionId)
        .catch((_) => null);
}

export function handlePendingBids() {
    let bids = getMyBids().filter((bid) => bid.status === 'pending mining');
    if (bids !== null) {
        let res = bids.map((bid) => {
            let txs = bid.tx.inputs.map(inp => inp.boxId).map(id => getSpendingTx(id))
            return Promise.all(txs).then(res => {
                if (res.filter(txId => txId !== null).length > 0) {
                    bid.tx = null
                    if (res[0] === bid.txId) {
                        bid.status = 'complete';
                        let msg = `Your bid for ${friendlyToken(
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
                        let msg = `Your bid for ${friendlyToken(
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
                    try {
                        explorer.broadcastTx(Transaction.formObject(bid.tx));
                    } catch (_) {}
                }
                return bid;
            })
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
