import React from "react";

const explorerUrl = "https://explorer.ergoplatform.com/en/"

export function friendlyToken(token) {
    return token.amount + ' of ' + token.tokenId.slice(0, 10) + '...' + token.tokenId.slice(-10) + ' token';
}

export function getTxUrl(txId) {
    return explorerUrl + "transactions/" + txId
}