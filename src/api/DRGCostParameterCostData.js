import request from '@/utils/request'
// 参数分配法

// 分页查询成本数据
export function pageCostData(params) {
    return request({
        url: '/drg/costData/page',
        method: 'get',
        params,
        btnCode: 'DRGParameterCostData:list'
    })
}

// 分页查询成本数据明细
export function pageCostDataDetail(params) {
    return request({
        url: '/drg/costDataDetails/page',
        method: 'get',
        params,
        btnCode: 'DRGParameterCostData:list'
    })
}

// 分页查询成本数据明细页
export function pageCostDataDetailPage(data) {
    return request({
        url: '/drg/costDataDetails/detail/page',
        method: 'post',
        data,
        btnCode: 'DRGParameterCostData:list'
    })
}

// 查询成本数据
export function oneCostData(id) {
    return request({
        url: `/drg/costData/${id}`,
        method: 'get'
    })
}

// 新增成本数据
export function addCostData(data) {
    return request({
        url: '/drg/costData/add',
        method: 'post',
        data,
        btnCode: 'DRGParameterCostData:add'
    })
}

// 新增成本数据明细
export function addCostDataDetail(data) {
    return request({
        url: '/drg/costDataDetails/add',
        method: 'post',
        data,
        btnCode: 'DRGParameterCostData:add'
    })
}

// 修改成本数据
export function updateCostData(data) {
    return request({
        url: '/drg/costData/update',
        method: 'post',
        data,
        btnCode: 'DRGParameterCostData:update'
    })
}

// 修改成本数据明细
export function updateCostDataDetail(data) {
    return request({
        url: '/drg/costDataDetails/update',
        method: 'post',
        data,
        btnCode: 'DRGParameterCostData:update'
    })
}

// 删除成本数据
export function deleteCostData(data) {
    return request({
        url: '/drg/costData/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGParameterCostData:delete'
    })
}

// 删除成本数据明细
export function deleteCostDataDetail(data) {
    return request({
        url: '/drg/costDataDetails/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGParameterCostData:delete'
    })
}

// 确认成本数据
export function enableCostData(data) {
    return request({
        url: '/drg/costData/confirm',
        method: 'post',
        data,
        btnCode: 'DRGParameterCostData:enable'
    })
}

// 取消确认成本数据
export function disableCostData(data) {
    return request({
        url: '/drg/costData/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'DRGParameterCostData:enable'
    })
}

// 采集成本数据
export function collectCostData(params) {
    return request({
        url: `drg/costData/in/collect/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
        params,
        btnCode: 'DRGParameterCostData:collect'
    })
}

// 导出成本数据
export function exportCostData(params) {
    return request({
        url: '/drg/costData/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DRGParameterCostData:export'
    })
}

// 导出成本数据明细
export function exportCostDataDetail(params) {
    return request({
        url: `/drg/costDataDetails/excel/${params.orderId}`,
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DRGParameterCostData:export'
    })
}

// 导出成本数据明细页
export function exportCostDataDetailPage(data) {
    return request({
        url: '/drg/costDataDetails/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DRGParameterCostData:export'
    })
}
