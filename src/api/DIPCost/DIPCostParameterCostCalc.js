import request from "@/utils/request";

export function checkData(id) {
    return request({
        url: `/dip/methodParameter/calculate/checkData/${id}`,
        method: 'get',
        btnCode: 'DIPCostParameterDataCheck:check'
    })
}

export function pageCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsMedicine/page',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'DIPCostParameterCostCalc:list'
    })
}
export function calcCalcData(params) {
    return request({
        url: `/dip/methodParameter/calculate/drugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostParameterCostCalc:calc'
    })
}
export function cancelCalcCalcData(params) {
    return request({
        url: `/dip/methodParameter/calculate/cancelDrugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostParameterCostCalc:calc'
    })
}
export function exportCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsMedicine/excel',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'DIPCostParameterCostCalc:export',
        responseType: 'blob'
    })
}

export function pageSecCalcData(data) {
    return request({
        url: '/dip/statistics/diseaseStatistics/queryPatientCaseCost',
        method: 'post',
        data: {
            ...data,
            type: 1
        },
        btnCode: 'DIPCostParameterCostCalc:list'
    })
}
export function calcSecCalcData(params) {
    return request({
        url: `/dip/methodParameter/calculate/diseaseCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostParameterCostCalc:calc'
    })
}
export function cancelSecCalcCalcData(params) {
    return request({
        url: `/dip/methodParameter/calculate/cancelDiseaseCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostParameterCostCalc:calc'
    })
}
export function exportSecCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatistics/excel',
        method: 'get',
        params,
        btnCode: 'DIPCostParameterCostCalc:export',
        responseType: 'blob'
    })
}

export function pageThrCalcData(data) {
    return request({
        url: '/dip/statistics/diseaseStatistics/queryDeptDiseaseStatisPageList',
        method: 'post',
        data: {
            ...data,
            type: 1
        },
        btnCode: 'DIPCostParameterCostCalc:list'
    })
}
export function calcThrCalcData(params) {
    return request({
        url: `/dip/methodParameter/calculate/dipDeptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostParameterCostCalc:calc'
    })
}
export function cancelThrCalcCalcData(params) {
    return request({
        url: `/dip/methodParameter/calculate/cancelDipDeptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostParameterCostCalc:calc'
    })
}
export function exportThrCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatistics/excel',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'DIPCostParameterCostCalc:export',
        responseType: 'blob'
    })
}

export function pageFourCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsHospital/page',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'DIPCostParameterCostCalc:list'
    })
}
export function calcFourCalcData(params) {
    return request({
        url: `/dip/methodParameter/calculate/hospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostParameterCostCalc:calc'
    })
}
export function cancelFourCalcCalcData(params) {
    return request({
        url: `/dip/methodParameter/calculate/cancelHospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostParameterCostCalc:calc'
    })
}
export function exportFourCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'DIPCostParameterCostCalc:export',
        responseType: 'blob'
    })
}
