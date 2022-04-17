import React from 'react';
import {Flip, Slide, toast} from 'react-toastify';
import {Address} from "@coinbarn/ergo-ts";
import {additionalData, auctionNFT, fakeThreshold, fakeURL, notifCoolOff} from "./consts";
import {getBoxesForAsset} from "./explorer";
import moment from "moment";
import ahIcon from "../assets/images/Ergo_auction_house_logo.png";
import onlyLogo from "../assets/images/only-logo.png";
import {get} from "./rest";

const explorerUrl = 'https://explorer.ergoplatform.com/en/';
const thumbnailUrl = process.env.REACT_APP_thumbnailApi

export function friendlyToken(token, quantity = true, length = 13) {
    let res = '';
    if (quantity) res = token.amount + ' of ';
    res +=
        token.id.slice(0, length) +
        '...' +
        token.id.slice(-length) +
        ' token';
    return res
}

export function getThumbnailAddress(token){
    return `${thumbnailUrl}/${token}`
}

export function friendlyAddress(addr, tot = 13) {
    if (addr === undefined || addr.slice === undefined) return ''
    return addr.slice(0, tot) + '...' + addr.slice(-tot);
}

export function friendlyName(name, tot = 80) {
    if (name === undefined || name.slice === undefined) return ''
    else if (name.length < tot) return name
    return name.slice(0, tot) + '...';

}

export function getTxUrl(txId) {
    return explorerUrl + 'transactions/' + txId;
}

export function getAuctionUrl(boxId) {
    return '#/auction/specific/' + boxId;
}

export function getArtworkUrl(tokenId) {
    return '#/artwork/' + tokenId;
}

export function getAddrUrl(addr) {
    return explorerUrl + 'addresses/' + addr;
}

export function getArtistUrl(addr) {
    return '#/auction/active?type=all&artist' + addr;
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
    return sessionStorage.getItem('wallet') !== null || localStorage.getItem('wallet') !== null;
}

export function isAssembler() {
    return isWalletSaved() && getWalletType() === 'assembler';
}

export function isYoroi() {
    return isWalletSaved() && getWalletType() === 'yoroi';
}

export function getWalletAddress() {
    return JSON.parse(localStorage.getItem('wallet')).address
}

export function getWalletType() {
    if (localStorage.getItem('wallet') !== null)
        return JSON.parse(localStorage.getItem('wallet')).type
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

export function getForKey(key) {
    let reqs = JSON.parse(localStorage.getItem(key));
    if (reqs === null) reqs = []
    return reqs
}

export function setForKey(reqs, key) {
    localStorage.setItem(key, JSON.stringify(reqs));
}

export function addForKey(req, key) {
    let reqs = getForKey(key)
    if (reqs.length < 100) {
        if (reqs.map(cur => cur.id).includes(req.id))
            return
    }
    reqs = reqs.concat([req])
    setForKey(reqs, key)
}

export function removeForKey(key, toRem) {
    let reqs = getForKey(key).filter(req => req.id !== toRem)
    setForKey(reqs, key)
}

export function updateForKey(key, toUp) {
    let reqs = getForKey(key).map(req => {
        if (req.id !== toUp.id) return req
        return toUp
    })
    setForKey(reqs, key)
}

export function getUrl(url) {
    if (!url.startsWith('http')) url = 'http://' + url;
    if (url.endsWith('/')) url = url.slice(0, url.length - 1);
    return url;
}

export function addNotification(msg, lnk, stat = 'info') {
    let nots = JSON.parse(localStorage.getItem('notification'))
    if (nots === null)
        nots = {
            data: [],
            unread: 0
        }
    nots.unread += 1
    nots.data = nots.data.concat([{
        message: msg,
        link: lnk,
        status: stat,
        time: moment().valueOf()
    }])
    setForKey(nots, 'notification')
    notifyMe(msg, lnk).then(r => {
    })
}

export function isNotifSupported() {
    return 'Notification' in window
}

export async function notifyMe(msg, lnk) {
    if (additionalData.lastNotif) {
        const lastNotif = moment.duration(moment().diff(moment(additionalData.lastNotif))).asSeconds();
        if (lastNotif < notifCoolOff) return
    }
    additionalData.lastNotif = moment().valueOf()
    if (!isNotifSupported()) return
    if (Notification.permission !== 'granted')
        await Notification.requestPermission();
    else {
        const notification = new Notification('New Notification for the Ergo Auction House', {
            icon: onlyLogo,
            body: msg,
            image: onlyLogo
        });
        notification.onclick = function () {
            window.open(lnk);
        };
    }
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

export async function updateDataInput() {
    additionalData['dataInput'] = (await getBoxesForAsset(auctionNFT)).items[0]
}

export async function uploadArtwork(file) {
    let form = new FormData();
    form.append('file', file);

    return fetch('https://ergoutilsupload.azurewebsites.net/ipfs/', {
        method: 'POST',
        body: form,
    }).then(res => res.json())
        .then(res => {
            return `ipfs://${res.value.cid}`
        })
}

export function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export async function firstOrig(id) {
    try {
        let res = await fetch(fakeURL + `?copiedTokenId=${id}&threshold=${fakeThreshold}&format=json`)
        res = await res.json()
        res = res.results
        if (res.length > 0) return res[0].originalNFT.token_id
        else return null
    } catch (e) {
        return null
    }
}
export function parseQueries(query) {
    let queries = query.slice(1).split('&')
    let queryMp = {}
    queries.forEach(query => {
        let cur = query.split('=')
        if (cur[0].length > 0)
            queryMp[cur[0]] = decodeURI(cur[1])
    })
    if (!Object.keys(queryMp).includes('artist'))
        queryMp['artist'] = undefined
    if (!Object.keys(queryMp).includes('searchValue'))
        queryMp['searchValue'] = undefined
    return queryMp
}

export function encodeQueries(queries) {
    return Object.keys(queries).filter(key => queries[key]).map(key => `${key}=${queries[key]}`).join('&')
}

