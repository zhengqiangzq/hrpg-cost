import request from '@/utils/request'

// 分页查询成本项目关系
export function pageChargeItemRelationship(params) {
    return request({
        url: '/methodService/serviceChargeShip/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostChargeItemRelationship:list'
    })
}

// 查询单个成本项目关系
export function oneChargeItemRelationship(id) {
    return request({
        url: `/methodService/serviceChargeShip/${id}`,
        method: 'get',
        btnCode: 'diseaseCostChargeItemRelationship:list'
    })
}

// 新增成本项目关系
export function addChargeItemRelationship(data) {
    return request({
        url: '/methodService/serviceChargeShip',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeItemRelationship:add'
    })
}

// 批量新增成本项目关系
export function batchAddChargeItemRelationship(data) {
    return request({
        url: '/methodService/serviceChargeShip/batchInsert',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeItemRelationship:add'
    })
}

// 更新成本项目关系
export function updateChargeItemRelationship(data) {
    return request({
        url: '/methodService/serviceChargeShip/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeItemRelationship:update'
    })
}

// 删除成本项目关系
export function deleteChargeItemRelationship(data) {
    return request({
        url: '/methodService/serviceChargeShip/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeItemRelationship:delete'
    })
}

// 导出成本项目关系
export function exportChargeItemRelationship(data) {
    return request({
        url: '/methodService/serviceChargeShip/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'diseaseCostChargeItemRelationship:export'
    })
}

