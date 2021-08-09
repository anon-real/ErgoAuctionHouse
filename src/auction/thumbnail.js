const thumbnailUrlPrefix = 'https://absole.io/cache/';

 function thumbnailUrl(tokenId, imgUrl){
     const fileExtension = imgUrl.split('.').pop()
    return thumbnailUrlPrefix + tokenId + '.' + fileExtension
}

async function hasThumbnail(tokenId, imgUrl){
    const url  = thumbnailUrl(tokenId, imgUrl)
    try {
        const response = await fetch(url, { method: 'HEAD'})
        return 200 === response.status
    } catch(error){
        return false
    }
}

export async function getThumbnail(tokenId, imgUrl){
    if(imgUrl && await hasThumbnail(tokenId, imgUrl)){
        return thumbnailUrl(tokenId, imgUrl)
    }else{
        return imgUrl
    }
}