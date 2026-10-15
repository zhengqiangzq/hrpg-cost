import request from '@/utils/request'

export function contributionMarginAnalysisList(data) {
    return request({
        url: '/drg/contributionMarginAnalysis/list',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/drg/contributionMarginAnalysis/getDetail',
        method: 'post',
        data
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/drg/contributionMarginAnalysis/exportDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function pageApportionmentLevelList(data) {
    return request({
        url: '/drg/contributionMarginAnalysis/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
