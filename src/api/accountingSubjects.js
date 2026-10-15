import request from '@/utils/request'

// 会计科目
export function bdAccountpage(params) {
    return request({
        url: '/bdAccount/page',
        method: 'get',
        params,
        btnCode: 'accountingSubjects:list'
    })
}

// 会计科目 tree
export function bdAccounttree(params) {
    return request({
        url: '/bdAccount/tree',
        method: 'get',
        params,
        btnCode: 'accountingSubjects:list'
    })
}
// 删除会计科目
export function bdAccountdelete(data) {
    return request({
        url: '/bdAccount/byDelete',
        method: 'post',
        data,
        btnCode: 'accountingSubjects:delete'
    })
}

// 启 停用
export function bdAccountenable(data) {
    return request({
        url: '/bdAccount',
        method: 'post',
        data,
        btnCode: 'accountingSubjects:enable'
    })
}

// 新增
export function bdAccountadd(data) {
    return request({
        url: '/bdAccount/add',
        method: 'post',
        data,
        btnCode: 'accountingSubjects:add'
    })
}

// 编辑
export function bdAccountupdate(data) {
    return request({
        url: '/bdAccount/update',
        method: 'post',
        data,
        btnCode: 'accountingSubjects:update'
    })
}


// 详情
export function bdAccountdetail(id) {
    return request({
        url: '/bdAccount/detail/' + id,
        method: 'get',
        btnCode: 'accountingSubjects:list'
    })
}


// 采集
export function bdAccountcollection() {
    return request({
        url: '/bdAccount/collection',
        method: 'get',
        btnCode: 'accountingSubjects:collection'
    })
}
// 导出
export function bdAccountexportExcel(params) {
    return request({
        url: '/bdAccount/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'accountingSubjects:export'
    })
}













