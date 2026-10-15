import request from '@/utils/request'

export function pageDeptPhaseAnalysis(data) {
    return request({
        url: '/item/profit/analysis/dept/loss',
        method: 'post',
        data
    })
}

export function analysisDeptPhaseAnalysis(data) {
    return request({
        url: '/item/profit/analysis/dept/lossAnalysis',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    // 无保本点
    return request({
        url: '/item/profit/analysis/dept/lossDetail',
        method: 'post',
        data: {
            ...data,
            isGuaranteed: 1
        }
    })
}

export function incomeDetail(data) {
    // 有保本点
    return request({
        url: '/item/profit/analysis/dept/lossDetail',
        method: 'post',
        data: {
            ...data,
            isGuaranteed: 0
        }
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/item/profit/analysis/dept/loss/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    // 无保本点
    return request({
        url: '/item/profit/analysis/dept/noLossDetail/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportIncomeDetail(data) {
    // 有保本点
    return request({
        url: '/item/profit/analysis/dept/lossDetail/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}