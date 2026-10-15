import request from '@/utils/request'



//    ---------------核算方法参数 ---------
// 列表
export function indirectModelPrampage(params) {
    return request({
        url: '/item/param/indirectModelPram/page',
        method: 'get',
        params,
        btnCode: 'accountingMethod:list'
    })
}

// 新增
export function paramindirectModelPramadd(data) {
    return request({
        url: '/item/param/indirectModelPram/add',
        method: 'post',
        data,
        btnCode: 'accountingMethod:add'
    })
}

// 编辑
export function indirectModelPramupdate(data) {
    return request({
        url: '/item/param/indirectModelPram/update',
        method: 'post',
        data,
        btnCode: 'accountingMethod:update'
    })
}

// 确认 、  取消确认
export function indirectModelPramconfirm(data) {
    return request({
        url: '/item/param/indirectModelPram/confirm',
        method: 'post',
        data,
        btnCode: 'accountingMethod:confirm'
    })
}

// 删除
export function indirectModelPramdel(data) {
    return request({
        url: '/item/param/indirectModelPram/del',
        method: 'post',
        data,
        btnCode: 'accountingMethod:delete'
    })
}

// 导出
export function indirectModelPramexportExcel(params) {
    return request({
        url: '/item/param/indirectModelPram/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'accountingMethod:export'
    })
}


// 导出明细
export function indirectModelPramexportDetailExcel(data) {
    return request({
        url: '/item/param/indirectModelPram/exportDetailExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'accountingMethod:export'
    })
}



//    ---------------核算方法参数 --明细 ---------
// 明细
export function indirectModelPramdetail(id) {
    return request({
        url: '/item/param/indirectModelPram/detail/' + id,
        method: 'get',
        btnCode: 'accountingMethod:list'
    })
}
// 明细分页
export function indirectModelPramdetailPage(data) {
    return request({
        url: '/item/param/indirectModelPram/detailPage',
        method: 'post',
        data,
        btnCode: 'accountingMethod:list'
    })
}

// 收费项目关系
export function indirectModelPramparam(params) {
    return request({
        url: '/item/param/indirectModelPram',
        method: 'get',
        params
    })
}

// 计算
export function indirectModelPramcollection(params) {
    return request({
        url: '/item/param/indirectModelPram/collection',
        method: 'get',
        params,
    })
}




