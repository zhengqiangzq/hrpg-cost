import request from '@/utils/request'

// ---------------- 资产成本 -----------------------
// 分页
export function itemAssetsCostpage(data) {
    return request({
        url: '/itemAssetsCost/page',
        method: 'post',
        data,
        btnCode: 'materialCosts:list'
    })
}

// 新增
export function itemAssetsCostadd(data) {
    return request({
        url: '/itemAssetsCost/add',
        method: 'post',
        data,
        btnCode: 'materialCosts:add'
    })
}

// 编辑
export function itemAssetsCostupdate(data) {
    return request({
        url: '/itemAssetsCost/update',
        method: 'post',
        data,
        btnCode: 'materialCosts:update'
    })
}
// 删除
export function itemAssetsCostdelete(data) {
    return request({
        url: '/itemAssetsCost/delete',
        method: 'post',
        data,
        btnCode: 'materialCosts:delete'
    })
}


// 详情
export function itemAssetsCostdetail(params) {
    return request({
        url: '/itemAssetsCost/detail',
        method: 'get',
        params,
        btnCode: 'materialCosts:list'
    })
}

// 确认
export function itemAssetsCostok(data) {
    return request({
        url: '/itemAssetsCost/ok',
        method: 'post',
        data,
        btnCode: 'materialCosts:confirm'
    })
}
// 取消确认
export function itemAssetsCostcancel(data) {
    return request({
        url: '/itemAssetsCost/cancel',
        method: 'post',
        data,
        btnCode: 'materialCosts:confirm'
    })
}

// 检查
export function itemAssetsCostcheck(data) {
    return request({
        url: '/itemAssetsCost/check',
        method: 'post',
        data,
        btnCode: 'materialCosts:check'
    })
}

// 金额计算
export function itemAssetsCostcalculateTotalMoney(params) {
    return request({
        url: '/itemAssetsCost/calculateTotalMoney',
        method: 'get',
        params
    })
}

// 导出
export function itemAssetsCostexportExcel(params) {
    return request({
        url: '/itemAssetsCost/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'materialCosts:export'
    })
}

// 采集
export function itemAssetsCostexportCollect(params) {
    return request({
        url: '/itemAssetsCost/collection',
        method: 'get',
        params,
        btnCode: 'materialCosts:collect'
    })
}



// ---------------- 资产成本  --子表 -----------------------
// 分页
export function itemAssetsCostDetailpage(data) {
    return request({
        url: '/itemAssetsCostDetail/page',
        method: 'post',
        data,
        btnCode: 'materialCosts:list'
    })
}


// 新增
export function itemAssetsCostDetailadd(data) {
    return request({
        url: '/itemAssetsCostDetail/add',
        method: 'post',
        data,
        btnCode: 'materialCosts:add'
    })
}

// 编辑
export function itemAssetsCostDetailupdate(data) {
    return request({
        url: '/itemAssetsCostDetail/update',
        method: 'post',
        data,
        btnCode: 'materialCosts:update'
    })
}

// 删除
export function itemAssetsCostDetaildelete(data) {
    return request({
        url: '/itemAssetsCostDetail/delete',
        method: 'post',
        data,
        btnCode: 'materialCosts:delete'
    })
}

// 导出   明细页
export function itemAssetsCostDetailExportDetailExcell(data) {
    return request({
        url: '/itemAssetsCostDetail/exportExcelDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'materialCosts:export'
    })
}

// 导出  子表
export function itemAssetsCostDetailexportExcel(params) {
    return request({
        url: '/itemAssetsCostDetail/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'materialCosts:export'
    })
}





