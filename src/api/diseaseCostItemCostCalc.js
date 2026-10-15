import request from "@/utils/request";

export function checkData(id) {
    return request({
        url: `/costItem/calculate/checkData/${id}`,
        method: 'get',
        btnCode: 'diseaseCostItemDataCheck:check'
    })
}

export function pageCalcData(params) {
    return request({
        url: '/statistics/diseaseStatisticsMedicine/page',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'diseaseCostItemCostCalc:list'
    })
}
export function calcCalcData(params) {
    return request({
        url: `/costItem/calculate/drugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostItemCostCalc:calc'
    })
}
export function cancelCalcCalcData(params) {
    return request({
        url: `/costItem/calculate/cancelDrugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostItemCostCalc:calc'
    })
}
export function exportCalcData(params) {
    return request({
        url: '/statistics/diseaseStatisticsMedicine/excel',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        responseType: 'blob',
        btnCode: 'diseaseCostItemCostCalc:export'
    })
}

export function pageSecCalcData(data) {
    return request({
        url: '/statistics/diseaseStatistics/queryPatientCaseCost',
        method: 'post',
        data: {
            ...data,
            type: 2
        },
        btnCode: 'diseaseCostItemCostCalc:calc'
    })
}
export function calcSecCalcData(params) {
    return request({
        url: `/costItem/calculate/patientCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostItemCostCalc:calc'
    })
}
export function cancelSecCalcCalcData(params) {
    return request({
        url: `/costItem/calculate/cancelPatientCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostItemCostCalc:calc'
    })
}
export function exportSecCalcData(data) {
    return request({
        url: '/statistics/diseaseStatistics/queryPatientCaseCostExcel',
        method: 'get',
        data: {
            ...data,
            type: 2
        },
        responseType: 'blob',
        btnCode: 'diseaseCostItemCostCalc:export'
    })
}

export function pageThrCalcData(data) {
    return request({
        url: '/statistics/diseaseStatistics/queryDeptDiseaseStatisPageList',
        method: 'post',
        data: {
            ...data,
            type: 2
        },
        btnCode: 'diseaseCostItemCostCalc:list'
    })
}
export function calcThrCalcData(params) {
    return request({
        url: `/costItem/calculate/deptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostItemCostCalc:calc'
    })
}
export function cancelThrCalcCalcData(params) {
    return request({
        url: `/costItem/calculate/cancelDeptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostItemCostCalc:calc'
    })
}
export function exportThrCalcData(params) {
    return request({
        url: '/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        responseType: 'blob',
        btnCode: 'diseaseCostItemCostCalc:export'
    })
}


export function pageFourCalcData(params) {
    return request({
        url: '/statistics/diseaseStatisticsHospital/page',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'diseaseCostItemCostCalc:list'
    })
}
export function calcFourCalcData(params) {
    return request({
        url: `/costItem/calculate/hospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostItemCostCalc:calc'
    })
}
export function cancelFourCalcCalcData(params) {
    return request({
        url: `/costItem/calculate/cancelHospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostItemCostCalc:calc'
    })
}
export function exportFourCalcData(params) {
    return request({
        url: '/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        responseType: 'blob',
        btnCode: 'diseaseCostItemCostCalc:export'
    })
}
