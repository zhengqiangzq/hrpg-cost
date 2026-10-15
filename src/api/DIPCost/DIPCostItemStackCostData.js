import request from '@/utils/request'
// 参数分配法

// 分页查询成本数据
export function pageCostData(params) {
    return request({
        url: '/dip/costItemData/page',
        method: 'get',
        params,
        btnCode:'DIPCostItemStackCostData:list',
    })
}

// 分页查询成本数据明细
export function pageCostDataDetail(params) {
    return request({
        url: '/dip/costItemDataDetails/page',
        method: 'get',
        params,
        btnCode:'DIPCostItemStackCostData:list',
    })
}

// 分页查询成本数据明细页
export function pageCostDataDetailPage(data) {
    return request({
        url: '/dip/costItemData/selectDetailPage',
        method: 'post',
        data,
        btnCode:'DIPCostItemStackCostData:list',
    })
}

// 查询成本数据
export function oneCostData(id) {
    return request({
        url: `/dip/costItemData/${id}`,
        method: 'get',
        btnCode:'DIPCostItemStackCostData:list',
    })
}

// 新增成本数据
export function addCostData(data) {
    return request({
        url: '/dip/costItemData/add',
        method: 'post',
        data,
        btnCode:'DIPCostItemStackCostData:add',
    })
}

// 新增成本数据明细
export function addCostDataDetail(data) {
    return request({
        url: '/dip/costItemDataDetails',
        method: 'post',
        data,
        btnCode:'DIPCostItemStackCostData:add',
    })
}

// 修改成本数据
export function updateCostData(data) {
    return request({
        url: '/dip/costItemData/byPost',
        method: 'post',
        data,
        btnCode:'DIPCostItemStackCostData:update',
    })
}

// 修改成本数据明细
export function updateCostDataDetail(data) {
    return request({
        url: '/dip/costItemDataDetails/byPost',
        method: 'post',
        data,
        btnCode:'DIPCostItemStackCostData:update',
    })
}

// 删除成本数据
export function deleteCostData(data) {
    return request({
        url: '/dip/costItemData/byDelete',
        method: 'post',
        data,
        btnCode:'DIPCostItemStackCostData:delete',
    })
}

// 删除成本数据明细
export function deleteCostDataDetail(data) {
    return request({
        url: '/dip/costItemDataDetails/byDelete',
        method: 'post',
        data,
        btnCode:'DIPCostItemStackCostData:delete',
    })
}

// 确认成本数据
export function enableCostData(data) {
    return request({
        url: '/dip/costItemData/confirm',
        method: 'post',
        data,
        btnCode:'DIPCostItemStackCostData:enable',
    })
}

// 取消确认成本数据
export function disableCostData(data) {
    return request({
        url: '/dip/costItemData/cancelConfirm',
        method: 'post',
        data,
        btnCode:'DIPCostItemStackCostData:enable',
    })
}

// 采集成本数据
export function collectCostData(params) {
    return request({
        url: `/dip/costItemData/in/collect/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
        params,
        btnCode:'DIPCostItemStackCostData:collect',
    })
}

// 导出成本数据
export function exportCostData(params) {
    return request({
        url: '/dip/costItemData/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode:'DIPCostItemStackCostData:export',
    })
}

// 导出成本数据明细
export function exportCostDataDetail(params) {
    return request({
        url: '/dip/costItemDataDetails/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode:'DIPCostItemStackCostData:export',
    })
}

// 导出成本数据明细页
export function exportCostDataDetailPage(data) {
    return request({
        url: '/dip/costItemData/excel/withDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode:'DIPCostItemStackCostData:export',
    })
}
