import request from '@/utils/request'

// 分页查询其他收入
export function deptOtherIncomeotherpage(params) {
    return request({
        url: '/deptOtherIncome/other/page',
        method: 'get',
        params,
        btnCode: 'otherIncome:list'
    })
}

// 分页查询其他收入明细
export function otherDetailpage(data) {
    return request({
        url: '/deptOtherIncome/other/detail/page',
        method: 'post',
        data,
        btnCode: 'otherIncome:list'
    })
}


// 查询其他收入明细
export function otherdetail(id) {
    return request({
        url: '/deptOtherIncome/other/detail/' + id,
        method: 'get',
        btnCode: 'otherIncome:list'
    })
}

// 计算其他收入明细  金额
export function othercalculateTotalMoney(id) {
    return request({
        url: '/deptOtherIncome/other/calculateTotalMoney/' + id,
        method: 'get',
        btnCode: 'otherIncome:list'
    })
}
// 确认 取消确认
export function otherIncomeconfirm(data) {
    return request({
        url: 'deptOtherIncome/other/confirm',
        method: 'post',
        data,
        btnCode: 'otherIncome:confirm'
    })
}

// 新增其他收入
export function OtherIncomeadd(data) {
    return request({
        url: '/deptOtherIncome/other/add',
        method: 'post',
        data,
        btnCode: 'otherIncome:add'
    })
}

// 修改其他收入
export function OtherIncomeaddupdate(data) {
    return request({
        url: '/deptOtherIncome/other/update',
        method: 'post',
        data,
        btnCode: 'otherIncome:update'
    })
}

// 新增其他收入明细
export function OtherIncomeDetailadd(data) {
    return request({
        url: '/deptOtherIncome/other/detail/add',
        method: 'post',
        data,
        btnCode: 'otherIncome:add'
    })
}

// 修改其他收入明细
export function OtherIncomeDetailupdate(data) {
    return request({
        url: '/deptOtherIncome/other/detail/update',
        method: 'post',
        data,
        btnCode: 'otherIncome:update'
    })
}

// 删除其他收入
export function OtherIncomedelete(data) {
    return request({
        url: '/deptOtherIncome/other/byDelete',
        method: 'post',
        data,
        btnCode: 'otherIncome:delete'
    })
}

// 删除其他收入明细
export function OtherIncomedetaildelete(data) {
    return request({
        url: '/deptOtherIncome/other/detail',
        method: 'post',
        data,
        btnCode: 'otherIncome:delete'
    })
}

// 导出其他收入
export function OtherIncomeexportExcel(params) {
    return request({
        url: '/deptOtherIncome/other/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'otherIncome:export'
    })
}

// 导出其他收入
export function OtherIncomedetailExcel(params) {
    return request({
        url: '/deptOtherIncome/other/detail/exportDetailExcelByDeptCost',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'otherIncome:export'
    })
}

// 明细页导出
export function OtherIncomedetailexportDetailExcel(data) {
    return request({
        url: '/deptOtherIncome/other/detail/exportDetailExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'otherIncome:export'
    })
}
