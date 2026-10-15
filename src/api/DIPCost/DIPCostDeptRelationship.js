import request from '@/utils/request'

// 分页查询科室关系
export function pageDeptRelationship(params) {
    return request({
        url: '/dip/methodService/serviceDeptShip/page',
        method: 'get',
        params,
        btnCode: 'DIPCostDeptRelationship:list'
    })
}

// 查询单个科室关系
export function oneDeptRelationship(id) {
    return request({
        url: `/dip/methodService/serviceDeptShip/${id}`,
        method: 'get',
    })
}

// 新增科室关系
export function addDeptRelationship(data) {
    return request({
        url: '/dip/methodService/serviceDeptShip',
        method: 'post',
        data,
        btnCode: 'DIPCostDeptRelationship:add'
    })
}

// 批量新增科室关系
export function batchAddDeptRelationship(data) {
    return request({
        url: '/dip/methodService/serviceDeptShip/batchInsert',
        method: 'post',
        data,
        btnCode: 'DIPCostDeptRelationship:add'
    })
}

// 更新科室关系
export function updateDeptRelationship(data) {
    return request({
        url: '/dip/methodService/serviceDeptShip/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostDeptRelationship:update'
    })
}

// 删除科室关系
export function deleteDeptRelationship(data) {
    return request({
        url: '/dip/methodService/serviceDeptShip/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostDeptRelationship:delete'
    })
}

// 导出科室关系
export function exportDeptRelationship(data) {
    return request({
        url: '/dip/methodService/serviceDeptShip/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DIPCostDeptRelationship:export'
    })
}

