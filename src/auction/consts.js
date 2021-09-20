import {Address} from "@coinbarn/ergo-ts";

export const auctionAddress = `5D3NT8mhA3GBRtUaBvDbTXGTeMgHxwRBd7TDs9WJVi5Ph9J7F1WzpbaCak76vCfVbAaApD5cbMVXggz7T85onGNCjaZwbnHR8CxVkmCxyaXp2q6fmTVhHKSLmoQeG29H2FFJrRNYtia28CorYLkLtvyneHU3Ne4ys7VZZtRnqgCKJ8eVsa6Z1BehTiogBiyQArTZjkb9F3DinaR6g9hxHe22dkSHcKq1cSD8SSDABKJfcEDC8xbQ7wLfPyQqiUvq1uVt5x31ytjdQqW2F7neto5kMzBhrbASrt68oQT6xdy3EBLWFqQxfZvYUTZzvXMLUsMG33JhgE8yayxEnZgVcn5SREj9me1GBVEMw8Emrkt47kMzySEnFAjMnATHAMcCDwweCjJLzr7BXR6JHAd9ighowoNXLKuak7JMSagegzmqGhgSA7SfuS8LmU2HpZxx2esHGycBWkTJrH49jTx7qBP9cLSzMvZs7N6XgiFSEvQMsqALaGp5ZtFPGwvCA3MRoJaT9pMdUFgRs6HnTM1vFYTAsjeQQxCoXaWFzWVvo1y1WVBkrL3wYQhjEEmXS6zhyzhZCandhp6qpi6XEEWn7p88PMhBtrYaSJSZGYZhsqGCA4GasfhbDutEFkVpouhweamtowreb9TsCMgs9dQ2Azt8mvDkdm16GVYDocZeFuAXM6mTesofKpGeSAZJVv4ERSqqNEWoP4XCEAXQXr5SSo7aTWZX9YxxJp1KgUEwFho1SfMvpoeFqUJmu2TQfz4RvK4UuX1UZmojmvMjQhFqfC5dsSmiKTVeZ9kHXriVYVfQGiPGtF66qcRuxiBkn1UA12GSvSVUKGRp4x37JGaSFJvz6ZednKR3EyYuyukg6C4cj5GcMupXYytiu8iRFJeajiouCTwahP8RVSLJgU1XznCw3HiwMH6y8a9Z3E7Ga6dziBfS7GFq1e1kMxKib9xR35yRc5A9DCdHRw6cwvex3QvKGQQbCLhCEfbayrb9UQphpN5aEtQDCfE6KsxgvYwQoX7iGwf8uiqHchX47m4TpQcBquHzUGqzu4YkcE1XVou7BM4MhLSj7MKzEdzW7463ruHbK9uuwNXrUHnZKDMnAV9YsBWzAe6Nudt4EQrQsMNHxFxJXnr8jFzLkF3Cj73JGjsimYt`
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
export const startFee = 100000000

export const artworkTypes = {
    image: [0x01, 0x01],
    audio: [0x01, 0x02],
    video: [0x01, 0x03],
}
