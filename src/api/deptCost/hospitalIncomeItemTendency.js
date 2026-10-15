import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/trendHospitalIncomeProjectAnalysis/hospitalIncomeProjectTrend',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/trendHospitalIncomeProjectAnalysis/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/trendHospitalIncomeProjectAnalysis/incomeList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/trendHospitalIncomeProjectAnalysis/exportIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/trendHospitalIncomeProjectAnalysis/exportHospitalIncomeProjectTrend',
        method: 'post',
        data,
        responseType: 'blob'
    })
}