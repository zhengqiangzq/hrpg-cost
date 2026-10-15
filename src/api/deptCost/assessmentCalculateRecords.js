import request from '@/utils/request'

export function pageAssessmentCalculateRecords(params) {
    return request({
        url: '/deptCost/deptAssessmentCalculateRecords/selectPage',
        method: 'get',
        params,
        btnCode: 'deptCost:assessmentCalculateRecords:list'
    })
}

export function pageDetailAssessmentCalculateRecords(params) {
    return request({
        url: '/deptCost/deptAssessmentCalculateRecords/deptScoreDetail',
        method: 'get',
        params,
        btnCode: 'deptCost:assessmentCalculateRecords:list'
    })
}

export function exportAssessmentCalculateRecords(params) {
    return request({
        url: '/deptCost/deptAssessmentCalculateRecords/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:assessmentCalculateRecords:export'
    })
}
