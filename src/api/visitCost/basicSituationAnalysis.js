import request from '@/utils/request'

export function topGraphics(data) {
    return request({
        url: '/bedClinic/analysis/clinic/basic',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/bedClinic/analysis/clinic/costList',
        method: 'post',
        data
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/analysis/clinic/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}