import request from '@/utils/request'

const PERMISSION_CODE = 'assignmentMethod'

export function pageAssignmentMethod(data, btnCode) {
    return request({
        url: '/methodParameter/diseaseApportionMethod/page',
        method: 'post',
        data,
        btnCode
    })
}

export function deptAssignmentMethod(params) {
    return request({
        url: '/methodParameter/diseaseApportionMethod/tree',
        method: 'get',
        params,
    })
}

export function oneAssignmentMethod(id) {
    return request({
        url: `/methodParameter/diseaseApportionMethod/detail/${id}`,
        method: 'get',
    })
}

export function addAssignmentMethod(data) {
    return request({
        url: '/methodParameter/diseaseApportionMethod/add',
        method: 'post',
        data,
        btnCode: `${PERMISSION_CODE}:add`
    })
}

export function updateAssignmentMethod(data) {
    return request({
        url: '/methodParameter/diseaseApportionMethod/update',
        method: 'post',
        data,
        btnCode: `${PERMISSION_CODE}:update`
    })
}

export function deleteAssignmentMethod(data) {
    return request({
        url: '/methodParameter/diseaseApportionMethod/byDelete',
        method: 'post',
        data,
        btnCode: `${PERMISSION_CODE}:delete`
    })
}

export function exportAssignmentMethod(data) {
    return request({
        url: '/methodParameter/diseaseApportionMethod/exportExcel',
        method: 'post',
        data,
        responseType: 'blob'
    })
}