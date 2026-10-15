

//  ---------------------  材料核算类关系  ---------------------------
import request from "@/utils/request";

// 列表
export function itemAssetCategoryRelationPage(data) {
    return request({
        url: '/item/assetsCategoryRelation/page',
        method: 'post',
        data,
        btnCode: 'assetTypeRelation:list'
    })
}

// 新增
export function itemAssetCategoryRelationAdd(data) {
    return request({
        url: '/item/assetsCategoryRelation/add',
        method: 'post',
        data,
        btnCode: 'assetTypeRelation:add'
    })
}

// 删除
export function itemAssetCategoryRelationDelete(data) {
    return request({
        url: '/item/assetsCategoryRelation/delete',
        method: 'post',
        data,
        btnCode: 'assetTypeRelation:delete'
    })
}
// 导出
export function itemAssetCategoryexportRelationExcel(params) {
    return request({
        url: '/item/assetsCategoryRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'assetTypeRelation:export'
    })
}
