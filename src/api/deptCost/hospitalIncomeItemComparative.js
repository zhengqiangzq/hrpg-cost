import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/compareHospitalIncomeProjectAnalysis/hospitalIncomeProjectCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/compareHospitalIncomeProjectAnalysis/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/compareHospitalIncomeProjectAnalysis/hospitalIncomeProjectCompareIncomeList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/compareHospitalIncomeProjectAnalysis/exportHospitalIncomeProjectCompareIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/compareHospitalIncomeProjectAnalysis/exportHospitalIncomeProjectCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}