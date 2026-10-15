import request from '@/utils/request'

export function pageClinicalPathwayCostCompare(params) {
    return request({
        url: '/disease/wayStatisticsHospital/pathWayContrast',
        method: 'get',
        params,
        btnCode: 'clinicalPathwayCostCompare:list'
    })
}

export function pageDetailClinicalPathwayCostCompare(params) {
    return request({
        url: '/disease/wayStatisticsHospital/pathWayContrast/details',
        method: 'get',
        params,
        btnCode: 'clinicalPathwayCostCompare:list'
    })
}

export function exportClinicalPathwayCostCompare(params) {
    return request({
        url: '/disease/wayStatisticsHospital/pathWayContrast/excel',
        method: 'get',
        params,
        btnCode: 'clinicalPathwayCostCompare:export',
        responseType: 'blob'
    })
}

export function exportDetailClinicalPathwayCostCompare(params) {
    return request({
        url: '/disease/wayStatisticsHospital/pathWayContrast/details/excel',
        method: 'get',
        params,
        btnCode: 'clinicalPathwayCostCompare:export',
        responseType: 'blob'
    })
}