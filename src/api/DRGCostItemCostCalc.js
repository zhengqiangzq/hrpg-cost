import request from "@/utils/request";

export function checkData(id) {
    return request({
        url: `/drgCostItem/calculate/checkData/${id}`,
        method: 'get',
        btnCode: 'DRGCostItemDataCheck:check'
    })
}

export function pageCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsMedicine/page',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DRGCostItemCostCalc:list'
    })
}
export function calcCalcData(params) {
    return request({
        url: `/drgCostItem/calculate/drugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostItemCostCalc:calc'
    })
}
export function cancelCalcCalcData(params) {
    return request({
        url: `/drgCostItem/calculate/cancelDrugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostItemCostCalc:calc'
    })
}
export function exportCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsMedicine/excel',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DRGCostItemCostCalc:export',
        responseType: 'blob'
    })
}

export function pageSecCalcData(data) {
    return request({
        url: '/drg/statistics/diseaseStatistics/queryPatientCaseCost',
        method: 'post',
        data: {
            ...data,
            type: 2
        },
        btnCode: 'DRGCostItemCostCalc:list'
    })
}
export function calcSecCalcData(params) {
    return request({
        url: `/drgCostItem/calculate/patientCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostItemCostCalc:calc'
    })
}
export function cancelSecCalcCalcData(params) {
    return request({
        url: `/drgCostItem/calculate/cancelPatientCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostItemCostCalc:calc'
    })
}
export function exportSecCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatistics/excel',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DRGCostItemCostCalc:export',
        responseType: 'blob'
    })
}

export function pageThrCalcData(data) {
    return request({
        url: '/drg/statistics/diseaseStatistics/queryDeptDiseaseStatisPageList',
        method: 'post',
        data: {
            ...data,
            type: 2
        },
        btnCode: 'DRGCostItemCostCalc:list'
    })
}
export function calcThrCalcData(params) {
    return request({
        url: `/drgCostItem/calculate/deptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostItemCostCalc:calc'
    })
}
export function cancelThrCalcCalcData(params) {
    return request({
        url: `/drgCostItem/calculate/cancelDeptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostItemCostCalc:calc'
    })
}
export function exportThrCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DRGCostItemCostCalc:export',
        responseType: 'blob'
    })
}

export function pageFourCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsHospital/page',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DRGCostItemCostCalc:list'
    })
}
export function calcFourCalcData(params) {
    return request({
        url: `/drgCostItem/calculate/hospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostItemCostCalc:calc'
    })
}
export function cancelFourCalcCalcData(params) {
    return request({
        url: `/drgCostItem/calculate/cancelHospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DRGCostItemCostCalc:calc'
    })
}
export function exportFourCalcData(params) {
    return request({
        url: '/drg/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DRGCostItemCostCalc:export',
        responseType: 'blob'
    })
}
