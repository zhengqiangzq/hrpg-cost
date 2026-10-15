import request from '@/utils/request'

export function contributionMarginAnalysisList(data) {
    return request({
        url: '/dept/contributionMarginAnalysis/list',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/dept/contributionMarginAnalysis/getIncomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/dept/contributionMarginAnalysis/getCostDetail',
        method: 'post',
        data
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/dept/contributionMarginAnalysis/exportIncomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/dept/contributionMarginAnalysis/exportCostDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function contributionMarginAnalysisexport(data) {
    return request({
        url: '/dept/contributionMarginAnalysis/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
