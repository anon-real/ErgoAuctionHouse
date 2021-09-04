import {Address} from "@coinbarn/ergo-ts";

export const auctionAddress = `XaNB7EUoXT5Q7QNUHpHsbnzC2Qf9ndZEqd9DnYMWGJmVWgitGpfvacuVMwakZCdpUbp8kYcpQg5fgTJPWPqPsjzdc3trKc87yTee1SxvoFN3fjXrLfesMe6ioSAxZ3Beh6uqALZwg8VEM8e12yBspAv1nCDhFrkkEY1qHcsqGiRLjbmjkJzAzSvRZeZArWBbcbgcFJjXkBDQ9t4F9PgVBkq8bBsKDWqkLkiSV4SEiv5JJEAkkn8ULquysuDj6sZ1LMVKVur2Pv7thyWpft9df11hVnJh3WU6HkadtmStTsQmFzLwtB5LGqgzbNsbugDfQ9NFWzeMU9YMEkjHbb7f7PbrRruaqEijN2oLuqqHrZDhTJwLpCE6gaNtHGv9J1VJrLr4BL8JL5E7Uti3a9N1RyDwNKysE34HDnN93Q7msPdYkbLDbg7ZDGpRCy62KFYGUc1SwwsNNqHfefb1ytSVj4o8ui9HP3goLPx4vCVXQsCCM7xVXy1qmXcv5pdGhbrHeh4BXPjpbdCoZBsgtJ3U8PbGRAzQAq3391jgqLyKukaoGeMnH3swShYWpbRcsLQ6K39WdVEQ4KJtWS5DPyJ3VzyJsnwy85wuQ1azcRjykHPnhqzLwYzdMVNzTxpptjexAn3xdgU2u2F6o4WNwqFEZ2H9z2o3WnhFYYTPVhMvAvxjGo4iqSTcszKJ455jNMmbgeb7wAhxcV5rUBdGPuSex6vhf8AWfmrUH7QnYNSPthkqicZiFv9qmwdTQPZxHwx6PHwMBfdVBdPwGgrsQNdnvp5x5LjeDYGwPiDvjPw911gt7`
export const auctionAddresses = [auctionAddress]
export let additionalData = {};
export const auctionTrees = [auctionAddress] // array of trees of all auction addresses until now.
    .map((addr) => new Address(addr).ergoTree)
export const trueAddress = '4MQyML64GnzMxZgm'; // dummy address to get unsigned tx from node, we only care about the boxes though in this case
export const auctionContract = ``
export let contracts = {}
contracts[auctionAddress] = {
    isActive: true,
    extendThreshold: 30 * 60 * 1000,
    extendNum: 40 * 60 * 1000,
    loyalty: true,
    customToken: true
}
export const auctionNFT =
    '9ebcd694bf34db4ee3e2ccea0087ca42970743b9e019a1e8d145e8560467c60e';
export const txFee = 1000000;

export const supportedCurrencies = {
    ERG: {
        name: 'ERG',
        id: '',
        decimal: 9,
        minSupported: 10000000
    },
    SigUSD: {
        name: 'SigUSD',
        id: '03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04',
        decimal: 2,
        minSupported: 10
    }
}