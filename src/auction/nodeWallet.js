import {post, get} from './rest'

function getUrl(url) {
    if (!url.startsWith('http')) url = 'http://' + url
    if (url.endsWith('/')) url = url.slice(0, url.length - 2)
    return url
}

export async function getInfo(url) {
    return get(getUrl(url) + '/info')
        .then(res => res.json())
}

export async function getAddress(url, apiKey) {
    return await post(getUrl(url) + '/wallet/deriveKey', {derivationPath: 'm'}, apiKey)
        .then(res => res.json())
}

