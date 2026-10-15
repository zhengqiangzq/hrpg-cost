import request from '@/utils/request'

// 分页查询成本项目关系
export function pageCostItemRelationship(params) {
    return request({
        url: '/dip/serviceItemShip/page',
        method: 'get',
        params,
        btnCode: 'DIPCostItemRelationship:list'
    })
}

// 查询单个成本项目关系
export function oneCostItemRelationship(id) {
    return request({
        url: `/dip/serviceItemShip/${id}`,
        method: 'get',
    })
}

// 新增成本项目关系
export function addCostItemRelationship(data) {
    return request({
        url: '/dip/serviceItemShip',
        method: 'post',
        data,
        btnCode: 'DIPCostItemRelationship:add'
    })
}

// 批量新增成本项目关系
export function batchAddCostItemRelationship(data) {
    return request({
        url: '/dip/serviceItemShip/batchInsert',
        method: 'post',
        data,
        btnCode: 'DIPCostItemRelationship:add'
    })
}

// 更新成本项目关系
export function updateCostItemRelationship(data) {
    return request({
        url: '/dip/serviceItemShip/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostItemRelationship:update'
    })
}

// 删除成本项目关系
export function deleteCostItemRelationship(data) {
    return request({
        url: '/dip/serviceItemShip/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostItemRelationship:delete'
    })
}

// 导出成本项目关系
export function exportCostItemRelationship(data) {
    return request({
        url: '/dip/serviceItemShip/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DIPCostItemRelationship:export'
    })
}

