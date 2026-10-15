import request from '@/utils/request'

export function pageKeyFactorsValue(params) {
    return request({
        url: '/item/itemizeKeyFactorValue/page',
        method: 'get',
        params,
        btnCode: 'keyFactorsValue:list'
    })
}

export function pageDetailListKeyFactorsValue(params) {
    return request({
        url: '/item/itemizeKeyFactorValue/queryDetailListPage',
        method: 'get',
        params,
        btnCode: 'keyFactorsValue:list'
    })
}

export function oneKeyFactorsValue(id) {
    return request({
        url: `/item/itemizeKeyFactorValue/${id}`,
        method: 'get',
        btnCode: 'keyFactorsValue:list'
    })
}

export function addKeyFactorsValue(data) {
    return request({
        url: '/item/itemizeKeyFactorValue/add',
        method: 'post',
        data,
        btnCode: 'keyFactorsValue:add'
    })
}

export function updateKeyFactorsValue(data) {
    return request({
        url: '/item/itemizeKeyFactorValue/byPost',
        method: 'post',
        data,
        btnCode: 'keyFactorsValue:update'
    })
}

export function deleteKeyFactorsValue(data) {
    return request({
        url: '/item/itemizeKeyFactorValue/byDelete',
        method: 'post',
        data,
        btnCode: 'keyFactorsValue:delete'
    })
}

export function enableKeyFactorsValue(data) {
    return request({
        url: '/item/itemizeKeyFactorValue/confirm',
        method: 'post',
        data,
        btnCode: 'keyFactorsValue:enable'
    })
}

export function collectKeyFactorsValue(params) {
    return request({
        url: '/item/itemizeKeyFactorValue/collection',
        method: 'get',
        params,
        btnCode: 'keyFactorsValue:collect'
    })
}

export function exportKeyFactorsValue(params) {
    return request({
        url: '/item/itemizeKeyFactorValue/exportExcel',
        method: 'get',
        params,
        btnCode: 'keyFactorsValue:export',
        responseType: 'blob'
    })
}

export function exportDetailListKeyFactorsValue(params) {
    return request({
        url: '/item/itemizeKeyFactorValue/exportExcelWithDetail',
        method: 'get',
        params,
        btnCode: 'keyFactorsValue:export',
        responseType: 'blob'
    })
}

export function pageDetailKeyFactorsValue(params) {
    return request({
        url: '/item/itemizeKeyFactorValueDetail/page',
        method: 'get',
        params,
        btnCode: 'keyFactorsValue:list'
    })
}

export function addDetailKeyFactorsValue(data) {
    return request({
        url: '/item/itemizeKeyFactorValueDetail',
        method: 'post',
        data,
        btnCode: 'keyFactorsValue:add'
    })
}

export function updateDetailKeyFactorsValue(data) {
    return request({
        url: '/item/itemizeKeyFactorValueDetail/byPost',
        method: 'post',
        data,
        btnCode: 'keyFactorsValue:update'
    })
}

export function deleteDetailKeyFactorsValue(data) {
    return request({
        url: '/item/itemizeKeyFactorValueDetail/byDelete',
        method: 'post',
        data,
        btnCode: 'keyFactorsValue:delete'
    })
}