import request from "@/utils/request";

export function checkData(id) {
    return request({
        url: `/drg/methodParameter/calculate/checkData/${id}`,
        method: 'get',
        btnCode: 'DRGCostParameterDataCheck:check'
    })
}

export function pageCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsMedicine/page',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'DRGCostParameterCostCalc:list'
    })
}
export function calcCalcData(params) {
    return request({
        url: `/drg/methodParameter/calculate/drugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostParameterCostCalc:calc'
    })
}
export function cancelCalcCalcData(params) {
    return request({
        url: `/drg/methodParameter/calculate/cancelDrugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostParameterCostCalc:calc'
    })
}
export function exportCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsMedicine/excel',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'DRGCostParameterCostCalc:export',
        responseType: 'blob'
    })
}

export function pageSecCalcData(data) {
    return request({
        url: '/drg/statistics/diseaseStatistics/queryPatientCaseCost',
        method: 'post',
        data: {
            ...data,
            type: 1
        },
        btnCode: 'DRGCostParameterCostCalc:list'
    })
}
export function calcSecCalcData(params) {
    return request({
        url: `/drg/methodParameter/calculate/diseaseCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostParameterCostCalc:calc'
    })
}
export function cancelSecCalcCalcData(params) {
    return request({
        url: `/drg/methodParameter/calculate/cancelDiseaseCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostParameterCostCalc:calc'
    })
}
export function exportSecCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatistics/excel',
        method: 'get',
        params,
        btnCode: 'DRGCostParameterCostCalc:export',
        responseType: 'blob'
    })
}

export function pageThrCalcData(data) {
    return request({
        url: '/drg/statistics/diseaseStatistics/queryDeptDiseaseStatisPageList',
        method: 'post',
        data: {
            ...data,
            type: 1
        },
        btnCode: 'DRGCostParameterCostCalc:list'
    })
}
export function calcThrCalcData(params) {
    return request({
        url: `/drg/methodParameter/calculate/drgDeptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostParameterCostCalc:calc'
    })
}
export function cancelThrCalcCalcData(params) {
    return request({
        url: `/drg/methodParameter/calculate/cancelDrgDeptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostParameterCostCalc:calc'
    })
}
export function exportThrCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatistics/excel',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'DRGCostParameterCostCalc:export',
        responseType: 'blob'
    })
}

export function pageFourCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsHospital/page',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'DRGCostParameterCostCalc:list'
    })
}
export function calcFourCalcData(params) {
    return request({
        url: `/drg/methodParameter/calculate/hospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostParameterCostCalc:calc'
    })
}
export function cancelFourCalcCalcData(params) {
    return request({
        url: `/drg/methodParameter/calculate/cancelHospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostParameterCostCalc:calc'
    })
}
export function exportFourCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'DRGCostParameterCostCalc:export',
        responseType: 'blob'
    })
}
