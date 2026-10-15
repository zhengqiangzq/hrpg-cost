import request from '@/utils/request'

// 查询全部服务单元
export function allServiceUnit(params) {
    return request({
        url: '/dip/methodService/serviceUnit/all',
        method: 'get',
        params,
        btnCode: 'DIPCostServiceUnit:list'
    })
}

// 分页查询服务单元
export function pageServiceUnit(params) {
    return request({
        url: '/dip/methodService/serviceUnit/page',
        method: 'get',
        params,
        btnCode: 'DIPCostServiceUnit:list'
    })
}

// 查询服务单元明细
export function oneServiceUnit(id) {
    return request({
        url: `/dip/methodService/serviceUnit/${id}`,
        method: 'get',
        btnCode: 'DIPCostServiceUnit:list'
    })
}

// 新增服务单元
export function addServiceUnit(data) {
    return request({
        url: '/dip/methodService/serviceUnit',
        method: 'post',
        data,
        btnCode: 'DIPCostServiceUnit:add'
    })
}

// 编辑服务单元
export function updateServiceUnit(data) {
    return request({
        url: '/dip/methodService/serviceUnit/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostServiceUnit:update'
    })
}

// 删除服务单元
export function deleteServiceUnit(data) {
    return request({
        url: '/dip/methodService/serviceUnit/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostServiceUnit:delete'
    })
}

// 导出服务单元
export function exportServiceUnit(data) {
    return request({
        url: '/dip/methodService/serviceUnit/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DIPCostServiceUnit:export'
    })
}
