import request from '@/utils/request'



//    ---------------人员拆分设置 ---------
// 列表
export function directCostSplitRulestaffpage(data) {
    return request({
        url: '/directCostSplitRule/staff/page',
        method: 'post',
        data,
        btnCode: 'personnelSplit:list'
    })
}

// 新增
export function directCostSplitRulestaffadd(data) {
    return request({
        url: '/directCostSplitRule/staff/add',
        method: 'post',
        data,
        btnCode: 'personnelSplit:add'
    })
}

// 编辑
export function directCostSplitRulestaffupdate(data) {
    return request({
        url: '/directCostSplitRule/staff/update',
        method: 'post',
        data,
        btnCode: 'personnelSplit:update'
    })
}

// 删除
export function directCostSplitRulestaffdel(data) {
    return request({
        url: '/directCostSplitRule/staff/byDelete',
        method: 'post',
        data,
        btnCode: 'personnelSplit:delete'
    })
}

// 导出
export function directCostSplitRulestaffexportExcel(data) {
    return request({
        url: '/directCostSplitRule/staff/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'personnelSplit:export'
    })
}



//    ---------------总账数据拆分设置 ---------
// 列表
export function directCostSplitRuleledgerpage(data) {
    return request({
        url: '/directCostSplitRule/ledger/page',
        method: 'post',
        data,
        btnCode: 'ledgerSplitting:list'
    })
}

// 新增
export function directCostSplitRuleledgeradd(data) {
    return request({
        url: '/directCostSplitRule/ledger/add',
        method: 'post',
        data,
        btnCode: 'ledgerSplitting:add'
    })
}

// 编辑
export function directCostSplitRuleledgerupdate(data) {
    return request({
        url: '/directCostSplitRule/ledger/update',
        method: 'post',
        data,
        btnCode: 'ledgerSplitting:update'
    })
}

// 删除
export function directCostSplitRuleledgerdel(data) {
    return request({
        url: '/directCostSplitRule/ledger/byDelete',
        method: 'post',
        data,
        btnCode: 'ledgerSplitting:delete'
    })
}

// 导出
export function directCostSplitRuleledgerexportExcel(data) {
    return request({
        url: '/directCostSplitRule/ledger/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'ledgerSplitting:export'
    })
}


//    ---------------薪酬数据拆分设置 ---------
// 列表
export function directCostSplitRulesalarypage(data) {
    return request({
        url: '/directCostSplitRule/salary/page',
        method: 'post',
        data,
        btnCode: 'paySplitting:list'
    })
}

// 新增
export function directCostSplitRulesalaryadd(data) {
    return request({
        url: '/directCostSplitRule/salary/add',
        method: 'post',
        data,
        btnCode: 'paySplitting:add'
    })
}

// 编辑
export function directCostSplitRulesalaryupdate(data) {
    return request({
        url: '/directCostSplitRule/salary/update',
        method: 'post',
        data,
        btnCode: 'paySplitting:update'
    })
}

// 删除
export function directCostSplitRulesalarydel(data) {
    return request({
        url: '/directCostSplitRule/salary/byDelete',
        method: 'post',
        data,
        btnCode: 'paySplitting:delete'
    })
}

// 导出
export function directCostSplitRulesalaryexportExcel(data) {
    return request({
        url: '/directCostSplitRule/salary/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'paySplitting:export'
    })
}



//    ---------------物资数据拆分设置 ---------
// 列表
export function directCostSplitRulesuppliespage(data) {
    return request({
        url: '/directCostSplitRule/supplies/page',
        method: 'post',
        data,
        btnCode: 'materialsSplitting:list'
    })
}

// 新增
export function directCostSplitRulesuppliesadd(data) {
    return request({
        url: '/directCostSplitRule/supplies/add',
        method: 'post',
        data,
        btnCode: 'materialsSplitting:add'
    })
}

// 编辑
export function directCostSplitRulesuppliesupdate(data) {
    return request({
        url: '/directCostSplitRule/supplies/update',
        method: 'post',
        data,
        btnCode: 'materialsSplitting:update'
    })
}

// 删除
export function directCostSplitRulesuppliesdel(data) {
    return request({
        url: '/directCostSplitRule/supplies/byDelete',
        method: 'post',
        data,
        btnCode: 'materialsSplitting:delete'
    })
}

// 导出
export function directCostSplitRulesuppliesexportExcel(data) {
    return request({
        url: '/directCostSplitRule/supplies/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'materialsSplitting:export'
    })
}


//    ---------------药品数据拆分设置 ---------
// 列表
export function directCostSplitRuledrugpage(data) {
    return request({
        url: '/directCostSplitRule/drug/page',
        method: 'post',
        data,
        btnCode: 'drugSplitting:list'
    })
}

// 新增
export function directCostSplitRuledrugadd(data) {
    return request({
        url: '/directCostSplitRule/drug/add',
        method: 'post',
        data,
        btnCode: 'drugSplitting:add'
    })
}

// 编辑
export function directCostSplitRuledrugupdate(data) {
    return request({
        url: '/directCostSplitRule/drug/update',
        method: 'post',
        data,
        btnCode: 'drugSplitting:update'
    })
}

// 删除
export function directCostSplitRuledrugdel(data) {
    return request({
        url: '/directCostSplitRule/drug/byDelete',
        method: 'post',
        data,
        btnCode: 'drugSplitting:delete'
    })
}

// 导出
export function directCostSplitRuledrugexportExcel(data) {
    return request({
        url: '/directCostSplitRule/drug/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'drugSplitting:export'
    })
}



//    ---------------资产数据拆分设置 ---------
// 列表
export function directCostSplitRuleassetspage(data) {
    return request({
        url: '/directCostSplitRule/assets/page',
        method: 'post',
        data,
        btnCode: 'assetSplitting:list'
    })
}

// 新增
export function directCostSplitRuleassetsadd(data) {
    return request({
        url: '/directCostSplitRule/assets/add',
        method: 'post',
        data,
        btnCode: 'assetSplitting:add'
    })
}

// 编辑
export function directCostSplitRuleassetsupdate(data) {
    return request({
        url: '/directCostSplitRule/assets/update',
        method: 'post',
        data,
        btnCode: 'assetSplitting:update'
    })
}

// 删除
export function directCostSplitRuleassetsdel(data) {
    return request({
        url: '/directCostSplitRule/assets/byDelete',
        method: 'post',
        data,
        btnCode: 'assetSplitting:delete'
    })
}

// 导出
export function directCostSplitRuleassetsexportExcel(data) {
    return request({
        url: '/directCostSplitRule/assets/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'assetSplitting:export'
    })
}


