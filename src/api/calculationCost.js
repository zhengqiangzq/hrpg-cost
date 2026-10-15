import request from '@/utils/request'




//  --------------  数据校验   ------------------
export function itemCostDataCheckdataCheck(params) {
    return request({
        url: '/item/itemCostDataCheck/dataCheck',
        method: 'get',
        params,
        btnCode: 'validation:check'
    })
}


//    ---------------作业成本法  成本计算 ---------

// 直接成本分页
export function itemCostComputequeryDirectComputeList(data) {
    return request({
        url: '/item/itemCostCompute/queryDirectComputeList',
        method: 'post',
        data,
        btnCode: 'calculationCost:list'
    })
}

// 直接成本计算
export function itemCostComputedirectCostCompute(params) {
    return request({
        url: '/item/itemCostCompute/directCostCompute',
        method: 'get',
        params,
        btnCode: 'calculationCost:calc'
    })
}

// 直接成本取消计算
export function itemCostComputeunCalculateDirectCost(params) {
    return request({
        url: '/item/itemCostCompute/unCalculateDirectCost',
        method: 'get',
        params,
        btnCode: 'calculationCost:calc'
    })
}


// 导出直接成本
export function itemCostComputeexportDirectComputeList(data) {
    return request({
        url: '/item/itemCostCompute/exportDirectComputeList',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'calculationCost:export'
    })
}


// 资源成本分页
export function itemCostComputequeryResourceComputeList(data) {
    return request({
        url: '/item/itemCostCompute/queryResourceComputeList',
        method: 'post',
        data,
        btnCode: 'calculationCost:list'
    })
}

// 资源成本计算
export function itemCostComputeresourceCompute(params) {
    return request({
        url: '/item/itemCostCompute/resourceCompute',
        method: 'get',
        params,
        btnCode: 'calculationCost:calc'
    })
}

// 资源成本取消计算
export function itemCostComputeunResourceCompute(params) {
    return request({
        url: '/item/itemCostCompute/unResourceCompute',
        method: 'get',
        params,
        btnCode: 'calculationCost:calc'
    })
}


// 导出资源成本
export function itemCostComputeexportResourceComputeList(data) {
    return request({
        url: '/item/itemCostCompute/exportResourceComputeList',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'calculationCost:export'
    })
}


// 作业成本分页
export function itemCostComputequeryActivityComputeList(data) {
    return request({
        url: '/item/itemCostCompute/queryActivityComputeList',
        method: 'post',
        data,
        btnCode: 'calculationCost:list'
    })
}

// 作业成本计算
export function itemCostComputeactivityCompute(params) {
    return request({
        url: '/item/itemCostCompute/activityCompute',
        method: 'get',
        params,
        btnCode: 'calculationCost:calc'
    })
}

// 作业成本取消计算
export function itemCostComputeunActivityCompute(params) {
    return request({
        url: '/item/itemCostCompute/unActivityCompute',
        method: 'get',
        params,
        btnCode: 'calculationCost:calc'
    })
}

// 导出作业成本
export function itemCostComputeexportActivityComputeList(data) {
    return request({
        url: '/item/itemCostCompute/exportActivityComputeList',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'calculationCost:export'
    })
}

// 院级成本计算
export function itemCostComputehospitalCompute(params) {
    return request({
        url: '/item/itemCostCompute/hospitalCompute',
        method: 'get',
        params,
        btnCode: 'calculationCost:calc'
    })
}

// 院级成本取消计算
export function itemCostComputeunHospitalCompute(params) {
    return request({
        url: '/item/itemCostCompute/unHospitalCompute',
        method: 'get',
        params,
        btnCode: 'calculationCost:calc'
    })
}
