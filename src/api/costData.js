import request from '@/utils/request'

// 分页查询成本数据
export function pageCostData(params) {
    return request({
        url: '/deptCost/page',
        method: 'get',
        params,
        btnCode: 'costData:list'
    })
}

// 分页查询成本数据详情
export function pageCostDataDetail(data) {
    return request({
        url: '/deptCost/detail/page',
        method: 'post',
        data,
        btnCode: 'costData:list'
    })
}

// 查询成本数据详情
export function oneCostData(id) {
    return request({
        url: `/deptCost/detail/${id}`,
        method: 'get',
        btnCode: 'costData:list'
    })
}

// 采集成本数据
export function collectCostData(params) {
    return request({
        url: '/deptCost/collection',
        method: 'get',
        params,
        btnCode: 'costData:collect'
    })
}

// 计算成本数据金额
export function calcCostDataMoney(id) {
    return request({
        url: `/deptCost/calculateTotalMoney/${id}`,
        method: 'get',
        btnCode: 'costData:list'
    })
}

// 新增成本数据
export function addCostData(data) {
    return request({
        url: '/deptCost/add',
        method: 'post',
        data,
        btnCode: 'costData:add'
    })
}

// 新增成本数据详情
export function addCostDataDetail(data) {
    return request({
        url: '/deptCost/detail/add',
        method: 'post',
        data,
        btnCode: 'costData:add'
    })
}

// 更新成本数据
export function updateCostData(data) {
    return request({
        url: '/deptCost/update',
        method: 'post',
        data,
        btnCode: 'costData:update'
    })
}

// 更新成本数据详情
export function updateCostDataDetail(data) {
    return request({
        url: '/deptCost/detail/update',
        method: 'post',
        data,
        btnCode: 'costData:update'
    })
}

// 删除成本数据
export function deleteCostData(data) {
    return request({
        url: '/deptCost/byDelete',
        method: 'post',
        data,
        btnCode: 'costData:delete'
    })
}

// 删除成本数据详情
export function deleteCostDataDetail(data) {
    return request({
        url: '/deptCost/detail/byDelete',
        method: 'post',
        data,
        btnCode: 'costData:delete'
    })
}

// 确认、取消确认成本数据
export function enableCostData(data) {
    return request({
        url: '/deptCost/confirm',
        method: 'post',
        data,
        btnCode: 'costData:confirm'
    })
}

// 导出成本数据
export function exportCostData(params) {
    return request({
        url: '/deptCost/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'costData:export'
    })
}

// 导出成本数据详情
export function exportCostDataDetail(params) {
    return request({
        url: '/deptCost/detail/exportDetailExcelByDeptCost',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'costData:export'
    })
}

// 导出成本数据明细
export function exportCostDataDetailList(data) {
    return request({
        url: '/deptCost/detail/exportDetailExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costData:export'
    })
}
