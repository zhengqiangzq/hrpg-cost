
//  ---------------------  核算科室关系  ---------------------------
// tree
import request from "@/utils/request";

// 分页
export function itemsectionRelationPage(data) {
    return request({
        url: '/item/sectionRelation/page',
        method: 'post',
        data,
        btnCode: 'accountingDeptRelationship:list'
    })
}
// 删除
export function itemsectionRelationDelete(data) {
    return request({
        url: '/item/sectionRelation/delete',
        method: 'post',
        data,
        btnCode: 'accountingDeptRelationship:delete'
    })
}
// 新增
export function itemsectionRelationAdd(data) {
    return request({
        url: '/item/sectionRelation/add',
        method: 'post',
        data,
        btnCode: 'accountingDeptRelationship:add'
    })
}
// 编辑
export function itemsectionRelationUpdate(data) {
    return request({
        url: '/item/sectionRelation/update',
        method: 'post',
        data,
        btnCode: 'accountingDeptRelationship:update'
    })
}

// 导出
export function itemsectionRelationexportExcel(data) {
    return request({
        url: '/item/sectionRelation/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'accountingDeptRelationship:export'
    })
}
