import request from '@/utils/request'

export function pageMarkupSetting(params) {
    return request({
        url: '/drg/chargeItemRate/page',
        method: 'get',
        params,
        btnCode: 'DRGCostMarkupSetting:list'
    })
}

export function addMarkupSetting(data) {
    return request({
        url: '/drg/chargeItemRate',
        method: 'post',
        data,
        btnCode: 'DRGCostMarkupSetting:add'
    })
}

export function updateMarkupSetting(data) {
    return request({
        url: '/drg/chargeItemRate/byPost',
        method: 'post',
        data,
        btnCode: 'DRGCostMarkupSetting:update'
    })
}

export function deleteMarkupSetting(data) {
    return request({
        url: '/drg/chargeItemRate/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostMarkupSetting:delete'
    })
}

export function exportMarkupSetting(params) {
    return request({
        url: '/drg/chargeItemRate/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DRGCostMarkupSetting:export'
    })
}
