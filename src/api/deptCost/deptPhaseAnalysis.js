import request from '@/utils/request'

export function pageDeptPhaseAnalysis(data) {
    return request({
        url: '/dept/profitAnalysis/deptProfitList',
        method: 'post',
        data
    })
}

export function analysisDeptPhaseAnalysis(data) {
    return request({
        url: '/dept/profitAnalysis/basic',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/profitAnalysis/deptCostDetail',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/profitAnalysis/deptIncomeDetail',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/profitAnalysis/exportDeptProfitList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/profitAnalysis/exportDeptCostDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/profitAnalysis/exportDeptIncomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}