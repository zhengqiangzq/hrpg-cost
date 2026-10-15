

//  ---------------------  材料核算类关系  ---------------------------
import request from "@/utils/request";

// 列表
export function itemMaterialCategoryRelationPage(params) {
    return request({
        url: '/itembak/deptWorkRelation',
        method: 'get',
        params,
        btnCode: 'deptWorkRelationship:list'
    })
}

// 新增
export function itemMaterialCategoryRelationAdd(data) {
    return request({
        url: '/itembak/deptWorkRelation/add',
        method: 'post',
        data,
        btnCode: 'deptWorkRelationship:add'
    })
}

// 修改
export function itemMaterialCategoryRelationUpdate(data) {
    return request({
        url: '/itembak/deptWorkRelation/update',
        method: 'post',
        data,
        btnCode: 'deptWorkRelationship:update'
    })
}

// 删除
export function itemMaterialCategoryRelationDelete(data) {
    return request({
        url: 'itembak/deptWorkRelation/del',
        method: 'post',
        data,
        btnCode: 'deptWorkRelationship:delete'
    })
}
// 导出
export function itemMaterialCategoryexportRelationExcel(params) {
    return request({
        url: '/itembak/deptWorkRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptWorkRelationship:export'
    })
}
