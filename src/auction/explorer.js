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

// auction contract protocol with time extending functionality
export const auctionWithExtensionAddr =
    'B63bstXvgAmLqicW4SphqE6AkixAyU7xPpN8g5QwzKsCLvUmNSjZTkrWif7dDzHTBwtCFSvE9qsouL9LnkfJKKmhL4Mw4sA2gNKzgN4wuVcXqvPmPRq5yHky2LyADXmF6Py8vS8KGm7cyHB4U2voCMFqEbgPFoXLRYaa2m3rmCJiNmfdmbqYtMdzH9xRYEVZheDmuBJJnAEFqn6z4h5pitDKZeJJRMnWoJ8YJAooXw5bhxviqcB3HAWmLuJovSpcQ2btWK9h6QhkfyjxbRCmLkKhkbqnF49PkvaqFhqSar68uXVRf6s9FDC4WVND8KmVVh2DhyRrNjNx8u25hwas3q8S7MQfY2jmMJ7pMmgQ8NXZL9FjEeH7WUJbWnwLvm8rKf3yAACP6WD9s84R7Nvr2ijK21PhXkRFgGAPzjWfa4VHVXqcKYYJrA79eK5fVnM8QrLEEd3Rn9Km1LjjT7EEgZhTyym5QyFVzHrx6XipunbwBw2BAXj7HE9wCi';
export const auctionWithExtensionTree = new Address(auctionWithExtensionAddr).ergoTree;
export const extendThreshold = 15; // if bid is being placed and endTime - HEIGHT <= extendThreshold we have to extend endTime
export const extendNum = 20; // number by which we have to extend endTime

// auction contract protocol with fixed end-time
export const auctionOrdinaryAddr =
    '5CC8sXX8ReWpiBXENqXCcSSD6JUAmMikyrsevD38QgCZ5rMx7QMzTrkfh2TfVkkVHmXkqFfLM3ucTtNbriFL7GbzLVxr65jrNUaVHxWj495fuYupgZWB1VApcBdVs4nezMDJq1uRVFvDZrFji2gbYpYwLa3G6R2cjR1Bkbh5CEQMJzP9DZQCRC9n62eXjH8o12ZTeBWrc7oeoBvpuzumf9T1y3Qt2qk1xD2f3FKEUmTczFLzvpVX1CpVFiu9FmUzTo33F124p8yU6Xj4urtdR5X12CesUPbErdwz4uqDzommprvJEdhse7SMtmXKdwKBN3sokcC11Be9TLkkzCTnBUC85ReMVgpx4fFVbLHB7ZGg6mQBVhgj69PiJrZNEUKZyAAg7p2HXT2btJbFppktHFmtCaigqs57FpbdFMeGfqbZV1TuUTbsU1yx3PNsaBVkcQGQxLvXWsifL32qfBvRbifn3giy54tkpiv';
export const auctionOrdinaryTree = new Address(auctionOrdinaryAddr).ergoTree;

export const activeAuctionAddresses = [
    auctionWithExtensionAddr, auctionOrdinaryAddr
];
export const inactiveAuctionAddresses = [
    // this is inactive due to the bug reported by Jason Davis!
    'S4x6bgnmHjUrGARXfHDfGUVjjLrfEiJQ9ZhRYbvLEv4gwqCCDThZ8KJYEoBD91XNRtGiJsBY6PGwdY6VW2epqymBBdnz81hdRJi241YNVDEV4ZPbwBYA1wc64e1KtmDkBFx4oh9qstmfdV3PHaBwN9dHE85zpAX3dXVcPb1jRvMmG3A9smNaR9q6MRmT9F25NujPhgW6CYP27yjwNpFpjbAfwBFJyFvmcwJwfx6oYPbNjxcvpBzzrmatw4h4R263FajVF9btFa4y4ejz9vainPHmMdW6artTXD9JW8YnpGtvme8xQEgr5hJoYH2J2J7MYF4BYiriToJrit7WBb6543ZLGXeTXXt58fdZFezDuC86x8eNbygw24ENELxENKM2rsU81t8eeWWENm2F1ezGVx7GB8KT8VkQqhUdzai65Po1RwbAk3Sdbn1LZYnFBojbGbZ3QiTYYUqQ6Hs3USCp3y8cF',
];
export const allAuctionTrees = activeAuctionAddresses // array of trees of all auction addresses until now.
    .concat(inactiveAuctionAddresses)
    .map((addr) => new Address(addr).ergoTree)
    .concat([auctionWithExtensionTree, auctionOrdinaryTree]);

export const trueAddress = '4wQyML64GnzMxZgm'; // dummy address to get unsigned tx from node, we only care about the boxes though in this case

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
    let all = activeAuctionAddresses.map((addr) => getActiveAuctions(addr));
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

export function getAuctionHistory(limit, offset, auctionAddr) {
    return getRequest(
        `/addresses/${auctionAddr}/transactions?limit=${limit}&offset=${offset}`
    )
        .then((res) => res.data)
        .then((res) => res.items);
}

export async function getCompleteAuctionHistory(limit, offset) {
    let allHistory = activeAuctionAddresses.map(addr => getAuctionHistory(limit, offset, addr))
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

export function handlePendingBids(height) {
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
                    // maybe bid was in the mempool for a long time and the endTiem must be extened.
                    if (!bid.isFirst && bid.shouldExtend) {
                        if (bid.prevEndTime - height < extendThreshold) {
                            bid.status = 'rejected';
                            bid.tx = null
                            let msg = `Your ${
                                bid.amount / 1e9
                            } ERG bid for ${friendlyToken(
                                bid.token,
                                false,
                                5
                            )} is rejected because the bid's end time must be extended, place your bid again to take that into account!.`;
                            showStickyMsg(msg, true);
                        }
                    }
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
