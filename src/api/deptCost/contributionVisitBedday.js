import request from '@/utils/request'

export function contributionMarginAnalysisList(data) {
    return request({
        url: '/bedClinic/contributionMarginAnalysis/list',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/bedClinic/contributionMarginAnalysis/getIncomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/bedClinic/contributionMarginAnalysis/getCostDetail',
        method: 'post',
        data
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/bedClinic/contributionMarginAnalysis/exportIncomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/contributionMarginAnalysis/exportCostDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function pageApportionmentLevelList(data) {
    return request({
        url: '/bedClinic/contributionMarginAnalysis/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
