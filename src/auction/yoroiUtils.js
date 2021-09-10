/* eslint no-undef: "off"*/
import {showMsg} from "./helpers";
import {txFee} from "./consts";
import {Address} from "@coinbarn/ergo-ts/dist/models/address";
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

export async function yoroiSendFunds(need, addr, block) {
    const wasm = await ergolib

    await setupYoroi()
    let have = JSON.parse(JSON.stringify(need))
    have['ERG'] += txFee
    let ins = []
    const keys = Object.keys(have)
    for (let i = 0; i < keys.length; i++) {
        // if (keys[i] === 'ERG') continue // TODO fix
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
        showMsg('Not enough balance in the Yoroi wallet!', true)
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
        additionalRegisters: {},
        creationHeight: block.height
    }

    const changeBox = {
        value: (-have['ERG']).toString(),
        ergoTree: wasm.Address.from_mainnet_str(await getYoroiAddress()).to_ergo_tree().to_base16_bytes(),
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
        outputs: [fundBox, changeBox],
        dataInputs: [],
        fee: txFee
    }
    console.log(JSON.stringify(unsigned))
    const tx = await ergo.sign_tx(unsigned)
    console.log('yoy', tx)

    showMsg('Congrats!!!')
}