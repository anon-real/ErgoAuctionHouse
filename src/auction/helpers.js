import React from "react";

const explorerUrl = "https://explorer.ergoplatform.com/en/"

export function friendlyToken(token) {
    return token.amount + ' of ' + token.tokenId.slice(0, 13) + '...' + token.tokenId.slice(-13) + ' token';
}

export function getTxUrl(txId) {
    return explorerUrl + "transactions/" + txId
}