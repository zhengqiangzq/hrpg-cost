import request from '@/utils/request'

export function pageCostCenter(params) {
    return request({
        url: '/drg/methodService/drgDataCenter/page',
        method: 'get',
        params: {
            ...params,
            dataSource: 0
        }
    })
}

export function pageCostCenterDetail(params) {
    return request({
        url: '/drg/methodService/dataCostDetails/page',
        method: 'get',
        params
    })
}

export function pageCostCenterDetailPage(params) {
    return request({
        url: '/drg/methodService/dataCostDetails/detail/page',
        method: 'get',
        params
    })
}

export function oneCostCenter(id) {
    return request({
        url: `/drg/methodService/drgDataCenter/${id}`,
        method: 'get',
    })
}

export function enableCostCenter(data) {
    return request({
        url: '/drg/methodService/drgDataCenter/confirm',
        method: 'post',
        data
    })
}

export function disableCostCenter(data) {
    return request({
        url: '/drg/methodService/drgDataCenter/cancelConfirm',
        method: 'post',
        data
    })
}

export function deleteCostCenter(data) {
    return request({
        url: '/drg/methodService/drgDataCenter/byDelete',
        method: 'post',
        data
    })
}

export function collectCostCenter(params) {
    return request({
        url: `/drg/methodService/drgDataCenter/collectCost/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
    })
}

export function exportCostCenter(params) {
    return request({
        url: '/drg/methodService/drgDataCenter/export',
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
        url: '/drg/methodService/dataCostDetails/detail/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

export function exportCostCenterDetailPage(params) {
    return request({
        url: '/drg/methodService/dataCostDetails/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}
