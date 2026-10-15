import request from '@/utils/request'


//  ---------------------  收费项目关系  ---------------------------
// 列表
export function itemfeeRelation(data) {
    return request({
        url: '/item/feeRelation',
        method: 'post',
        data,
        btnCode: 'feeItemRelation:list'
    })
}


//新增
export function itemfeeRelationadd(data) {
    return request({
        url: '/item/feeRelation/add',
        method: 'post',
        data,
        btnCode: 'feeItemRelation:add'
    })
}


//编辑
export function itemfeeRelationupdate(data) {
    return request({
        url: '/item/feeRelation/update',
        method: 'post',
        data,
        btnCode: 'feeItemRelation:update'
    })
}

//删除
export function itemfeeRelationdel(data) {
    return request({
        url: '/item/feeRelation/del',
        method: 'post',
        data,
        btnCode: 'feeItemRelation:delete'
    })
}


// 计算
export function itemfeeRelationcollection(id) {
    return request({
        url: '/item/feeRelation/collection/' + id,
        method: 'get',
        btnCode: 'feeItemRelation:count'
    })
}

// 导出
export function itemfeeRelationexportExcel(data) {
    return request({
        url: '/item/feeRelation/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'feeItemRelation:export'
    })
}

//   ---------------------  科室作业关系  ---------------------------

// 列表
export function itemdeptWorkRelation(params) {
    return request({
        url: '/item/deptWorkRelation',
        method: 'get',
        params,
        btnCode: 'deptAssignmentRelation:list'
    })
}


//新增
export function itemdeptWorkRelationadd(data) {
    return request({
        url: '/item/deptWorkRelation/add',
        method: 'post',
        data,
        btnCode: 'deptAssignmentRelation:add'
    })
}


//编辑
export function itemdeptWorkRelationupdate(data) {
    return request({
        url: '/item/deptWorkRelation/update',
        method: 'post',
        data,
        btnCode: 'deptAssignmentRelation:update'
    })
}

//删除
export function itemdeptWorkRelationdel(data) {
    return request({
        url: '/item/deptWorkRelation/del',
        method: 'post',
        data,
        btnCode: 'deptAssignmentRelation:delete'
    })
}

// 导出
export function itemdeptWorkRelationexportExcel(params) {
    return request({
        url: '/item/deptWorkRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptAssignmentRelation:export'
    })
}








