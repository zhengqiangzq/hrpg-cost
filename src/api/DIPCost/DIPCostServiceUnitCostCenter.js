import request from '@/utils/request'

export function pageCostCenter(params) {
    return request({
        url: '/dip/methodService/dipDataCenter/page',
        method: 'get',
        params: {
            ...params,
            dataSource: 0
        }
    })
}

export function pageCostCenterDetail(params) {
    return request({
        url: '/dip/methodService/dataCostDetails/page',
        method: 'get',
        params
    })
}

export function pageCostCenterDetailPage(params) {
    return request({
        url: '/dip/methodService/dataCostDetails/detail/page',
        method: 'get',
        params
    })
}

export function oneCostCenter(id) {
    return request({
        url: `/dip/methodService/dipDataCenter/${id}`,
        method: 'get',
    })
}

export function enableCostCenter(data) {
    return request({
        url: '/dip/methodService/dipDataCenter/confirm',
        method: 'post',
        data
    })
}

export function disableCostCenter(data) {
    return request({
        url: '/dip/methodService/dipDataCenter/cancelConfirm',
        method: 'post',
        data
    })
}

export function deleteCostCenter(data) {
    return request({
        url: '/dip/methodService/dipDataCenter/byDelete',
        method: 'post',
        data
    })
}

export function collectCostCenter(params) {
    return request({
        url: `/dip/methodService/dipDataCenter/collectCost/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
    })
}

export function exportCostCenter(params) {
    return request({
        url: '/dip/methodService/dipDataCenter/export',
        method: 'get',
        params: {
            ...params,
            dataSource: 0
        },
        responseType: 'blob'
    })
}

export function exportCostCenterDetail(params) {
    return request({
        url: '/dip/methodService/dataCostDetails/detail/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

export function exportCostCenterDetailPage(params) {
    return request({
        url: '/dip/methodService/dataCostDetails/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}
