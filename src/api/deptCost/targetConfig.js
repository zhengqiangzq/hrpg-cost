import request from '@/utils/request'

export function pageTargetConfig(params) {
    return request({
        url: '/deptCost/deptTargetConfig/page',
        method: 'get',
        params,
        btnCode: 'deptCost:targetConfig:list'
    })
}

export function pageDetailListTargetConfig(params) {
    return request({
        url: '/deptCost/deptTargetConfig/selectDetailPage',
        method: 'get',
        params,
        btnCode: 'deptCost:targetConfig:list'
    })
}

export function oneTargetConfig(id) {
    return request({
        url: `/deptCost/deptTargetConfig/${id}`,
        method: 'get',
        btnCode: 'deptCost:targetConfig:list'
    })
}

export function allTargetConfigDetail(params) {
    return request({
        url: `/deptCost/deptTargetConfigDetails/all`,
        method: 'get',
        params,
        btnCode: 'deptCost:targetConfig:list'
    })
}

export function addTargetConfig(data) {
    return request({
        url: '/deptCost/deptTargetConfig/add',
        method: 'post',
        data,
        btnCode: 'deptCost:targetConfig:add'
    })
}

export function updateTargetConfig(data) {
    return request({
        url: '/deptCost/deptTargetConfig/update',
        method: 'post',
        data,
        btnCode: 'deptCost:targetConfig:update'
    })
}

export function calcTargetConfig(id) {
    return request({
        url: `/deptCost/deptTargetConfig/execCalculate/${id}`,
        method: 'post',
    })
}

export function deleteTargetConfig(data) {
    return request({
        url: '/deptCost/deptTargetConfig/byDelete',
        method: 'post',
        data,
        btnCode: 'deptCost:targetConfig:delete'
    })
}

export function enableTargetConfig(data) {
    return request({
        url: '/deptCost/deptTargetConfig/confirm',
        method: 'post',
        data,
        btnCode: 'deptCost:targetConfig:confirm'
    })
}

export function disableTargetConfig(data) {
    return request({
        url: '/deptCost/deptTargetConfig/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'deptCost:targetConfig:confirm'
    })
}

export function exportTargetConfig(params) {
    return request({
        url: '/deptCost/deptTargetConfig/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:targetConfig:export'
    })
}

export function exportDetailListTargetConfig(params) {
    return request({
        url: '/deptCost/deptTargetConfig/exportWithDetail',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:targetConfig:export'
    })
}

export function exportDetailTargetConfig(id) {
    return request({
        url: `/deptCost/deptTargetConfigDetails/exportExcel/${id}`,
        method: 'get',
        responseType: 'blob',
        btnCode: 'deptCost:targetConfig:export'
    })
}
