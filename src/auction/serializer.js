import { Serializer } from '@coinbarn/ergo-ts/dist/serializer';
import {Address} from "@coinbarn/ergo-ts/dist/models/address";
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
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

export async function decodeString(encoded) {
    return toHexString((await ergolib).Constant.decode_from_base16(encoded).to_byte_array())
}

export async function decodeBox(box, height) {
    let info = Serializer.stringFromHex(
        await decodeString(box.additionalRegisters.R9)
    );
    info = info.split(',').map((num) => parseInt(num));
    let finalBlock = await decodeNum(box.additionalRegisters.R5, true)
    box.description = Serializer.stringFromHex(
        await decodeString(box.additionalRegisters.R7)
    );
    box.remBlock = Math.max(finalBlock - height - 1, 0);
    box.doneBlock =
        ((height - info[2]) / (finalBlock - info[2])) *
        100;
    box.finalBlock = finalBlock;
    box.increase = (
        ((box.value - info[0]) / info[0]) *
        100
    ).toFixed(1);
    box.minStep = info[1];
    box.seller = Address.fromErgoTree(
        await decodeString(box.additionalRegisters.R4)
    ).address;
    box.bidder = Address.fromErgoTree(
        await decodeString(box.additionalRegisters.R8)
    ).address;
    box.loader = false;
    return await box
}

export async function decodeBoxes(boxes, height) {
    return Promise.all(boxes.map((box) => decodeBox(box, height)))
}

export function ergToNano(erg) {
    if (erg === undefined) return 0
    if (erg.startsWith('.')) return parseInt(erg.slice(1) + '0'.repeat(9 - erg.length + 1))
    let parts = erg.split('.')
    if (parts.length === 1) parts.push('')
    if (parts[1].length > 9) return 0
    return parseInt(parts[0] + parts[1] + '0'.repeat(9 - parts[1].length))
}

export function isFloat(num) {
    return num === '' || floatRe.test(num)
}

export function isNatural(num) {
    return num === '' || naturalRe.test(num)
}
