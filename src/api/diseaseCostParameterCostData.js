import request from '@/utils/request'
// 参数分配法

// 分页查询成本数据
export function pageCostData(params) {
    return request({
        url: '/methodParameter/diseaseCostData/page',
        method: 'get',
        params,
        btnCode: 'diseaseParameterCostData:list'
    })
}

// 分页查询成本数据明细
export function pageCostDataDetail(params) {
    return request({
        url: '/methodParameter/diseaseCostDataDetails/page',
        method: 'get',
        params,
        btnCode: 'diseaseParameterCostData:list'
    })
}

// 分页查询成本数据明细页
export function pageCostDataDetailPage(data) {
    return request({
        url: '/methodParameter/diseaseCostDataDetails/detail/page',
        method: 'post',
        data,
        btnCode: 'diseaseParameterCostData:list'
    })
}

// 查询成本数据
export function oneCostData(id) {
    return request({
        url: `/methodParameter/diseaseCostData/${id}`,
        method: 'get',
        btnCode: 'diseaseParameterCostData:list'
    })
}

// 新增成本数据
export function addCostData(data) {
    return request({
        url: '/methodParameter/diseaseCostData/add',
        method: 'post',
        data,
        btnCode: 'diseaseParameterCostData:add'
    })
}

// 新增成本数据明细
export function addCostDataDetail(data) {
    return request({
        url: '/methodParameter/diseaseCostDataDetails/add',
        method: 'post',
        data,
        btnCode: 'diseaseParameterCostData:add'
    })
}

// 修改成本数据
export function updateCostData(data) {
    return request({
        url: '/methodParameter/diseaseCostData/update',
        method: 'post',
        data,
        btnCode: 'diseaseParameterCostData:update'
    })
}

// 修改成本数据明细
export function updateCostDataDetail(data) {
    return request({
        url: '/methodParameter/diseaseCostDataDetails/update',
        method: 'post',
        data,
        btnCode: 'diseaseParameterCostData:update'
    })
}

// 删除成本数据
export function deleteCostData(data) {
    return request({
        url: '/methodParameter/diseaseCostData/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseParameterCostData:delete'
    })
}

// 删除成本数据明细
export function deleteCostDataDetail(data) {
    return request({
        url: '/methodParameter/diseaseCostDataDetails/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseParameterCostData:delete'
    })
}

// 确认成本数据
export function enableCostData(data) {
    return request({
        url: '/methodParameter/diseaseCostData/confirm',
        method: 'post',
        data,
        btnCode: 'diseaseParameterCostData:enable'
    })
}

// 取消确认成本数据
export function disableCostData(data) {
    return request({
        url: '/methodParameter/diseaseCostData/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'diseaseParameterCostData:enable'
    })
}

// 采集成本数据
export function collectCostData(params) {
    return request({
        url: `methodParameter/diseaseCostData/in/collect/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
        params,
        btnCode: 'diseaseParameterCostData:collect'
    })
}

// 导出成本数据
export function exportCostData(params) {
    return request({
        url: '/methodParameter/diseaseCostData/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseParameterCostData:export'
    })
}

// 导出成本数据明细
export function exportCostDataDetail(params) {
    return request({
        url: `/methodParameter/diseaseCostDataDetails/excel/${params.orderId}`,
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseParameterCostData:export'
    })
}

// 导出成本数据明细页
export function exportCostDataDetailPage(data) {
    return request({
        url: '/methodParameter/diseaseCostDataDetails/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'diseaseParameterCostData:export'
    })
}
