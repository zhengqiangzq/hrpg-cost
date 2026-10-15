import request from '@/utils/request'

export function pageMarkupSetting(params) {
    return request({
        url: '/dip/chargeItemRate/page',
        method: 'get',
        params,
        btnCode: 'DIPCostMarkupSetting:list'
    })
}

export function addMarkupSetting(data) {
    return request({
        url: '/dip/chargeItemRate',
        method: 'post',
        data,
        btnCode: 'DIPCostMarkupSetting:add'
    })
}

export function updateMarkupSetting(data) {
    return request({
        url: '/dip/chargeItemRate/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostMarkupSetting:update'
    })
}

export function deleteMarkupSetting(data) {
    return request({
        url: '/dip/chargeItemRate/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostMarkupSetting:delete'
    })
}

export function exportMarkupSetting(params) {
    return request({
        url: '/dip/chargeItemRate/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DIPCostMarkupSetting:export'
    })
}
