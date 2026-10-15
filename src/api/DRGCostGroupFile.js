import request from '@/utils/request'

// 分页查询GroupFile档案
export function pageGroupFile(params) {
    return request({
        url: '/base/drgDefinition/page',
        method: 'get',
        params,
        btnCode: 'DRGCostGroupFile:list',
    })
}

// 新增ICD-9档案
export function addGroupFile(data) {
    return request({
        url: '/base/drgDefinition',
        method: 'post',
        data,
        btnCode: 'DRGCostGroupFile:add',
    })
}

// 修改ICD-9档案
export function updateGroupFile(data) {
    return request({
        url: '/base/drgDefinition/byPost',
        method: 'post',
        data,
        btnCode: 'DRGCostGroupFile:update',
    })
}

// 删除ICD-9档案
export function deleteGroupFile(data) {
    return request({
        url: '/base/drgDefinition/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostGroupFile:delete',
    })
}

// 导出ICD-9档案
export function exportGroupFile(params) {
    return request({
        url: '/base/drgDefinition/excel',
        method: 'get',
        params,
        btnCode: 'DRGCostGroupFile:export',
        responseType: 'blob'
    })
}
