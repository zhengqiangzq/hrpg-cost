import request from '@/utils/request'

// ---------------- 物资成本 -----------------------
// 分页
export function itemProductCostpage(data) {
    return request({
        url: '/itemProductCost/page',
        method: 'post',
        data,
        btnCode: 'materialCosts:list'
    })
}

// 新增
export function itemProductCostadd(data) {
    return request({
        url: '/itemProductCost/add',
        method: 'post',
        data,
        btnCode: 'materialCosts:add'
    })
}

// 编辑
export function itemdeptIncomeupdate(data) {
    return request({
        url: '/itemProductCost/update',
        method: 'post',
        data,
        btnCode: 'materialCosts:update'
    })
}
// 删除
export function itemProductCostdelete(data) {
    return request({
        url: '/itemProductCost/delete',
        method: 'post',
        data,
        btnCode: 'materialCosts:delete'
    })
}


// 详情
export function itemProductCostdetail(params) {
    return request({
        url: '/itemProductCost/detail',
        method: 'get',
        params,
        btnCode: 'materialCosts:list'
    })
}

// 确认
export function itemProductCostok(data) {
    return request({
        url: '/itemProductCost/ok',
        method: 'post',
        data,
        btnCode: 'materialCosts:confirm'
    })
}
// 取消确认
export function itemProductCostcancel(data) {
    return request({
        url: '/itemProductCost/cancel',
        method: 'post',
        data,
        btnCode: 'materialCosts:confirm'
    })
}

// 检查
export function itemProductCostcheck(data) {
    return request({
        url: '/itemProductCost/check',
        method: 'post',
        data,
        btnCode: 'materialCosts:check'
    })
}

// 金额计算
export function itemProductCostcalculateTotalMoney(params) {
    return request({
        url: '/itemProductCost/calculateTotalMoney',
        method: 'get',
        params
    })
}

// 导出
export function itemProductCostexportExcel(params) {
    return request({
        url: '/itemProductCost/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'materialCosts:export'
    })
}

// 导出
export function itemProductCostexportCollect(params) {
    return request({
        url: '/itemProductCost/collection',
        method: 'get',
        params,
        btnCode: 'materialCosts:export'
    })
}



// ---------------- 物资成本  --子表 -----------------------
// 分页
export function itemProductCostDetailpage(data) {
    return request({
        url: '/itemProductCostDetail/page',
        method: 'post',
        data,
        btnCode: 'materialCosts:list'
    })
}


// 新增
export function itemProductCostDetailadd(data) {
    return request({
        url: '/itemProductCostDetail/add',
        method: 'post',
        data,
        btnCode: 'materialCosts:add'
    })
}

// 编辑
export function itemProductCostDetailupdate(data) {
    return request({
        url: '/itemProductCostDetail/update',
        method: 'post',
        data,
        btnCode: 'materialCosts:update'
    })
}

// 删除
export function itemProductCostDetaildelete(data) {
    return request({
        url: '/itemProductCostDetail/delete',
        method: 'post',
        data,
        btnCode: 'materialCosts:delete'
    })
}

// 导出   明细页
export function itemProductCostDetailExportDetailExcell(data) {
    return request({
        url: '/itemProductCostDetail/exportExcelDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'materialCosts:export'
    })
}

// 导出  子表
export function itemProductCostDetailExcel(params) {
    return request({
        url: '/itemProductCostDetail/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'materialCosts:export'
    })
}





