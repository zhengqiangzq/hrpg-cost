import request from '@/utils/request'

export function pageDeptPhaseAnalysis(data) {
    return request({
        url: '/item/constituteAnalysis/hospital/feeItem',
        method: 'post',
        data
    })
}

export function analysisDeptPhaseAnalysis(data) {
    return request({
        url: '/item/constituteAnalysis/hospital/feeItemAnalysis',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/item/constituteAnalysis/hospital/feeItem/detail',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/item/constituteAnalysis/hospital/feeItem/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/item/constituteAnalysis/hospital/feeItem/detail/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}