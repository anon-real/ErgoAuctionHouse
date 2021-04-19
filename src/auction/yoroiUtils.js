/* eslint no-undef: "off"*/
import {showMsg} from "./helpers";

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
