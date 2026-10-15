import request from '@/utils/request'

export function pageIncomeCenter(params) {
    return request({
        url: '/drg/methodService/drgDataCenter/page',
        method: 'get',
        params: {
            ...params,
            dataSource: 1
        }
    })
}

export function pageIncomeCenterDetail(params) {
    return request({
        url: '/drg/methodService/dataIncomeDetails/page',
        method: 'get',
        params
    })
}

export function pageIncomeCenterDetailPage(params) {
    return request({
        url: '/drg/methodService/dataIncomeDetails/detail/page',
        method: 'get',
        params
    })
}

export function oneIncomeCenter(id) {
    return request({
        url: `/drg/methodService/drgDataCenter/${id}`,
        method: 'get',
    })
}

export function enableIncomeCenter(data) {
    return request({
        url: '/drg/methodService/drgDataCenter/confirm',
        method: 'post',
        data
    })
}

export function disableIncomeCenter(data) {
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

export function collectIncomeCenter(params) {
    return request({
        url: `/drg/methodService/drgDataCenter/collectIncome/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
    })
}

export function exportIncomeCenter(params) {
    return request({
        url: '/drg/methodService/drgDataCenter/export',
        method: 'get',
        params: {
            ...params,
            dataSource: 1
        },
        responseType: 'blob'
    })
}

export function exportIncomeCenterDetail(params) {
    return request({
        url: '/drg/methodService/dataIncomeDetails/detail/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

export function exportIncomeCenterDetailPage(params) {
    return request({
        url: '/drg/methodService/dataIncomeDetails/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}
