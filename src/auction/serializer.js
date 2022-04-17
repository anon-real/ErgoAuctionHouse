import {Serializer} from '@coinbarn/ergo-ts/dist/serializer';
import moment from 'moment';
import {Address, AddressKind} from "@coinbarn/ergo-ts/dist/models/address";
import {boxById, getIssuingBox, getSpendingTx, txById,localApi} from "./explorer";
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
    inf.artHash = box.token.hash
    inf.artCode = box.token.type
    inf.tokenName = box.token.name
    inf.tokenDescription = box.token.description
    inf.artworkUrl = (box.token.url)? box.token.url :"data:image/jpeg;base64,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";


    if (inf.isArtwork) {
        try {
            // || inf.artCode === "0e0430313031"
            if (inf.artCode === "picture") {
                inf.isPicture = true
            } else if (inf.artCode === 'audio') {
                inf.isAudio = true
            } else if (inf.artCode === 'video') {
                inf.isVideo = true
            } else {
                inf.isArtwork = false
                inf.type = 'MtTs'
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
        inf.royalty = box.token.royalty
        inf.artist = box.token.artistId
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
    console.log(box);
    box.boxId = box.id
    box.stableId = box.currentBoxId
    box.stableTxId = box.transactionId
    box.currency = 'ERG'
    box.bidder = '-'
    //should be change to auction value
    box.curBid = 0
    if (box.numberOfAssets > 1) {
        box.currency = box.currencyToken.name
        box.curBid = box.currencyToken.amount
    }
    if (box.bids.length>0) {
        box.bidder = box.bids[0].bidder
        box.curBid = box.bids[0].value
    }

    box.step = box.minStep

    box.instantAmount = box.buyNowAmount

    if (box.description.length === 0) box.description = '-'


    box.remTime = moment.duration(Math.max(box.endTime - block.timestamp, 0), 'milliseconds').format("w [weeks], d [days], h [hours], m [minutes]", {
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

