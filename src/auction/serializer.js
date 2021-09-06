import {Serializer} from '@coinbarn/ergo-ts/dist/serializer';
import moment from 'moment';
import {Address, AddressKind} from "@coinbarn/ergo-ts/dist/models/address";
import {boxById, getIssuingBox, txById} from "./explorer";
import {supportedCurrencies} from "./consts";
var momentDurationFormatSetup = require("moment-duration-format");


let ergolib = import('ergo-lib-wasm-browser')

const floatRe = new RegExp('^([0-9]*[.])?[0-9]*$')
const naturalRe = new RegExp('^[0-9]+$')

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

async function decodeStr(str) {
    return new TextDecoder().decode((await ergolib).Constant.decode_from_base16(str).to_byte_array())
}

export async function decodeBox(box, block) {
    box.seller = Address.fromErgoTree(await decodeString(box.additionalRegisters.R4)).address;
    box.bidder = Address.fromErgoTree(await decodeString(box.additionalRegisters.R5)).address;
    box.step = parseInt(await decodeNum(box.additionalRegisters.R6))
    box.endTime = parseInt(await decodeNum(box.additionalRegisters.R7))
    box.instantAmount = parseInt(await decodeNum(box.additionalRegisters.R8))

    let info = Serializer.stringFromHex(await decodeString(box.additionalRegisters.R9)).split(',')
    box.initialBid = parseInt(info[0])
    box.startTime = parseInt(info[1])
    box.description = info[2]
    if (box.description.length === 0) box.description = '-'

    box.remTime = Math.max(box.endTime - block.timestamp, 0);
    box.remTime = moment.duration(box.remTime, 'milliseconds').format("w [weeks], d [days], h [hours], m [minutes]", {largest: 2, trim: true})
    box.done = ((moment().valueOf() - box.startTime) / (box.endTime - box.startTime)) * 100;
    box.currency = 'ERG'
    box.curBid = box.value
    if (box.assets.length > 1) {
        box.currency = Object.values(supportedCurrencies).find(cur => cur.id === box.assets[1].tokenId).name
        box.curBid = box.assets[1].amount
    }
    box.increase = (((box.curBid - box.initialBid) / box.initialBid) * 100).toFixed(1);

    box.loader = false;

    await getIssuingBox(box.assets[0].tokenId)
        .then((res) => {
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
        })
        .catch(err => {
            console.log(err)
        });
    if (box.isArtwork) {
        try {
            if (box.artCode === "0e020101" || box.artCode === "0e0430313031") {
                box.isPicture = true
            } else if (box.artCode === '0e020102') {
                box.isAudio = true
            } else box.isArtwork = false
            if (box.isArtwork) {
                box.artHash = await decodeString(box.artHash)
                box.tokenName = await decodeStr(box.tokenName)
                if (box.tokenName.length === 0) box.tokenName = '-'
                box.tokenDescription = await decodeStr(box.tokenDescription)
                if (box.artworkUrl)
                    box.artworkUrl = await decodeStr(box.artworkUrl)
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

    try {
        box.artist = 'Unknown'
        const tokBox = await boxById(box.assets[0].tokenId)
        if (AddressKind.P2PK === new Address(tokBox.address).getType())
            box.artist = tokBox.address
        else {
            const tokTx = await txById(tokBox.txId)
            if (AddressKind.P2PK === new Address(tokTx.inputs[0].address).getType())
                box.artist = tokTx.inputs[0].address
        }
    } catch (e) {
        console.log(e)
    }

    return await box
}

export async function decodeBoxes(boxes, block) {
    let cur = await Promise.all(boxes.map((box) => decodeBox(box, block)))
    cur = cur.filter(res => res !== undefined)
    cur.sort((a, b) => a.remTime - b.remTime)
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

export function longToCurrency(val, decimal = 9, currencyName=null) {
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
