import request from '@/utils/request'

export function pageDeptComparativeAnalysis(data) {
    return request({
        url: '/disease/contrastAnalysis/dept',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function analysisDeptComparativeAnalysis(data) {
    return request({
        url: '/disease/contrastAnalysis/dept/analysis',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function incomeDetail(data) {
    return request({
        url: '/disease/contrastAnalysis/dept/incomeDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function costDetail(data) {
    return request({
        url: '/disease/contrastAnalysis/dept/costDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        }
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/disease/contrastAnalysis/dept/export',
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
        url: '/disease/contrastAnalysis/dept/export/incomeDetail',
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
        url: '/disease/contrastAnalysis/dept/export/costDetail',
        method: 'post',
        data: {
            ...data,
            isSingleDisease: 1
        },
        responseType: 'blob'
    })
}