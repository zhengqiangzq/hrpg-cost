import request from '@/utils/request'



//    ---------------当量系数法  数据校验 ---------
// 列表
export function itemChargeItemEquivalentCostDetailcheckData(id) {
    return request({
        url: '/item/itemizeCostCompute/checkData/' + id,
        method: 'get',
        btnCode: 'eqvalidation:confirm'
    })
}

//    ---------------当量系数法  成本计算 ---------

// 直接成本计算分页
export function itemChargeItemEquivalentCostDetaildeptPage(data) {
    return request({
        url: '/item/itemizeCostCompute/queryDirectComputeList',
        method: 'post',
        data,
        btnCode: 'eqcalculation:list'
    })
}

// 间接成本计算分页
export function itemChargeItemEquivalentCostDetailhospitalPage(data) {
    return request({
        url: '/item/itemizeCostCompute/queryIndirectComputeList',
        method: 'post',
        data,
        btnCode: 'eqcalculation:list'
    })
}


// 直接成本计算
export function itemChargeItemEquivalentCostDetailcalculate(accountingPeriodId) {
    return request({
        url: '/item/itemizeCostCompute/directCostCompute/' + accountingPeriodId,
        method: 'get',
        btnCode: 'eqcalculation:calc'
    })
}

// 直接成本取消计算
export function itemChargeItemEquivalentCostDetailcancelCalculate(accountingPeriodId) {
    return request({
        url: '/item/itemizeCostCompute/cancelDirectCostCompute/' + accountingPeriodId,
        method: 'get',
        btnCode: 'eqcalculation:calc'
    })
}

// 间接成本计算
export function itemChargeItemEquivalentCostDetailhospitalCalculate(accountingPeriodId) {
    return request({
        url: '/item/itemizeCostCompute/indirectCostCompute/' + accountingPeriodId,
        method: 'get',
        btnCode: 'eqcalculation:calc'
    })
}

// 间接成本取消计算
export function itemChargeItemEquivalentCostDetailcancelHospitalCalculate(accountingPeriodId) {
    return request({
        url: '/item/itemizeCostCompute/cancelIndirectCostCompute/' + accountingPeriodId,
        method: 'get',
        btnCode: 'eqcalculation:calc'
    })
}

// 导出直接成本计算
export function itemChargeItemEquivalentCostDetailexportExcel(data) {
    return request({
        url: '/item/itemizeCostCompute/exportDirectComputeList',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'eqcalculation:export'
    })
}

// 导出间接成本计算
export function itemChargeItemEquivalentCostDetailexportHospitalExcel(data) {
    return request({
        url: '/item/itemizeCostCompute/exportIndirectComputeList',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'eqcalculation:export'
    })
}

export function calcThrQuery(data) {
    return request({
        url: '/item/itemizeCostCompute/queryDeptCostComputeList',
        method: 'post',
        data,
        btnCode: 'eqcalculation:list'
    })
}

export function calcThrCalc(accountingPeriodId) {
    return request({
        url: '/item/itemizeCostCompute/deptCostCompute/' + accountingPeriodId,
        method: 'get',
        btnCode: 'eqcalculation:calc'
    })
}

export function calcThrCancelCalc(accountingPeriodId) {
    return request({
        url: '/item/itemizeCostCompute/cancelDeptCostCompute/' + accountingPeriodId,
        method: 'get',
        btnCode: 'eqcalculation:calc'
    })
}

export function calcThrExport(data) {
    return request({
        url: '/item/itemizeCostCompute/exportDeptCostComputeList',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'eqcalculation:export'
    })
}

export function calcFourQuery(data) {
    return request({
        url: '/item/cost/ledger/hospitalCostPage',
        method: 'post',
        data,
        btnCode: 'eqcalculation:list'
    })
}

export function calcFourCalc(accountingPeriodId) {
    return request({
        url: '/item/itemizeCostCompute/hospitalCompute/' + accountingPeriodId,
        method: 'get',
        btnCode: 'eqcalculation:calc'
    })
}

export function calcFourCancelCalc(accountingPeriodId) {
    return request({
        url: '/item/itemizeCostCompute/cancelHospitalCompute/' + accountingPeriodId,
        method: 'get',
        btnCode: 'eqcalculation:calc'
    })
}

export function calcFourExport(data) {
    return request({
        url: '/item/cost/ledger/hospitalCostExport',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'eqcalculation:export'
    })
}

















