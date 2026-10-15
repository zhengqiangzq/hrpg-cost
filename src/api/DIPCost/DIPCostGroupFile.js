import request from '@/utils/request'

// 分页查询GroupFile档案
export function dipDefinitionPage(params) {
    return request({
        url: '/base/dipDefinition/page',
        method: 'get',
        params,
        btnCode: 'DIPCostGroupFile:list',
    })
}

// 新增ICD-9档案
export function addGroupFile(data) {
    return request({
        url: '/base/dipDefinition',
        method: 'post',
        data,
        btnCode: 'DIPCostGroupFile:add',
    })
}

// 修改ICD-9档案
export function updateGroupFile(data) {
    return request({
        url: '/base/dipDefinition/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostGroupFile:update',
    })
}

// 删除ICD-9档案
export function deleteGroupFile(data) {
    return request({
        url: '/base/dipDefinition/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostGroupFile:delete',
    })
}

// 导出ICD-9档案
export function exportGroupFile(params) {
    return request({
        url: '/base/dipDefinition/excel',
        method: 'get',
        params,
        btnCode: 'DIPCostGroupFile:export',
        responseType: 'blob'
    })
}
