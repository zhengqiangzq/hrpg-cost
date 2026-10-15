import request from '@/utils/request'

// 分页查询成本项目关系
export function pageChargeItemRelationship(params) {
    return request({
        url: '/drg/methodService/serviceChargeShip/page',
        method: 'get',
        params,
        btnCode: 'DRGCostChargeItemRelationship:list'
    })
}

// 查询单个成本项目关系
export function oneChargeItemRelationship(id) {
    return request({
        url: `/drg/methodService/serviceChargeShip/${id}`,
        method: 'get',
    })
}

// 新增成本项目关系
export function addChargeItemRelationship(data) {
    return request({
        url: '/drg/methodService/serviceChargeShip',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeItemRelationship:add'
    })
}

// 批量新增成本项目关系
export function batchAddChargeItemRelationship(data) {
    return request({
        url: '/drg/methodService/serviceChargeShip/batchInsert',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeItemRelationship:add'
    })
}

// 更新成本项目关系
export function updateChargeItemRelationship(data) {
    return request({
        url: '/drg/methodService/serviceChargeShip/byPost',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeItemRelationship:update'
    })
}

// 删除成本项目关系
export function deleteChargeItemRelationship(data) {
    return request({
        url: '/drg/methodService/serviceChargeShip/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeItemRelationship:delete'
    })
}

// 导出成本项目关系
export function exportChargeItemRelationship(data) {
    return request({
        url: '/drg/methodService/serviceChargeShip/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DRGCostChargeItemRelationship:export'
    })
}

