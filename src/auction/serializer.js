import { Serializer } from '@coinbarn/ergo-ts/dist/serializer';

export function encodeLong(n, isInt = false) {
    n *= 2;
    let vq = Serializer.intToVlq(n);
    let r = '05';
    if (isInt) r = '04';
    vq.forEach((i) => {
        let cur = i.toString(16);
        if (cur.length === 1) cur = '0' + cur;
        r = r + cur;
    });
    return r;
}

export function encodeStr(reg, applyHex = false) {
    let byteArray = reg
    if (applyHex) byteArray = Serializer.stringToHex(reg.toString());
    const b1 = Buffer.from([0x0e]);
    const b2 = Buffer.from(Serializer.intToVlq(byteArray.length / 2)).toString('hex');
    return b1.toString('hex') + b2 + byteArray;
}

export function decodeString(encoded) {
    for (let i = 0; i < encoded.length; i++) {
        if (encodeStr(encoded.slice(i), false) === encoded) {
            return encoded.slice(i)
        }
    }
}
