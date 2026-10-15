import request from '@/utils/request'


//  ---------------------  核算期间  ---------------------------
// 列表
export function itemaccountingPeriodpage(params) {
    return request({
        url: '/item/accountingPeriod/page',
        method: 'get',
        params,
        btnCode: 'accountingPeriod:list'
    })
}


//新增
export function itemaccountingPeriodadd(data) {
    return request({
        url: '/item/accountingPeriod/add',
        method: 'post',
        data,
        btnCode: 'accountingPeriod:add'
    })
}

//修改
export function itemaccountingPeriodupdate(data) {
    return request({
        url: '/item/accountingPeriod/update',
        method: 'post',
        data,
        btnCode: 'accountingPeriod:update'
    })
}
//删除
export function itemaccountingPerioddel(data) {
    return request({
        url: '/item/accountingPeriod/del',
        method: 'post',
        data,
        btnCode: 'accountingPeriod:delete'
    })
}


//  ---------------------  作业分类  ---------------------------
// tree
export function itemjobClasstree(params) {
    return request({
        url: '/item/jobClass/tree',
        method: 'get',
        params,
        btnCode: 'taskClassify:list'
    })
}

//新增
export function itemjobClassadd(data) {
    return request({
        url: '/item/jobClass/add',
        method: 'post',
        data,
        btnCode: 'taskClassify:add'
    })
}

//修改
export function itemjobClassupdate(data) {
    return request({
        url: '/item/jobClass/update',
        method: 'post',
        data,
        btnCode: 'taskClassify:update'
    })
}
//删除
export function itemjobClassdel(id) {
    return request({
        url: '/item/jobClass/delete/' + id,
        method: 'post',
        btnCode: 'taskClassify:delete'
    })
}
//详情
export function itemjobClassdetail(id) {
    return request({
        url: '/item/jobClass/' + id,
        method: 'get',
        btnCode: 'taskClassify:list'
    })
}

// 启用
export function itemjobClassenable(id) {
    return request({
        url: '/item/jobClass/enable/' + id,
        method: 'post',
        btnCode: 'taskClassify:enable'
    })
}

// 停用
export function itemjobClassdisable(id) {
    return request({
        url: '/item/jobClass/disable/' + id,
        method: 'post',
        btnCode: 'taskClassify:disable'
    })
}
// 导出
export function itemjobClassexportExcel(params) {
    return request({
        url: '/item/jobClass/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'taskClassify:export'
    })
}

// 分配
export function itemjobClasscallallocation(data) {
    return request({
        url: '/item/jobClass/allocationData',
        method: 'post',
        data,
        btnCode: 'taskClassify:callallocation'
    })
}
// 取消分配
export function itemjobClassallocationDetail(data) {
    return request({
        url: '/item/jobClass/cancelAllocationData',
        method: 'post',
        data,
        btnCode: 'taskClassify:allocationDetail'
    })
}
//  ---------------------  作业字典  ---------------------------

export function itemjob(data) {
    return request({
        url: '/item/job/page',
        method: 'post',
        data,
        btnCode: 'taskDictionary:list',
    })
}

//新增
export function itemjobadd(data) {
    return request({
        url: '/item/job/add',
        method: 'post',
        data,
        btnCode: 'taskDictionary:add',
    })
}

//修改
export function itemjobupdate(data) {
    return request({
        url: '/item/job/update',
        method: 'post',
        data,
        btnCode: 'taskDictionary:update',
    })
}

// 详情
export function itemjobdetail(id) {
    return request({
        url: '/item/job/' + id,
        method: 'get',
        btnCode: 'taskDictionary:list',
    })
}
//删除
export function itemjobdel(data) {
    return request({
        url: '/item/job/delete',
        method: 'post',
        data,
        btnCode: 'taskDictionary:delete',
    })
}

// 启用
export function itemjobenable(data) {
    return request({
        url: '/item/job/enable',
        method: 'post',
        data,
        btnCode: 'taskDictionary:enable',
    })
}

// 停用
export function itemjobdisable(data) {
    return request({
        url: '/item/job/disable',
        method: 'post',
        data,
        btnCode: 'taskDictionary:disable',
    })
}

// 导出
export function itemjobexportExcel(data) {
    return request({
        url: '/item/job/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'taskDictionary:export',
    })
}



