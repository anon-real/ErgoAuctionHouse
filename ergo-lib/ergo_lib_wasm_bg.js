import * as wasm from './ergo_lib_wasm_bg.wasm';

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4);
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
* Box selector implementations
*/
export const BoxSelector = Object.freeze({
/**
* Naive box selector, collects inputs until target balance is reached
*/
Simple:0,"0":"Simple", });
/**
* An address is a short string corresponding to some script used to protect a box. Unlike (string-encoded) binary
* representation of a script, an address has some useful characteristics:
*
* - Integrity of an address could be checked., as it is incorporating a checksum.
* - A prefix of address is showing network and an address type.
* - An address is using an encoding (namely, Base58) which is avoiding similarly l0Oking characters, friendly to
* double-clicking and line-breaking in emails.
*
*
*
* An address is encoding network type, address type, checksum, and enough information to watch for a particular scripts.
*
* Possible network types are:
* Mainnet - 0x00
* Testnet - 0x10
*
* For an address type, we form content bytes as follows:
*
* P2PK - serialized (compressed) public key
* P2SH - first 192 bits of the Blake2b256 hash of serialized script bytes
* P2S  - serialized script
*
* Address examples for testnet:
*
* 3   - P2PK (3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN)
* ?   - P2SH (rbcrmKEYduUvADj9Ts3dSVSG27h54pgrq5fPuwB)
* ?   - P2S (Ms7smJwLGbUAjuWQ)
*
* for mainnet:
*
* 9  - P2PK (9fRAWhdxEsTcdb8PhGNrZfwqa65zfkuYHAMmkQLcic1gdLSV5vA)
* ?  - P2SH (8UApt8czfFVuTgQmMwtsRBZ4nfWquNiSwCWUjMg)
* ?  - P2S (4MQyML64GnzMxZgm, BxKBaHkvrTvLZrDcZjcsxsF7aSsrN73ijeFZXtbj4CXZHHcvBtqSxQ)
*
*
* Prefix byte = network type + address type
*
* checksum = blake2b256(prefix byte ++ content bytes)
*
* address = prefix byte ++ content bytes ++ checksum
*/
export class Address {

    static __wrap(ptr) {
        const obj = Object.create(Address.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_address_free(ptr);
    }
    /**
    * Decode (base58) testnet address from string
    * @param {string} s
    * @returns {Address}
    */
    static from_testnet_str(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_from_testnet_str(ptr0, len0);
        return Address.__wrap(ret);
    }
}
/**
* Box value with with bound checks
*/
export class BoxValue {

    static __wrap(ptr) {
        const obj = Object.create(BoxValue.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_boxvalue_free(ptr);
    }
    /**
    * Recommended (safe) minimal box value to use in case box size estimation is unavailable.
    * Allows box size upto 2777 bytes with current min box value per byte of 360 nanoERGs
    * @returns {BoxValue}
    */
    static SAFE_USER_MIN() {
        var ret = wasm.boxvalue_SAFE_USER_MIN();
        return BoxValue.__wrap(ret);
    }
    /**
    * Create from u32 with bounds check
    * @param {number} v
    * @returns {BoxValue}
    */
    static from_u32(v) {
        var ret = wasm.boxvalue_from_u32(v);
        return BoxValue.__wrap(ret);
    }
}
/**
* Ergo constant(evaluated) values
*/
export class Constant {

    static __wrap(ptr) {
        const obj = Object.create(Constant.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_constant_free(ptr);
    }
    /**
    * Decode from Base16-encoded ErgoTree serialized value
    * @param {string} base16_bytes_str
    * @returns {Constant}
    */
    static decode_from_base16(base16_bytes_str) {
        var ptr0 = passStringToWasm0(base16_bytes_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.constant_decode_from_base16(ptr0, len0);
        return Constant.__wrap(ret);
    }
    /**
    * Encode as Base16-encoded ErgoTree serialized value
    * @returns {string}
    */
    encode_to_base16() {
        try {
            const retptr = wasm.__wbindgen_export_2.value - 16;
            wasm.__wbindgen_export_2.value = retptr;
            wasm.constant_encode_to_base16(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_export_2.value += 16;
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Create from i32 value
    * @param {number} v
    * @returns {Constant}
    */
    static from_i32(v) {
        var ret = wasm.constant_from_i32(v);
        return Constant.__wrap(ret);
    }
    /**
    * Extract i32 value, returning error if wrong type
    * @returns {number}
    */
    as_i32() {
        var ret = wasm.constant_as_i32(this.ptr);
        return ret;
    }
    /**
    * Create from i64
    * @param {I64} v
    * @returns {Constant}
    */
    static from_i64(v) {
        _assertClass(v, I64);
        var ret = wasm.constant_from_i64(v.ptr);
        return Constant.__wrap(ret);
    }
    /**
    * Extract i64 value, returning error if wrong type
    * @returns {I64}
    */
    as_i64() {
        var ret = wasm.constant_as_i64(this.ptr);
        return I64.__wrap(ret);
    }
    /**
    * Create from byte array
    * @param {Uint8Array} v
    * @returns {Constant}
    */
    static from_byte_array(v) {
        var ptr0 = passArray8ToWasm0(v, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.constant_from_byte_array(ptr0, len0);
        return Constant.__wrap(ret);
    }
    /**
    * Extract byte array, returning error if wrong type
    * @returns {Uint8Array}
    */
    as_byte_array() {
        var ret = wasm.constant_as_byte_array(this.ptr);
        return takeObject(ret);
    }
}
/**
* Defines the contract(script) that will be guarding box contents
*/
export class Contract {

    static __wrap(ptr) {
        const obj = Object.create(Contract.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_contract_free(ptr);
    }
    /**
    * create new contract that allow spending of the guarded box by a given recipient ([`Address`])
    * @param {Address} recipient
    * @returns {Contract}
    */
    static pay_to_address(recipient) {
        _assertClass(recipient, Address);
        var ret = wasm.contract_pay_to_address(recipient.ptr);
        return Contract.__wrap(ret);
    }
}
/**
* Ergo box, that is taking part in some transaction on the chain
* Differs with [`ErgoBoxCandidate`] by added transaction id and an index in the input of that transaction
*/
export class ErgoBox {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBox.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_ergobox_free(ptr);
    }
    /**
    * make a new box with:
    * `value` - amount of money associated with the box
    * `contract` - guarding contract([`Contract`]), which should be evaluated to true in order
    * to open(spend) this box
    * `creation_height` - height when a transaction containing the box is created.
    * `tx_id` - transaction id in which this box was "created" (participated in outputs)
    * `index` - index (in outputs) in the transaction
    * @param {BoxValue} value
    * @param {number} creation_height
    * @param {Contract} contract
    * @param {TxId} tx_id
    * @param {number} index
    */
    constructor(value, creation_height, contract, tx_id, index) {
        _assertClass(value, BoxValue);
        _assertClass(contract, Contract);
        _assertClass(tx_id, TxId);
        var ret = wasm.ergobox_new(value.ptr, creation_height, contract.ptr, tx_id.ptr, index);
        return ErgoBox.__wrap(ret);
    }
}
/**
* ErgoBox candidate not yet included in any transaction on the chain
*/
export class ErgoBoxCandidate {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBoxCandidate.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_ergoboxcandidate_free(ptr);
    }
}
/**
* ErgoBoxCandidate builder
*/
export class ErgoBoxCandidateBuilder {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBoxCandidateBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_ergoboxcandidatebuilder_free(ptr);
    }
    /**
    * Create builder with required box parameters:
    * `value` - amount of money associated with the box
    * `contract` - guarding contract([`Contract`]), which should be evaluated to true in order
    * to open(spend) this box
    * `creation_height` - height when a transaction containing the box is created.
    * It should not exceed height of the block, containing the transaction with this box.
    * @param {BoxValue} value
    * @param {Contract} contract
    * @param {number} creation_height
    */
    constructor(value, contract, creation_height) {
        _assertClass(value, BoxValue);
        _assertClass(contract, Contract);
        var ret = wasm.ergoboxcandidatebuilder_new(value.ptr, contract.ptr, creation_height);
        return ErgoBoxCandidateBuilder.__wrap(ret);
    }
    /**
    * Set minimal value (per byte of the serialized box size)
    * @param {number} new_min_value_per_byte
    */
    set_min_box_value_per_byte(new_min_value_per_byte) {
        wasm.ergoboxcandidatebuilder_set_min_box_value_per_byte(this.ptr, new_min_value_per_byte);
    }
    /**
    * Get minimal value (per byte of the serialized box size)
    * @returns {number}
    */
    min_box_value_per_byte() {
        var ret = wasm.ergoboxcandidatebuilder_min_box_value_per_byte(this.ptr);
        return ret >>> 0;
    }
    /**
    * Set new box value
    * @param {BoxValue} new_value
    */
    set_value(new_value) {
        _assertClass(new_value, BoxValue);
        var ptr0 = new_value.ptr;
        new_value.ptr = 0;
        wasm.ergoboxcandidatebuilder_set_value(this.ptr, ptr0);
    }
    /**
    * Get box value
    * @returns {BoxValue}
    */
    value() {
        var ret = wasm.ergoboxcandidatebuilder_value(this.ptr);
        return BoxValue.__wrap(ret);
    }
    /**
    * Calculate serialized box size(in bytes)
    * @returns {number}
    */
    calc_box_size_bytes() {
        var ret = wasm.ergoboxcandidatebuilder_calc_box_size_bytes(this.ptr);
        return ret >>> 0;
    }
    /**
    * Calculate minimal box value for the current box serialized size(in bytes)
    * @returns {BoxValue}
    */
    calc_min_box_value() {
        var ret = wasm.ergoboxcandidatebuilder_calc_min_box_value(this.ptr);
        return BoxValue.__wrap(ret);
    }
    /**
    * Build the box candidate
    * @returns {ErgoBoxCandidate}
    */
    build() {
        var ptr = this.ptr;
        this.ptr = 0;
        var ret = wasm.ergoboxcandidatebuilder_build(ptr);
        return ErgoBoxCandidate.__wrap(ret);
    }
}
/**
* Collection of ErgoBoxCandidates
*/
export class ErgoBoxCandidates {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBoxCandidates.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_ergoboxcandidates_free(ptr);
    }
    /**
    * Create new outputs
    * @param {ErgoBoxCandidate} box_candidate
    */
    constructor(box_candidate) {
        _assertClass(box_candidate, ErgoBoxCandidate);
        var ret = wasm.ergoboxcandidates_new(box_candidate.ptr);
        return ErgoBoxCandidates.__wrap(ret);
    }
}
/**
* Collection of ErgoBox'es
*/
export class ErgoBoxes {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBoxes.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_ergoboxes_free(ptr);
    }
    /**
    * parse ErgoBox array from json
    * @param {any[]} boxes
    * @returns {ErgoBoxes}
    */
    static from_boxes_json(boxes) {
        var ptr0 = passArrayJsValueToWasm0(boxes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ergoboxes_from_boxes_json(ptr0, len0);
        return ErgoBoxes.__wrap(ret);
    }
    /**
    * Create new collection with one element
    * @param {ErgoBox} b
    */
    constructor(b) {
        _assertClass(b, ErgoBox);
        var ret = wasm.ergoboxes_new(b.ptr);
        return ErgoBoxes.__wrap(ret);
    }
    /**
    * Add an element to the collection
    * @param {ErgoBox} b
    */
    add(b) {
        _assertClass(b, ErgoBox);
        wasm.ergoboxes_add(this.ptr, b.ptr);
    }
}
/**
* TBD
*/
export class ErgoStateContext {

    static __wrap(ptr) {
        const obj = Object.create(ErgoStateContext.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_ergostatecontext_free(ptr);
    }
    /**
    * empty (dummy) context (for signing P2PK tx only)
    * @returns {ErgoStateContext}
    */
    static dummy() {
        var ret = wasm.ergostatecontext_dummy();
        return ErgoStateContext.__wrap(ret);
    }
}
/**
* Wrapper for i64 for JS/TS
*/
export class I64 {

    static __wrap(ptr) {
        const obj = Object.create(I64.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_i64_free(ptr);
    }
    /**
    * Create from a standard rust string representation
    * @param {string} string
    * @returns {I64}
    */
    static from_str(string) {
        var ptr0 = passStringToWasm0(string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.i64_from_str(ptr0, len0);
        return I64.__wrap(ret);
    }
    /**
    * String representation of the value for use from environments that don't support i64
    * @returns {string}
    */
    to_str() {
        try {
            const retptr = wasm.__wbindgen_export_2.value - 16;
            wasm.__wbindgen_export_2.value = retptr;
            wasm.i64_to_str(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_export_2.value += 16;
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Secret key for the prover
*/
export class SecretKey {

    static __wrap(ptr) {
        const obj = Object.create(SecretKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_secretkey_free(ptr);
    }
    /**
    * generate random key
    * @returns {SecretKey}
    */
    static random_dlog() {
        var ret = wasm.secretkey_random_dlog();
        return SecretKey.__wrap(ret);
    }
    /**
    * Parse dlog secret key from bytes (SEC-1-encoded scalar)
    * @param {Uint8Array} bytes
    * @returns {SecretKey}
    */
    static dlog_from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.secretkey_dlog_from_bytes(ptr0, len0);
        return SecretKey.__wrap(ret);
    }
    /**
    * Address (encoded public image)
    * @returns {Address}
    */
    get_address() {
        var ret = wasm.secretkey_get_address(this.ptr);
        return Address.__wrap(ret);
    }
}
/**
* ErgoTransaction is an estroys Boxes from the state
* and creates new ones. If transaction is spending boxes protected by some non-trivial scripts,
* its inputs should also contain proof of spending correctness - context extension (user-defined
* key-value map) and data inputs (links to existing boxes in the state) that may be used during
* script reduction to crypto, signatures that satisfies the remaining cryptographic protection
* of the script.
* Transactions are not encrypted, so it is possible to browse and view every transaction ever
* collected into a block.
*/
export class Transaction {

    static __wrap(ptr) {
        const obj = Object.create(Transaction.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_transaction_free(ptr);
    }
    /**
    * JSON representation
    * @returns {any}
    */
    to_json() {
        var ret = wasm.transaction_to_json(this.ptr);
        return takeObject(ret);
    }
}
/**
* Unsigned transaction builder
*/
export class TxBuilder {

    static __wrap(ptr) {
        const obj = Object.create(TxBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_txbuilder_free(ptr);
    }
    /**
    * Creates new TxBuilder
    * `box_selector` - input box selection algorithm to choose inputs from `boxes_to_spend`,
    * `boxes_to_spend` - spendable boxes,
    * `output_candidates` - output boxes to be "created" in this transaction,
    * `current_height` - chain height that will be used in additionally created boxes (change, miner's fee, etc.),
    * `fee_amount` - miner's fee,
    * `change_address` - change (inputs - outputs) will be sent to this address,
    * `min_change_value` - minimal value of the change to be sent to `change_address`, value less than that
    * will be given to miners,
    * @param {number} box_selector
    * @param {ErgoBoxes} inputs
    * @param {ErgoBoxCandidates} output_candidates
    * @param {number} current_height
    * @param {BoxValue} fee_amount
    * @param {Address} change_address
    * @param {BoxValue} min_change_value
    * @returns {TxBuilder}
    */
    static new(box_selector, inputs, output_candidates, current_height, fee_amount, change_address, min_change_value) {
        _assertClass(inputs, ErgoBoxes);
        _assertClass(output_candidates, ErgoBoxCandidates);
        _assertClass(fee_amount, BoxValue);
        _assertClass(change_address, Address);
        _assertClass(min_change_value, BoxValue);
        var ret = wasm.txbuilder_new(box_selector, inputs.ptr, output_candidates.ptr, current_height, fee_amount.ptr, change_address.ptr, min_change_value.ptr);
        return TxBuilder.__wrap(ret);
    }
    /**
    * Build the unsigned transaction
    * @returns {UnsignedTransaction}
    */
    build() {
        var ptr = this.ptr;
        this.ptr = 0;
        var ret = wasm.txbuilder_build(ptr);
        return UnsignedTransaction.__wrap(ret);
    }
}
/**
* Transaction id
*/
export class TxId {

    static __wrap(ptr) {
        const obj = Object.create(TxId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_txid_free(ptr);
    }
    /**
    * Zero (empty) transaction id (to use as dummy value in tests)
    * @returns {TxId}
    */
    static zero() {
        var ret = wasm.txid_zero();
        return TxId.__wrap(ret);
    }
}
/**
* Unsigned (inputs without proofs) transaction
*/
export class UnsignedTransaction {

    static __wrap(ptr) {
        const obj = Object.create(UnsignedTransaction.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_unsignedtransaction_free(ptr);
    }
}
/**
* TBD
*/
export class Wallet {

    static __wrap(ptr) {
        const obj = Object.create(Wallet.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_wallet_free(ptr);
    }
    /**
    * Create wallet instance loading secret key from mnemonic
    * @param {string} _mnemonic_phrase
    * @param {string} _mnemonic_pass
    * @returns {Wallet}
    */
    static from_mnemonic(_mnemonic_phrase, _mnemonic_pass) {
        var ptr0 = passStringToWasm0(_mnemonic_phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(_mnemonic_pass, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.wallet_from_mnemonic(ptr0, len0, ptr1, len1);
        return Wallet.__wrap(ret);
    }
    /**
    * Create wallet using provided secret key
    * @param {SecretKey} secret
    * @returns {Wallet}
    */
    static from_secret(secret) {
        _assertClass(secret, SecretKey);
        var ret = wasm.wallet_from_secret(secret.ptr);
        return Wallet.__wrap(ret);
    }
    /**
    * Sign a transaction:
    * `boxes_to_spend` - unspent boxes [`ErgoBoxCandidate`] used as inputs in the transaction
    * @param {ErgoStateContext} _state_context
    * @param {UnsignedTransaction} tx
    * @param {ErgoBoxes} boxes_to_spend
    * @param {ErgoBoxes} data_boxes
    * @returns {Transaction}
    */
    sign_transaction(_state_context, tx, boxes_to_spend, data_boxes) {
        _assertClass(_state_context, ErgoStateContext);
        _assertClass(tx, UnsignedTransaction);
        _assertClass(boxes_to_spend, ErgoBoxes);
        _assertClass(data_boxes, ErgoBoxes);
        var ret = wasm.wallet_sign_transaction(this.ptr, _state_context.ptr, tx.ptr, boxes_to_spend.ptr, data_boxes.ptr);
        return Transaction.__wrap(ret);
    }
}

export const __wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export const __wbindgen_json_serialize = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = JSON.stringify(obj === undefined ? null : obj);
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbindgen_json_parse = function(arg0, arg1) {
    var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export const __wbindgen_is_undefined = function(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

export const __wbg_buffer_49131c283a06686f = function(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export const __wbg_newwithbyteoffsetandlength_c0f38401daad5a22 = function(arg0, arg1, arg2) {
    var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export const __wbg_new_9b295d24cf1d706f = function(arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export const __wbg_getRandomValues_3ac1b33c90b52596 = function(arg0, arg1, arg2) {
    getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
};

export const __wbg_randomFillSync_6f956029658662ec = function(arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
};

export const __wbg_self_1c83eb4471d9eb9b = handleError(function() {
    var ret = self.self;
    return addHeapObject(ret);
});

export const __wbg_static_accessor_MODULE_abf5ae284bffdf45 = function() {
    var ret = module;
    return addHeapObject(ret);
};

export const __wbg_require_5b2b5b594d809d9f = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
};

export const __wbg_crypto_c12f14e810edcaa2 = function(arg0) {
    var ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export const __wbg_msCrypto_679be765111ba775 = function(arg0) {
    var ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export const __wbg_getRandomValues_05a60bf171bfc2be = function(arg0) {
    var ret = getObject(arg0).getRandomValues;
    return addHeapObject(ret);
};

export const __wbindgen_is_string = function(arg0) {
    var ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export const __wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbindgen_debug_string = function(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export const __wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};

export const __wbindgen_memory = function() {
    var ret = wasm.memory;
    return addHeapObject(ret);
};

