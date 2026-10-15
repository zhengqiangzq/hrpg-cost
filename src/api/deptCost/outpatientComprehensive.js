import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/clinic/analysis',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/clinic/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/clinic/incomeList',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/clinic/costList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/clinic/exportIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/clinic/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/clinic/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}