import request from '@/utils/request'


// 获取末级成本分类
export function lastLeafCostCategory(params) {
    return request({
        url: '/costCategory/getLastList',
        method: 'get',
        params
    })
}