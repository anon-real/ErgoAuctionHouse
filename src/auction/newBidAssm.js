import {addAssemblerBid, getWalletAddress,} from './helpers';
import {Address} from '@coinbarn/ergo-ts';
import {encodeHex, encodeNum} from './serializer';
import {follow, p2s} from "./assembler";
import {additionalData, auctionAddress, contracts, supportedCurrencies, txFee} from "./consts";
import {currentBlock} from "./explorer";

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
  sigmaProp(placeBid || returnFunds)
}`;

export async function registerBid(bidAmount, box) {
    const block = await currentBlock()
    let ourAddr = getWalletAddress();
    let userTree = new Address(ourAddr).ergoTree;
    const p2s = (await getBidP2s(bidAmount, box)).address

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
                let bid = {
                    id: res.id,
                    msg: "Your bid is being placed, see 'My Bids' section for more details.",
                    info: {
                        token: box.assets[0],
                        boxId: box.id,
                        txId: null,
                        tx: null,
                        prevEndTime: box.endTime,
                        shouldExtend: nextEndTime === box.endTime,
                        status: 'pending mining',
                        amount: bidAmount,
                        currency: supportedCurrencies[box.currency],
                        isFirst: false,
                    },
                };
                addAssemblerBid(bid);
            }
            res.address = p2s
            return res;
        });
}

export async function getBidP2s(bid, box) {
    let id64 = Buffer.from(box.boxId, 'hex').toString('base64');
    let currencyId = ''
    if (box.assets.length > 1) currencyId = box.assets[1].tokenId
    currencyId = Buffer.from(currencyId, 'hex').toString('base64');

    let script = template
        .replace('$userAddress', getWalletAddress())
        .replace('$bidAmount', bid)
        .replace('$auctionId', id64)
        .replace('$currencyId', currencyId)
        .replaceAll('\n', '\\n');
    // console.log(script)
    // return
    return p2s(script);
}

