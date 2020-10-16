import { Address, Explorer, Transaction } from '@coinbarn/ergo-ts';
import {
    friendlyToken,
    getMyBids,
    isWalletSaved,
    setMyBids,
    showStickyMsg,
} from './helpers';
import { broadcast } from './nodeWallet';

const explorer = Explorer.mainnet;
export const auctionAddress =
    '9RN5yYHW3AfFvU65Zo5KXpwrmYMEx549dtTTB8Bq5PSwyPQ1je35jAQrwvM9xLkxMS1Tp4if3DvaXfduY6Us7CNu4xsZMCZYjD5V33p8Znu7PyNxx2qtSduL2nK64tREtH2e7isDCueZHJCmfQbVaZEw6EidRtg9tDusXb963wKaV43GVSgF2i2tt6UtNBskmQA1RzYwjXGWXCtTnE7kYN68w34Yt3yAhxtArxKTcr48GxfT1raTDaytB8AGLa3Bq7GGZVRmPtpJCzSKUsAYveQ94FCwfCd1fbJfY3af42ec4GGfnrwLj3iuPsuTggh5x5bLFzZpW8uKTf5VCyWv9MoBhBjtBGhuchMnpHqNUJrA993f2APVXUwdTfgCHRvtsUawg4mWBjT8c5iojvnY863x9TxuxQ1Kp9UJVcc1783jZsrZCbHRZnuEqkHwG3nom8i1TCT4rxpVcGqmtUjSDbofjg4K';
export const auctionTree = new Address(auctionAddress).ergoTree;
export const oldAuctionAddresses = [
    'sLjd9UUGa3nhh58YLReDqyZb695v91tKLyaV5Lifpw9uTKyJEGdcF7Z5MJsEgnPMyQycASAaBtSfLQdzw6HkZgAXTTZQtruZw3dFLC3MZrVYG14Gyjw7Twf2pYXzWLqauNqiCVrVq6bs8dEg7UycdnGUKEdP6a7HvtdtLZoaRRsK9hf8Jhx9TUnVjaGhYFjMRKnDEhXzDsKBpvmXnKyAJok89gqbspWbzhvnJPat2SgGXU3t4RTxRvYZyV2UJkcS2JVpB9jZ26pAcG55PAgxDNsmuXgDUGRnqutbFaigpTZWSpkTeP9yUFCfYFD4g4pJLvFGwY8knARVLoGADPAPRvs7EbPTFTYde8RxMFyPYdh6gtGmJ7Lz3QTve2ufCXTasAEZ5tJini8sip9zj2yHbATmeXC789wgjinSYmEaPvUF3T9JUxLG7Eb2575tpGdbN2sQotSAXdqFbtcw3V',
];
export const allAuctionTrees = oldAuctionAddresses
    .map((addr) => new Address(addr).ergoTree)
    .concat(auctionTree);
export const trueAddress = '4wQyML64GnzMxZgm';
export const dataInputAddress =
    'AfHRBHDmA19bEqvBNoprnecKkffKTVpfjMJoWrutWzFztXBYrPijLGTq5WVGUapNRRKLr';
export const auctionNFT =
    '35f2a7b17800bd28e0592559bccbaa65a46d90d592064eb98db0193914abb563';
export const auctionFee = 2000000;
export let additionalData = {};

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
    return getRequest(`/transactions/boxes/byAddress/unspent/${address}`).then(
        (res) => res.data
    );
}

export function getActiveAuctions(addr) {
    return getRequest(`/transactions/boxes/byAddress/unspent/${addr}`)
        .then((res) => res.data)
        .then((boxes) => boxes.filter((box) => box.assets.length > 0));
}

export function getAllActiveAuctions() {
    let all = oldAuctionAddresses
        .concat(auctionAddress)
        .map((addr) => getActiveAuctions(addr));
    return Promise.all(all)
        .then((res) => [].concat.apply([], res))
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
    return getRequest(
        `/addresses/${auctionAddress}/transactions?limit=${limit}&offset=${offset}`
    )
        .then((res) => res.data)
        .then((res) => res.items);
}

export function boxById(id) {
    return getRequest(`/transactions/boxes/${id}`).then((res) => res.data);
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
                    try {
                        console.log('broadcasting to explorer...');
                        explorer.broadcastTx(Transaction.formObject(bid.tx));
                        if (isWalletSaved()) {
                            broadcast(bid.tx).then((r) =>
                                console.log(`broadcasting using node: ${r}`)
                            );
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
