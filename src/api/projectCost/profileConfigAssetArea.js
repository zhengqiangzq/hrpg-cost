import request from '@/utils/request'

export function pageProfileConfigAssetArea(params) {
    return request({
        url: '/item/assetsItemArea/page',
        method: 'get',
        params,
        btnCode: 'profileConfigAssetArea:list'
    })
}

export function addProfileConfigAssetArea(data) {
    return request({
        url: '/item/assetsItemArea',
        method: 'post',
        data,
        btnCode: 'profileConfigAssetArea:add'
    })
}

export function updateProfileConfigAssetArea(data) {
    return request({
        url: '/item/assetsItemArea/byPost',
        method: 'post',
        data,
        btnCode: 'profileConfigAssetArea:update'
    })
}

export function deleteProfileConfigAssetArea(data) {
    return request({
        url: '/item/assetsItemArea/byDelete',
        method: 'post',
        data,
        btnCode: 'profileConfigAssetArea:delete'
    })
}

export function exportProfileConfigAssetArea(params) {
    return request({
        url: '/item/assetsItemArea/excel',
        method: 'get',
        params,
        btnCode: 'profileConfigAssetArea:export',
        responseType: 'blob'
    })
}