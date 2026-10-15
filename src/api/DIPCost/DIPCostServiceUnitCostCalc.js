import request from '@/utils/request'

export function checkData(id) {
    return request({
        url: `/dip/methodService/calculate/checkData/${id}`,
        method: 'get',
        btnCode: 'DIPCostServiceUnitDataCheck:check'
    })
}

export function pageCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsCostIncome/page',
        method: 'get',
        params,
        btnCode: 'DIPCostServiceUnitCostCalc:list'
    })
}
export function calcCalcData(params) {
    return request({
        url: `/dip/methodService/calculate/costToIncomeRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostServiceUnitCostCalc:calc'
    })
}
export function cancelCalcCalcData(params) {
    return request({
        url: `/dip/methodService/calculate/cancelCostToIncomeRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostServiceUnitCostCalc:calc'
    })
}
export function exportCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsCostIncome/excel',
        method: 'get',
        params,
        btnCode: 'DIPCostServiceUnitCostCalc:export',
        responseType: 'blob'
    })
}

export function pageSecCalcData(data) {
    return request({
        url: '/dip/statistics/diseaseStatistics/queryPatientCaseCost',
        method: 'post',
        data: {
            ...data,
            type: 3
        },
        btnCode: 'DIPCostServiceUnitCostCalc:list'
    })
}
export function calcSecCalcData(params) {
    return request({
        url: `/dip/methodService/calculate/diseaseRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostServiceUnitCostCalc:calc'
    })
}
export function cancelSecCalcCalcData(params) {
    return request({
        url: `/dip/methodService/calculate/cancelDiseaseRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostServiceUnitCostCalc:calc'
    })
}
export function exportSecCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatistics/excel',
        method: 'get',
        params: {
            ...params,
            type: 3
        },
        btnCode: 'DIPCostServiceUnitCostCalc:export',
        responseType: 'blob'
    })
}

export function pageThrCalcData(data) {
    return request({
        url: '/dip/statistics/diseaseStatistics/queryDeptDiseaseStatisPageList',
        method: 'post',
        data: {
            ...data,
            type: 3
        },
        btnCode: 'DIPCostServiceUnitCostCalc:list'
    })
}
export function calcThrCalcData(params) {
    return request({
        url: `/dip/methodService/calculate/deptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostServiceUnitCostCalc:calc'
    })
}
export function cancelThrCalcCalcData(params) {
    return request({
        url: `/dip/methodService/calculate/cancelDeptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostServiceUnitCostCalc:calc'
    })
}
export function exportThrCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 3
        },
        btnCode: 'DIPCostServiceUnitCostCalc:export',
        responseType: 'blob'
    })
}

export function pageFourCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsHospital/page',
        method: 'get',
        params: {
            ...params,
            type: 3
        },
        btnCode: 'DIPCostServiceUnitCostCalc:list'
    })
}
export function calcFourCalcData(params) {
    return request({
        url: `/dip/methodService/calculate/hospitalDiseaseRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostServiceUnitCostCalc:calc'
    })
}
export function cancelFourCalcCalcData(params) {
    return request({
        url: `/dip/methodService/calculate/cancelHospitalDiseaseRatio/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostServiceUnitCostCalc:calc'
    })
}
export function exportFourCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 3
        },
        btnCode: 'DIPCostServiceUnitCostCalc:export',
        responseType: 'blob'
    })
}
