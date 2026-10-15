

//  ---------------------  资产核算类  ---------------------------
// tree
import request from "@/utils/request";

export function itemAssetsCategorytlist(params) {
    return request({
        url: '/item/assetsCategory/list',
        method: 'get',
        params,
    })
}

// 启用
export function itemAssetsCategoryEnable(id) {
    return request({
        url: '/item/assetsCategory/enable/' + id,
        method: 'post',
        btnCode: 'assetType:enable'
    })
}
// 停用
export function itemAssetsCategoryDisable(id) {
    return request({
        url: '/item/assetsCategory/disable/' + id,
        method: 'post',
        btnCode: 'assetType:disable'
    })
}
// 删除
export function itemAssetsCategoryDelete(id) {
    return request({
        url: '/item/assetsCategory/delete/' + id,
        method: 'post',
        btnCode: 'assetType:delete'
    })
}
// 新增
export function itemAssetsCategoryAdd(data) {
    return request({
        url: '/item/assetsCategory/add',
        method: 'post',
        data,
        btnCode: 'assetType:add'
    })
}
// 详情
export function itemAssetsCategoryDetail(id) {
    return request({
        url: '/item/assetsCategory/' + id,
        method: 'get',
        btnCode: 'assetType:list'
    })
}
// 编辑
export function itemAssetsCategoryUpdate(data) {
    return request({
        url: '/item/assetsCategory/update',
        method: 'post',
        data,
        btnCode: 'assetType:update'
    })
}
// 分配
export function itemAssetsCategoryAllocationData(data) {
    return request({
        url: '/item/assetsCategory/allocationData',
        method: 'post',
        data,
        btnCode: 'assetType:allocation'
    })
}
// 取消分配
export function itemAssetsCategoryCancelAllocationData(data) {
    return request({
        url: '/item/assetsCategory/cancelAllocationData',
        method: 'post',
        data,
        btnCode: 'assetType:callallocation'
    })
}

// 导出
export function itemAssetsCategoryexportExcel(params) {
    return request({
        url: '/item/assetsCategory/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'assetType:export'
    })
}
