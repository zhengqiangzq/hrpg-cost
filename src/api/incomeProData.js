import request from '@/utils/request'


// ---------------- 收入数据 -----------------------
// 分页
export function itemdeptIncomepage(params) {
    return request({
        url: '/item/deptIncome/page',
        method: 'get',
        params,
        btnCode: 'incomeProData:list'
    })
}

// 新增
export function itemdeptIncomeadd(data) {
    return request({
        url: '/item/deptIncome/add',
        method: 'post',
        data,
        btnCode: 'incomeProData:add'
    })
}

// 编辑
export function itemdeptIncomeupdate(data) {
    return request({
        url: '/item/deptIncome/update',
        method: 'post',
        data,
        btnCode: 'incomeProData:update'
    })
}
// 删除
export function itemdeptIncomedelete(data) {
    return request({
        url: '/item/deptIncome/byDelete',
        method: 'post',
        data,
        btnCode: 'incomeProData:delete'
    })
}

// 采集
export function itemdeptIncomecollection(params) {
    return request({
        url: '/item/deptIncome/collection',
        method: 'get',
        params,
        btnCode: 'incomeProData:collect'
    })
}

// 查询详情
export function itemdeptIncomedetailId(id) {
    return request({
        url: '/item/deptIncome/detail/' + id,
        method: 'get',
        btnCode: 'incomeProData:list'
    })
}
// 确认  -取消确认
export function itemdeptIncomeconfirm(data) {
    return request({
        url: '/item/deptIncome/confirm',
        method: 'post',
        data,
        btnCode: 'incomeProData:confirm'
    })
}

// 金额计算
export function itemdeptIncomecalculateTotalMoney(id) {
    return request({
        url: '/item/deptIncome/calculateTotalMoney/' + id,
        method: 'get',
    })
}

// 导出
export function deptIncomeexportExcel(params) {
    return request({
        url: '/item/deptIncome/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'incomeProData:export'
    })
}



// ---------------- 收入数据  --子表 -----------------------
// 分页
export function itemdeptIncomedetailpage(data) {
    return request({
        url: '/item/deptIncome/detail/page',
        method: 'post',
        data,
        btnCode: 'incomeProData:list'
    })
}

// 新增
export function itemdeptIncomedetailadd(data) {
    return request({
        url: '/item/deptIncome/detail/add',
        method: 'post',
        data,
        btnCode: 'incomeProData:add'
    })
}

// 编辑
export function itemdeptIncomedetailupdate(data) {
    return request({
        url: '/item/deptIncome/detail/update',
        method: 'post',
        data,
        btnCode: 'incomeProData:update'
    })
}

// 删除
export function itemdeptIncomedetaildelete(data) {
    return request({
        url: '/item/deptIncome/detail/' + data.itemDeptIncomeId,
        method: 'post',
        data: data.ids,
        btnCode: 'incomeProData:delete'
    })
}

// 导出   明细页
export function deptIncomedetailexportDetailExcel(data) {
    return request({
        url: '/item/deptIncome/detail/exportDetailExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'incomeProData:export'
    })
}

// 导出  子表
export function deptIncomeExportDetailExcelByDeptIncome(params) {
    return request({
        url: '/item/deptIncome/detail/exportDetailExcelByDeptIncome',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'incomeProData:export'
    })
}





