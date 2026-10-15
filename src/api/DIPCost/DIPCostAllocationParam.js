import request from '@/utils/request'

export function pageAllocationParam(params) {
    return request({
        url: '/dip/apportion/page',
        method: 'get',
        params,
        btnCode: 'DIPCostAllocationParam:list'
    })
}

export function addAllocationParam(data) {
    return request({
        url: '/dip/apportion',
        method: 'post',
        data,
        btnCode: 'DIPCostAllocationParam:add'
    })
}

export function updateAllocationParam(data) {
    return request({
        url: '/dip/apportion/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostAllocationParam:update'
    })
}

export function deleteAllocationParam(data) {
    return request({
        url: '/dip/apportion/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostAllocationParam:delete'
    })
}

export function enableAllocationParam(data) {
    return request({
        url: '/dip/apportion/enable',
        method: 'post',
        data,
        btnCode: 'DIPCostAllocationParam:enable'
    })
}

export function disableAllocationParam(data) {
    return request({
        url: '/dip/apportion/disable',
        method: 'post',
        data,
        btnCode: 'DIPCostAllocationParam:enable'
    })
}

export function exportAllocationParam(params) {
    return request({
        url: '/dip/apportion/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DIPCostAllocationParam:export'
    })
}
