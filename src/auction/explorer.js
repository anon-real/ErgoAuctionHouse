import {Explorer, Transaction} from '@coinbarn/ergo-ts';
import {friendlyToken, getMyBids, setMyBids, showStickyMsg,} from './helpers';
import {get} from "./rest";
import {auctionAddress, auctionAddresses, auctionTrees} from "./consts";
import {longToCurrency} from "./serializer";

const explorer = Explorer.mainnet;
export const explorerApi = 'https://api.ergoplatform.com/api/v0'
export const explorerApiV1 = 'https://api.ergoplatform.com/api/v1'
export const localApi = 'http://localhost:3001'
function getRequest(url, api = explorerApi) {
    return get(api + url).then(res => res.json())
}

export async function getAllActiveAuctions2(limit=-1,page=1,query="") {
    return getRequest(`/auctions/all/active?limit=${limit}&page=${page}${query}`,localApi)
        .then(res => res)
}

export async function getStatus(query="") {
    return getRequest(`/auctions/getStatus?${query}`,localApi)
        .then(res => res)
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

export async function currentBlock2() {
    return getRequest('/auctions/all/?page=0&limit=1&type&sort=des',localApi)
        .then(res => {
            return res.data[0]
        })
}

export function unspentBoxesFor(address) {
    return getRequest(`/transactions/boxes/byAddress/unspent/${address}`)
}

export function getBoxesForAsset(asset) {
    return getRequest(`/boxes/unspent/byTokenId/${asset}`, explorerApiV1)
}

export function getActiveAuctions(addr) {
    return getRequest(`/boxes/unspent/byAddress/${addr}?limit=500`, explorerApiV1)
        .then(res => res.items)
        .then((boxes) => boxes.filter((box) => box.assets.length > 0));
}

export function getUnconfirmedTxsFor(addr) {
    return getRequest(
        `/mempool/transactions/byAddress/${addr}`, explorerApiV1
    )
        .then((res) => res.items);
}

export async function getAllActiveAuctions() {
    const spending = (await getUnconfirmedTxsFor(auctionAddress)).filter(s => s.inputs.length > 1)

    let idToNew = {}
    spending.forEach(s => {
        let curId = s.inputs[s.inputs.length - 1].boxId
        if (idToNew[curId] === undefined || idToNew[curId].value < s.value) {
            idToNew[curId] = s.outputs[0]
            idToNew[curId].stableId = curId
            idToNew[curId].stableTxId = s.inputs[s.inputs.length - 1].outputTransactionId
        }
    })
    const all = auctionAddresses.map((addr) => getActiveAuctions(addr));
    return Promise.all(all)
        .then((res) => [].concat.apply([], res))
        .then(res => {
            return res.map(r => {
                if (idToNew[r.boxId] !== undefined) return idToNew[r.boxId]
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

export function getAuctionHistory2(limit, page) {
    return getRequest(
        `/auctions/all/?page=${page}&limit=${limit}&sort=des`, localApi
    )
        .then((res) => res.data);
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

export function boxByAddress(id) {
    return getRequest(`/transactions/boxes/${id}`)
}

export function boxById(id) {
    return getRequest(`/transactions/boxes/${id}`)
}

export async function followAuction(id) {
    let cur = await getRequest(`/boxes/${id}`, explorerApiV1)
    if (!cur.id) cur.id = cur.boxId
    while (cur.spentTransactionId) {
        let new_cur = (await txById(cur.spentTransactionId)).outputs[0]
        if (new_cur.address === auctionAddress)
            cur = new_cur
        else break
    }
    cur = await getRequest(`/boxes/${cur.id}`, explorerApiV1)
    return cur
}

export async function followAuction2(id) {
    return await getRequest(`/auctions/${id}`, localApi)

}


export function txByAddress(addr) {
    return getRequest(`/addresses/${addr}/transactions`)
        .then((res) => res.items);
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

export function sendTx(tx) {
    explorer.broadcastTx(tx);
}

export async function getBalance(addr) {
    return getRequest(`/addresses/${addr}/balance/confirmed`, explorerApiV1);
}
