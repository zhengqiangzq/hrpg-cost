import request from '@/utils/request'

export function pageAllocationParam(params) {
    return request({
        url: '/drg/apportion/page',
        method: 'get',
        params,
        btnCode: 'DRGCostAllocationParam:list'
    })
}

export function addAllocationParam(data) {
    return request({
        url: '/drg/apportion',
        method: 'post',
        data,
        btnCode: 'DRGCostAllocationParam:add'
    })
}

export function updateAllocationParam(data) {
    return request({
        url: '/drg/apportion/byPost',
        method: 'post',
        data,
        btnCode: 'DRGCostAllocationParam:update'
    })
}

export function deleteAllocationParam(data) {
    return request({
        url: '/drg/apportion/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostAllocationParam:delete'
    })
}

export function enableAllocationParam(data) {
    return request({
        url: '/drg/apportion/enable',
        method: 'post',
        data,
        btnCode: 'DRGCostAllocationParam:enable'
    })
}

export function disableAllocationParam(data) {
    return request({
        url: '/drg/apportion/disable',
        method: 'post',
        data,
        btnCode: 'DRGCostAllocationParam:enable'
    })
}

export function exportAllocationParam(params) {
    return request({
        url: '/drg/apportion/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DRGCostAllocationParam:export'
    })
}
