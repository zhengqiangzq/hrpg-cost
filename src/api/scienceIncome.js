import request from '@/utils/request'

// 分页查询财政科教收入
export function deptOtherIncomefinanceAndEducpage(params) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/page',
        method: 'get',
        params,
        btnCode: 'scienceIncome:list'
    })
}

// 分页查询财政科教收入明细
export function financeAndEducDetailpage(data) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/detail/page',
        method: 'post',
        data,
        btnCode: 'scienceIncome:list'
    })
}


// 查询财政科教收入明细
export function financeAndEducdetail(id) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/detail/' + id,
        method: 'get',
        btnCode: 'scienceIncome:list'
    })
}

// 计算财政科教收入明细  金额
export function financeAndEduccalculateTotalMoney(id) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/calculateTotalMoney/' + id,
        method: 'get',
        btnCode: 'scienceIncome:list'
    })
}
// 确认 取消确认
export function financeAndEducconfirm(data) {
    return request({
        url: 'deptOtherIncome/financeAndEduc/confirm',
        method: 'post',
        data,
        btnCode: 'scienceIncome:confirm'
    })
}

// 新增财政科教收入
export function financeAndEducadd(data) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/add',
        method: 'post',
        data,
        btnCode: 'scienceIncome:add'
    })
}

// 修改财政科教收入
export function financeAndEducupdate(data) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/update',
        method: 'post',
        data,
        btnCode: 'scienceIncome:update'
    })
}

// 新增财政科教收入明细
export function financeAndEducDetailadd(data) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/detail/add',
        method: 'post',
        data,
        btnCode: 'scienceIncome:add'
    })
}

// 修改财政科教收入明细
export function financeAndEducDetailupdate(data) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/detail/update',
        method: 'post',
        data,
        btnCode: 'scienceIncome:update'
    })
}

// 删除财政科教收入
export function deptOtherIncomefinanceAndEduc(data) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/byDelete',
        method: 'post',
        data,
        btnCode: 'scienceIncome:delete'
    })
}

// 删除财政科教收入明细
export function deptOtherIncomefinanceAndEducdetail(data) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/detail/byDelete',
        method: 'post',
        data,
        btnCode: 'scienceIncome:delete'
    })
}

// 导出财政科教收入
export function financeAndEducexportExcel(params) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'scienceIncome:export'
    })
}

// 导出财政科教收入
export function financeAndEducdetailExcel(params) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/detail/exportDetailExcelByDeptCost',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'scienceIncome:export'
    })
}

// 明细页导出
export function financeAndEducdetailexportDetailExcel(data) {
    return request({
        url: '/deptOtherIncome/financeAndEduc/detail/exportDetailExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'scienceIncome:export'
    })
}
