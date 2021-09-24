import {Serializer} from '@coinbarn/ergo-ts/dist/serializer';
import moment from 'moment';
import {Address, AddressKind} from "@coinbarn/ergo-ts/dist/models/address";
import {boxById, getIssuingBox, txById} from "./explorer";
import {supportedCurrencies} from "./consts";
import {getEncodedBox} from "./assembler";
import {getForKey, removeForKey} from "./helpers";

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

export async function decodeArtwork(box, tokenId, considerArtist=true) {
    const res = await getIssuingBox(tokenId)
    if (box === null)
        box = res[0]
    if (Object.keys(res[0].additionalRegisters).length >= 5) {
        box.isArtwork = true
        box.artHash = res[0].additionalRegisters.R8
        box.artCode = res[0].additionalRegisters.R7
        box.tokenName = res[0].additionalRegisters.R4
        box.tokenDescription = res[0].additionalRegisters.R5
        if (Object.keys(res[0].additionalRegisters).length === 6)
            box.artworkUrl = res[0].additionalRegisters.R9
    } else if (Object.keys(res[0].additionalRegisters).length >= 1) {
        box.tokenName = res[0].additionalRegisters.R4
    }
    if (Object.keys(res[0].additionalRegisters).length >= 2) {
        box.tokenDescription = res[0].additionalRegisters.R5
    }

    if (box.isArtwork) {
        try {
            if (box.artCode === "0e020101" || box.artCode === "0e0430313031") {
                box.isPicture = true
                box.type = 'picture'
            } else if (box.artCode === '0e020102') {
                box.isAudio = true
                box.type = 'audio'
            } else if (box.artCode === '0e020103') {
                box.isVideo = true
                box.type = 'video'
            } else {
                box.isArtwork = false
                box.type = 'other'
            }
            if (box.isArtwork) {
                box.artHash = await decodeString(box.artHash)
                box.tokenName = await decodeStr(box.tokenName)
                if (box.tokenName.length === 0) box.tokenName = '-'
                box.tokenDescription = await decodeStr(box.tokenDescription)
                if (box.isAudio) {
                    try {
                        const two = await decodeColTuple(box.artworkUrl)
                        box.audioUrl = resolveIpfs(two[0])
                        box.artworkUrl = resolveIpfs(two[1])
                    } catch (e) {
                        box.audioUrl = resolveIpfs(await decodeStr(box.artworkUrl))
                        box.artworkUrl = null
                    }

                } else if (box.artworkUrl)
                    box.artworkUrl = resolveIpfs(await decodeStr(box.artworkUrl), box.isVideo)
            }
        } catch (e) {
            box.isArtwork = false
        }

    } else {
        if (box.tokenName) {
            box.tokenName = await decodeStr(box.tokenName)
        }
        if (box.tokenDescription) {
            box.tokenDescription = await decodeStr(box.tokenDescription)
        }
    }

    if (considerArtist) {
        try {
            box.artist = 'Unknown'
            const tokBox = await boxById(box.assets[0].tokenId)
            box.royalty = 0
            if (tokBox.additionalRegisters.R4)
                box.royalty = await decodeNum(tokBox.additionalRegisters.R4, true)
            if (AddressKind.P2PK === new Address(tokBox.address).getType())
                box.artist = tokBox.address
            else {
                const tokTx = await txById(tokBox.txId)
                if (AddressKind.P2PK === new Address(tokTx.inputs[0].address).getType())
                    box.artist = tokTx.inputs[0].address
            }
        } catch (e) {
            console.error(e)
        }
    }
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

    let info = Serializer.stringFromHex(await decodeString(box.additionalRegisters.R9.serializedValue)).split(',')
    box.startTime = parseInt(info[1])
    box.description = info[2]
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
    if (box.assets.length > 1) {
        box.currency = Object.values(supportedCurrencies).find(cur => cur.id === box.assets[1].tokenId).name
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

    await decodeArtwork(box, box.assets[0].tokenId)
    return box
}

export async function decodeBoxes(boxes, block) {
    let cur = await Promise.all(boxes.map((box) => decodeAuction(box, block)))
    cur = cur.filter(res => res !== undefined)
    cur.sort((a, b) => a.remTime - b.remTime)
    const favs = getForKey('fav-artworks').map(fav => fav.id)
    cur.forEach(bx => {
        if (favs.includes(bx.assets[0].tokenId)) bx.isFav = true
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

