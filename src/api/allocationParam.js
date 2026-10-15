import request from '@/utils/request'

// 分页查询分摊参数列表
export function pageAllocationParam(params) {
    return request({
        url: '/apportionmentParam',
        method: 'get',
        params,
        btnCode: 'allocationParam:list'
    })
}

// 新增分摊参数
export function addAllocationParam(data) {
    return request({
        url: '/apportionmentParam/add',
        method: 'post',
        data,
        btnCode: 'allocationParam:add'
    })
}

// 修改分摊参数
export function updateAllocationParam(data) {
    return request({
        url: '/apportionmentParam/update',
        method: 'post',
        data,
        btnCode: 'allocationParam:update'
    })
}

// 删除分摊参数
export function deleteAllocationParam(id) {
    return request({
        url: `/apportionmentParam/${id}`,
        method: 'post',
        btnCode: 'allocationParam:delete'
    })
}

// 启用停用分摊参数
export function enableAllocationParam(data) {
    return request({
        url: `/apportionmentParam`,
        method: 'post',
        data,
        btnCode: 'allocationParam:enable'
    })
}

// 导出分摊参数
export function exportAllocationParam(params) {
    return request({
        url: '/apportionmentParam/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'allocationParam:export'
    })
}
