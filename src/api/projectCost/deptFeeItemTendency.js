import request from '@/utils/request'

export function pageDeptPhaseAnalysis(data) {
    return request({
        url: '/item/cvp/dept',
        method: 'post',
        data
    })
}

export function analysisDeptPhaseAnalysis(data) {
    return request({
        url: '/item/cvp/dept/analysis',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/item/cvp/dept/costDetail',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/item/cvp/dept/incomeDetail',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/item/cvp/dept/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/item/cvp/dept/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/item/cvp/dept/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}