import request from '@/utils/request'

export function contributionMarginAnalysisList(data) {
    return request({
        url: '/disease/contributionMarginAnalysis/list',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/disease/contributionMarginAnalysis/getDetail',
        method: 'post',
        data
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/disease/contributionMarginAnalysis/exportDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function pageApportionmentLevelList(data) {
    return request({
        url: '/disease/contributionMarginAnalysis/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
