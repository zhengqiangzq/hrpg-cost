import request from '@/utils/request'

// 分页查询科室关系
export function pageDeptRelationship(params) {
    return request({
        url: '/drg/methodService/serviceDeptShip/page',
        method: 'get',
        params,
        btnCode: 'DRGCostDeptRelationship:list'
    })
}

// 查询单个科室关系
export function oneDeptRelationship(id) {
    return request({
        url: `/drg/methodService/serviceDeptShip/${id}`,
        method: 'get',
    })
}

// 新增科室关系
export function addDeptRelationship(data) {
    return request({
        url: '/drg/methodService/serviceDeptShip',
        method: 'post',
        data,
        btnCode: 'DRGCostDeptRelationship:add'
    })
}

// 批量新增科室关系
export function batchAddDeptRelationship(data) {
    return request({
        url: '/drg/methodService/serviceDeptShip/batchInsert',
        method: 'post',
        data,
        btnCode: 'DRGCostDeptRelationship:add'
    })
}

// 更新科室关系
export function updateDeptRelationship(data) {
    return request({
        url: '/drg/methodService/serviceDeptShip/byPost',
        method: 'post',
        data,
        btnCode: 'DRGCostDeptRelationship:update'
    })
}

// 删除科室关系
export function deleteDeptRelationship(data) {
    return request({
        url: '/drg/methodService/serviceDeptShip/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostDeptRelationship:delete'
    })
}

// 导出科室关系
export function exportDeptRelationship(data) {
    return request({
        url: '/drg/methodService/serviceDeptShip/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DRGCostDeptRelationship:export'
    })
}

