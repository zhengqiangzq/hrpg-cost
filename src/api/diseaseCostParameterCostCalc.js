import request from "@/utils/request";

export function checkData(id) {
    return request({
        url: `/methodParameter/calculate/checkData/${id}`,
        method: 'get',
        btnCode: 'diseaseCostParameterDataCheck:check'
    })
}

export function pageCalcData(params) {
    return request({
        url: '/statistics/diseaseStatisticsMedicine/page',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'diseaseCostParameterCostCalc:list'
    })
}
export function calcCalcData(params) {
    return request({
        url: `/methodParameter/calculate/drugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostParameterCostCalc:calc'
    })
}
export function cancelCalcCalcData(params) {
    return request({
        url: `/methodParameter/calculate/cancelDrugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostParameterCostCalc:calc'
    })
}
export function exportCalcData(params) {
    return request({
        url: '/statistics/diseaseStatisticsMedicine/excel',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        responseType: 'blob',
        btnCode: 'diseaseCostParameterCostCalc:export'
    })
}

export function pageSecCalcData(data) {
    return request({
        url: '/statistics/diseaseStatistics/queryPatientCaseCost',
        method: 'post',
        data: {
            ...data,
            type: 1
        },
        btnCode: 'diseaseCostParameterCostCalc:list'
    })
}
export function calcSecCalcData(params) {
    return request({
        url: `/methodParameter/calculate/diseaseCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostParameterCostCalc:calc'
    })
}
export function cancelSecCalcCalcData(params) {
    return request({
        url: `/methodParameter/calculate/cancelDiseaseCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostParameterCostCalc:calc'
    })
}
export function exportSecCalcData(params) {
    return request({
        url: '/statistics/diseaseStatisticsShare/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostParameterCostCalc:export'
    })
}

export function pageThrCalcData(data) {
    return request({
        url: '/statistics/diseaseStatistics/queryDeptDiseaseStatisPageList',
        method: 'post',
        data: {
            ...data,
            type: 1
        },
        btnCode: 'diseaseCostParameterCostCalc:list'
    })
}
export function calcThrCalcData(params) {
    return request({
        url: `/methodParameter/calculate/diseaseDeptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostParameterCostCalc:calc'
    })
}
export function cancelThrCalcCalcData(params) {
    return request({
        url: `/methodParameter/calculate/cancelDiseaseDeptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostParameterCostCalc:calc'
    })
}
export function exportThrCalcData(params) {
    return request({
        url: '/statistics/diseaseStatistics/excel',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        responseType: 'blob',
        btnCode: 'diseaseCostParameterCostCalc:export'
    })
}

export function pageFourCalcData(params) {
    return request({
        url: '/statistics/diseaseStatisticsHospital/page',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        btnCode: 'diseaseCostParameterCostCalc:list'
    })
}
export function calcFourCalcData(params) {
    return request({
        url: `/methodParameter/calculate/hospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostParameterCostCalc:calc'
    })
}
export function cancelFourCalcCalcData(params) {
    return request({
        url: `/methodParameter/calculate/cancelHospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostParameterCostCalc:calc'
    })
}
export function exportFourCalcData(params) {
    return request({
        url: '/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 1
        },
        responseType: 'blob',
        btnCode: 'diseaseCostParameterCostCalc:export'
    })
}
