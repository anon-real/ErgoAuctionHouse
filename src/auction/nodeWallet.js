import {get, post} from './rest';

function getUrl(url) {
    if (!url.startsWith('http')) url = 'http://' + url;
    if (url.endsWith('/')) url = url.slice(0, url.length - 1);
    console.log(url)
    return url;
}

export async function getInfo(url) {
    return get(getUrl(url) + '/info').then((res) => res.json());
}

export async function getAddress(
    url = JSON.parse(sessionStorage.getItem('wallet')).url,
    apiKey = JSON.parse(sessionStorage.getItem('wallet')).apiKey
) {
    return await post(
        getUrl(url) + '/wallet/deriveKey',
        {derivationPath: 'm'},
        apiKey
    ).then((res) => res.json());
}

export async function getAssets(
    url = JSON.parse(sessionStorage.getItem('wallet')).url,
    apiKey = JSON.parse(sessionStorage.getItem('wallet')).apiKey
) {
    return await get(getUrl(url) + '/wallet/balances', apiKey)
        .then((res) => res.json())
}
