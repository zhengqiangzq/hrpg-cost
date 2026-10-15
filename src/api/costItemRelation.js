import request from '@/utils/request'

// 查询成本项目关系
export function pageCostItemRelationpage(params) {
    return request({
        url: '/costItemAccountRelation/page',
        method: 'get',
        params,
        btnCode: 'costItemRelation:list'
    })
}

// 读取成本项目关系数据
export function readCostItemRelation(params) {
    return request({
        url: '/costItemAccountRelation/readData',
        method: 'get',
        params,
        btnCode: 'costItemRelation:read'
    })
}

// 删除成本项目关系
export function deleteCostItemRelation(data) {
    return request({
        url: '/costItemAccountRelation/byDelete',
        method: 'post',
        data,
        btnCode: 'costItemRelation:delete'
    })
}

// 保存成本项目关系
export function saveCostItemRelationadd(data) {
    return request({
        url: '/costItemAccountRelation/add',
        method: 'post',
        data,
        btnCode: 'costItemRelation:add'
    })
}

// 保存成本项目关系
export function costItemAccountRelationupdate(data) {
    return request({
        url: '/costItemAccountRelation/update',
        method: 'post',
        data,
        btnCode: 'costItemRelation:update'
    })
}

// 导出成本项目关系
export function exportCostItemRelation(params) {
    return request({
        url: '/costItemAccountRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'costItemRelation:export'
    })
}

// 保存成本项目关系
export function costItemAccountRelationaccassItemValue(params) {
    return request({
        url: '/finance/accountAssistFileServlet',
        method: 'get',
        params
    })
}









