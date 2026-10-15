import request from '@/utils/request'

export function pageDeptPhaseAnalysis(data) {
    return request({
        url: '/bedClinic/profitAnalysis/bed/profitList',
        method: 'post',
        data
    })
}

export function analysisDeptPhaseAnalysis(data) {
    return request({
        url: '/bedClinic/profitAnalysis/bed/profitAnalysis',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/profitAnalysis/bed/costList',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/bedClinic/profitAnalysis/bed/incomeList',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/profitAnalysis/bed/exportProfitList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/profitAnalysis/bed/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/bedClinic/profitAnalysis/bed/exportIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}