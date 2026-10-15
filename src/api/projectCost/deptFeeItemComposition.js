import request from '@/utils/request'

export function pageDeptPhaseAnalysis(data) {
    return request({
        url: '/item/constituteAnalysis/dept/feeItem',
        method: 'post',
        data
    })
}

export function analysisDeptPhaseAnalysis(data) {
    return request({
        url: '/item/constituteAnalysis/dept/feeItemAnalysis',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/item/constituteAnalysis/dept/feeItem/detail',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/item/constituteAnalysis/dept/feeItem/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/item/constituteAnalysis/dept/feeItem/detail/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}