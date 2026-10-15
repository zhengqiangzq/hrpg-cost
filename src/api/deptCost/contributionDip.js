import request from '@/utils/request'

export function contributionMarginAnalysisList(data) {
    return request({
        url: '/dip/contributionMarginAnalysis/list',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/dip/contributionMarginAnalysis/getDetail',
        method: 'post',
        data
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/dip/contributionMarginAnalysis/exportDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function pageApportionmentLevelList(data) {
    return request({
        url: '/dip/contributionMarginAnalysis/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
