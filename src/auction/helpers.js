import React from 'react';
import {Flip, Slide, toast} from 'react-toastify';
import {Address} from "@coinbarn/ergo-ts";

const explorerUrl = 'https://explorer.ergoplatform.com/en/';

export function friendlyToken(token, quantity = true, length = 13) {
    let res = '';
    if (quantity) res = token.amount + ' of ';
    res +=
        token.tokenId.slice(0, length) +
        '...' +
        token.tokenId.slice(-length) +
        ' token';
    return res
}

export function friendlyAddress(addr) {
    if (addr === undefined || addr.slice === undefined) return ''
    return addr.slice(0, 13) + '...' + addr.slice(-13);
}

export function getTxUrl(txId) {
    return explorerUrl + 'transactions/' + txId;
}

export function getAddrUrl(addr) {
    return explorerUrl + 'addresses/' + addr;
}

export function showMsg(message, isError = false, isWarning = false) {
    let status = 'default'
    if (isError) status = 'error'
    if (isWarning) status = 'warning'
    toast(message, {
        transition: Slide,
        closeButton: true,
        autoClose: 5000,
        position: 'top-right',
        type: status,
    });
}

export function showStickyMsg(message, isError = false) {
    toast(message, {
        transition: Flip,
        closeButton: true,
        autoClose: false,
        closeOnClick: false,
        position: 'top-center',
        type: isError ? 'error' : 'default',
    });
}

export function isWalletSaved() {
    return sessionStorage.getItem('wallet') !== null;
}

export function isWalletNode() {
    return isWalletSaved() && getWalletType() === 'node';
}

export function isAssembler() {
    return isWalletSaved() && getWalletType() === 'assembler';
}

export function getWalletAddress() {
    return JSON.parse(sessionStorage.getItem('wallet')).address
}

export function getWalletType() {
    return JSON.parse(sessionStorage.getItem('wallet')).type
}

export function getMyBids() {
    let bids = JSON.parse(localStorage.getItem('bids'));
    if (bids === null) bids = []
    return bids
}

export function setMyBids(bids) {
    localStorage.setItem('bids', JSON.stringify(bids));
}

export function addBid(bid) {
    let bids = getMyBids()
    bids.unshift(bid)
    setMyBids(bids)
}

export function getAssemblerBids() {
    let bids = JSON.parse(localStorage.getItem('assemblerBids'));
    if (bids === null) bids = []
    return bids
}

export function setAssemblerBids(bids) {
    localStorage.setItem('assemblerBids', JSON.stringify(bids));
}

export function addAssemblerBid(bid) {
    let bids = getAssemblerBids()
    bids = bids.concat([bid])
    setAssemblerBids(bids)
}

export function getUrl(url) {
    if (!url.startsWith('http')) url = 'http://' + url;
    if (url.endsWith('/')) url = url.slice(0, url.length - 1);
    return url;
}

export async function copyToClipboard(text) {
    return navigator.clipboard.writeText(text).then(_ => showMsg("Copied!"))
}

export function isAddressValid(address) {
    try {
        return (new Address(address).isValid())
    } catch (_) {
        return false
    }
}
