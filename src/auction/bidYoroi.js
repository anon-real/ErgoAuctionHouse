/* eslint no-undef: "off"*/

import {post, get} from './rest';
import {
    addAssemblerBid,
    addBid,
    getAssemblerBids,
    getUrl,
    getWalletAddress,
    isAssembler,
    isWalletNode,
    setAssemblerBids,
    showMsg,
} from './helpers';
import {Address, Transaction} from '@coinbarn/ergo-ts';
import {
    additionalData,
    auctionFee,
    auctionWithExtensionTree,
    extendNum,
    extendThreshold,
    sendTx, trueAddress,
} from './explorer';
import {decodeNum, decodeString, encodeHex, encodeNum} from './serializer';
import {setupYoroi} from "./yoroiUtils";

let ergolib = import('ergo-lib-wasm-browser')

export async function placeBid(currentHeight, bidAmount, box) {
    let wasm = await ergolib
    let yoroiRes = await setupYoroi()
    if (!yoroiRes) throw new Error('Could not connect to Yoroi wallet')

    let ourAddr = getWalletAddress();
    let tree = new Address(ourAddr).ergoTree;

    let oldBid = wasm.ErgoBox.from_json(JSON.stringify(box))

    const utxos = await ergo.get_utxos(bidAmount + auctionFee);
    const selector = new wasm.SimpleBoxSelector();
    let ins = wasm.ErgoBoxes.from_boxes_json(utxos)
    let needTokens = new wasm.Tokens()
    needTokens.add(oldBid.tokens().get(0))
    ins.add(oldBid)
    const boxSelection = selector.select(
        ins,
        wasm.BoxValue.from_i64(wasm.I64.from_str(bidAmount.toString())
            .checked_add(wasm.I64.from_str(auctionFee.toString())
                .checked_add(oldBid.value().as_i64()))),
        needTokens)

    const returnBidder = new wasm.ErgoBoxCandidateBuilder(
        oldBid.value(),
        wasm.Contract.pay_to_address(wasm.Address.from_base58(box.bidder),
            currentHeight))

    const bid = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(bidAmount.toString())),
        wasm.Contract.pay_to_address(wasm.Address.from_base58(box.address),
            currentHeight))
    bid.add_token(oldBid.tokens().get(0).id(), oldBid.tokens().get(0).amount())

    let nextEndTime =
        box.finalBlock - currentHeight <= extendThreshold &&
        box.ergoTree === auctionWithExtensionTree
            ? box.finalBlock + extendNum
            : box.finalBlock;
    if (nextEndTime !== box.finalBlock)
        console.log(
            `extended from ${box.finalBlock} to ${nextEndTime}. height: ${currentHeight}`
        );

    bid.set_register_value(4, oldBid.register_value(4))
    bid.set_register_value(5, wasm.Constant.from_i32(nextEndTime))
    bid.set_register_value(6, oldBid.register_value(6))
    bid.set_register_value(7, oldBid.register_value(7))
    bid.set_register_value(8, wasm.Constant.from_byte_array(Buffer.from(tree, 'hex')))
    if (oldBid.register_value(9) !== undefined)
        bid.set_register_value(9, oldBid.register_value(9))

    let outs = new wasm.ErgoBoxCandidates(bid.build())
    outs.add(returnBidder.build())

    const txBuilder = wasm.TxBuilder.new(
        boxSelection,
        outs,
        currentHeight,
        wasm.BoxValue.from_i64(wasm.I64.from_str(auctionFee.toString())),
        wasm.Address.from_base58(ourAddr),
        wasm.BoxValue.SAFE_USER_MIN());
    txBuilder.d

    try {
        txBuilder.build()
    } catch (e) {
        console.log(e)
    }
    console.log('here')
    console.log(box)
    console.log(txBuilder.build().to_json())


    return

    let newBox = {
        value: bidAmount,
        address: Address.fromErgoTree(box.ergoTree).address,
        assets: box.assets,
        registers: {
            R4: box.additionalRegisters.R4,
            R5: encodedNextEndTime,
            R6: box.additionalRegisters.R6,
            R7: box.additionalRegisters.R7,
            R8: encodedTree,
            R9: box.additionalRegisters.R9,
        },
    };
    let request = {
        address: address,
        returnTo: ourAddr,
        startWhen: {
            erg: bidAmount + auctionFee,
        },
        txSpec: {
            requests: [newBox, returnBidder],
            fee: auctionFee,
            inputs: ['$userIns', box.id],
            dataInputs: [additionalData.dataInput.id],
        },
    };
    return await follow(request)
        .then((res) => {
            if (res.id !== undefined) {
                let bid = {
                    id: res.id,
                    msg: "Your bid is being placed by the assembler service, see 'My Bids' section for more details.",
                    info: {
                        token: box.assets[0],
                        boxId: box.id,
                        txId: null,
                        tx: null,
                        prevEndTime: box.finalBlock,
                        shouldExtend:
                            box.ergoTree === auctionWithExtensionTree &&
                            nextEndTime === box.finalBlock,
                        status: 'pending mining',
                        amount: bidAmount,
                        isFirst: false,
                    },
                };
                addAssemblerBid(bid);
            }
            return res;
        });
}

export async function getBidP2s(bid, box) {
    let id64 = Buffer.from(box.id, 'hex').toString('base64');
    let script = template
        .replace('$userAddress', getWalletAddress())
        .replace('$bidAmount', bid)
        .replace('$endTime', box.finalBlock)
        .replace('$auctionId', id64)
        .replaceAll('\n', '\\n');
    return p2s(script);
}

