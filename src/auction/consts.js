import {Address} from "@coinbarn/ergo-ts";

export const auctionAddress = `3cVSf8PPdT3GVE782iaguCye3dFXxbU5z9ah5AfxuQ6SjLrnYYj9H1R6CjqQNF6vzwMqTcYLJTjeK3TWSENwaEw3Uu36nuZHRK7Py9Rydt7pSFKQ4uSn7RvpoMAidjx9kar1GDf54PNTB8tmVvCHCwuNG4YUnNHjkF3PhK8dwo6wybxt5xYzxDosjb1ddZzLLZryMGBzJutHdjyBDK8JinbkjGQ8fDwKxDL5T6nW5XTsoU2NWLngfky8AzF1y4nn6mPShN7pTNdjSGCVhAZBsGt3i5tVVnuu1kD4kffvSpEcWBrVuMijbxzjhQCrsphozEbVj13Loj3RQuewjzAfHcqpbp17KWjAZtMugi9xvAct9BhFBBS6sEDjBLdWtcFbkp5NbJcZECe3UxBUMKzN9nrdZ84GVKoeGC4dFbf7rM1HTGBv2HNoK21ymzuGDkQokGkcCzHWSkt8u9mcZHVk3NCthzDckY2Xjg9qoJWPt5ngF2f7g3KkMt14aj2PYrArnWMPKz8Sf94owhgdg2BVHDtQhwqwTavW2hTdbzC84Vjjf3j8q9nmJEc8F3PUHi9PJBFqf5y8nCpT4NH4NZobCwpMKQtseL6AwyAMgEs1tSyXKKaJnQwarCe7Mru9LErpT65SdYsXRH8LaHM9a8kKm1D111kC8SrMFfVGbGL8LonzznWq6Cd7erxUFkGQeZceabwet6secgZRw6nCb7PKxqXuMqMEwxbN68Jd1ShqFPHzW25JSZGwhQdDMsVs1qTqxryL7AGnPVTpTbMpFxYKLYpyL2TTb5eNYivVM21SgjqrbLF1panFsDSvBCWfAEoBsVuxjTSLBJaJXcAv1HmJuU7EpmKry468sdWHmWXmM1AZ74ngXgTW4U3hr7gSGneimxYozziL26QZogZQcFeKuPNirXoH39jhUJVfZcdJ2EQ73WXtcr4sUT4QpZF1d`
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
    },
    TestUSD: {
        name: 'TestUSD',
        id: '77597c7594ab183f2ae4b5cd388291505c14dca3e1308e40952239a65a053694',
        decimal: 2,
        minSupported: 10
    }
}
// export const assmUrl = 'https://assembler.ergoauctions.org/';
export const assmUrl = 'localhost:9000/';
