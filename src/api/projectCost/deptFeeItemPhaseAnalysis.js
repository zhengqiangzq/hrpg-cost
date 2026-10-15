import request from '@/utils/request'

export function pageDeptPhaseAnalysis(data) {
    return request({
        url: '/item/profit/analysis/dept/feeCategory',
        method: 'post',
        data
    })
}

export function analysisDeptPhaseAnalysis(data) {
    return request({
        url: '/item/profit/analysis/dept/profitAndLossAnalysis',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/item/profit/analysis/dept/feeCategory/profitDetail',
        method: 'post',
        data: {
            ...data,
            isProfit: 0
        }
    })
}

export function incomeDetail(data) {
    return request({
        url: '/item/profit/analysis/dept/feeCategory/profitDetail',
        method: 'post',
        data: {
            ...data,
            isProfit: 1
        }
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/item/profit/analysis/dept/feeCategory/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/item/profit/analysis/dept/feeCategory/lossDetail/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/item/profit/analysis/dept/feeCategory/profitDetail/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}