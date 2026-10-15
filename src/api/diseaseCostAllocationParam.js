import request from '@/utils/request'

export function pageAllocationParam(params) {
    return request({
        url: '/methodParameter/diseaseApportion/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostAllocationParam:list'
    })
}

export function addAllocationParam(data) {
    return request({
        url: '/methodParameter/diseaseApportion',
        method: 'post',
        data,
        btnCode: 'diseaseCostAllocationParam:add'
    })
}

export function updateAllocationParam(data) {
    return request({
        url: '/methodParameter/diseaseApportion/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostAllocationParam:update'
    })
}

export function deleteAllocationParam(data) {
    return request({
        url: '/methodParameter/diseaseApportion/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostAllocationParam:delete'
    })
}

export function enableAllocationParam(data) {
    return request({
        url: '/methodParameter/diseaseApportion/enable',
        method: 'post',
        data,
        btnCode: 'diseaseCostAllocationParam:enable'
    })
}

export function disableAllocationParam(data) {
    return request({
        url: '/methodParameter/diseaseApportion/disable',
        method: 'post',
        data,
        btnCode: 'diseaseCostAllocationParam:enable'
    })
}

export function exportAllocationParam(params) {
    return request({
        url: '/methodParameter/diseaseApportion/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostAllocationParam:export'
    })
}
