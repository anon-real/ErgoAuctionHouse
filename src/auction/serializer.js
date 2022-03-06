import {Serializer} from '@coinbarn/ergo-ts/dist/serializer';
import moment from 'moment';
import {Address, AddressKind} from "@coinbarn/ergo-ts/dist/models/address";
import {boxById, getIssuingBox, getSpendingTx, txById} from "./explorer";
import {supportedCurrencies} from "./consts";
import {getEncodedBox} from "./assembler";
import {getForKey} from "./helpers";
import {addNFTInfo, deleteNFTInfo, getNFTInfo} from "./dbUtils";

var momentDurationFormatSetup = require("moment-duration-format");


let ergolib = import('ergo-lib-wasm-browser')

const floatRe = new RegExp('^([0-9]*[.])?[0-9]*$')
const naturalRe = new RegExp('^[0-9]+$')

export async function encodeLongTuple(a, b) {
    if (typeof a !== 'string') a = a.toString()
    if (typeof b !== 'string') b = b.toString()
    return (await ergolib).Constant.from_i64_str_array([a, b]).encode_to_base16()
}

export async function colTuple(a, b) {
    return (await ergolib).Constant.from_tuple_coll_bytes(Buffer.from(a, 'hex'), Buffer.from(b, 'hex')).encode_to_base16()
}

export async function encodeByteArray(reg) {
    return (await ergolib).Constant.from_byte_array(reg).encode_to_base16()
}

export async function decodeLongTuple(val) {
    return (await ergolib).Constant.decode_from_base16(val).to_i64_str_array().map(cur => parseInt(cur))
}

export async function encodeNum(n, isInt = false) {
    if (isInt) return (await ergolib).Constant.from_i32(n).encode_to_base16()
    else return (await ergolib).Constant.from_i64((await ergolib).I64.from_str(n)).encode_to_base16()
}

export async function decodeNum(n, isInt = false) {
    if (isInt) return (await ergolib).Constant.decode_from_base16(n).to_i32()
    else return (await ergolib).Constant.decode_from_base16(n).to_i64().to_str()
}

export async function encodeHex(reg) {
    return (await ergolib).Constant.from_byte_array(Buffer.from(reg, 'hex')).encode_to_base16()
}

function toHexString(byteArray) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

export async function decodeString(encoded) {
    return toHexString((await ergolib).Constant.decode_from_base16(encoded).to_byte_array())
}

async function decodeColTuple(str) {
    const two = (await ergolib).Constant.decode_from_base16(str).to_tuple_coll_bytes()
    const decoder = new TextDecoder()
    return [decoder.decode(two[0]), decoder.decode(two[1])]
}

async function decodeStr(str) {
    return new TextDecoder().decode((await ergolib).Constant.decode_from_base16(str).to_byte_array())
}

function resolveIpfs(url, isVideo = false) {
    const ipfsPrefix = 'ipfs://'
    if (!url.startsWith(ipfsPrefix)) return url
    else {
        if (isVideo)
            return url.replace(ipfsPrefix, 'https://ipfs.blockfrost.dev/ipfs/')
        return url.replace(ipfsPrefix, 'https://cloudflare-ipfs.com/ipfs/')
    }
}
export async function decodeArtwork2(box, considerArtist = true) {

    let inf = {type: 'other'}

    inf.totalIssued = box.token.amount
    inf.isArtwork = true
    inf.artHash = "dont have"
    inf.artCode = box.token.artwork.type
    inf.tokenName = box.token.name
    inf.tokenDescription = box.token.description
    inf.artworkUrl = (box.token.artwork.url.slice(0,9) === 'artworks/') ? `http://localhost:3001/${box.token.artwork.url}` : box.token.artwork.url;


    if (inf.isArtwork) {
        try {
            // || inf.artCode === "0e0430313031"
            if (inf.artCode === "0101") {
                inf.isPicture = true
                inf.type = 'picture'
            } else if (inf.artCode === '0102') {
                inf.isAudio = true
                inf.type = 'audio'
            } else if (inf.artCode === '0103') {
                inf.isVideo = true
                inf.type = 'video'
            } else {
                inf.isArtwork = false
                inf.type = 'other'
            }
            if (inf.isAudio) {
                inf.audioUrl = inf.artworkUrl

            }
        } catch (e) {
            inf.isArtwork = false
        }

    } else {
        if (inf.tokenName) {
            inf.tokenName = await decodeStr(inf.tokenName)
        }
        if (inf.tokenDescription) {
            inf.tokenDescription = await decodeStr(inf.tokenDescription)
        }
    }

    if (considerArtist) {
        inf.royalty = box.token.artwork.royalty
        inf.artist = box.token.artwork.artist.id
    }
    if (considerArtist) {
        inf.NFTID = box.token.id
        // addNFTInfo(inf).then((d) => console.log(d))
        //     .catch((e) => console.error(e))
    }

    return {...box, ...inf}
}
export async function decodeArtwork(box, tokenId, considerArtist = true) {
    const res = await getIssuingBox(tokenId)
    if (box === null)
        box = res[0]
    let inf = await getNFTInfo(tokenId)
    if (inf !== undefined && considerArtist) {
        if (!inf.isArtwork) inf.type = 'other'
        if (box === null) box = {}
        box = {...box, ...inf}
        if (inf.artist === 'Unknown') {
            await deleteNFTInfo(tokenId)
        }
        else return box
    }
    inf = {type: 'other'}

    inf.totalIssued = res[0].assets[0].amount
    if (Object.keys(res[0].additionalRegisters).length >= 5) {
        inf.isArtwork = true
        inf.artHash = res[0].additionalRegisters.R8
        inf.artCode = res[0].additionalRegisters.R7
        inf.tokenName = res[0].additionalRegisters.R4
        inf.tokenDescription = res[0].additionalRegisters.R5
        if (Object.keys(res[0].additionalRegisters).length === 6)
            inf.artworkUrl = res[0].additionalRegisters.R9
    } else if (Object.keys(res[0].additionalRegisters).length >= 1) {
        inf.tokenName = res[0].additionalRegisters.R4
    }
    if (Object.keys(res[0].additionalRegisters).length >= 2) {
        inf.tokenDescription = res[0].additionalRegisters.R5
    }

    if (inf.isArtwork) {
        try {
            if (inf.artCode === "0e020101" || inf.artCode === "0e0430313031") {
                inf.isPicture = true
                inf.type = 'picture'
            } else if (inf.artCode === '0e020102') {
                inf.isAudio = true
                inf.type = 'audio'
            } else if (inf.artCode === '0e020103') {
                inf.isVideo = true
                inf.type = 'video'
            } else {
                inf.isArtwork = false
                inf.type = 'other'
            }
            if (inf.isArtwork) {
                inf.artHash = await decodeString(inf.artHash)
                inf.tokenName = await decodeStr(inf.tokenName)
                if (inf.tokenName.length === 0) inf.tokenName = '-'
                inf.tokenDescription = await decodeStr(inf.tokenDescription)
                if (inf.isAudio) {
                    try {
                        const two = await decodeColTuple(inf.artworkUrl)
                        inf.audioUrl = resolveIpfs(two[0])
                        inf.artworkUrl = resolveIpfs(two[1])
                    } catch (e) {
                        inf.audioUrl = resolveIpfs(await decodeStr(inf.artworkUrl))
                        inf.artworkUrl = null
                    }

                } else if (inf.artworkUrl)
                    inf.artworkUrl = resolveIpfs(await decodeStr(inf.artworkUrl), inf.isVideo)
            }
        } catch (e) {
            inf.isArtwork = false
        }

    } else {
        if (inf.tokenName) {
            inf.tokenName = await decodeStr(inf.tokenName)
        }
        if (inf.tokenDescription) {
            inf.tokenDescription = await decodeStr(inf.tokenDescription)
        }
    }

    if (considerArtist) {
        try {
            inf.artist = 'Unknown'
            const tokBox = await boxById(tokenId)
            inf.royalty = 0
            if (tokBox.additionalRegisters.R4)
                inf.royalty = await decodeNum(tokBox.additionalRegisters.R4, true)

            inf.artist = await getArtist(tokBox)
        } catch (e) {
            console.error(e)
        }
    }
    if (considerArtist) {
        inf.NFTID = tokenId
        addNFTInfo(inf).then((d) => console.log(d))
            .catch((e) => console.error(e))
    }
    return {...box, ...inf}
}

export async function getArtist(bx) {
    while (AddressKind.P2PK !== new Address(bx.address).getType()) {
        let tx = await txById(bx.txId === undefined ? bx.outputTransactionId : bx.txId)
        bx = tx.inputs[0]
    }
    return bx.address
}
export async function decodeAuction2(box, block) {
    if (box.bids.length>0) {
        box.bids.sort(function(a, b) {
            if (b.amount !== 0 && a.amount !== 0)
                return b.amount - a.amount
            else
                return b.value - a.value
        })
        box.bidder = box.bids[0]["id"]
        box.currency = box.bids[0].name
        box.curBid = box.bids[0].value
    }
    else {
        box.bidder = '-'
        box.currency = 'ERG'
        box.curBid = box.initialBid
    }
    box.step = box.minStep

    box.instantAmount = box.buyNowAmount

    if (box.description.length === 0) box.description = '-'

    box.remTime = Math.max(box.endTime - block.timestamp, 0);
    box.remTime = moment.duration(box.remTime, 'milliseconds').format("w [weeks], d [days], h [hours], m [minutes]", {
        largest: 2,
        trim: true
    })
    box.remTimeTimestamp = box.endTime - block.timestamp
    box.done = ((moment().valueOf() - box.startTime) / (box.endTime - box.startTime)) * 100;
    box.nextBid = box.curBid + box.step
    if (box.curBid < box.minBid) box.nextBid = box.minBid
    if (box.curBid < box.minBid) box.increase = 0
    else box.increase = (((box.curBid - box.minBid) / box.minBid) * 100).toFixed(1);

    box.loader = false;

    box.isFinished = box.remTime === "0 minutes"
    if (box.instantAmount !== -1 && box.curBid >= box.instantAmount)
        box.isFinished = true


    box = await decodeArtwork2(box)

    return box
}
export async function decodeAuction(box, block) {
    box.seller = Address.fromErgoTree(await decodeString(box.additionalRegisters.R4.serializedValue)).address;
    box.bidder = Address.fromErgoTree(await decodeString(box.additionalRegisters.R5.serializedValue)).address;
    const stepInit = await decodeLongTuple(box.additionalRegisters.R6.serializedValue)
    box.minBid = stepInit[0]
    box.initialBid = stepInit[0]
    box.step = stepInit[1]
    box.endTime = parseInt(await decodeNum(box.additionalRegisters.R7.serializedValue))
    box.instantAmount = parseInt(await decodeNum(box.additionalRegisters.R8.serializedValue))

    let info = Serializer.stringFromHex(await decodeString(box.additionalRegisters.R9.serializedValue))
    try {
        const infoJs = JSON.parse(info)
        box.startTime = infoJs.startTime
        box.description = infoJs.description

    } catch (e) {
        box.startTime = parseInt(info.split(',')[1])
        box.description = info.split(',')[2]
    }
    if (box.description.length === 0) box.description = '-'

    box.remTime = Math.max(box.endTime - block.timestamp, 0);
    box.remTime = moment.duration(box.remTime, 'milliseconds').format("w [weeks], d [days], h [hours], m [minutes]", {
        largest: 2,
        trim: true
    })
    box.remTimeTimestamp = box.endTime - block.timestamp
    box.done = ((moment().valueOf() - box.startTime) / (box.endTime - box.startTime)) * 100;
    box.currency = 'ERG'
    box.curBid = box.value
    if (box.numberOfAssets > 1) {
        box.currency = Object.values(supportedCurrencies).find(cur => cur.id === box.bids[0].tokenId).name
        box.curBid = box.assets[1].amount
    }
    box.nextBid = box.curBid + box.step
    if (box.curBid < box.minBid) box.nextBid = box.minBid
    if (box.curBid < box.minBid) box.increase = 0
    else box.increase = (((box.curBid - box.minBid) / box.minBid) * 100).toFixed(1);

    box.loader = false;

    box.isFinished = box.remTime === 0
    if (box.instantAmount !== -1 && box.curBid >= box.instantAmount)
        box.isFinished = true

    box = await decodeArtwork(box, box.assets[0].tokenId)
    return box
}
export async function decodeBoxes2(boxes, block) {

    let cur = await Promise.all(boxes.map((box) => decodeAuction2(box, block)))
    cur = cur.filter(res => res !== undefined)
    cur.sort((a, b) => a.remTime - b.remTime)
    const favs = getForKey('fav-artworks').map(fav => fav.id)
    cur.forEach(bx => {
        bx.isFav = !!favs.includes(bx.token.id);
    })
    return cur
}
export async function decodeBoxes(boxes, block) {
    let cur = await Promise.all(boxes.map((box) => decodeAuction(box, block)))
    cur = cur.filter(res => res !== undefined)
    cur.sort((a, b) => a.remTime - b.remTime)
    const favs = getForKey('fav-artworks').map(fav => fav.id)
    cur.forEach(bx => {
        bx.isFav = !!favs.includes(bx.assets[0].tokenId);
    })
    return cur
}

export function currencyToLong(val, decimal = 9) {
    if (typeof val !== 'string') val = String(val)
    if (val === undefined) return 0
    if (val.startsWith('.')) return parseInt(val.slice(1) + '0'.repeat(decimal - val.length + 1))
    let parts = val.split('.')
    if (parts.length === 1) parts.push('')
    if (parts[1].length > decimal) return 0
    return parseInt(parts[0] + parts[1] + '0'.repeat(decimal - parts[1].length))
}

export function longToCurrency(val, decimal = 9, currencyName = null) {
    if (typeof val !== "number") val = parseInt(val)
    if (currencyName) decimal = supportedCurrencies[currencyName].decimal
    return val / Math.pow(10, decimal)
}

export function isFloat(num) {
    return num === '' || floatRe.test(num)
}

export function isNatural(num) {
    return num === '' || naturalRe.test(num)
}

export async function getEncodedBoxSer(box) {
    const bytes = (await ergolib).ErgoBox.from_json(JSON.stringify(box)).sigma_serialize_bytes()
    return await getEncodedBox(Buffer.from(bytes).toString('hex').toUpperCase())
}

export function isP2pkAddr(tree) {
    return Address.fromErgoTree(tree).getType() === AddressKind.P2PK
}

export async function ttest() {

}

