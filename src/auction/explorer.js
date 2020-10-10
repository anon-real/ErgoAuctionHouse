import {Address, Explorer, Transaction} from '@coinbarn/ergo-ts';
import {friendlyToken, getMyBids, isWalletSaved, setMyBids, showStickyMsg} from './helpers';
import {broadcast} from "./nodeWallet";

const explorer = Explorer.mainnet;
export const auctionAddress =
    'S4x6bgnmHjUrGARXfHDfGUVjjLrfEiJQ9ZhRYbvLEv4gwqCCDThZ8KJYEoBD91XNRtGiJsBY6PGwdY6VW2epqymBBdnz81hdRJi241YNVDEV4ZPbwBYA1wc64e1KtmDkBFx4oh9qstmfdV3PHaBwN9dHE85zpAX3dXVcPb1jRvMmG3A9smNaR9q6MRmT9F25NujPhgW6CYP27yjwNpFpjbAfwBFJyFvmcwJwfx6oYPbNjxcvpBzzrmatw4h4R263FajVF9btFa4y4ejz9vainPHmMdW6artTXD9JW8YnpGtvme8xQEgr5hJoYH2J2J7MYF4BYiriToJrit7WBb6543ZLGXeTXXt58fdZFezDuC86x8eNbygw24ENELxENKM2rsU81t8eeWWENm2F1ezGVx7GB8KT8VkQqhUdzai65Po1RwbAk3Sdbn1LZYnFBojbGbZ3QiTYYUqQ6Hs3USCp3y8cF';
export const auctionTree = new Address(auctionAddress).ergoTree;
export const trueAddress = '4wQyML64GnzMxZgm';
export const dataInputAddress = 'AfHRBHDmA19bEqvBNoprnecKkffKTVpfjMJoWrutWzFztXBYrPijLGTq5WVGUapNRRKLr'
export const auctionNFT = '35f2a7b17800bd28e0592559bccbaa65a46d90d592064eb98db0193914abb563'
export const auctionFee = 2000000;
export let additionalData = {

}

async function getRequest(url) {
    return explorer.apiClient({
        method: 'GET',
        url,
    });
}

export function currentHeight() {
    return explorer.getCurrentHeight();
}

export function unspentBoxesFor(address) {
    return getRequest(`/transactions/boxes/byAddress/unspent/${address}`)
        .then(res => res.data)
}

export function getActiveAuctions() {
    return getRequest(`/transactions/boxes/byAddress/unspent/${auctionAddress}`)
        .then(res => res.data)
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

export function getAuctionHistory(limit, offset) {
    return getRequest(`/addresses/${auctionAddress}/transactions?limit=${limit}&offset=${offset}`)
        .then(res => res.data)
        .then(res => res.items)
}

export function boxById(id) {
    return getRequest(`/transactions/boxes/${id}`)
        .then(res => res.data)
}

export function txById(id) {
    return getRequest(`/transactions/${id}`)
        .then(res => res.data)
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
            let txs = bid.tx.inputs
                .map((inp) => inp.boxId)
                .map((id) => getSpendingTx(id));
            return Promise.all(txs).then((res) => {
                if (res.filter((txId) => txId !== null).length > 0) {
                    bid.tx = null;
                    if (res[0] === bid.txId) {
                        bid.status = 'complete';
                        let msg = `Your ${bid.amount / 1e9} ERG bid for ${friendlyToken(
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
                        let msg = `Your ${bid.amount / 1e9} ERG bid for ${friendlyToken(
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
                        console.log('broadcasting to explorer...')
                        explorer.broadcastTx(Transaction.formObject(bid.tx));
                        if (isWalletSaved()) {
                            broadcast(bid.tx).then(r => console.log(`broadcasting using node: ${r}`))
                        }
                    } catch (_) {}
                }
                return bid;
            });
            return getSpendingTx(bid.boxId).then((res) => {});
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

