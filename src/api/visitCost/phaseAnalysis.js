import request from '@/utils/request'

export function pageDeptPhaseAnalysis(data) {
    return request({
        url: '/bedClinic/profitAnalysis/clinic/profitList',
        method: 'post',
        data
    })
}

export function analysisDeptPhaseAnalysis(data) {
    return request({
        url: '/bedClinic/profitAnalysis/clinic/profitAnalysis',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/profitAnalysis/clinic/costList',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/bedClinic/profitAnalysis/clinic/incomeList',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/profitAnalysis/clinic/exportProfitList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/profitAnalysis/clinic/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/bedClinic/profitAnalysis/clinic/exportIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}