import request from '@/utils/request'

export function pageCostVolumeProfit(params) {
    return request({
        url: '/deptCost/deptForecastScheme/costVolumeProfit',
        method: 'get',
        params,
        btnCode:'deptCost:costVolumeProfit:list'
    })
}

export function exportCostVolumeProfit(params) {
    return request({
        url: '/deptCost/deptForecastScheme/exportExcel/costVolumeProfit',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:costVolumeProfit:export'
    })
}
