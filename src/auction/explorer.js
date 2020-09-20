import {Address, Explorer, Transaction, ErgoBox} from "@coinbarn/ergo-ts";
import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios';

const explorer = Explorer.mainnet;

async function getRequest(url) {
    return explorer.apiClient({
        method: 'GET',
        url,
    });
}

export function currentHeight() {
    return explorer.getCurrentHeight()
}

export function getTokenInfo(token) {
    return explorer.getTokenInfo(token)
}

export function getActiveAuctions() {
    let address = '9gAKeRu1W4Dh6adWXnnYmfqjCTnxnSMtym2LPPMPErCkusCd6F3'
    return explorer.getUnspentOutputs(new Address(address))
        .then(boxes => boxes.filter(box => box.assets.length > 0))

}

export async function getTokenTx(tokenId) {
    const {data} = await getRequest(`/transactions/boxes/${tokenId}`);
    console.log(data)
    return await data.spentTransactionId
}

