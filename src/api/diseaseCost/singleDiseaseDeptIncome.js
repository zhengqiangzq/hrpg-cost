import request from '@/utils/request'

export function pageDeptDRGsIncomeAnalysis(data) {
    return request({
        url: '/disease/incomeAnalysis/dept',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function analysisDeptDRGsIncomeAnalysis(data) {
    return request({
        url: '/disease/incomeAnalysis/dept/analysis',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function incomeDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/dept/incomeDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function costDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/dept/costDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/disease/incomeAnalysis/dept/export',
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
        url: '/disease/incomeAnalysis/dept/export/incomeDetail',
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
        url: '/disease/incomeAnalysis/dept/export/costDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        },
        responseType: 'blob'
    })
}