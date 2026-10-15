import request from '@/utils/request'

export function pageDeptPhaseAnalysis(data) {
    return request({
        url: '/item/constituteAnalysis/hospital/feeCategory',
        method: 'post',
        data
    })
}

export function analysisDeptPhaseAnalysis(data) {
    return request({
        url: '/item/constituteAnalysis/hospital/feeCategoryAnalysis',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/item/constituteAnalysis/hospital/feeCategory/detail',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/item/constituteAnalysis/hospital/feeCategory/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/item/constituteAnalysis/hospital/feeCategory/detail/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}