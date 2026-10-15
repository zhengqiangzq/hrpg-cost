

//  ---------------------  材料核算类  ---------------------------
// tree
import request from "@/utils/request";

export function itemMaterialCategorytlist(params) {
    return request({
        url: '/item/materialCategory/list',
        method: 'get',
        params,
    })
}

// 启用
export function itemMaterialCategoryEnable(id) {
    return request({
        url: '/item/materialCategory/enable/' + id,
        method: 'post',
        btnCode: 'materialType:enable'
    })
}
// 停用
export function itemMaterialCategoryDisable(id) {
    return request({
        url: '/item/materialCategory/disable/' + id,
        method: 'post',
        btnCode: 'materialType:disable'
    })
}
// 删除
export function itemMaterialCategoryDelete(id) {
    return request({
        url: '/item/materialCategory/delete/' + id,
        method: 'post',
        btnCode: 'materialType:delete'
    })
}
// 新增
export function itemMaterialCategoryAdd(data) {
    return request({
        url: '/item/materialCategory/add',
        method: 'post',
        data,
        btnCode: 'materialType:add'
    })
}
// 详情
export function itemMaterialCategoryDetail(id) {
    return request({
        url: '/item/materialCategory/' + id,
        method: 'get',
        btnCode: 'materialType:list'
    })
}
// 编辑
export function itemMaterialCategoryUpdate(data) {
    return request({
        url: '/item/materialCategory/update',
        method: 'post',
        data,
        btnCode: 'materialType:update'
    })
}
// 分配
export function itemMaterialCategoryAllocationData(data) {
    return request({
        url: '/item/materialCategory/allocationData',
        method: 'post',
        data,
        btnCode: 'materialType:update'
    })
}
// 取消分配
export function itemMaterialCategoryCancelAllocationData(data) {
    return request({
        url: '/item/materialCategory/cancelAllocationData',
        method: 'post',
        data,
        btnCode: 'materialType:update'
    })
}

// 导出
export function itemMaterialCategoryexportExcel(params) {
    return request({
        url: '/item/materialCategory/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'materialType:export'
    })
}
