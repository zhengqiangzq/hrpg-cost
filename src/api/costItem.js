import request from '@/utils/request'

export function pageCostItem(params) {
    return request({
        url: '/costItem',
        method: 'get',
        params
    })
}

// 查询末级成本项目
export function lastLeafCostItem(params) {
    return request({
        url: '/costItem/getLastList',
        method: 'get',
        params
    })
}