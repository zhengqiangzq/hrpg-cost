import request from '@/utils/request'

// 总账取数规则
// 列表
export function finAccessRulepage(params) {
    return request({
        url: '/finAccessRule/page',
        method: 'get',
        params,
        btnCode: 'ledgerRetrievalRules:list'
    })
}

// 新增
export function finAccessRuleadd(data) {
    return request({
        url: '/finAccessRule/add',
        method: 'post',
        data,
        btnCode: 'ledgerRetrievalRules:add'
    })
}
// 编辑
export function finAccessRuleupdate(data) {
    return request({
        url: '/finAccessRule/update',
        method: 'post',
        data,
        btnCode: 'ledgerRetrievalRules:update'
    })
}
// 删除
export function finAccessRuledelete(data) {
    return request({
        url: '/finAccessRule/byDelete',
        method: 'post',
        data,
        btnCode: 'ledgerRetrievalRules:delete'
    })
}
// 编辑查询
export function finAccessRuledetail(id) {
    return request({
        url: '/finAccessRule/detail/' + id,
        method: 'get',
        btnCode: 'ledgerRetrievalRules:list'
    })
}

// 详情页导出
export function finAccessRuledetailexportDetailExcel(params) {
    return request({
        url: '/finAccessRule/detail/exportDetailExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'ledgerRetrievalRules:export'
    })
}

// 明细页导出
export function finAccessRuledetailexportDetailExcelByDeptCost(params) {
    return request({
        url: '/finAccessRule/detail/exportDetailExcelByDeptCost',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'ledgerRetrievalRules:export'
    })
}

// 详情分页
export function finAccessRuledetailpage(params) {
    return request({
        url: '/finAccessRule/detail/page',
        method: 'get',
        params,
        btnCode: 'ledgerRetrievalRules:list'
    })
}

// 详情新增
export function finAccessRuleetailadd(data) {
    return request({
        url: '/finAccessRule/detail/add',
        method: 'post',
        data,
        btnCode: 'ledgerRetrievalRules:add'
    })
}
// 详情编辑
export function finAccessRuleetailupdate(data) {
    return request({
        url: '/finAccessRule/detail/update',
        method: 'post',
        data,
        btnCode: 'ledgerRetrievalRules:update'
    })
}

// 详情删除
export function finAccessRuledetaildelete(data) {
    return request({
        url: '/finAccessRule/detail/byDelete',
        method: 'post',
        data,
        btnCode: 'ledgerRetrievalRules:delete'
    })
}


// 通过科目查询辅助核算
export function bdAccountgetBdAccassItem(data) {
    return request({
        url: '/bdAccount/getBdAccassItem',
        method: 'post',
        data
    })
}





