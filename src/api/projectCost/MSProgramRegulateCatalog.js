import request from '@/utils/request'

export function treeMSProgramRegulateCatalog(params) {
    return request({
        url: '/item/medicalServiceStandardsCatalog/tree',
        method: 'get',
        params,
        btnCode: 'catalog:list'
    })
}

export function medicalServiceStandardsCatalogdetail(id) {
    return request({
        url: '/item/medicalServiceStandardsCatalog/' + id,
        method: 'get',
        btnCode: 'catalog:list'
    })
}

export function addMSProgramRegulateCatalog(data) {
    return request({
        url: '/item/medicalServiceStandardsCatalog/add',
        method: 'post',
        data,
        btnCode: 'catalog:add'
    })
}

export function updateMSProgramRegulateCatalog(data) {
    return request({
        url: '/item/medicalServiceStandardsCatalog/update',
        method: 'post',
        data,
        btnCode: 'catalog:update'
    })
}

// 启用
export function medicalServiceStandardsCatalogEnable(id) {
    return request({
        url: '/item/medicalServiceStandardsCatalog/enable/' + id,
        method: 'post',
        btnCode: 'assetType:enable'
    })
}
// 停用
export function medicalServiceStandardsCatalogDisable(id) {
    return request({
        url: '/item/medicalServiceStandardsCatalog/disable/' + id,
        method: 'post',
        btnCode: 'assetType:disable'
    })
}

export function deleteMSProgramRegulateCatalog(id) {
    return request({
        url: '/item/medicalServiceStandardsCatalog/delete/' + id,
        method: 'post',
        btnCode: 'catalog:delete'
    })
}

export function exportMSProgramRegulateCatalog(params) {
    return request({
        url: '/item/medicalServiceStandardsCatalog/exportExcel',
        method: 'get',
        params,
        btnCode: 'catalog:export',
        responseType: 'blob'
    })
}

export function medicalServiceStandardsCatalogallocationData(data) {
    return request({
        url: '/item/medicalServiceStandardsCatalog/allocationData',
        method: 'post',
        data,
        btnCode: 'catalog:allocation'
    })
}

export function medicalServiceStandardsCatalogcalallocationData(data) {
    return request({
        url: '/item/medicalServiceStandardsCatalog/cancelAllocationData',
        method: 'post',
        data,
        btnCode: 'catalog:callallocation'
    })
}
