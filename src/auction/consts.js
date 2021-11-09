import {Address} from "@coinbarn/ergo-ts";

export const auctionAddress = `5t19JGogcry9DRipPNcLs4mSnHYXQoqazPDMXXcdMixeH2mkgzMvWXjENsHRJzfP9ftQ8fPvXpuGp1CCQLy3v4x9jFKgMb5dqboJBdJ8jo5Bz3TQ5kWFnSnsHTWjXjnFu12UyCSYV5ifTEnWiaVLd6QgWttLFeiam2eVX5RiaioRAvigFYUA8TtHhMUb2DQ6vPGu8wThtxFLjVnJY4RQg2sceQppVCwATngRGP5mm9PLQ1LSzZb12Afxx8TfMbB6JPXBkPqjN8Rx5DhrrcLQzUqFdrCyw36qucWj6wGUQ3BGzLz5bnyBqUezKnfCShDhTcV266pc8yrjZivsBsDJ8isHwUGm2pKdwiBc2moF4n55ffSWsyx1tzugbkn16QsuMA4enjPS9sT98obbzfbpTaU7dM8hRvdeTSo8xdjzzkUKgfDWnMhcFBNmxm6xukchTB9iRgouQQogajBqi8y41UDJDJDpriUpk36KUyugc7wGCKCtY9QNq4QxFbmA5bu4QenzSQ9izNW3cFsBPf2GFB1KsWwMnuWKaBisSAF47y9Y9ugCnKmukmwCLoRPGUJ2WbqDbiJaYnsAsQ99AMChBELQegCbuTtaczR2fcc3SpsrE7TxXkLj5enH6N21HM2GN9KNJsW1h1B2nGESYhya2naoBekqVwxywQtwuJCQ9QzosUF8WA5KhHM6mdzq91LJbwxScMnfFbSAzm4LHZh8QigJfKj9zoSAFDQ9ptpPjZQksLAqLRhB8As7V5xEHugUxsq4gN6gm2R11M8Ne5yPiQaRaUsAeEwYSKuGwNW9MfysuJPuCH4TfjGEityBvbbNv4rMDTcXPeEbpj5pu4wZU9wEhR5PBAnUeVvYaJVxgE7zuHb1fmpoyfKnKWDfDDq5fTi6YEApo8bZfX27TWTuM8mK3whqDpVpDkEpxy3162St4nxQX8CX9LEVv4YzonCShct97dxPV47CngsPRHth7pL3akM4SVTXjeaJhdovbWHvao7FjB3oVQ4j9QNkTpBLihQTSCXvWtJraPKiePWdTiwn8KgnYcjpzYAN7WmLgB2hpRYwTYvk5LWLQXM6RtKu9T9CUzVfQ8yd9wFYzsrqfmwRcRnYfyZpnGwgpYiSDn3MrY34tEKmLQdDEAmoCW7tKuRjbiYqN3LHFqQdHoW4iFvNAkCwi9vu1NfWACoPCjGHgpV4MqzXzWonTLvcVxwN7B2bxtsuSxjXkYcg5WrC3zM7Hg2CP`
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
        minSupported: 10000000,
        initial: 10000000,
    },
    SigUSD: {
        name: 'SigUSD',
        id: '03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04',
        decimal: 2,
        minSupported: 100,
        initial: 1,
    },
    SigRSV: {
        name: 'SigRSV',
        id: '003bd19d0187117f130b62e1bcab0939929ff5c7709f843c5c4dd158949285d0',
        decimal: 0,
        minSupported: 100,
        initial: 1,
    },
    kushti: {
        name: 'kushti',
        id: 'fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40',
        decimal: 0,
        minSupported: 100,
        initial: 1,
    },
}
export const assmUrl = 'https://assembler.ergoauctions.org/';

export const artworkTypes = {
    image: [0x01, 0x01],
    audio: [0x01, 0x02],
    video: [0x01, 0x03],
}

export const remFavNotif = 12

export const fakeThreshold = 0.05
export const fakeURL = 'https://ergolui.com/nft-check/nfthashcompares/'

export const notifCoolOff = 40
