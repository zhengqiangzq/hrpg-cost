import request from '@/utils/request'

export function pageCostCenter(params) {
    return request({
        url: '/methodService/diseaseDataCenter/page',
        method: 'get',
        params: {
            ...params,
            dataSource: 0
        },
        btnCode: 'diseaseCostServiceUnitCostCenter:list'
    })
}

export function pageCostCenterDetail(params) {
    return request({
        url: '/methodService/diseaseDataCostDetails/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostServiceUnitCostCenter:list'
    })
}

export function pageCostCenterDetailPage(params) {
    return request({
        url: '/methodService/diseaseDataCostDetails/detail/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostServiceUnitCostCenter:list'
    })
}

export function oneCostCenter(id) {
    return request({
        url: `/methodService/diseaseDataCenter/${id}`,
        method: 'get',
        btnCode: 'diseaseCostServiceUnitCostCenter:list'
    })
}

export function enableCostCenter(data) {
    return request({
        url: '/methodService/diseaseDataCenter/confirm',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitCostCenter:enable'
    })
}

export function disableCostCenter(data) {
    return request({
        url: '/methodService/diseaseDataCenter/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitCostCenter:enable'
    })
}

export function deleteCostCenter(data) {
    return request({
        url: '/methodService/diseaseDataCenter/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitCostCenter:delete'
    })
}

export function collectCostCenter(params) {
    return request({
        url: `/methodService/diseaseDataCenter/collectCost/${params.orgId}/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'diseaseCostServiceUnitCostCenter:collect'
    })
}

export function exportCostCenter(params) {
    return request({
        url: '/methodService/diseaseDataCenter/export',
        method: 'get',
        params: {
            ...params,
            dataSource: 0
        },
        responseType: 'blob',
        btnCode: 'diseaseCostServiceUnitCostCenter:export'
    })
}

export function exportCostCenterDetail(params) {
    return request({
        url: '/methodService/diseaseDataCostDetails/detail/export',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostServiceUnitCostCenter:export'
    })
}

export function exportCostCenterDetailPage(params) {
    return request({
        url: '/methodService/diseaseDataCostDetails/export',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostServiceUnitCostCenter:export'
    })
}
