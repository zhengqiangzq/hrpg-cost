import request from '@/utils/request'

// 分页查询成本项目关系
export function pageCostItemRelationship(params) {
    return request({
        url: '/drg/serviceItemShip/page',
        method: 'get',
        params,
        btnCode: 'DRGCostItemRelationship:list'
    })
}

// 查询单个成本项目关系
export function oneCostItemRelationship(id) {
    return request({
        url: `/drg/serviceItemShip/${id}`,
        method: 'get',
    })
}

// 新增成本项目关系
export function addCostItemRelationship(data) {
    return request({
        url: '/drg/serviceItemShip',
        method: 'post',
        data,
        btnCode: 'DRGCostItemRelationship:add'
    })
}

// 批量新增成本项目关系
export function batchAddCostItemRelationship(data) {
    return request({
        url: '/drg/serviceItemShip/batchInsert',
        method: 'post',
        data,
        btnCode: 'DRGCostItemRelationship:add'
    })
}

// 更新成本项目关系
export function updateCostItemRelationship(data) {
    return request({
        url: '/drg/serviceItemShip/byPost',
        method: 'post',
        data,
        btnCode: 'DRGCostItemRelationship:update'
    })
}

// 删除成本项目关系
export function deleteCostItemRelationship(data) {
    return request({
        url: '/drg/serviceItemShip/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostItemRelationship:delete'
    })
}

// 导出成本项目关系
export function exportCostItemRelationship(data) {
    return request({
        url: '/drg/serviceItemShip/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DRGCostItemRelationship:export'
    })
}

