import request from '@/utils/request'
// 参数分配法

// 分页查询成本数据
export function pageCostData(params) {
    return request({
        url: '/dip/costData/page',
        method: 'get',
        params,
        btnCode: 'DIPParameterCostData:list'
    })
}

// 分页查询成本数据明细
export function pageCostDataDetail(params) {
    return request({
        url: '/dip/costDataDetails/page',
        method: 'get',
        params,
        btnCode: 'DIPParameterCostData:list'
    })
}

// 分页查询成本数据明细页
export function pageCostDataDetailPage(data) {
    return request({
        url: '/dip/costDataDetails/detail/page',
        method: 'post',
        data,
        btnCode: 'DIPParameterCostData:list'
    })
}

// 查询成本数据
export function oneCostData(id) {
    return request({
        url: `/dip/costData/${id}`,
        method: 'get'
    })
}

// 新增成本数据
export function addCostData(data) {
    return request({
        url: '/dip/costData/add',
        method: 'post',
        data,
        btnCode: 'DIPParameterCostData:add'
    })
}

// 新增成本数据明细
export function addCostDataDetail(data) {
    return request({
        url: '/dip/costDataDetails/add',
        method: 'post',
        data,
        btnCode: 'DIPParameterCostData:add'
    })
}

// 修改成本数据
export function updateCostData(data) {
    return request({
        url: '/dip/costData/update',
        method: 'post',
        data,
        btnCode: 'DIPParameterCostData:update'
    })
}

// 修改成本数据明细
export function updateCostDataDetail(data) {
    return request({
        url: '/dip/costDataDetails/update',
        method: 'post',
        data,
        btnCode: 'DIPParameterCostData:update'
    })
}

// 删除成本数据
export function deleteCostData(data) {
    return request({
        url: '/dip/costData/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPParameterCostData:delete'
    })
}

// 删除成本数据明细
export function deleteCostDataDetail(data) {
    return request({
        url: '/dip/costDataDetails/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPParameterCostData:delete'
    })
}

// 确认成本数据
export function enableCostData(data) {
    return request({
        url: '/dip/costData/confirm',
        method: 'post',
        data,
        btnCode: 'DIPParameterCostData:enable'
    })
}

// 取消确认成本数据
export function disableCostData(data) {
    return request({
        url: '/dip/costData/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'DIPParameterCostData:enable'
    })
}

// 采集成本数据
export function collectCostData(params) {
    return request({
        url: `dip/costData/in/collect/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
        params,
        btnCode: 'DIPParameterCostData:collect'
    })
}

// 导出成本数据
export function exportCostData(params) {
    return request({
        url: '/dip/costData/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DIPParameterCostData:export'
    })
}

// 导出成本数据明细
export function exportCostDataDetail(params) {
    return request({
        url: `/dip/costDataDetails/excel/${params.orderId}`,
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DIPParameterCostData:export'
    })
}

// 导出成本数据明细页
export function exportCostDataDetailPage(data) {
    return request({
        url: '/dip/costDataDetails/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DIPParameterCostData:export'
    })
}
