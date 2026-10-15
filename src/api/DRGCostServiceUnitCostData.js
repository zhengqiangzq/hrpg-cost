import request from '@/utils/request'
// 服务单元

// 分页查询成本数据
export function pageCostData(params) {
    return request({
        url: '/drg/methodService/costServiceData/page',
        method: 'get',
        params,
        btnCode: 'DRGCostServiceUnitCostData:list'
    })
}

// 分页查询成本数据明细
export function pageCostDataDetail(params) {
    return request({
        url: '/drg/methodService/costServiceDataDetails/page',
        method: 'get',
        params,
        btnCode: 'DRGCostServiceUnitCostData:list'
    })
}

// 分页查询成本数据明细页
export function pageCostDataDetailPage(data) {
    return request({
        url: '/drg/methodService/costServiceDataDetails/detail/page',
        method: 'post',
        data,
        btnCode: 'DRGCostServiceUnitCostData:list'
    })
}

// 查询成本数据
export function oneCostData(id) {
    return request({
        url: `/drg/methodService/costServiceData/${id}`,
        method: 'get',
        btnCode: 'DRGCostServiceUnitCostData:list'
    })
}

// 新增成本数据
export function addCostData(data) {
    return request({
        url: '/drg/methodService/costServiceData/add',
        method: 'post',
        data,
        btnCode: 'DRGCostServiceUnitCostData:add'
    })
}

// 新增成本数据明细
export function addCostDataDetail(data) {
    return request({
        url: '/drg/methodService/costServiceDataDetails/add',
        method: 'post',
        data,
        btnCode: 'DRGCostServiceUnitCostData:add'
    })
}

// 修改成本数据
export function updateCostData(data) {
    return request({
        url: '/drg/methodService/costServiceData/update',
        method: 'post',
        data,
        btnCode: 'DRGCostServiceUnitCostData:update'
    })
}

// 修改成本数据明细
export function updateCostDataDetail(data) {
    return request({
        url: '/drg/methodService/costServiceDataDetails/update',
        method: 'post',
        data,
        btnCode: 'DRGCostServiceUnitCostData:update'
    })
}

// 删除成本数据
export function deleteCostData(data) {
    return request({
        url: '/drg/methodService/costServiceData/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostServiceUnitCostData:delete'
    })
}

// 删除成本数据明细
export function deleteCostDataDetail(data) {
    return request({
        url: '/drg/methodService/costServiceDataDetails/deleteByIds',
        method: 'post',
        data,
        btnCode: 'DRGCostServiceUnitCostData:delete'
    })
}

// 确认成本数据明细
export function enableCostDataDetail(data) {
    return request({
        url: '/drg/methodService/costServiceData/confirm',
        method: 'post',
        data,
        btnCode: 'DRGCostServiceUnitCostData:enable'
    })
}

// 取消确认成本数据明细
export function disableCostData(data) {
    return request({
        url: '/drg/methodService/costServiceData/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'DRGCostServiceUnitCostData:enable'
    })
}

// 采集成本数据
export function collectCostData(params) {
    return request({
        url: `/drg/methodService/costServiceData/in/collect/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
        params,
        btnCode: 'DRGCostServiceUnitCostData:collect'
    })
}

// 导出成本数据
export function exportCostData(params) {
    return request({
        url: '/drg/methodService/costServiceData/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DRGCostServiceUnitCostData:export'
    })
}

// 导出成本数据明细
export function exportCostDataDetail(params) {
    return request({
        url: `/drg/methodService/costServiceDataDetails/excel/${params.orderId}`,
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DRGCostServiceUnitCostData:export'
    })
}

// 导出成本数据明细页
export function exportCostDataDetailPage(data) {
    return request({
        url: '/drg/methodService/costServiceDataDetails/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DRGCostServiceUnitCostData:export'
    })
}
