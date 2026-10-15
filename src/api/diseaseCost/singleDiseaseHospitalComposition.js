import request from '@/utils/request'

export function pageHospitalCompositionAnalysis(data) {
    return request({
        url: '/disease/constituteAnalysis/hospital',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function analysisHospitalCompositionAnalysis(data) {
    return request({
        url: '/disease/constituteAnalysis/hospital/analysis',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function incomeDetail(data) {
    return request({
        url: '/disease/constituteAnalysis/hospital/incomeDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function costDetail(data) {
    return request({
        url: '/disease/constituteAnalysis/hospital/costDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/disease/constituteAnalysis/hospital/export',
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
        url: '/disease/constituteAnalysis/hospital/export/incomeDetail',
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
        url: '/disease/constituteAnalysis/hospital/export/costDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        },
        responseType: 'blob'
    })
}