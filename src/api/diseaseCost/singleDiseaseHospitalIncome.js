import request from '@/utils/request'

export function pageHospitalDRGsIncomeAnalysis(data) {
    return request({
        url: '/disease/incomeAnalysis/hospital',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function analysisHospitalDRGsIncomeAnalysis(data) {
    return request({
        url: '/disease/incomeAnalysis/hospital/analysis',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function incomeDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/hospital/incomeDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function costDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/hospital/costDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/disease/incomeAnalysis/hospital/export',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        },
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/hospital/export/incomeDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        },
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/hospital/export/costDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        },
        responseType: 'blob'
    })
}