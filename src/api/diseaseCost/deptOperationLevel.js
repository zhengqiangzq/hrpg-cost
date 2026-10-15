import request from '@/utils/request'

export function pageDeptOperationLevel(data) {
    return request({
        url: '/disease/incomeAnalysis/deptSurgery',
        method: 'post',
        data,
    })
}

export function analysisDeptOperationLevel(data) {
    return request({
        url: '/disease/incomeAnalysis/deptSurgery/analysis',
        method: 'post',
        data,
    })
}

export function incomeDeptOperationLevelDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/deptSurgery/profitDetail',
        method: 'post',
        data,
    })
}

export function exportDeptOperationLevel(data) {
    return request({
        url: '/disease/incomeAnalysis/deptSurgery/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportIncomeDeptOperationLevelDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/deptSurgery/export/profitDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}