import request from '@/utils/request'

// 分页查询分摊方法定义
export function pageAllocationMethodDefinition(data) {
    return request({
        url: '/apportionmentWay/page',
        method: 'post',
        data,
        btnCode: 'allocationMethodDefinition:list'
    })
}

// 查询分摊方法定义明细
export function oneAllocationMethodDefinition(id) {
    return request({
        url: `/apportionmentWay/detail/${id}`,
        method: 'get',
        btnCode: 'allocationMethodDefinition:list'
    })
}

// 新增分摊方法定义
export function addAllocationMethodDefinition(data) {
    return request({
        url: '/apportionmentWay/add',
        method: 'post',
        data,
        btnCode: 'allocationMethodDefinition:add'
    })
}

// 批量新增分摊方法定义
export function batchAddAllocationMethodDefinition(data) {
    return request({
        url: '/apportionmentWay/batchAdd',
        method: 'post',
        data,
        btnCode: 'allocationMethodDefinition:add'
    })
}

// 更新分摊方法定义
export function updateAllocationMethodDefinition(data) {
    return request({
        url: '/apportionmentWay/update',
        method: 'post',
        data,
        btnCode: 'allocationMethodDefinition:update'
    })
}

// 删除分摊方法定义
export function deleteAllocationMethodDefinition(data) {
    return request({
        url: '/apportionmentWay/byDelete',
        method: 'post',
        data,
        btnCode: 'allocationMethodDefinition:delete'
    })
}

// 导出分摊方法定义
export function exportAllocationMethodDefinition(data) {
    return request({
        url: '/apportionmentWay/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'allocationMethodDefinition:export'
    })
}


// 分摊方法定义 查询科室
export function apportionmentWaytree(params) {
    return request({
        url: '/apportionmentWay/tree',
        method: 'get',
        params,
        btnCode: 'allocationMethodDefinition:list'
    })
}
