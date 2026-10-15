import request from '@/utils/request'



const prePath = '/deptRiskFundCost'
// -----------------  风险基金  -------------------
// 分页查询
export function deptRiskFundCostpage(data) {
    return request({
        url: prePath + '/page',
        method: 'post',
        data,
        btnCode: 'riskFund:list'
    })
}

// 查询详情
export function deptRiskFundCostdetail(params) {
    return request({
        url: prePath + '/detail',
        method: 'get',
        params,
        btnCode: 'riskFund:list'
    })
}

// 主表新增
export function deptRiskFundCostadd(data) {
    return request({
        url: prePath + '/add',
        method: 'post',
        data,
        btnCode: 'riskFund:add'
    })
}
// 主表编辑
export function deptRiskFundCostupdate(data) {
    return request({
        url: prePath + '/update',
        method: 'post',
        data,
        btnCode: 'riskFund:update'
    })
}

// 确认单据
export function deptRiskFundCostok(data) {
    return request({
        url: prePath + '/ok',
        method: 'post',
        data,
        btnCode: 'riskFund:confirm'
    })
}

// 取消确认单据
export function deptRiskFundCostcancel(data) {
    return request({
        url: prePath + '/cancel',
        method: 'post',
        data,
        btnCode: 'riskFund:unconfirm'
    })
}

// 计提
export function deptRiskFundCostcollection(data) {
    return request({
        url: prePath + '/provision',
        method: 'post',
        data,
        btnCode: 'riskFund:provision'
    })
}


// 删除
export function deptRiskFundCostdelete(data) {
    return request({
        url: prePath + '/delete',
        method: 'post',
        data,
        btnCode: 'riskFund:delete'
    })
}

// 导出参数数据
export function deptRiskFundCostexportExcel(params) {
    return request({
        url: prePath + '/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'riskFund:export'
    })
}


// -----------------  明细  -------------------

const prePath2 = '/deptRiskFundCostDetail'
// 分页查询
export function deptRiskFundCostDetailpage(data) {
    return request({
        url: prePath2 + '/page',
        method: 'post',
        data,
        btnCode: 'riskFund:list'
    })
}

// 子表新增
export function deptRiskFundCostDetailadd(data) {
    return request({
        url: prePath2 + '/add',
        method: 'post',
        data,
        btnCode: 'riskFund:add'
    })
}

// 子表修改
export function deptRiskFundCostDetailupdate(data) {
    return request({
        url: prePath2 + '/update',
        method: 'post',
        data,
        btnCode: 'riskFund:update'
    })
}

// 子表删除
export function deptRiskFundCostDetaildelete(data) {
    return request({
        url: prePath2 + '/delete',
        method: 'post',
        data,
        btnCode: 'riskFund:delete'
    })
}

// 导出 明细数据
export function deptRiskFundCostDetailexportExcel(params) {
    return request({
        url: prePath2 + '/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'riskFund:detailexport'
    })
}
// 导出参数数据
export function deptRiskFundCostDetailexportExcelDetail(data) {
    return request({
        url: prePath2 + '/exportExcelDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'riskFund:detailexport'
    })
}

