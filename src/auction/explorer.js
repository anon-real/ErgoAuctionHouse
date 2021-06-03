import {Address, Explorer, Transaction} from '@coinbarn/ergo-ts';
import {
    friendlyToken,
    getMyBids, isWalletNode,
    // isWalletSaved,
    setMyBids,
    showStickyMsg,
} from './helpers';
import {broadcast} from './nodeWallet';
import {get} from "./rest";

const explorer = Explorer.mainnet;

// auction contract protocol with time extending functionality
export const auctionWithExtensionAddr =
    'MFrQp7bsMkG9u1AQT33hn5ydUAcrqNMxhocS1RvvJqmUcHaiyXcCE3Sg7DbphepEXHXPkhEBzC6Kqw7jzQDzd4a9SX9M96b4NV8vTVp1zJGepnX41yuLzdWPzbB3k1XRTCUe7An26NDozTD3L5brAu5Nu5Pxkk28kNiFMtfG76n4yfF5YB1wbzXrfoaM9qVTFKhjLTRpJ1pwFZgzPnDC3LXEDyk4EPRjqnRe4WSnMhqa6ngfdGG79J4ZphMuDtamsJY7RD1PoWwxvidk9by7iQrQ3v9EGn1QkrtpxFN9Di7nsyKzUzQS6vxhpdcGXTRBhghaZPMnqRyzdhtspJxiYewSB14Q2cF1uR7vz3m6cqLuS7Fw8jKMpfsY9wXLRaHqUnzfJtEf7LTJfGHtCxifo2iuiHowkLWtwgZDNjH5UAiwAXubSuCzFVSZaDDyxdA5mqBSSRbSC8LoZvQwPcfFLvjjnx2nNznokdG6vA7LU8BbmXrnVXR';
export const auctionWithExtensionTree = new Address(auctionWithExtensionAddr).ergoTree;
export const extendThreshold = 15; // if bid is being placed and endTime - HEIGHT <= extendThreshold we have to extend endTime
export const extendNum = 20; // number by which we have to extend endTime

// auction contract protocol with fixed end-time
export const auctionOrdinaryAddr =
    '9RN5yYHW3AfFvU65Zo5KXpwrmYMEx549dtTTB8Bq5PSwyPQ1je35jAQrwvM9xLkxMS1Tp4if3DvaXfduY6Us7CNu4xsZMCZYjD5V33p8Znu7PyNxx2qtSduL2nK64tREtH2e7isDCueZHJCmfQbVaZEw6EidRtg9tDusXb963wKaV43GVSgF2i2tt6UtNBskmQA1RzYwjXGWXCtTnE7kYN68w34Yt3yAhxtArxKTcr48GxfT1raTDaytB8AGLa3Bq7GGZVRmPtpJCzSKUsAYveQ94FCwfCd1fbJfY3af42ec4GGfnrwLj3iuPsuTggh5x5bLFzZpW8uKTf5VCyWv9MoBhBjtBGhuchMnpHqNUJrA993f2APVXUwdTfgCHRvtsUawg4mWBjT8c5iojvnY863x9TxuxQ1Kp9UJVcc1783jZsrZCbHRZnuEqkHwG3nom8i1TCT4rxpVcGqmtUjSDbofjg4K';
export const auctionOrdinaryTree = new Address(auctionOrdinaryAddr).ergoTree;

export const activeAuctionAddresses = [
    auctionWithExtensionAddr, auctionOrdinaryAddr
];
export const inactiveAuctionAddresses = [
    // this is inactive due to the bug reported by Jason Davis!
    'sLjd9UUGa3nhh58YLReDqyZb695v91tKLyaV5Lifpw9uTKyJEGdcF7Z5MJsEgnPMyQycASAaBtSfLQdzw6HkZgAXTTZQtruZw3dFLC3MZrVYG14Gyjw7Twf2pYXzWLqauNqiCVrVq6bs8dEg7UycdnGUKEdP6a7HvtdtLZoaRRsK9hf8Jhx9TUnVjaGhYFjMRKnDEhXzDsKBpvmXnKyAJok89gqbspWbzhvnJPat2SgGXU3t4RTxRvYZyV2UJkcS2JVpB9jZ26pAcG55PAgxDNsmuXgDUGRnqutbFaigpTZWSpkTeP9yUFCfYFD4g4pJLvFGwY8knARVLoGADPAPRvs7EbPTFTYde8RxMFyPYdh6gtGmJ7Lz3QTve2ufCXTasAEZ5tJini8sip9zj2yHbATmeXC789wgjinSYmEaPvUF3T9JUxLG7Eb2575tpGdbN2sQotSAXdqFbtcw3V',
];
export const allAuctionTrees = activeAuctionAddresses // array of trees of all auction addresses until now.
    .concat(inactiveAuctionAddresses)
    .map((addr) => new Address(addr).ergoTree)
    .concat([auctionWithExtensionTree, auctionOrdinaryTree]);

export const trueAddress = '4MQyML64GnzMxZgm'; // dummy address to get unsigned tx from node, we only care about the boxes though in this case

export const dataInputAddress =
    'AfHRBHDmA19bEqvBNoprnecKkffKTVpfjMJoWrutWzFztXBYrPijLGTq5WVGUapNRRKLr';
export const auctionNFT =
    '35f2a7b17800bd28e0592559bccbaa65a46d90d592064eb98db0193914abb563';

export const auctionFee = 2000000;
export let additionalData = {};

export const explorerApi = 'https://api.ergoplatform.com/api/v0'

async function getRequest(url) {
    return get(explorerApi + url).then(res => {
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

export function getActiveAuctions(addr) {
    return getRequest(`/transactions/boxes/byAddress/unspent/${addr}`)
        .then((res) => res.data)
        .then((boxes) => boxes.filter((box) => box.assets.length > 0));
}

export function getAllActiveAuctions() {
    let all = activeAuctionAddresses.map((addr) => getActiveAuctions(addr));
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

export async function followAuction(id) {
    let cur = await getRequest(`/transactions/boxes/${id}`).then((res) => res.data);
    while (cur.spentTransactionId) {
        let new_cur = (await txById(cur.spentTransactionId)).outputs[0]
        if (allAuctionTrees.includes(new_cur.ergoTree))
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

export function handlePendingBids(height) { let bids = getMyBids().filter((bid) => bid.status === 'pending mining');
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
                        if (bid.prevEndTime - height < extendThreshold) {
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
                        if (isWalletNode()) {
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
