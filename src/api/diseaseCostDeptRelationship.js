import request from '@/utils/request'

// 分页查询科室关系
export function pageDeptRelationship(params) {
    return request({
        url: '/methodService/serviceDeptShip/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostDeptRelationship:list'
    })
}

// 查询单个科室关系
export function oneDeptRelationship(id) {
    return request({
        url: `/methodService/serviceDeptShip/${id}`,
        method: 'get',
        btnCode: 'diseaseCostDeptRelationship:list'
    })
}

// 新增科室关系
export function addDeptRelationship(data) {
    return request({
        url: '/methodService/serviceDeptShip',
        method: 'post',
        data,
        btnCode: 'diseaseCostDeptRelationship:add'
    })
}

// 批量新增科室关系
export function batchAddDeptRelationship(data) {
    return request({
        url: '/methodService/serviceDeptShip/batchInsert',
        method: 'post',
        data,
        btnCode: 'diseaseCostDeptRelationship:add'
    })
}

// 更新科室关系
export function updateDeptRelationship(data) {
    return request({
        url: '/methodService/serviceDeptShip/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostDeptRelationship:update'
    })
}

// 删除科室关系
export function deleteDeptRelationship(data) {
    return request({
        url: '/methodService/serviceDeptShip/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostDeptRelationship:delete'
    })
}

// 导出科室关系
export function exportDeptRelationship(data) {
    return request({
        url: '/methodService/serviceDeptShip/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'diseaseCostDeptRelationship:export'
    })
}

