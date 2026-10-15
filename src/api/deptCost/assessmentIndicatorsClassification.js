import request from '@/utils/request'

export function treeAssessmentIndicatorsClassification(params) {
    return request({
        url: '/deptCost/deptAssessmentIndicatorsClassification/tree',
        method: 'get',
        params,
        btnCode: 'deptCost:assessmentIndicatorsClassification:list'
    })
}

export function addAssessmentIndicatorsClassification(data) {
    return request({
        url: '/deptCost/deptAssessmentIndicatorsClassification',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentIndicatorsClassification:add'
    })
}

export function updateAssessmentIndicatorsClassification(data) {
    return request({
        url: '/deptCost/deptAssessmentIndicatorsClassification/byPost',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentIndicatorsClassification:update'
    })
}

export function deleteAssessmentIndicatorsClassification(data) {
    return request({
        url: '/deptCost/deptAssessmentIndicatorsClassification/byDelete',
        method: 'post',
        data,
        btnCode: 'deptCost:assessmentIndicatorsClassification:delete'
    })
}

export function exportAssessmentIndicatorsClassification(params) {
    return request({
        url: '/deptCost/deptAssessmentIndicatorsClassification/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:assessmentIndicatorsClassification:export'
    })
}
