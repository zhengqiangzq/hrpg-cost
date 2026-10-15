import request from '@/utils/request'

export function pageDeptMainOperation(data) {
    return request({
        url: '/disease/incomeAnalysis/deptMainSurgery',
        method: 'post',
        data,
    })
}

export function incomeDeptMainOperationDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/deptMainSurgery/profitDetail',
        method: 'post',
        data,
    })
}

export function exportDeptMainOperation(data) {
    return request({
        url: '/disease/incomeAnalysis/deptMainSurgery/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportIncomeDeptMainOperationDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/deptMainSurgery/export/profitDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}