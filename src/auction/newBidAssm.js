import {addForKey, firstOrig, getWalletAddress, isAssembler, isYoroi,} from './helpers';
import moment from 'moment';
import {Address} from '@coinbarn/ergo-ts';
import {encodeHex, encodeNum, longToCurrency} from './serializer';
import {follow, p2s} from "./assembler";
import {additionalData, auctionAddress, contracts, txFee} from "./consts";
import {currentBlock} from "./explorer";
import {yoroiSendFunds} from "./yoroiUtils";

const template = `{
  val userAddress = PK("$userAddress")
  val bidAmount = $bidAmountL
  val currencyId = fromBase64("$currencyId")
  val placeBid = {
    INPUTS(INPUTS.size - 1).id == fromBase64("$auctionId") &&
      OUTPUTS(0).R5[Coll[Byte]].get == userAddress.propBytes && 
      ((currencyId.size == 0 && OUTPUTS(0).value == bidAmount) ||
         (OUTPUTS(0).tokens(1)._1 == currencyId && OUTPUTS(0).tokens(1)._2 == bidAmount))
  }
  val returnFunds = {
    val total = INPUTS.fold(0L, {(x:Long, b:Box) => x + b.value}) - 2000000
    OUTPUTS(0).value >= total && OUTPUTS(0).propositionBytes == userAddress.propBytes && OUTPUTS.size == 2
  }
  sigmaProp((placeBid || returnFunds) && HEIGHT < $timestampL)
}`;

export async function registerBid(bidAmount, box) {
    const block = await currentBlock()
    let ourAddr;
    if (isYoroi()) ourAddr = getWalletAddress()
    else ourAddr = getWalletAddress()
    let userTree = new Address(ourAddr).ergoTree;
    const p2s = (await getBidP2s(bidAmount, box, ourAddr)).address
    let nextEndTime = box.endTime
    if (box.endTime - block.timestamp <= contracts[auctionAddress].extendThreshold) {
        nextEndTime += contracts[auctionAddress].extendNum
    }

    let auctionErg = bidAmount
    let start = {
        erg: bidAmount + txFee,
    }
    let auctionAssets = [
        {
            tokenId: box.assets[0].tokenId,
            amount: box.assets[0].amount
        }
    ]
    let returnBidder = {
        value: box.value,
        address: box.bidder,
    };
    if (box.assets.length > 1) {
        start = {}
        start[box.assets[1].tokenId] = bidAmount

        auctionErg = box.value
        auctionAssets = [
            {
                tokenId: box.assets[0].tokenId,
                amount: box.assets[0].amount
            },
            {
                tokenId: box.assets[1].tokenId,
                amount: bidAmount,
            },
        ]

        returnBidder = {
            value: -1,
            address: box.bidder,
            assets: [
                {
                    tokenId: box.assets[1].tokenId,
                    amount: box.assets[1].amount
                }
            ]
        }
    }

    let newBox = {
        value: auctionErg,
        address: auctionAddress,
        assets: auctionAssets,
        registers: {
            R4: box.additionalRegisters.R4.serializedValue,
            R5: await encodeHex(userTree),
            R6: box.additionalRegisters.R6.serializedValue,
            R7: await encodeNum(nextEndTime.toString()),
            R8: box.additionalRegisters.R8.serializedValue,
            R9: box.additionalRegisters.R9.serializedValue,
        },
    };
    let request = {
        // address: "4MQyML64GnzMxZgm",
        address: p2s,
        returnTo: ourAddr,
        startWhen: start,
        txSpec: {
            requests: [newBox, returnBidder],
            fee: txFee,
            inputs: ['$userIns', box.boxId],
            dataInputs: [additionalData.dataInput.boxId],
        },
    };
    return await follow(request)
        .then((res) => {
            if (res.id !== undefined) {
                let pending = {
                    id: res.id,
                    address: p2s,
                    time: moment().valueOf(),
                    key: 'bid',
                    box: box,
                    amount: bidAmount
                };
                addForKey(pending, 'pending')
            }
            res.address = p2s
            res.block = block
            return res;
        });
}

export async function getBidP2s(bid, box, addr) {
    let id64 = Buffer.from(box.boxId, 'hex').toString('base64');
    let currencyId = ''
    if (box.assets.length > 1) currencyId = box.assets[1].tokenId
    currencyId = Buffer.from(currencyId, 'hex').toString('base64');

    let script = template
        .replace('$userAddress', addr)
        .replace('$bidAmount', bid)
        .replace('$auctionId', id64)
        .replace('$currencyId', currencyId)
        .replace('$timestamp', moment().valueOf())
        .replaceAll('\n', '\\n');
    return p2s(script);
}

export async function bidHelper(bid, box, modal, fakeModal, considerFake=true) {
    if (considerFake) {
        const original = await firstOrig(box.assets[0].tokenId)
        if (original !== null) {
            fakeModal(bid, box, modal, original)
            return
        }
    }
    const r = await registerBid(bid, box)
    if (r.id === undefined) throw Error("Could not contact the assembler service")
    if (isAssembler()) {
        modal(r.address, longToCurrency(bid + (box.assets.length === 1 ? txFee : 0), -1, box.currency), false, box.currency)
    } else if (isYoroi()) {
        let need = {ERG: bid + txFee}
        if (box.assets.length > 1) {
            need = {ERG: 2000000}
            need[box.assets[1].tokenId] = bid
        }
        return await yoroiSendFunds(need, r.address, r.block)
    }
}
