import request from '@/utils/request'



//    ---------------成本分类 ---------
// 列表
export function costCategory(params) {
    return request({
        url: '/costCategory/tree',
        method: 'get',
        params,
        btnCode: 'costClassification:list',
    })
}
// 新增
export function costCategoryadd(data) {
    return request({
        url: '/costCategory/add',
        method: 'post',
        data,
        btnCode: 'costClassification:add',
    })
}

// 修改
export function costCategoryupdate(data) {
    return request({
        url: '/costCategory/update',
        method: 'post',
        data,
        btnCode: 'costClassification:update',
    })
}

// 删除
export function costCategorydelete(id) {
    return request({
        url: '/costCategory/byDelete/'+ id,
        method: 'post',
        btnCode: 'costClassification:delete',
    })
}
// 详情
export function costCategorydetail(id) {
    return request({
        url: '/costCategory/'+ id,
        method: 'get',
        btnCode: 'costClassification:list',
    })
}


// 启用
export function costCategoryenable(data) {
    return request({
        url: '/costCategory/enable',
        method: 'post',
        data,
        btnCode: 'costClassification:enable',
    })
}


// 停用
export function costCategorydisable(data) {
    return request({
        url: '/costCategory/disable',
        method: 'post',
        data,
        btnCode: 'costClassification:enable',
    })
}


// 导出Excel
export function costCategoryexportExcel(params) {
    return request({
        url: '/costCategory/exportExcel',
        method: 'get',
        params,
        btnCode: 'costClassification:exportExcel',
        responseType: 'blob'
    })
}

// 分配
export function costCategoryallocationData(data) {
    return request({
        url: '/costCategory/allocationData',
        method: 'post',
        data
    })
}

// 取消分配
export function costCategorycancelAllocationData(data) {
    return request({
        url: '/costCategory/cancelAllocationData',
        method: 'post',
        data
    })
}

//    ---------------成本项目 ---------

// 列表
export function costItem(params) {
    return request({
        url: '/costItem',
        method: 'get',
        params,
        btnCode: 'costProject:list'
    })
}
// 新增
export function costItemadd(data) {
    return request({
        url: '/costItem/add',
        method: 'post',
        data,
        btnCode: 'costProject:add'
    })
}

// 修改
export function costItemupdate(data) {
    return request({
        url: '/costItem/update',
        method: 'post',
        data,
        btnCode: 'costProject:update'
    })
}

// 删除
export function costItemdelete(data) {
    return request({
        url: '/costItem/delete',
        method: 'post',
        data,
        btnCode: 'costProject:delete'
    })
}


// 启用
export function costItemenable(data) {
    return request({
        url: '/costItem/enable',
        method: 'post',
        data,
        btnCode: 'costProject:enable'
    })
}


// 停用
export function costItemdisable(data) {
    return request({
        url: '/costItem/disable',
        method: 'post',
        data,
        btnCode: 'costProject:enable'
    })
}

// 导出
export function costItemexportExcel(params) {
    return request({
        url: '/costItem/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'costProject:exportExcel'
    })
}

//  成本项目关系  获取会计科目
export function costItemAccountRelationgetAccountList(params) {
    return request({
        url: '/costItemAccountRelation/getAccountList',
        method: 'get',
        params,
    })
}

// 分配
export function costItemallocationData(data) {
    return request({
        url: '/costItem/allocationData',
        method: 'post',
        data
    })
}

// 取消分配
export function costItemcancelAllocationData(data) {
    return request({
        url: '/costItem/cancelAllocationData',
        method: 'post',
        data
    })
}












