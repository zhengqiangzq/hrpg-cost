

//  ---------------------  核算科室  ---------------------------
// tree
import request from "@/utils/request";

export function itemsectiontree(params) {
    return request({
        url: '/item/section/tree',
        method: 'get',
        params,
    })
}
// 分页
export function itemsectionPage(params) {
    return request({
        url: '/item/section/page',
        method: 'get',
        params,
        btnCode: 'accountingDept:list'
    })
}
// 启用
export function itemsectionEnable(id) {
    return request({
        url: '/item/section/enable/' + id,
        method: 'post',
        btnCode: 'accountingDept:enable'
    })
}
// 停用
export function itemsectionDisable(id) {
    return request({
        url: '/item/section/disable/' + id,
        method: 'post',
        btnCode: 'accountingDept:disable'
    })
}
// 删除
export function itemsectionDelete(id) {
    return request({
        url: '/item/section/delete/' + id,
        method: 'post',
        btnCode: 'accountingDept:delete'
    })
}
// 新增
export function itemsectionAdd(data) {
    return request({
        url: '/item/section/add',
        method: 'post',
        data,
        btnCode: 'accountingDept:add'
    })
}
// 编辑
export function itemsectionUpdate(data) {
    return request({
        url: '/item/section/update',
        method: 'post',
        data,
        btnCode: 'accountingDept:update'
    })
}
// 同步
export function itemsectionSync(data) {
    return request({
        url: '/item/section/sync',
        method: 'post',
        data,
        btnCode: 'accountingDept:synchronization'
    })
}

// 导出
export function itemsectionexportExcel(params) {
    return request({
        url: '/item/section/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'accountingDept:export'
    })
}
