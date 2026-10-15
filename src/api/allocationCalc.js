import request from '@/utils/request'

// 查询分摊计算列表
export function pageAllocationCalc(data) {
    return request({
        url: '/allocateCalculation/queryList',
        method: 'post',
        data,
        btnCode: 'allocationCalc:list'
    })
}

// 检查分摊计算
export function checkAllocationCalc(params) {
    return request({
        url: '/allocateCalculation/caculationValidate',
        method: 'get',
        params,
        btnCode: 'allocationCalc:check'
    })
}

// 计算分摊计算
export function calcAllocationCalc(params) {
    return request({
        url: '/allocateCalculation/calculation',
        method: 'get',
        params,
        btnCode: 'allocationCalc:calc'
    })
}

// 取消计算分摊计算
export function cancelCalcAllocationCalc(params) {
    return request({
        url: '/allocateCalculation/unCalculation',
        method: 'get',
        params,
        btnCode: 'allocationCalc:calc'
    })
}

// 导出分摊计算
export function exportCalcAllocationCalc(params) {
    return request({
        url: '/allocateCalculation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'allocationCalc:export'
    })
}
