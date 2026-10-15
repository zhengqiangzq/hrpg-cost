import request from '@/utils/request'

export function pageIncomeCenter(params) {
    return request({
        url: '/dip/methodService/dipDataCenter/page',
        method: 'get',
        params: {
            ...params,
            dataSource: 1
        }
    })
}

export function pageIncomeCenterDetail(params) {
    return request({
        url: '/dip/methodService/dataIncomeDetails/page',
        method: 'get',
        params
    })
}

export function pageIncomeCenterDetailPage(params) {
    return request({
        url: '/dip/methodService/dataIncomeDetails/detail/page',
        method: 'get',
        params
    })
}

export function oneIncomeCenter(id) {
    return request({
        url: `/dip/methodService/dipDataCenter/${id}`,
        method: 'get',
    })
}

export function enableIncomeCenter(data) {
    return request({
        url: '/dip/methodService/dipDataCenter/confirm',
        method: 'post',
        data
    })
}

export function disableIncomeCenter(data) {
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

export function collectIncomeCenter(params) {
    return request({
        url: `/dip/methodService/dipDataCenter/collectIncome/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
    })
}

export function exportIncomeCenter(params) {
    return request({
        url: '/dip/methodService/dipDataCenter/export',
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
        url: '/dip/methodService/dataIncomeDetails/detail/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

export function exportIncomeCenterDetailPage(params) {
    return request({
        url: '/dip/methodService/dataIncomeDetails/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}
