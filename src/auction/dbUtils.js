import {openDB} from 'idb';
import {additionalData} from "./consts";

export function setUpDb() {
    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
        return null;
    }

    return openDB('nft', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            console.log('upgrade')
            if (!db.objectStoreNames.contains('nft')) {
                db.createObjectStore('nft', {keyPath: 'NFTID'});
            }
        },
        blocked() {
            console.error('blocked')
        },
        blocking() {
            console.error('blocking')
        },
        terminated() {
            console.error('terminated')
        },
    });
}

export async function addNFTInfo(info) {
    let db
    if (additionalData.db === undefined) db = await setUpDb()
    else db = additionalData.db
    additionalData.db = db
    if (db === null) return
    let tx = db.transaction('nft', 'readwrite');
    let store = tx.objectStore('nft');
    store.add(info);
    return tx.complete;
}

export async function getNFTInfo(id) {
    let db
    if (additionalData.db === undefined) db = await setUpDb()
    else db = additionalData.db
    additionalData.db = db
    if (db === null) db = await setUpDb()
    if (db === null) return
    let tx = db.transaction('nft', 'readonly');
    let store = tx.objectStore('nft');
    return store.get(id);
}

export async function deleteNFTInfo(info) {
    let db
    if (additionalData.db === undefined) db = await setUpDb()
    else db = additionalData.db
    additionalData.db = db
    if (db === null) return
    let tx = db.transaction('nft', 'readwrite');
    let store = tx.objectStore('nft');
    store.delete(info);
    return tx.complete;
}
