import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/compareHospitalIncomeProjectAnalysisRange/hospitalIncomeProjectCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/compareHospitalIncomeProjectAnalysisRange/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/compareHospitalIncomeProjectAnalysisRange/hospitalIncomeProjectCompareIncomeList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/compareHospitalIncomeProjectAnalysisRange/exportHospitalIncomeProjectCompareIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/compareHospitalIncomeProjectAnalysisRange/exportHospitalIncomeProjectCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
