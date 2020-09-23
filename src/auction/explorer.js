import { Address, Explorer, Transaction, ErgoBox } from "@coinbarn/ergo-ts";
import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from "axios";

const explorer = Explorer.mainnet;
const auctionAddress =
  "PLHeEg8w7y5tNkJkcKhK9bd4qvubZ4xFMDjrHPTvFxoj4WA86rp6kHzj5XgrpWQJgxnaQ3N6phdoHwoqxGUpT4fnee5BtbTcic6K7FWaNFAWEBc4co1KcanGBVJNKT42qxdygppgN2jpcSfBY3CSVQ78YrfPmaqZUBs1M8Yahb2XLbEPAsRYwJsfwTQUB2qumzv5kxEppHVmdtqqKwcryQSvyqEsvgLDPpG7YdiXVmhDeLdoacMKEtw3gEkV4Y4RcEhhS4SWooyrtfZibqgfYAfPfEjVmCiZwtwnzTVPFLjWnmHdPabWiQ9ku63WxzSrCKqKVF6npPV";

async function getRequest(url) {
  return explorer.apiClient({
    method: "GET",
    url,
  });
}

export function currentHeight() {
  return explorer.getCurrentHeight();
}

export function getTokenInfo(token) {
  return explorer.getTokenInfo(token);
}

export function getActiveAuctions() {
  return explorer
    .getUnspentOutputs(new Address(auctionAddress))
    .then((boxes) => boxes.filter((box) => box.assets.length > 0));
}

export async function getTokenTx(tokenId) {
  const { data } = await getRequest(`/transactions/boxes/${tokenId}`);
  return await data.spentTransactionId;
}
