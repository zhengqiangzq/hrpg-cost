import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/bed/analysis',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/bed/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/bed/incomeList',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/bed/costList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/bed/exportIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/bed/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/bed/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}