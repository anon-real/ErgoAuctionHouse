import React from "react";
import {Slide, toast} from "react-toastify";

const explorerUrl = "https://explorer.ergoplatform.com/en/"

export function friendlyToken(token) {
    return token.amount + ' of ' + token.tokenId.slice(0, 13) + '...' + token.tokenId.slice(-13) + ' token';
}

export function friendlyAddress(addr) {
    return addr.slice(0, 13) + '...' + addr.slice(-13)
}

export function getTxUrl(txId) {
    return explorerUrl + "transactions/" + txId
}
export function getAddrUrl(addr) {
    return explorerUrl + "addresses/" + addr
}

export function showMsg(message, isError = false) {
    toast(message, {
        transition: Slide,
        closeButton: true,
        autoClose: 5000,
        position: 'top-right',
        type: (isError ? 'error' : 'default')
    })
}
