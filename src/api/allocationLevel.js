import request from '@/utils/request'

// 分页查询分摊级次
export function pageAllocationLevel(params) {
    return request({
        url: '/apportionmentLevel',
        method: 'get',
        params,
        btnCode: 'allocationLevel:list'
    })
}

// 新增分摊级次
export function addAllocationLevel(data) {
    return request({
        url: '/apportionmentLevel/add',
        method: 'post',
        data,
        btnCode: 'allocationLevel:add'
    })
}

// 修改分摊级次
export function updateAllocationLevel(data) {
    return request({
        url: '/apportionmentLevel/update',
        method: 'post',
        data,
        btnCode: 'allocationLevel:update'
    })
}

// 删除分摊级次
export function deleteAllocationLevel(id) {
    return request({
        url: `/apportionmentLevel/${id}`,
        method: 'post',
        btnCode: 'allocationLevel:delete'
    })
}
