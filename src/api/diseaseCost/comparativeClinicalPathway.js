import request from '@/utils/request'

export function pageDeptComparativeAnalysis(data) {
    return request({
        url: '/disease/contrastAnalysis/waysPath',
        method: 'post',
        data
    })
}
export function analysisDeptComparativeAnalysis(data) {
    return request({
        url: '/disease/contrastAnalysis/waysPath/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/disease/contrastAnalysis/waysPath/incomeDetail',
        method: 'post',
        data
    })
}
export function clinicalPathwayDetail(data) {
    return request({
        url: '/disease/contrastAnalysis/waysPath/detail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/disease/contrastAnalysis/waysPath/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportClinicalPathwayDetail(data) {
    return request({
        url: '/disease/contrastAnalysis/waysPath/detail/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}