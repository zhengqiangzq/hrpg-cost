import request from '@/utils/request'



//    ---------------参数分配法  数据校验 ---------
// 列表
export function paramcalculateverifyData(id) {
    return request({
        url: '/item/param/calculate/verifyData/' + id,
        method: 'get',
        btnCode: 'dataCheck:check'
    })
}

//    ---------------参数分配法  成本计算 ---------

// 直接成本分页
export function paramcalculatedirectCostPage(data) {
    return request({
        url: '/item/param/calculate/directCostPage',
        method: 'post',
        data,
        btnCode: 'costCalculate:list'
    })
}

// 直接成本计算
export function paramcalculatecalculateDirectCost(id) {
    return request({
        url: '/item/param/calculate/calculateDirectCost/' + id,
        method: 'get',
        btnCode: 'costCalculate:calc'
    })
}

// 直接成本取消计算
export function paramcalculateunCalculateDirectCost(id) {
    return request({
        url: '/item/param/calculate/unCalculateDirectCost/' + id,
        method: 'get',
        btnCode: 'costCalculate:calc'
    })
}


// 导出直接成本
export function paramcalculatedirectCostExport(data) {
    return request({
        url: '/item/param/calculate/directCostExport',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costCalculate:export'
    })
}


// 间接成本分页
export function paramcalculateindirectCostPage(data) {
    return request({
        url: '/item/param/calculate/indirectCostPage',
        method: 'post',
        data,
        btnCode: 'costCalculate:list'
    })
}

// 间接成本计算
export function paramcalculatecalculateIndirectCost(id) {
    return request({
        url: '/item/param/calculate/calculateIndirectCost/' + id,
        method: 'get',
        btnCode: 'costCalculate:calc'
    })
}

// 间接成本取消计算
export function paramcalculateunCalculateIndirectCost(id) {
    return request({
        url: '/item/param/calculate/unCalculateIndirectCost/' + id,
        method: 'get',
        btnCode: 'costCalculate:calc'
    })
}


// 导出间接成本
export function paramcalculateindirectCostExport(data) {
    return request({
        url: '/item/param/calculate/indirectCostExport',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costCalculate:export'
    })
}


// 院级成本分页
export function costledgerhospitalCostPage(data) {
    return request({
        url: '/item/cost/ledger/hospitalCostPage',
        method: 'post',
        data,
        btnCode: 'costCalculate:list'
    })
}

// 院级成本计算
export function paramcalculatecalculateHospitalCost(id) {
    return request({
        url: '/item/param/calculate/calculateHospitalCost/' + id,
        method: 'get',
        btnCode: 'costCalculate:calc'
    })
}

// 院级成本取消计算
export function paramcalculateunCalculateHospitalCost(id) {
    return request({
        url: '/item/param/calculate/unCalculateHospitalCost/' + id,
        method: 'get',
        btnCode: 'costCalculate:calc'
    })
}

// 导出院级成本
export function costledgerhospitalCostExport(data) {
    return request({
        url: '/item/cost/ledger/hospitalCostExport',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costCalculate:export'
    })
}

//    ---------------参数分配法  科室查询 ---------
// 列表
export function costledgergetCostResByDept(data) {
    return request({
        url: '/item/cost/ledger/getCostResByDept',
        method: 'post',
        data,
        btnCode: 'deptQuery:list'
    })
}

// 导出院级成本
export function costledgergetCostResByDeptExport(data) {
    return request({
        url: '/item/cost/ledger/getCostResByDeptExport',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costCalculate:export'
    })
}


//    ---------------参数分配法  院方查询 ---------
// 列表
export function costledgergetCostResByOrg(params) {
    return request({
        url: '/item/cost/ledger/getCostResByOrg',
        method: 'get',
        params,
        btnCode: 'costCalculate:list'
    })
}

// 导出院级成本
export function costledgergetCostResByOrgExport(params) {
    return request({
        url: '/item/cost/ledger/getCostResByOrgExport',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'costCalculate:export'
    })
}


