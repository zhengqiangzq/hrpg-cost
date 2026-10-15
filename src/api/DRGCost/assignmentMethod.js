import request from '@/utils/request'

const PERMISSION_CODE = 'DRGAssignmentMethod'

export function pageAssignmentMethod(data, btnCode) {
    return request({
        url: '/drg/apportionMethod/page',
        method: 'post',
        data,
        btnCode
    })
}

export function deptAssignmentMethod(params) {
    return request({
        url: '/drg/apportionMethod/tree',
        method: 'get',
        params,
    })
}

export function oneAssignmentMethod(id) {
    return request({
        url: `/drg/apportionMethod/detail/${id}`,
        method: 'get',
    })
}

export function addAssignmentMethod(data) {
    return request({
        url: '/drg/apportionMethod/add',
        method: 'post',
        data,
        btnCode: `${PERMISSION_CODE}:add`
    })
}

export function updateAssignmentMethod(data) {
    return request({
        url: '/drg/apportionMethod/update',
        method: 'post',
        data,
        btnCode: `${PERMISSION_CODE}:update`
    })
}

export function deleteAssignmentMethod(data) {
    return request({
        url: '/drg/apportionMethod/byDelete',
        method: 'post',
        data,
        btnCode: `${PERMISSION_CODE}:delete`
    })
}

export function exportAssignmentMethod(data) {
    return request({
        url: '/drg/apportionMethod/exportExcel',
        method: 'post',
        data,
        responseType: 'blob'
    })
}