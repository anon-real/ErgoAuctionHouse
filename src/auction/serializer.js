import { Serializer } from '@coinbarn/ergo-ts/dist/serializer';
import {Address} from "@coinbarn/ergo-ts/dist/models/address";
let ergolib = import('ergo-lib-wasm')

export async function encodeNum(n, isInt = false) {
    if (isInt) return (await ergolib).Constant.from_i32(n).encode_to_base16()
    else return (await ergolib).Constant.from_i64((await ergolib).I64.from_str(n)).encode_to_base16()
}

export async function decodeNum(n, isInt = false) {
    if (isInt) return (await ergolib).Constant.decode_from_base16(n).as_i32()
    else return (await ergolib).Constant.decode_from_base16(n).as_i64().to_str()
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
    return toHexString((await ergolib).Constant.decode_from_base16(encoded).as_byte_array())
}

export async function decodeBox(box, height) {
    let info = Serializer.stringFromHex(
        await decodeString(box.additionalRegisters.R9)
    );
    info = info.split(',').map((num) => parseInt(num));
    box.description = Serializer.stringFromHex(
        await decodeString(box.additionalRegisters.R7)
    );
    box.remBlock = Math.max(info[3] - height, 0);
    box.doneBlock =
        ((height - info[2]) / (info[3] - info[2])) *
        100;
    box.finalBlock = info[3];
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


