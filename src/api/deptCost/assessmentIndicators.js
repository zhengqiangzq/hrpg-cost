import request from '@/utils/request'

export function pageAssessmentIndicators(params) {
    return request({
        url: '/deptCost/deptAssessmentIndicators/page',
        method: 'get',
        params,
        btnCode: 'deptCost:assessmentIndicators:list'
    })
}

export function oneAssessmentIndicators(id) {
    return request({
        url: `/deptCost/deptAssessmentIndicators/${id}`,
        method: 'get',
        btnCode: 'deptCost:assessmentIndicators:list'
    })
}

export function addAssessmentIndicators(data) {
    return request({
        url: '/deptCost/deptAssessmentIndicators',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentIndicators:add'
    })
}

export function updateAssessmentIndicators(data) {
    return request({
        url: '/deptCost/deptAssessmentIndicators/byPost',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentIndicators:update'
    })
}

export function enableAssessmentIndicators(data) {
    return request({
        url: '/deptCost/deptAssessmentIndicators/enable',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentIndicators:enable'
    })
}

export function disableAssessmentIndicators(data) {
    return request({
        url: '/deptCost/deptAssessmentIndicators/disable',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentIndicators:enable'
    })
}

export function deleteAssessmentIndicators(data) {
    return request({
        url: '/deptCost/deptAssessmentIndicators/byDelete',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentIndicators:delete'
    })
}

export function verifyAssessmentIndicators(data) {
    return request({
        url: '/deptCost/deptAssessmentIndicators/sqlVerification',
        method: 'post',
        data
    })
}

export function exportAssessmentIndicators(params) {
    return request({
        url: '/deptCost/deptAssessmentIndicators/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:assessmentIndicators:export'
    })
}
