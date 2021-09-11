import {Address} from "@coinbarn/ergo-ts";

export const auctionAddress = `5D3NT8mhA3GBRtUaBvDbTXGTeMgHxwRBd7TDs9WJVi5Ph9J7F5kurj7Z353aJ9RDrk6Btf81djSpgCrGMPymv8ZQ7Qn53iHnuLev9LtRoXurUE5oEv9jz18U3Kd7Y1c5x3LcD4mbHuDub8qT9XoKjY1vpDKiZA5B4JuykiDjLwj8kstH937qFt1Lvbn2ttpbHVQdE8t5pxot8av3EMuu9h6n84VxS15aJPxQQbttgw5qgEBJtAWZtsGK7uDMdwumVsTmHt6rhW34jo9RmfrCBxJG2caR7gVXhLK3mMVJs8ch4EiAdcYXmCguomnGke6eqAyqfTVLKQXYRXwnB8EHshjEAmRRLpDLNC5jPapfaTvQkVXXNw631dMbBzYNev5nT8jJqv5rQihvMsD2zZ8LAL2e1EKSbQ1EZz3aRh4je7q1tfq5BwkW4Xsac6QbsfqNBmkvsyMDA5ABZDmjmJ69cNNvW5dwofHyHbi42fewtJQCtFUXUzYtco46BXiftDmm1bQWoHpMCWLvsbJDL1SJZw1JjxSXRredXC6vFiT6TA1aJCH2GY8xUBFzFp81mpYZ49ikLoStfVpGcc5afDyUDRUQyDnhbkobK9ah9Vuj7nENtvdsGQs2gCZ6GK3GWubRvWTUTacBRZZTNNajQqGU4Rd1JY9AHKJhnfVvTd9wgiu47P3dCMjnC7kxnfeLbCTsSCtLMt2mkdPgQssMazSpNydwohYLhng9KDv178cMEQ65u37YW34dM2FrnR7qHs5AxAr9oJhfhdUkgivWcWnp9ync2WeUeaQ8XLmwCegwSRT1f8UJH4GLd7xm2TmAj8mB7nYCHQsCXJoiMXRsfmUuoJHmua8fGh3YiDevV7EXP8VJ54JaVQoA9hfKkSF5V1CZvVqQRNoRmSKbPG72j731BXqDyEZHxaXDcT8zxJM8v2yWjJp32KDD1i8xXQyn8dUVDdKSZNF7ohzL2dxkg3bxGB6C5F4UhxVHtGh6svVz4VGWujMZkLr243KtqFRVmC94rna8AfUtvEJPjTEPXXzMe87y1Gej63nqxzow3R8wtLWu6vP55GPhcrkSsvffgHEt7WWuZJZGjrECAa47x7uDEm87B5o9Hp16NjPKv62qeuMWXkEhqj9XRARMSjFGGrVWkRpT1b8`
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
    TestUSD: {
        name: 'TestUSD',
        id: '67280a3b27b57abd667ea5822c419636a07952bec908800fdb0949781789340d',
        decimal: 2,
        minSupported: 100,
        initial: 1,
    }
}
export const assmUrl = 'https://assembler.ergoauctions.org/';