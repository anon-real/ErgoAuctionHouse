/* eslint no-undef: "off"*/
import {addNotification, getTxUrl, getWalletAddress, showMsg} from "./helpers";
import {txFee} from "./consts";
import {currentBlock, getBalance} from "./explorer";
import {colTuple, encodeByteArray, encodeHex, encodeNum} from "./serializer";
import {Serializer} from "@coinbarn/ergo-ts/dist/serializer";
import {follow} from "./assembler";

let ergolib = import('ergo-lib-wasm-browser')

function yoroiDisconnect() {
    showMsg('Disconnected from Yoroi wallet', true)
    localStorage.removeItem('wallet');
}

export async function setupYoroi(isFirst = false) {
    if (typeof ergo_request_read_access === "undefined") {
        showMsg('You must install Yoroi-Ergo dApp Connector to be able to connect to Yoroi', true)
    } else {
        if (isFirst) {
            window.removeEventListener("ergo_wallet_disconnected", yoroiDisconnect);
            window.addEventListener("ergo_wallet_disconnected", yoroiDisconnect);
        }
        let hasAccess = await ergo_check_read_access()
        if (!hasAccess) {
            let granted = await ergo_request_read_access()
            if (!granted) {
                if (isFirst) showMsg('Wallet access denied', true)
            } else {
                if (isFirst) showMsg('Successfully connected to Yoroi')
                return true
            }
        } else return true
    }
    return false
}

export async function getYoroiAddress() {
    let res = await setupYoroi()
    if (res) return await ergo.get_change_address();
    return null
}

export async function yoroiSendFunds(need, addr, block, registers={}, notif=true) {
    const wasm = await ergolib

    // await setupYoroi()
    let have = JSON.parse(JSON.stringify(need))
    have['ERG'] += txFee
    let ins = []
    const keys = Object.keys(have)

    const allBal = await getYoroiTokens()
    if (keys.filter(key => key !== 'ERG').filter(key => !Object.keys(allBal).includes(key) || allBal[key].amount < have[key]).length > 0) {
        showMsg('Not enough balance in the Yoroi wallet! See FAQ for more info.', true)
        return
    }

    for (let i = 0; i < keys.length; i++) {
        if (have[keys[i]] <= 0) continue
        const curIns = await ergo.get_utxos(have[keys[i]].toString(), keys[i]);
        if (curIns !== undefined) {
            curIns.forEach(bx => {
                have['ERG'] -= parseInt(bx.value)
                bx.assets.forEach(ass => {
                    if (!Object.keys(have).includes(ass.tokenId)) have[ass.tokenId] = 0
                    have[ass.tokenId] -= parseInt(ass.amount)
                })
            })
            ins = ins.concat(curIns)
        }
    }
    if (keys.filter(key => have[key] > 0).length > 0) {
        showMsg('Not enough balance in the Yoroi wallet! See FAQ for more info.', true)
        return
    }

    const fundBox = {
        value: need['ERG'].toString(),
        ergoTree: wasm.Address.from_mainnet_str(addr).to_ergo_tree().to_base16_bytes(),
        assets: keys.filter(key => key !== 'ERG').map(key => {
            return {
                tokenId: key,
                amount: need[key].toString()
            }
        }),
        additionalRegisters: registers,
        creationHeight: block.height
    }

    const feeBox = {
        value: txFee.toString(),
        creationHeight: block.height,
        ergoTree: "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
        assets: [],
        additionalRegisters: {},
    }

    const changeBox = {
        value: (-have['ERG']).toString(),
        ergoTree: wasm.Address.from_mainnet_str(getWalletAddress()).to_ergo_tree().to_base16_bytes(),
        assets: Object.keys(have).filter(key => key !== 'ERG')
            .filter(key => have[key] < 0)
            .map(key => {
                return {
                    tokenId: key,
                    amount: (-have[key]).toString()
                }
            }),
        additionalRegisters: {},
        creationHeight: block.height
    }

    const unsigned = {
        inputs: ins.map(curIn => {
            return {
                ...curIn,
                extension: {}
            }
        }),
        outputs: [fundBox, changeBox, feeBox],
        dataInputs: [],
        fee: txFee
    }

    let tx = null
    try {
        tx = await ergo.sign_tx(unsigned)
    } catch (e) {
        showMsg('Error while sending funds from Yoroi!', true)
        return
    }
    const txId = await ergo.submit_tx(tx)

    console.log('Yoroi tx id', txId)
    if (notif) {
        if (txId !== undefined && txId.length > 0)
            showMsg('The operation is being done with Yoroi, please wait...')
        else
            showMsg('Error while sending funds using Yoroi!', true)
    }
    return txId
}

export async function getYoroiTokens() {
    await setupYoroi()
    const addresses = (await ergo.get_used_addresses()).concat(await ergo.get_unused_addresses())
    let tokens = {}
    for (let i = 0; i < addresses.length; i++) {
        (await getBalance(addresses[i])).tokens.forEach(ass => {
            if (!Object.keys(tokens).includes(ass.tokenId))
                tokens[ass.tokenId] = {
                    amount: 0,
                    name: ass.name,
                    tokenId: ass.tokenId
                }
            tokens[ass.tokenId].amount += parseInt(ass.amount)
        })
    }
    return tokens
}

