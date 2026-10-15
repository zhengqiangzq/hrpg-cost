import request from '@/utils/request'

export function pageIncomeCenter(params) {
    return request({
        url: '/methodService/diseaseDataCenter/page',
        method: 'get',
        params: {
            ...params,
            dataSource: 1
        },
        btnCode: 'diseaseCostServiceUnitIncomeCenter:list'
    })
}

export function pageIncomeCenterDetail(params) {
    return request({
        url: '/methodService/diseaseDataIncomeDetails/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostServiceUnitIncomeCenter:list'
    })
}

export function pageIncomeCenterDetailPage(params) {
    return request({
        url: '/methodService/diseaseDataIncomeDetails/detail/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostServiceUnitIncomeCenter:list'
    })
}

export function oneIncomeCenter(id) {
    return request({
        url: `/methodService/diseaseDataCenter/${id}`,
        method: 'get',
        btnCode: 'diseaseCostServiceUnitIncomeCenter:list'
    })
}

export function enableIncomeCenter(data) {
    return request({
        url: '/methodService/diseaseDataCenter/confirm',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitIncomeCenter:enable'
    })
}

export function disableIncomeCenter(data) {
    return request({
        url: '/methodService/diseaseDataCenter/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitIncomeCenter:enable'
    })
}

export function deleteCostCenter(data) {
    return request({
        url: '/methodService/diseaseDataCenter/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitIncomeCenter:delete'
    })
}

export function collectIncomeCenter(params) {
    return request({
        url: `/methodService/diseaseDataCenter/collectIncome/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostServiceUnitIncomeCenter:collect'
    })
}

export function exportIncomeCenter(params) {
    return request({
        url: '/methodService/diseaseDataCenter/export',
        method: 'get',
        params: {
            ...params,
            dataSource: 1
        },
        responseType: 'blob',
        btnCode: 'diseaseCostServiceUnitIncomeCenter:export'
    })
}

export function exportIncomeCenterDetail(params) {
    return request({
        url: '/methodService/diseaseDataIncomeDetails/detail/export',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostServiceUnitIncomeCenter:export'
    })
}

export function exportIncomeCenterDetailPage(params) {
    return request({
        url: '/methodService/diseaseDataIncomeDetails/export',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostServiceUnitIncomeCenter:export'
    })
}
