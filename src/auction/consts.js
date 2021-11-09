import {Address} from "@coinbarn/ergo-ts";

export const auctionAddress = `2e4LGewjRex3MAXn1KcU5Z2veDWC3JjtMrdpA4MLztF4BQkQnt2JshCWXx4ArYcidekxmy9sT2DusC2wb1j76aoMHVoJBjsgiQHgvHuDx7fbeYwnH9BVci1pPkj4dUJb3gxtY2SY9pooSiaAeeUuj2kaEaXtbjFg8hwiUT5pUdZNYdEsSKALmrBYqB4eb4RQr9XJdVERikELrG91tGab5jDpYZksqLx5jU4W54voizGHNF8YWEyuUADnpgkaZ9G8nAE6F6s6LRDW78iYAYBphSa31252WueodXcBmdF65A8YSVbJXnHtJTeGnKyPy9os13LbG6eeHWWyjqkLR8pWZ5Unbt2ALVoDjtxcVo7TrRBhY6WtnHyZDdSE78agukTwmSJsY3rnq2kmakrTWC3BGo77nZHLLjgCK8EnrLsZySnXZ178mKkS6qTHMvDWrc8GXPukBwG5bLiU4ohX6DznETiyMkRhaFkHPQTav9qN9FiPSaQPAbK7cgjsciXwKAr3ydWD8Q3NrtiwSMqA1eZ3bytGDQwNs6hpYKPcU9NBPBbNHaCHUixE7UjBk2JYQVcWFJSx7bftaFxZfzdv9kaXbTQoFQDpsvNRmEmWMpQYppnUjBFEWWgkEaxdsbxJUAD3JNHt12XZAVzb1pXMk7BV3s39NkZR7YW1bwRyzPgrX8AVS87uEv9ootp74hE4xk8RiD8py2x1KuyLVKCWjkQMDDKF11wnvZmeke7RkSazeyDqz9bsDQQU3R9wDqb5EZ9LF1RKoadab4ty9NZdWLeAYRWxxPKemV23bejgJyJYkQ7vTPobgMdprAAyMmUmLqdWRZeabRzd4LsZhifGBAN68otJUatznAgkpSrkzEfe5dFRbdjMvCxssKhJECTRMureMkwAP13qEJvfib7VgbupjsMVYEpFz53ejkBDCSYdVEvXv6WjhDkUqsFreaREo7ycwcSMcMkgzg2yDQZg4kHKTTZHTZ7oQXTjTeZz1PUzA1MJsGppNeS75QeskGqgYQrAR3RK3t24hatm18C2zr1mQ77aHay4dpiGpftf85BCPNHwXfGtqGpYWUKK2HUXKERLPXXT8rG3Vam3NEH8aiTU5FZAbNkjyJ6zZZoFNBZJfjtViScLBwHT2R3FEJtmTyjeatMmAxyBNmAMSXpon79fJzQiYocERLeQJJZ1225Xjw9JfUTTozr1njxdrbPGNqQ4NLzh5SCyTkdq4Y8o93DgUyWfWeJ9kspR`
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
