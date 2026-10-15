import request from '@/utils/request'

export function allProfileConfigKeyFactors(params) {
    return request({
        url: '/item/keyFactorSetting/all',
        method: 'get',
        params,
        btnCode: 'profileConfigKeyFactors:list'
    })
}

export function pageProfileConfigKeyFactors(params) {
    return request({
        url: '/item/keyFactorSetting/page',
        method: 'get',
        params,
        btnCode: 'profileConfigKeyFactors:list'
    })
}

export function addProfileConfigKeyFactors(data) {
    return request({
        url: '/item/keyFactorSetting',
        method: 'post',
        data,
        btnCode: 'profileConfigKeyFactors:add'
    })
}

export function updateProfileConfigKeyFactors(data) {
    return request({
        url: '/item/keyFactorSetting/byPost',
        method: 'post',
        data,
        btnCode: 'profileConfigKeyFactors:update'
    })
}

export function deleteProfileConfigKeyFactors(data) {
    return request({
        url: '/item/keyFactorSetting/byDelete',
        method: 'post',
        data,
        btnCode: 'profileConfigKeyFactors:delete'
    })
}

export function enableProfileConfigKeyFactors(data) {
    return request({
        url: '/item/keyFactorSetting/enable',
        method: 'post',
        data,
        btnCode: 'profileConfigKeyFactors:enable'
    })
}

export function disableProfileConfigKeyFactors(data) {
    return request({
        url: '/item/keyFactorSetting/disable',
        method: 'post',
        data,
        btnCode: 'profileConfigKeyFactors:enable'
    })
}

export function exportProfileConfigKeyFactors(params) {
    return request({
        url: '/item/keyFactorSetting/excel',
        method: 'get',
        params,
        btnCode: 'profileConfigKeyFactors:export',
        responseType: 'blob'
    })
}