import request from '@/utils/request'

export function pageStandardClinicalPathway(params) {
    return request({
        url: '/base/diseaseClinicalPathways/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostStandardClinicalPathway:list'
    })
}

export function oneStandardClinicalPathway(id) {
    return request({
        url: `/base/diseaseClinicalPathways/${id}`,
        method: 'get',
        btnCode: 'diseaseCostStandardClinicalPathway:list'
    })
}
export function oneDetailsStandardClinicalPathway(params) {
    return request({
        url: '/base/diseaseClinicalPathwaysDetails/all',
        method: 'get',
        params,
        btnCode: 'diseaseCostStandardClinicalPathway:list'
    })
}

export function addStandardClinicalPathway(data) {
    return request({
        url: '/base/diseaseClinicalPathways/add',
        method: 'post',
        data,
        btnCode: 'diseaseCostStandardClinicalPathway:add'
    })
}

export function updateStandardClinicalPathway(data) {
    return request({
        url: '/base/diseaseClinicalPathways/update',
        method: 'post',
        data,
        btnCode: 'diseaseCostStandardClinicalPathway:update'
    })
}

export function deleteStandardClinicalPathway(data) {
    return request({
        url: '/base/diseaseClinicalPathways/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostStandardClinicalPathway:delete'
    })
}

export function exportStandardClinicalPathway(params) {
    return request({
        url: '/base/diseaseClinicalPathways/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostStandardClinicalPathway:export'
    })
}