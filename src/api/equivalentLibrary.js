import request from '@/utils/request'



// -----------------  项目当量库  -------------------
// 分页查询
export function itemChargeItemEquivalentPage(data) {
    return request({
        url: '/itemChargeItemEquivalent/page',
        method: 'post',
        data,
        btnCode: 'equivalentLibrary:list'
    })
}

// 查询详情
export function itemChargeItemEquivalentdetail(params) {
    return request({
        url: '/itemChargeItemEquivalent/detail',
        method: 'get',
        params,
        btnCode: 'equivalentLibrary:list'
    })
}

// 主表新增
export function itemChargeItemEquivalentadd(data) {
    return request({
        url: '/itemChargeItemEquivalent/add',
        method: 'post',
        data,
        btnCode: 'equivalentLibrary:add'
    })
}
// 主表编辑
export function itemChargeItemEquivalentupdate(data) {
    return request({
        url: '/itemChargeItemEquivalent/update',
        method: 'post',
        data,
        btnCode: 'equivalentLibrary:update'
    })
}

// 删除
export function itemChargeItemEquivalentdelete(data) {
    return request({
        url: '/itemChargeItemEquivalent/delete',
        method: 'post',
        data,
        btnCode: 'equivalentLibrary:delete'
    })
}

// 导出参数数据
export function itemChargeItemEquivalentexportExcel(data) {
    return request({
        url: '/itemChargeItemEquivalent/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'equivalentLibrary:export'
    })
}


// 总金额值
export function itemChargeItemEquivalentetgetTotalEquivalent(params) {
    return request({
        url: '/itemChargeItemEquivalent/getTotalEquivalent',
        method: 'get',
        params,
    })
}
// -----------------  项目当量库  子表  -------------------

// 分页查询
export function itemChargeItemEquivalentDetailpage(data) {
    return request({
        url: '/itemChargeItemEquivalentDetail/page',
        method: 'post',
        data,
        btnCode: 'equivalentLibrary:list'
    })
}

// 子表新增
export function itemChargeItemEquivalentDetailadd(data) {
    return request({
        url: '/itemChargeItemEquivalentDetail/add',
        method: 'post',
        data,
        btnCode: 'equivalentLibrary:add'
    })
}

// 子表修改
export function itemChargeItemEquivalentDetailupdate(data) {
    return request({
        url: '/itemChargeItemEquivalentDetail/update',
        method: 'post',
        data,
        btnCode: 'equivalentLibrary:update'
    })
}

// 子表删除
export function itemChargeItemEquivalentDetaildelete(data) {
    return request({
        url: '/itemChargeItemEquivalentDetail/delete',
        method: 'post',
        data,
        btnCode: 'equivalentLibrary:delete'
    })
}

// 导出 子表数据
export function itemChargeItemEquivalentDetailexportExcel(params) {
    return request({
        url: '/itemChargeItemEquivalentDetail/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'equivalentLibrary:export'
    })
}

// 导出 明细数据
export function itemChargeItemEquivalentDetailexportExcelDetail(data) {
    return request({
        url: '/itemChargeItemEquivalentDetail/exportExcelDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'equivalentLibrary:export'
    })
}

