import request from '@/utils/request'

export function checkData(id) {
    return request({
        url: `/drg/methodService/calculate/checkData/${id}`,
        method: 'get',
        btnCode: 'DRGCostServiceUnitDataCheck:check'
    })
}

export function pageCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsCostIncome/page',
        method: 'get',
        params,
        btnCode: 'DRGCostServiceUnitCostCalc:list'
    })
}
export function calcCalcData(params) {
    return request({
        url: `/drg/methodService/calculate/costToIncomeRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostServiceUnitCostCalc:calc'
    })
}
export function cancelCalcCalcData(params) {
    return request({
        url: `/drg/methodService/calculate/cancelCostToIncomeRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostServiceUnitCostCalc:calc'
    })
}
export function exportCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsCostIncome/excel',
        method: 'get',
        params,
        btnCode: 'DRGCostServiceUnitCostCalc:export',
        responseType: 'blob'
    })
}

export function pageSecCalcData(data) {
    return request({
        url: '/drg/statistics/diseaseStatistics/queryPatientCaseCost',
        method: 'post',
        data: {
            ...data,
            type: 3
        },
        btnCode: 'DRGCostServiceUnitCostCalc:list'
    })
}
export function calcSecCalcData(params) {
    return request({
        url: `/drg/methodService/calculate/diseaseRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostServiceUnitCostCalc:calc'
    })
}
export function cancelSecCalcCalcData(params) {
    return request({
        url: `/drg/methodService/calculate/cancelDiseaseRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostServiceUnitCostCalc:calc'
    })
}
export function exportSecCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatistics/excel',
        method: 'get',
        params: {
            ...params,
            type: 3
        },
        btnCode: 'DRGCostServiceUnitCostCalc:export',
        responseType: 'blob'
    })
}

export function pageThrCalcData(data) {
    return request({
        url: '/drg/statistics/diseaseStatistics/queryDeptDiseaseStatisPageList',
        method: 'post',
        data: {
            ...data,
            type: 3
        },
        btnCode: 'DRGCostServiceUnitCostCalc:list'
    })
}
export function calcThrCalcData(params) {
    return request({
        url: `/drg/methodService/calculate/deptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostServiceUnitCostCalc:calc'
    })
}
export function cancelThrCalcCalcData(params) {
    return request({
        url: `/drg/methodService/calculate/cancelDeptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostServiceUnitCostCalc:calc'
    })
}
export function exportThrCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 3
        },
        btnCode: 'DRGCostServiceUnitCostCalc:export',
        responseType: 'blob'
    })
}

export function pageFourCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsHospital/page',
        method: 'get',
        params: {
            ...params,
            type: 3
        },
        btnCode: 'DRGCostServiceUnitCostCalc:list'
    })
}
export function calcFourCalcData(params) {
    return request({
        url: `/drg/methodService/calculate/hospitalDiseaseRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostServiceUnitCostCalc:calc'
    })
}
export function cancelFourCalcCalcData(params) {
    return request({
        url: `/drg/methodService/calculate/cancelHospitalDiseaseRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostServiceUnitCostCalc:calc'
    })
}
export function exportFourCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 3
        },
        btnCode: 'DRGCostServiceUnitCostCalc:export',
        responseType: 'blob'
    })
}
