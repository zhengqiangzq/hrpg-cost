import request from '@/utils/request'

// 分页查询成本项目关系
export function pageCostItemRelationship(params) {
    return request({
        url: '/methodService/serviceItemShip/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostItemRelationship:list'
    })
}

// 查询单个成本项目关系
export function oneCostItemRelationship(id) {
    return request({
        url: `/methodService/serviceItemShip/${id}`,
        method: 'get',
        btnCode: 'diseaseCostItemRelationship:list'
    })
}

// 新增成本项目关系
export function addCostItemRelationship(data) {
    return request({
        url: '/methodService/serviceItemShip',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemRelationship:add'
    })
}

// 批量新增成本项目关系
export function batchAddCostItemRelationship(data) {
    return request({
        url: '/methodService/serviceItemShip/batchInsert',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemRelationship:add'
    })
}

// 更新成本项目关系
export function updateCostItemRelationship(data) {
    return request({
        url: '/methodService/serviceItemShip/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemRelationship:update'
    })
}

// 删除成本项目关系
export function deleteCostItemRelationship(data) {
    return request({
        url: '/methodService/serviceItemShip/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemRelationship:delete'
    })
}

// 导出成本项目关系
export function exportCostItemRelationship(data) {
    return request({
        url: '/methodService/serviceItemShip/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'diseaseCostItemRelationship:export'
    })
}

