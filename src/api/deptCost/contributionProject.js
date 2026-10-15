import request from '@/utils/request'

export function contributionMarginAnalysisList(data) {
    return request({
        url: '/item/contributionMarginAnalysis/list',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/item/contributionMarginAnalysis/getIncomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/item/contributionMarginAnalysis/getCostDetail',
        method: 'post',
        data
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/item/contributionMarginAnalysis/exportIncomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/item/contributionMarginAnalysis/exportCostDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function pageApportionmentLevelList(data) {
    return request({
        url: '/item/contributionMarginAnalysis/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
