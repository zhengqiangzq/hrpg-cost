import request from '@/utils/request'

// 分页查询ICD10档案
export function pageICD10File(params) {
    return request({
        url: '/base/diseaseIcd10/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostICD10File:list'
    })
}

// 新增ICD-10档案
export function addICD10File(data) {
    return request({
        url: '/base/diseaseIcd10',
        method: 'post',
        data,
        btnCode: 'diseaseCostICD10File:add'
    })
}

// 修改ICD-10档案
export function updateICD10File(data) {
    return request({
        url: '/base/diseaseIcd10/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostICD10File:update'
    })
}

// 删除ICD-10档案
export function deleteICD10File(data) {
    return request({
        url: '/base/diseaseIcd10/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostICD10File:delete'
    })
}

// 导出ICD-10档案
export function exportICD10File(params) {
    return request({
        url: '/base/diseaseIcd10/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostICD10File:export'
    })
}
