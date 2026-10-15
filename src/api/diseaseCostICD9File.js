import request from '@/utils/request'

// 分页查询ICD9档案
export function pageICD9File(params) {
    return request({
        url: '/base/diseaseIcd9/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostICD9File:list'
    })
}

// 新增ICD-9档案
export function addICD9File(data) {
    return request({
        url: '/base/diseaseIcd9',
        method: 'post',
        data,
        btnCode: 'diseaseCostICD9File:add'
    })
}

// 修改ICD-9档案
export function updateICD9File(data) {
    return request({
        url: '/base/diseaseIcd9/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostICD9File:update'
    })
}

// 删除ICD-9档案
export function deleteICD9File(data) {
    return request({
        url: '/base/diseaseIcd9/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostICD9File:delete'
    })
}

// 导出ICD-9档案
export function exportICD9File(params) {
    return request({
        url: '/base/diseaseIcd9/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostICD9File:export'
    })
}
