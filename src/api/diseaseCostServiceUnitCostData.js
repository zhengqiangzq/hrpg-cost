import request from '@/utils/request'
// 服务单元

// 分页查询成本数据
export function pageCostData(params) {
    return request({
        url: '/methodService/diseaseCostServiceData/page',
        method: 'get',
        params,
        btnCode: 'serviceUnitCostData:list'
    })
}

// 分页查询成本数据明细
export function pageCostDataDetail(params) {
    return request({
        url: '/methodService/diseaseCostServiceDataDetails/page',
        method: 'get',
        params,
        btnCode: 'serviceUnitCostData:list'
    })
}

// 分页查询成本数据明细页
export function pageCostDataDetailPage(data) {
    return request({
        url: '/methodService/diseaseCostServiceDataDetails/detail/page',
        method: 'post',
        data,
        btnCode: 'serviceUnitCostData:list'
    })
}

// 查询成本数据
export function oneCostData(id) {
    return request({
        url: `/methodService/diseaseCostServiceData/${id}`,
        method: 'get',
        btnCode: 'serviceUnitCostData:list'
    })
}

// 新增成本数据
export function addCostData(data) {
    return request({
        url: '/methodService/diseaseCostServiceData/add',
        method: 'post',
        data,
        btnCode: 'serviceUnitCostData:add'
    })
}

// 新增成本数据明细
export function addCostDataDetail(data) {
    return request({
        url: '/methodService/diseaseCostServiceDataDetails/add',
        method: 'post',
        data,
        btnCode: 'serviceUnitCostData:add'
    })
}

// 修改成本数据
export function updateCostData(data) {
    return request({
        url: '/methodService/diseaseCostServiceData/update',
        method: 'post',
        data,
        btnCode: 'serviceUnitCostData:update'
    })
}

// 修改成本数据明细
export function updateCostDataDetail(data) {
    return request({
        url: '/methodService/diseaseCostServiceDataDetails/update',
        method: 'post',
        data,
        btnCode: 'serviceUnitCostData:update'
    })
}

// 删除成本数据
export function deleteCostData(data) {
    return request({
        url: '/methodService/diseaseCostServiceData/byDelete',
        method: 'post',
        data,
        btnCode: 'serviceUnitCostData:delete'
    })
}

// 删除成本数据明细
export function deleteCostDataDetail(data) {
    return request({
        url: '/methodService/diseaseCostServiceDataDetails/deleteByIds',
        method: 'post',
        data,
        btnCode: 'serviceUnitCostData:delete'
    })
}

// 确认成本数据明细
export function enableCostDataDetail(data) {
    return request({
        url: '/methodService/diseaseCostServiceData/confirm',
        method: 'post',
        data,
        btnCode: 'serviceUnitCostData:enable'
    })
}

// 取消确认成本数据明细
export function disableCostData(data) {
    return request({
        url: '/methodService/diseaseCostServiceData/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'serviceUnitCostData:enable'
    })
}

// 取消确认成本数据明细
export function collectCostData(params) {
    return request({
        url: `/methodService/diseaseCostServiceData/in/collect/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
        params,
        btnCode: 'serviceUnitCostData:collect'
    })
}

// 导出成本数据
export function exportCostData(params) {
    return request({
        url: '/methodService/diseaseCostServiceData/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'serviceUnitCostData:export'
    })
}

// 导出成本数据明细
export function exportCostDataDetail(params) {
    return request({
        url: `/methodService/diseaseCostServiceDataDetails/excel/${params.orderId}`,
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'serviceUnitCostData:export'
    })
}

// 导出成本数据明细页
export function exportCostDataDetailPage(data) {
    return request({
        url: '/methodService/diseaseCostServiceDataDetails/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'serviceUnitCostData:export'
    })
}
