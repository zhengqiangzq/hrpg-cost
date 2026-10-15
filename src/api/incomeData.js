import request from '@/utils/request'

// 分页查询收入数据
export function pageIncomeData(params) {
    return request({
        url: '/deptIncome',
        method: 'get',
        params,
        btnCode: 'incomeData:list'
    })
}

// 分页查询收入数据明细
export function pageIncomeDataDetail(data) {
    return request({
        url: '/deptIncomeDetail/page',
        method: 'post',
        data,
        btnCode: 'incomeData:list'
    })
}

// 明细页分页查询
export function pageIncomeDataDetailQuery(data) {
    return request({
        url: '/deptIncomeDetail/query',
        method: 'post',
        data,
        btnCode: 'incomeData:list'
    })
}

// 查询收入数据明细
export function oneIncomeData(params) {
    return request({
        url: '/deptIncome/getById',
        method: 'get',
        params,
        btnCode: 'incomeData:list'
    })
}

export function enableIncomeData(status, data) {
    const api = status == 1 ? '/deptIncome/ok' : '/deptIncome/cancel'
    return request({
        url: api,
        method: 'post',
        data,
        btnCode: 'incomeData:confirm'
    })
}

// 新增收入数据
export function addIncomeData(data) {
    return request({
        url: '/deptIncome/add',
        method: 'post',
        data,
        btnCode: 'incomeData:add'
    })
}

// 修改收入数据
export function updateIncomeData(data) {
    return request({
        url: '/deptIncome/addOrUpdate',
        method: 'post',
        data,
        btnCode: 'incomeData:update'
    })
}

// 采集收入数据
export function collectIncomeData(params) {
    return request({
        url: '/deptIncome/collection',
        method: 'get',
        params,
        btnCode: 'incomeData:collect'
    })
}

// 新增收入数据明细
export function addIncomeDataDetail(data) {
    return request({
        url: '/deptIncomeDetail/add',
        method: 'post',
        data,
        btnCode: 'incomeData:add'
    })
}

// 修改收入数据明细
export function updateIncomeDataDetail(data) {
    return request({
        url: '/deptIncomeDetail/update',
        method: 'post',
        data,
        btnCode: 'incomeData:update'
    })
}

// 删除收入数据
export function deleteIncomeData(data) {
    return request({
        url: '/deptIncome/delete',
        method: 'post',
        data,
        btnCode: 'incomeData:delete'
    })
}

// 删除收入数据明细
export function deleteIncomeDataDetail(data) {
    return request({
        url: '/deptIncomeDetail/delete',
        method: 'post',
        data,
        btnCode: 'incomeData:delete'
    })
}

// 导出收入数据
export function exportIncomeData(params) {
    return request({
        url: '/deptIncome/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'incomeData:export'
    })
}

// 导出收入数据
export function exportIncomeDataDetail(params) {
    return request({
        url: '/deptIncomeDetail/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'incomeData:export'
    })
}

// 明细页导出
export function exportIncomeDataDetailQuery(data) {
    return request({
        url: '/deptIncomeDetail/exportDetailExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'incomeData:export'
    })
}

export function pullDataLog(params) {
    return request({
        url: '/pullLog/page',
        method: 'get',
        params,
    })
}

export function deletePullDataLog(data) {
    return request({
        url: '/pullLog/byDelete',
        method: 'post',
        data,
    })
}

