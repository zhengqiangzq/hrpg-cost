import request from '@/utils/request'

export function topGraphics(data) {
    return request({
        url: '/bedClinic/analysis/bed/basic',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/bedClinic/analysis/bed/costList',
        method: 'post',
        data
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/analysis/bed/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}