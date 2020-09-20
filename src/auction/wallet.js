import {Address, Explorer, Transaction, ErgoBox} from "@coinbarn/ergo-ts";

const explorer = Explorer.mainnet;

export function currentHeight() {
    return explorer.getCurrentHeight()
}

export function getTokenInfo(token) {
    return explorer.getTokenInfo(token)
}

export function getUnspentBoxes(address) {

    return explorer.getUnspentOutputs(new Address(address))
}
