/* eslint no-undef: "off"*/
import {getWalletType, showMsg} from './helpers';
import {currentHeight} from './explorer';
import {Nautilus, txFee, Yoroi} from './consts';

let ergolib = import('ergo-lib-wasm-browser')

function walletDisconnect() {
    showMsg(`Disconnected from ${getWalletType()} wallet`, true)
    localStorage.removeItem('wallet');
}

export async function setupWallet(isFirst = false, tp = Nautilus) {
    if (tp !== Yoroi && tp !== Nautilus)
        return null
    const nautilusExists = ergoConnector.nautilus !== undefined && ergoConnector.nautilus.connect !== undefined
    const yoroiExists = ergo_request_read_access !== undefined

    if ((tp === Yoroi && !yoroiExists) || (tp === Nautilus && !nautilusExists)) {
        showMsg(`You should have the ${getWalletType(tp)} wallet installed to be able to connect to it.`, true)
        return null
    }
    let granted = false
    if (tp === Nautilus)
        granted = await ergoConnector.nautilus.connect()
    else if (tp === Yoroi)
        granted = await ergo_request_read_access()

    if (!granted) {
        if (isFirst) showMsg('Wallet access denied', true)
    } else {
        const addr = await getConnectedAddress(tp, false)
        if (isFirst) showMsg(`Successfully connected to ${getWalletName(tp)}`)
        return addr
    }
    return null
}

export async function getConnectedAddress(tp = undefined, setup = true) {
    if (tp === undefined)
        tp = getWalletType()
    if (window.ergo === undefined && setup)
        await setupWallet(false, tp)
    if (tp === Yoroi)
        return await ergo.get_change_address();
    if (tp === Nautilus)
        return await ergo.get_change_address()
    return null
}

export async function walletSendFunds(need, addr, registers = {}, notif = true) {
    const wasm = await ergolib
    await setupWallet(false, getWalletType())
    const height = await currentHeight()

    let have = JSON.parse(JSON.stringify(need))
    have['ERG'] += txFee
    let ins = []
    const keys = Object.keys(have)

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
        showMsg(`Not enough balance in the ${getWalletType()} wallet! See FAQ for more info.`, true)
        return
    }

    const fundBox = {
        value: need['ERG'].toString(),
        ergoTree: (await wasm).Address.from_mainnet_str(addr).to_ergo_tree().to_base16_bytes(),
        assets: keys.filter(key => key !== 'ERG').map(key => {
            return {
                tokenId: key,
                amount: need[key].toString()
            }
        }),
        additionalRegisters: registers,
        creationHeight: height
    }

    const feeBox = {
        value: txFee.toString(),
        creationHeight: height,
        ergoTree: "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
        assets: [],
        additionalRegisters: {},
    }

    const changeBox = {
        value: (-have['ERG']).toString(),
        ergoTree: wasm.Address.from_mainnet_str(await getConnectedAddress()).to_ergo_tree().to_base16_bytes(),
        assets: Object.keys(have).filter(key => key !== 'ERG')
            .filter(key => have[key] < 0)
            .map(key => {
                return {
                    tokenId: key,
                    amount: (-have[key]).toString()
                }
            }),
        additionalRegisters: {},
        creationHeight: height
    }
    const eins = ins.map(curIn => {
        return {
            ...curIn,
            extension: {}
        }
    })
    const unsigned = {
        inputs: eins,
        outputs: [fundBox, changeBox, feeBox],
        dataInputs: eins,
        fee: txFee
    }
    console.log(unsigned)

    let tx = null
    try {
        tx = await ergo.sign_tx(unsigned)
    } catch (e) {
        showMsg(`Error while sending funds from ${getWalletType()}!`, true)
        console.log('error', e)
        return
    }
    console.log(tx)
    return
    const txId = await ergo.submit_tx(tx)

    if (notif) {
        if (txId !== undefined && txId.length > 0)
            showMsg(`The operation is being done with ${getWalletType()}, please wait...`)
        else
            showMsg(`Error while sending funds using ${getWalletType()}!`, true)
    }
    return txId
}

export async function getDappBalance(tokenId) {
    await setupWallet(false, getWalletType())
    return await ergo.get_balance(tokenId)
}

export function getWalletName(tp = Nautilus) {
    if (tp === Nautilus)
        return 'Nautilus'
    else if (tp === Yoroi)
        return 'Yoroi'
    else return 'Unknown Wallet'
}


export async function createTx(ins, outs, dataIns, height) {
    const wasm = await ergolib
    await setupWallet(false, getWalletType())

    ins = ins.map(curIn => toStandardBox(curIn, wasm))
    outs = outs.map(curIn => {
        let st = toStandardBox(curIn, wasm)
        st.creationHeight = height
        return st
    })
    dataIns = dataIns.map(curIn => toStandardBox(curIn, wasm))

    let have = {'ERG': 0}
    have['ERG'] += txFee
    outs.forEach(out => {
        have['ERG'] += parseInt(out.value)
        if (out.assets !== undefined)
            out.assets.forEach(asset => {
                if (have[asset.tokenId] === undefined) have[asset.tokenId] = 0
                have[asset.tokenId] += parseInt(asset.amount)
            })
    })
    ins.forEach(curIn => {
        have['ERG'] -= parseInt(curIn.value)
        curIn.assets.forEach(asset => {
            if (have[asset.tokenId] === undefined) have[asset.tokenId] = 0
            have[asset.tokenId] -= parseInt(asset.amount)
        })
    })

    const keys = Object.keys(have)
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
        showMsg(`Not enough balance in your wallet!`, true)
        return
    }

    const feeBox = {
        value: txFee.toString(),
        creationHeight: height,
        ergoTree: "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
        assets: [],
        additionalRegisters: {},
    }

    const changeBox = {
        value: (-have['ERG']).toString(),
        ergoTree: wasm.Address.from_mainnet_str(await getConnectedAddress()).to_ergo_tree().to_base16_bytes(),
        assets: Object.keys(have).filter(key => key !== 'ERG')
            .filter(key => have[key] < 0)
            .map(key => {
                return {
                    tokenId: key,
                    amount: (-have[key]).toString()
                }
            }),
        additionalRegisters: {},
        creationHeight: height
    }
    outs = outs.concat([changeBox, feeBox])
    const eins = ins.map(curIn => {
        return {
            ...curIn,
            extension: {}
        }
    })
    const eDataIns = dataIns.map(curIn => {
        return {
            ...curIn,
            extension: {}
        }
    })

    const unsigned = {
        inputs: eins,
        outputs: outs,
        dataInputs: eDataIns,
        fee: txFee
    }

    let tx = null
    try {
        tx = await ergo.sign_tx(unsigned)
    } catch (e) {
        showMsg(`Error while sending funds from ${getWalletType()}!`, true)
        console.log('error', e)
        return
    }
    const txId = await ergo.submit_tx(tx)

    if (notif) {
        if (txId !== undefined && txId.length > 0)
            showMsg(`The operation is being done with ${getWalletType()}, please wait...`)
        else
            showMsg(`Error while sending funds using ${getWalletType()}!`, true)
    }
    return txId
}

export function toStandardBox(box, wasm) {
    box.value = box.value.toString()
    if (box.assets !== undefined)
        box.assets = box.assets.map(asset => {
            return {
                tokenId: asset.tokenId,
                amount: asset.amount.toString()
            }
        })
    else box.assets = []
    if (box.additionalRegisters === undefined)
        box.additionalRegisters = {}
    if (box.ergoTree === undefined)
        box.ergoTree = wasm.Address.from_mainnet_str(box.address).to_ergo_tree().to_base16_bytes()
    if (box.boxId === undefined) {
        box.boxId = box.id
        box.id = undefined
    }
    box = JSON.parse(JSON.stringify(box))
    return box
}