import request from '@/utils/request'

export function pageDeptCompositionAnalysis(data) {
    return request({
        url: '/dip/constituteAnalysis/dept',
        method: 'post',
        data
    })
}
export function analysisDeptCompositionAnalysis(data) {
    return request({
        url: '/dip/constituteAnalysis/dept/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/dept/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/dept/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/dip/constituteAnalysis/dept/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/dept/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/dept/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
