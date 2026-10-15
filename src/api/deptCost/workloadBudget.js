import request from '@/utils/request'

export function pageWorkloadBudget(params) {
    return request({
        url: '/deptCost/deptWorkloadForecast/page',
        method: 'get',
        params,
        btnCode: 'deptCost:workloadBudget:list'
    })
}

export function addWorkloadBudget(data) {
    return request({
        url: '/deptCost/deptWorkloadForecast',
        method: 'post',
        data,
        btnCode: 'deptCost:workloadBudget:add'
    })
}

export function updateWorkloadBudget(data) {
    return request({
        url: '/deptCost/deptWorkloadForecast/byPost',
        method: 'post',
        data,
        btnCode: 'deptCost:workloadBudget:update'
    })
}

export function deleteWorkloadBudget(data) {
    return request({
        url: '/deptCost/deptWorkloadForecast/byDelete',
        method: 'post',
        data,
        btnCode: 'deptCost:workloadBudget:delete'
    })
}

export function exportWorkloadBudget(params) {
    return request({
        url: '/deptCost/deptWorkloadForecast/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:workloadBudget:export'
    })
}
