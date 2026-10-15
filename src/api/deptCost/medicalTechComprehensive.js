import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/medicalTechnology/analysis',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/medicalTechnology/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/medicalTechnology/incomeList',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/medicalTechnology/costList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/medicalTechnology/exportIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/medicalTechnology/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/costVolumeProfitAnalysis/medicalTechnology/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}