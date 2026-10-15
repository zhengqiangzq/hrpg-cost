import request from '@/utils/request'

export function pageMarkupSetting(params) {
    return request({
        url: '/disease/chargeItemRate/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostMarkupSetting:list'
    })
}

export function addMarkupSetting(data) {
    return request({
        url: '/disease/chargeItemRate',
        method: 'post',
        data,
        btnCode: 'diseaseCostMarkupSetting:add'
    })
}

export function updateMarkupSetting(data) {
    return request({
        url: '/disease/chargeItemRate/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostMarkupSetting:update'
    })
}

export function deleteMarkupSetting(data) {
    return request({
        url: '/disease/chargeItemRate/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostMarkupSetting:delete'
    })
}

export function exportMarkupSetting(params) {
    return request({
        url: '/disease/chargeItemRate/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostMarkupSetting:export'
    })
}
