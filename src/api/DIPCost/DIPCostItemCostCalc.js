import request from "@/utils/request";

export function checkData(id) {
    return request({
        url: `/dipCostItem/calculate/checkData/${id}`,
        method: 'get',
        btnCode: 'DIPCostItemDataCheck:check'
    })
}

export function pageCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsMedicine/page',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DIPCostItemCostCalc:list'
    })
}
export function calcCalcData(params) {
    return request({
        url: `/dipCostItem/calculate/drugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostItemCostCalc:calc'
    })
}
export function cancelCalcCalcData(params) {
    return request({
        url: `/dipCostItem/calculate/cancelDrugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostItemCostCalc:calc'
    })
}
export function exportCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsMedicine/excel',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DIPCostItemCostCalc:export',
        responseType: 'blob'
    })
}

export function pageSecCalcData(data) {
    return request({
        url: '/dip/statistics/diseaseStatistics/queryPatientCaseCost',
        method: 'post',
        data: {
            ...data,
            type: 2
        },
        btnCode: 'DIPCostItemCostCalc:list'
    })
}
export function calcSecCalcData(params) {
    return request({
        url: `/dipCostItem/calculate/patientCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostItemCostCalc:calc'
    })
}
export function cancelSecCalcCalcData(params) {
    return request({
        url: `/dipCostItem/calculate/cancelPatientCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostItemCostCalc:calc'
    })
}
export function exportSecCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatistics/excel',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DIPCostItemCostCalc:export',
        responseType: 'blob'
    })
}

export function pageThrCalcData(data) {
    return request({
        url: '/dip/statistics/diseaseStatistics/queryDeptDiseaseStatisPageList',
        method: 'post',
        data: {
            ...data,
            type: 2
        },
        btnCode: 'DIPCostItemCostCalc:list'
    })
}
export function calcThrCalcData(params) {
    return request({
        url: `/dipCostItem/calculate/deptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostItemCostCalc:calc'
    })
}
export function cancelThrCalcCalcData(params) {
    return request({
        url: `/dipCostItem/calculate/cancelDeptCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostItemCostCalc:calc'
    })
}
export function exportThrCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatistics/excel',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DIPCostItemCostCalc:export',
        responseType: 'blob'
    })
}


export function pageFourCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsHospital/page',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DIPCostItemCostCalc:list'
    })
}
export function calcFourCalcData(params) {
    return request({
        url: `/dipCostItem/calculate/hospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostItemCostCalc:calc'
    })
}
export function cancelFourCalcCalcData(params) {
    return request({
        url: `/dipCostItem/calculate/cancelHospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'DIPCostItemCostCalc:calc'
    })
}
export function exportFourCalcData(params) {
    return request({
        url: '/dip/statistics/diseaseStatisticsHospital/excel',
        method: 'get',
        params: {
            ...params,
            type: 2
        },
        btnCode: 'DIPCostItemCostCalc:export',
        responseType: 'blob'
    })
}
