

import request from '@/utils/request'

// 查询列表
export function costBedClinicqueryList(params) {
    return request({
        url: '/costBedClinic/queryList',
        method: 'get',
        params,
        btnCode: params.interType == '2' ? 'bedDayCostCalc:list' : 'visitAllocationCalc:list'
    })
}
// 分摊检查
export function costBedCliniccaculationValidate(params) {
    return request({
        url: '/costBedClinic/caculationValidate',
        method: 'get',
        params,
        btnCode: params.interType == '2' ? 'bedDayCostCalc:inspect' : 'visitAllocationCalc:inspect'
    })
}

// 分摊计算
export function costBedCliniccalculation(params) {
    return request({
        url: '/costBedClinic/calculation',
        method: 'get',
        params,
        btnCode: params.interType == '2' ? 'bedDayCostCalc:calculate' : 'visitAllocationCalc:calculate'
    })
}


// 取消分摊计算
export function costBedClinicunCalculation(params) {
    return request({
        url: '/costBedClinic/unCalculation',
        method: 'get',
        params,
        btnCode: params.interType == '2' ? 'bedDayCostCalc:cancelCalculate' : 'visitAllocationCalc:cancelCalculate'
    })
}

// 导出分摊计算
export function exportBedClinicunCalculation(params) {
    return request({
        url: '/costBedClinic/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: params.interType == '2' ? 'bedDayCostCalc:export' : 'visitAllocationCalc:export'
    })
}
