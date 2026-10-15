import request from '@/utils/request'
// 参数分配法

// 分页查询成本数据
export function pageCostData(params) {
    return request({
        url: '/drg/costItemData/page',
        method: 'get',
        params,
        btnCode:'DRGCostItemStackCostData:list',
    })
}

// 分页查询成本数据明细
export function pageCostDataDetail(params) {
    return request({
        url: '/drg/costItemDataDetails/page',
        method: 'get',
        params,
        btnCode:'DRGCostItemStackCostData:list',
    })
}

// 分页查询成本数据明细页
export function pageCostDataDetailPage(data) {
    return request({
        url: '/drg/costItemData/selectDetailPage',
        method: 'post',
        data,
        btnCode:'DRGCostItemStackCostData:list',
    })
}

// 查询成本数据
export function oneCostData(id) {
    return request({
        url: `/drg/costItemData/${id}`,
        method: 'get',
        btnCode:'DRGCostItemStackCostData:list',
    })
}

// 新增成本数据
export function addCostData(data) {
    return request({
        url: '/drg/costItemData/add',
        method: 'post',
        data,
        btnCode:'DRGCostItemStackCostData:add',
    })
}

// 新增成本数据明细
export function addCostDataDetail(data) {
    return request({
        url: '/drg/costItemDataDetails',
        method: 'post',
        data,
        btnCode:'DRGCostItemStackCostData:add',
    })
}

// 修改成本数据
export function updateCostData(data) {
    return request({
        url: '/drg/costItemData/byPost',
        method: 'post',
        data,
        btnCode:'DRGCostItemStackCostData:update',
    })
}

// 修改成本数据明细
export function updateCostDataDetail(data) {
    return request({
        url: '/drg/costItemDataDetails/byPost',
        method: 'post',
        data,
        btnCode:'DRGCostItemStackCostData:update',
    })
}

// 删除成本数据
export function deleteCostData(data) {
    return request({
        url: '/drg/costItemData/byDelete',
        method: 'post',
        data,
        btnCode:'DRGCostItemStackCostData:delete',
    })
}

// 删除成本数据明细
export function deleteCostDataDetail(data) {
    return request({
        url: '/drg/costItemDataDetails/byDelete',
        method: 'post',
        data,
        btnCode:'DRGCostItemStackCostData:delete',
    })
}

// 确认成本数据
export function enableCostData(data) {
    return request({
        url: '/drg/costItemData/confirm',
        method: 'post',
        data,
        btnCode:'DRGCostItemStackCostData:enable',
    })
}

// 取消确认成本数据
export function disableCostData(data) {
    return request({
        url: '/drg/costItemData/cancelConfirm',
        method: 'post',
        data,
        btnCode:'DRGCostItemStackCostData:enable',
    })
}

// 采集成本数据
export function collectCostData(params) {
    return request({
        url: `/drg/costItemData/in/collect/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
        params,
        btnCode:'DRGCostItemStackCostData:collect',
    })
}

// 导出成本数据
export function exportCostData(params) {
    return request({
        url: '/drg/costItemData/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode:'DRGCostItemStackCostData:export',
    })
}

// 导出成本数据明细
export function exportCostDataDetail(params) {
    return request({
        url: '/drg/costItemDataDetails/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode:'DRGCostItemStackCostData:export',
    })
}

// 导出成本数据明细页
export function exportCostDataDetailPage(data) {
    return request({
        url: '/drg/costItemData/excel/withDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode:'DRGCostItemStackCostData:export',
    })
}
