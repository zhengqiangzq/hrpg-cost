import request from '@/utils/request'

export function pageDeptPhaseAnalysis(data) {
    return request({
        url: '/item/profit/analysis/hospital/feeItem',
        method: 'post',
        data
    })
}

export function analysisDeptPhaseAnalysis(data) {
    return request({
        url: '/item/profit/analysis/hospital/feeItemAnalysis',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/item/profit/analysis/hospital/feeItem/costDetail',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/item/profit/analysis/hospital/feeItem/incomeDetail',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/item/profit/analysis/hospital/feeItem/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/item/profit/analysis/hospital/feeItem/costDetail/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/item/profit/analysis/hospital/feeItem/incomeDetail/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}