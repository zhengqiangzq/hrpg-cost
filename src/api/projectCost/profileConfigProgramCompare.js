import request from '@/utils/request'

export function pageProfileConfigProgramCompare(data) {
    return request({
        url: '/item/feeItemStandardsLibMapping/page',
        method: 'post',
        data,
        btnCode: 'profileConfigProgramCompare:list'
    })
}

export function compareProfileConfigProgramCompare(data) {
    return request({
        url: '/item/feeItemStandardsLibMapping/mapping',
        method: 'post',
        data,
        btnCode: 'profileConfigProgramCompare:compare'
    })
}

export function cancelCompareProfileConfigProgramCompare(data) {
    return request({
        url: '/item/feeItemStandardsLibMapping/cancelMapping',
        method: 'post',
        data,
        btnCode: 'profileConfigProgramCompare:compare'
    })
}

export function exportProfileConfigProgramCompare(data) {
    return request({
        url: '/item/feeItemStandardsLibMapping/excel',
        method: 'post',
        data,
        btnCode: 'profileConfigProgramCompare:export',
        responseType: 'blob'
    })
}
