import request from '@/utils/request'

export function pageAssessmentScheme(params) {
    return request({
        url: '/deptCost/deptAssessmentScheme/page',
        method: 'get',
        params,
        btnCode: 'deptCost:assessmentScheme:list'
    })
}

export function oneAssessmentScheme(id) {
    return request({
        url: `/deptCost/deptAssessmentScheme/${id}`,
        method: 'get',
        btnCode: 'deptCost:assessmentScheme:list'
    })
}

export function pageDetailListAssessmentScheme(params) {
    return request({
        url: '/deptCost/deptAssessmentScheme/selectDetailPage',
        method: 'get',
        params,
        btnCode: 'deptCost:assessmentScheme:list'
    })
}

export function allAssessmentSchemeDetail(params) {
    return request({
        url: '/deptCost/deptAssessmentSchemeDetails/all',
        method: 'get',
        params,
        btnCode: 'deptCost:assessmentScheme:list'
    })
}

export function addAssessmentScheme(data) {
    return request({
        url: '/deptCost/deptAssessmentScheme/add',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentScheme:add'
    })
}

export function updateAssessmentScheme(data) {
    return request({
        url: '/deptCost/deptAssessmentScheme/update',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentScheme:update'
    })
}

export function deleteAssessmentScheme(data) {
    return request({
        url: '/deptCost/deptAssessmentScheme/byDelete',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentScheme:delete'
    })
}

export function confirmAssessmentScheme(data) {
    return request({
        url: '/deptCost/deptAssessmentScheme/confirm',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentScheme:confirm'
    })
}

export function cancelAssessmentScheme(data) {
    return request({
        url: '/deptCost/deptAssessmentScheme/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentScheme:confirm'
    })
}

export function calcAssessmentScheme(id) {
    return request({
        url: `/deptCost/deptAssessmentScheme/execCalculate/${id}`,
        method: 'post',
    })
}

export function exportAssessmentScheme(params) {
    return request({
        url: '/deptCost/deptAssessmentScheme/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:assessmentScheme:export'
    })
}

export function exportDetailListAssessmentScheme(params) {
    return request({
        url: '/deptCost/deptAssessmentScheme/exportWithDetail',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:assessmentScheme:export'
    })
}

export function exportDetailAssessmentScheme(id) {
    return request({
        url: `/deptCost/deptAssessmentSchemeDetails/exportExcel/${id}`,
        method: 'get',
        responseType: 'blob',
        btnCode: 'deptCost:assessmentScheme:export'
    })
}
