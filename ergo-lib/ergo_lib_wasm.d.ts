/* tslint:disable */
/* eslint-disable */
/**
* Box selector implementations
*/
export enum BoxSelector {
/**
* Naive box selector, collects inputs until target balance is reached
*/
  Simple,
}
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
  free(): void;
/**
* Decode (base58) testnet address from string
* @param {string} s
* @returns {Address}
*/
  static from_testnet_str(s: string): Address;
}
/**
* Box value with with bound checks
*/
export class BoxValue {
  free(): void;
/**
* Recommended (safe) minimal box value to use in case box size estimation is unavailable.
* Allows box size upto 2777 bytes with current min box value per byte of 360 nanoERGs
* @returns {BoxValue}
*/
  static SAFE_USER_MIN(): BoxValue;
/**
* Create from u32 with bounds check
* @param {number} v
* @returns {BoxValue}
*/
  static from_u32(v: number): BoxValue;
}
/**
* Ergo constant(evaluated) values
*/
export class Constant {
  free(): void;
/**
* Decode from Base16-encoded ErgoTree serialized value
* @param {string} base16_bytes_str
* @returns {Constant}
*/
  static decode_from_base16(base16_bytes_str: string): Constant;
/**
* Encode as Base16-encoded ErgoTree serialized value
* @returns {string}
*/
  encode_to_base16(): string;
/**
* Create from i32 value
* @param {number} v
* @returns {Constant}
*/
  static from_i32(v: number): Constant;
/**
* Extract i32 value, returning error if wrong type
* @returns {number}
*/
  as_i32(): number;
/**
* Create from i64
* @param {I64} v
* @returns {Constant}
*/
  static from_i64(v: I64): Constant;
/**
* Extract i64 value, returning error if wrong type
* @returns {I64}
*/
  as_i64(): I64;
/**
* Create from byte array
* @param {Uint8Array} v
* @returns {Constant}
*/
  static from_byte_array(v: Uint8Array): Constant;
/**
* Extract byte array, returning error if wrong type
* @returns {Uint8Array}
*/
  as_byte_array(): Uint8Array;
}
/**
* Defines the contract(script) that will be guarding box contents
*/
export class Contract {
  free(): void;
/**
* create new contract that allow spending of the guarded box by a given recipient ([`Address`])
* @param {Address} recipient
* @returns {Contract}
*/
  static pay_to_address(recipient: Address): Contract;
}
/**
* Ergo box, that is taking part in some transaction on the chain
* Differs with [`ErgoBoxCandidate`] by added transaction id and an index in the input of that transaction
*/
export class ErgoBox {
  free(): void;
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
  constructor(value: BoxValue, creation_height: number, contract: Contract, tx_id: TxId, index: number);
}
/**
* ErgoBox candidate not yet included in any transaction on the chain
*/
export class ErgoBoxCandidate {
  free(): void;
}
/**
* ErgoBoxCandidate builder
*/
export class ErgoBoxCandidateBuilder {
  free(): void;
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
  constructor(value: BoxValue, contract: Contract, creation_height: number);
/**
* Set minimal value (per byte of the serialized box size)
* @param {number} new_min_value_per_byte
*/
  set_min_box_value_per_byte(new_min_value_per_byte: number): void;
/**
* Get minimal value (per byte of the serialized box size)
* @returns {number}
*/
  min_box_value_per_byte(): number;
/**
* Set new box value
* @param {BoxValue} new_value
*/
  set_value(new_value: BoxValue): void;
/**
* Get box value
* @returns {BoxValue}
*/
  value(): BoxValue;
/**
* Calculate serialized box size(in bytes)
* @returns {number}
*/
  calc_box_size_bytes(): number;
/**
* Calculate minimal box value for the current box serialized size(in bytes)
* @returns {BoxValue}
*/
  calc_min_box_value(): BoxValue;
/**
* Build the box candidate
* @returns {ErgoBoxCandidate}
*/
  build(): ErgoBoxCandidate;
}
/**
* Collection of ErgoBoxCandidates
*/
export class ErgoBoxCandidates {
  free(): void;
/**
* Create new outputs
* @param {ErgoBoxCandidate} box_candidate
*/
  constructor(box_candidate: ErgoBoxCandidate);
}
/**
* Collection of ErgoBox'es
*/
export class ErgoBoxes {
  free(): void;
/**
* parse ErgoBox array from json
* @param {any[]} boxes
* @returns {ErgoBoxes}
*/
  static from_boxes_json(boxes: any[]): ErgoBoxes;
/**
* Create new collection with one element
* @param {ErgoBox} b
*/
  constructor(b: ErgoBox);
/**
* Add an element to the collection
* @param {ErgoBox} b
*/
  add(b: ErgoBox): void;
}
/**
* TBD
*/
export class ErgoStateContext {
  free(): void;
/**
* empty (dummy) context (for signing P2PK tx only)
* @returns {ErgoStateContext}
*/
  static dummy(): ErgoStateContext;
}
/**
* Wrapper for i64 for JS/TS
*/
export class I64 {
  free(): void;
/**
* Create from a standard rust string representation
* @param {string} string
* @returns {I64}
*/
  static from_str(string: string): I64;
/**
* String representation of the value for use from environments that don't support i64
* @returns {string}
*/
  to_str(): string;
}
/**
* Secret key for the prover
*/
export class SecretKey {
  free(): void;
/**
* generate random key
* @returns {SecretKey}
*/
  static random_dlog(): SecretKey;
/**
* Parse dlog secret key from bytes (SEC-1-encoded scalar)
* @param {Uint8Array} bytes
* @returns {SecretKey}
*/
  static dlog_from_bytes(bytes: Uint8Array): SecretKey;
/**
* Address (encoded public image)
* @returns {Address}
*/
  get_address(): Address;
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
  free(): void;
/**
* JSON representation
* @returns {any}
*/
  to_json(): any;
}
/**
* Unsigned transaction builder
*/
export class TxBuilder {
  free(): void;
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
  static new(box_selector: number, inputs: ErgoBoxes, output_candidates: ErgoBoxCandidates, current_height: number, fee_amount: BoxValue, change_address: Address, min_change_value: BoxValue): TxBuilder;
/**
* Build the unsigned transaction
* @returns {UnsignedTransaction}
*/
  build(): UnsignedTransaction;
}
/**
* Transaction id
*/
export class TxId {
  free(): void;
/**
* Zero (empty) transaction id (to use as dummy value in tests)
* @returns {TxId}
*/
  static zero(): TxId;
}
/**
* Unsigned (inputs without proofs) transaction
*/
export class UnsignedTransaction {
  free(): void;
}
/**
* TBD
*/
export class Wallet {
  free(): void;
/**
* Create wallet instance loading secret key from mnemonic
* @param {string} _mnemonic_phrase
* @param {string} _mnemonic_pass
* @returns {Wallet}
*/
  static from_mnemonic(_mnemonic_phrase: string, _mnemonic_pass: string): Wallet;
/**
* Create wallet using provided secret key
* @param {SecretKey} secret
* @returns {Wallet}
*/
  static from_secret(secret: SecretKey): Wallet;
/**
* Sign a transaction:
* `boxes_to_spend` - unspent boxes [`ErgoBoxCandidate`] used as inputs in the transaction
* @param {ErgoStateContext} _state_context
* @param {UnsignedTransaction} tx
* @param {ErgoBoxes} boxes_to_spend
* @param {ErgoBoxes} data_boxes
* @returns {Transaction}
*/
  sign_transaction(_state_context: ErgoStateContext, tx: UnsignedTransaction, boxes_to_spend: ErgoBoxes, data_boxes: ErgoBoxes): Transaction;
}
