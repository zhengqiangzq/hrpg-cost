import request from "@/utils/request";

export function checkData(id) {
    return request({
        url: `/costItem/calculate/checkData/${id}`,
        method: 'get',
        btnCode: 'SCPCostCalc:check'
    })
}

export function pageCalcData(params) {
    return request({
        url: '/disease/wayStatisticsMedicine/page',
        method: 'get',
        params,
        btnCode: 'SCPCostCalc:list'
    })
}
export function calcCalcData(params) {
    return request({
        url: `/disease/wayRecordMedicine/drugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'SCPCostCalc:calc'
    })
}
export function cancelCalcCalcData(params) {
    return request({
        url: `/disease/wayRecordMedicine/cancelDrugAndProCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'SCPCostCalc:calc'
    })
}
export function exportCalcData(params) {
    return request({
        url: '/disease/wayStatisticsMedicine/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'SCPCostCalc:export'
    })
}

export function pageSecCalcData(params) {
    return request({
        url: '/disease/wayStatistics/page',
        method: 'get',
        params,
        btnCode: 'SCPCostCalc:calc'
    })
}
export function calcSecCalcData(params) {
    return request({
        url: `/disease/wayRecordMedicine/patientCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'SCPCostCalc:calc'
    })
}
export function cancelSecCalcCalcData(params) {
    return request({
        url: `/disease/wayRecordMedicine/cancelPatientCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'SCPCostCalc:calc'
    })
}
export function exportSecCalcData(params) {
    return request({
        url: '/disease/wayStatistics/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'SCPCostCalc:export'
    })
}

export function pageThrCalcData(params) {
    return request({
        url: '/disease/wayStatisticsHospital/page',
        method: 'get',
        params,
        btnCode: 'SCPCostCalc:list'
    })
}
export function calcThrCalcData(params) {
    return request({
        url: `/disease/wayRecordMedicine/hospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'SCPCostCalc:calc'
    })
}
export function cancelThrCalcCalcData(params) {
    return request({
        url: `/disease/wayRecordMedicine/cancelHospitalCount/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'SCPCostCalc:calc'
    })
}
export function exportThrCalcData(params) {
    return request({
        url: '/disease/wayStatisticsHospital/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'SCPCostCalc:export'
    })
}
