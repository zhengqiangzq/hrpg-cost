import request from '@/utils/request'
// 参数分配法

// 分页查询成本数据
export function pageCostData(params) {
    return request({
        url: '/methodItem/diseaseCostItemData/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostItemStackCostData:list'
    })
}

// 分页查询成本数据明细
export function pageCostDataDetail(params) {
    return request({
        url: '/methodItem/diseaseCostItemDataDetails/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostItemStackCostData:list'
    })
}

// 分页查询成本数据明细页
export function pageCostDataDetailPage(data) {
    return request({
        url: '/methodItem/diseaseCostItemData/selectDetailPage',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemStackCostData:list'
    })
}

// 查询成本数据
export function oneCostData(id) {
    return request({
        url: `/methodItem/diseaseCostItemData/${id}`,
        method: 'get',
        btnCode: 'diseaseCostItemStackCostData:list'
    })
}

// 新增成本数据
export function addCostData(data) {
    return request({
        url: '/methodItem/diseaseCostItemData/add',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemStackCostData:add'
    })
}

// 新增成本数据明细
export function addCostDataDetail(data) {
    return request({
        url: '/methodItem/diseaseCostItemDataDetails',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemStackCostData:add'
    })
}

// 修改成本数据
export function updateCostData(data) {
    return request({
        url: '/methodItem/diseaseCostItemData/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemStackCostData:update'
    })
}

// 修改成本数据明细
export function updateCostDataDetail(data) {
    return request({
        url: '/methodItem/diseaseCostItemDataDetails/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemStackCostData:update'
    })
}

// 删除成本数据
export function deleteCostData(data) {
    return request({
        url: '/methodItem/diseaseCostItemData/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemStackCostData:delete'
    })
}

// 删除成本数据明细
export function deleteCostDataDetail(data) {
    return request({
        url: '/methodItem/diseaseCostItemDataDetails/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemStackCostData:delete'
    })
}

// 确认成本数据
export function enableCostData(data) {
    return request({
        url: '/methodItem/diseaseCostItemData/confirm',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemStackCostData:enable'
    })
}

// 取消确认成本数据
export function disableCostData(data) {
    return request({
        url: '/methodItem/diseaseCostItemData/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'diseaseCostItemStackCostData:enable'
    })
}

// 采集成本数据
export function collectCostData(params) {
    return request({
        url: `/methodItem/diseaseCostItemData/in/collect/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
        params,
        btnCode: 'diseaseCostItemStackCostData:collect'
    })
}

// 导出成本数据
export function exportCostData(params) {
    return request({
        url: '/methodItem/diseaseCostItemData/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostItemStackCostData:export'
    })
}

// 导出成本数据明细
export function exportCostDataDetail(params) {
    return request({
        url: '/methodItem/diseaseCostItemDataDetails/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostItemStackCostData:export'
    })
}

// 导出成本数据明细页
export function exportCostDataDetailPage(data) {
    return request({
        url: '/methodItem/diseaseCostItemData/excel/withDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'diseaseCostItemStackCostData:export'
    })
}
