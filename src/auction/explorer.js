import {
    Address,
    Explorer,
    Transaction,
    ErgoBox,
    Serializer,
} from '@coinbarn/ergo-ts';
import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios';

const explorer = Explorer.mainnet;
const auctionAddress =
    'PLHeEg8w7y5tNkJkcKhK9bd4qvubZ4xFMDjrHPTvFxoj4WA86rp6kHzj5XgrpWQJgxnaQ3N6phdoHwoqxGUpT4fnee5BtbTcic6K7FWaNFAWEBc4co1KcanGBVJNKT42qxdygppgN2jpcSfBY3CSVQ78YrfPmaqZUBs1M8Yahb2XLbEPAsRYwJsfwTQUB2qumzv5kxEppHVmdtqqKwcryQSvyqEsvgLDPpG7YdiXVmhDeLdoacMKEtw3gEkV4Y4RcEhhS4SWooyrtfZibqgfYAfPfEjVmCiZwtwnzTVPFLjWnmHdPabWiQ9ku63WxzSrCKqKVF6npPV';

async function getRequest(url) {
    return explorer.apiClient({
        method: 'GET',
        url,
    });
}

export function currentHeight() {
    return explorer.getCurrentHeight();
}

export function getTokenInfo(token) {
    return explorer.getTokenInfo(token);
}

export function getActiveAuctions() {
    return explorer
        .getUnspentOutputs(new Address(auctionAddress))
        .then((boxes) => boxes.filter((box) => box.assets.length > 0))
        .then((boxes) => {
            boxes.sort((a, b) => {
                if (a.assets[0].tokenId > b.assets[0].tokenId) return 1;
                else if (a.assets[0].tokenId < b.assets[0].tokenId) return -1;
                else return 0;
            });
            return boxes;
        });
}

export async function getTokenTx(tokenId) {
    const { data } = await getRequest(`/transactions/boxes/${tokenId}`);
    return await data.spentTransactionId;
}

export async function handlePendingBids() {
    localStorage.removeItem('pendingBids')
    let bids = localStorage.getItem('pendingBids');
    if (bids === null) {
        localStorage.setItem(
            'pendingBids',
            JSON.stringify([
                {
                    txId: '5331e2ba3dbf63a76627bbb4ffa4ed22b1d816f1df2f90da5e1a968a298fc418',
                },
            ])
        );
    }
    bids = localStorage.getItem('pendingBids');
    if (bids !== null) {
        bids = JSON.parse(bids);
        let newPendingBids = [];
        let res = bids.map((bid) => {
            let data = getRequest(`/transactions/${bid.txId}`);
            return data.then((res) => res.data)
                .then(res => res.summary)
                .then(res => {
                    if (res.confirmationsCount > 0) return bid
                    else return -1
                })
                .catch(res => 0)
        });
        // console.log(await Promise.all(res));
    }
}

export function test() {
    handlePendingBids().then((res) => {
        // console.log(res);
    });
}
