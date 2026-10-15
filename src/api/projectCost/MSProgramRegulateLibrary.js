import request from '@/utils/request'

export function pageMsProgramRegulateLibrary(params) {
    return request({
        url: '/item/medicalServiceStandardsLib/page',
        method: 'get',
        params,
        btnCode: 'library:list'
    })
}

export function medicalServiceStandardsLibDetail(id) {
    return request({
        url: '/item/medicalServiceStandardsLib/' + id,
        method: 'get',
        btnCode: 'library:list'
    })
}

export function addMsProgramRegulateLibrary(data) {
    return request({
        url: '/item/medicalServiceStandardsLib/add',
        method: 'post',
        data,
        btnCode: 'library:add'
    })
}

export function updateMsProgramRegulateLibrary(data) {
    return request({
        url: '/item/medicalServiceStandardsLib/update',
        method: 'post',
        data,
        btnCode: 'library:update'
    })
}

export function deleteMsProgramRegulateLibrary(data) {
    return request({
        url: '/item/medicalServiceStandardsLib/delete',
        method: 'post',
        data,
        btnCode: 'library:delete'
    })
}

export function medicalServiceStandardsLiballocationData(data) {
    return request({
        url: '/item/medicalServiceStandardsLib/allocationData',
        method: 'post',
        data,
        btnCode: 'library:allocation'
    })
}

export function medicalServiceStandardsLibcancelAllocationData(data) {
    return request({
        url: '/item/medicalServiceStandardsLib/cancelAllocationData',
        method: 'post',
        data,
        btnCode: 'library:callallocation'
    })
}


export function exportMsProgramRegulateLibrary(params) {
    return request({
        url: '/item/medicalServiceStandardsLib/excel',
        method: 'get',
        params,
        btnCode: 'library:export',
        responseType: 'blob'
    })
}
