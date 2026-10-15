import request from '@/utils/request'

export function treeIndicatorsClassification(params) {
    return request({
        url: '/deptCost/deptIndicatorsClassification/tree',
        method: 'get',
        params,
        btnCode: 'deptCost:indicatorsClassification:list'
    })
}

export function addIndicatorsClassification(data) {
    return request({
        url: '/deptCost/deptIndicatorsClassification',
        method: 'post',
        data,
        btnCode: 'deptCost:indicatorsClassification:add'
    })
}

export function updateIndicatorsClassification(data) {
    return request({
        url: '/deptCost/deptIndicatorsClassification/byPost',
        method: 'post',
        data,
        btnCode: 'deptCost:indicatorsClassification:update'
    })
}

export function deleteIndicatorsClassification(data) {
    return request({
        url: '/deptCost/deptIndicatorsClassification/byDelete',
        method: 'post',
        data,
        btnCode: 'deptCost:indicatorsClassification:delete'
    })
}

export function exportIndicatorsClassification(params) {
    return request({
        url: '/deptCost/deptIndicatorsClassification/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:indicatorsClassification:export'
    })
}
