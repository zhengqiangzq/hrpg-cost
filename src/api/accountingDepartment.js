import request from '@/utils/request'



//    ---------------科室档案 ---------
// 列表
export function section(params) {
    return request({
        url: '/section',
        method: 'get',
        params,
        btnCode: 'deptArchives:list',
    })
}

// 列表  tree
export function sectiontree(params) {
    return request({
        url: '/section/tree',
        method: 'get',
        params,
        btnCode: 'deptArchives:list',
    })
}

// 新增
export function sectionadd(data) {
    return request({
        url: '/section/add',
        method: 'post',
        data,
        btnCode: 'deptArchives:add',
    })
}

// 编辑
export function sectionupdate(data) {
    return request({
        url: '/section/update',
        method: 'post',
        data,
        btnCode: 'deptArchives:update',
    })
}

// 删除
export function sectiondelete(id) {
    return request({
        url: '/section/byDelete/'+ id,
        method: 'post',
        btnCode: 'deptArchives:delete',
    })
}

// 详情
export function sectiondetail(id) {
    return request({
        url: '/section/' + id,
        method: 'get',
    })
}

// 同步科室
export function sectionsyncId(orgId) {
    return request({
        url: '/section/sync/' + orgId,
        method: 'post',
        btnCode: 'deptArchives:synchro',
    })
}


// 导出
export function sectionexportExcel(params) {
    return request({
        url: '/section/exportExcel',
        method: 'get',
        params,
        btnCode: 'deptArchives:exportExcel',
        responseType: 'blob'
    })
}

//    ---------------成本科室关系 ---------
// 列表
export function sectionRelationpage(data) {
    return request({
        url: '/sectionRelation/page',
        method: 'post',
        data,
        btnCode: {
            '0': 'costDeptRelation:list',
            '1': 'outpatientDeptRelation:list',
            '2': 'hospitalizationDept:list',
        }[data.type],
    })
}

// 新增
export function sectionRelationadd(data) {
    return request({
        url: '/sectionRelation/add',
        method: 'post',
        data,
        btnCode: {
            '0': 'costDeptRelation:add',
            '1': 'outpatientDeptRelation:add',
            '2': 'hospitalizationDept:add',
        }[data.type],
    })
}

// 编辑
export function sectionRelationupdate(data) {
    return request({
        url: '/sectionRelation/update',
        method: 'post',
        data,
        btnCode: {
            '0': 'costDeptRelation:update',
            '1': 'outpatientDeptRelation:update',
            '2': 'hospitalizationDept:update',
        }[data.type],
    })
}


// 删除
export function sectionRelationdelete(data) {
    return request({
        url: '/sectionRelation/delete',
        method: 'post',
        data,
        btnCode: {
            '0': 'costDeptRelation:delete',
            '1': 'outpatientDeptRelation:delete',
            '2': 'hospitalizationDept:delete',
        }[data.type],
    })
}

// 导出
export function sectionRelationexportExcel(data) {
    return request({
        url: '/sectionRelation/exportExcel',
        method: 'post',
        data,
        btnCode: {
            '0': 'costDeptRelation:exportExcel',
            '1': 'outpatientDeptRelation:exportExcel',
            '2': 'hospitalizationDept:exportExcel',
        }[data.type],
        responseType: 'blob'
    })
}


//    ---------------二次分配 ---------
// 列表
export function secondAllocationTypepage(params) {
    return request({
        url: '/secondAllocationType/page',
        method: 'get',
        params
    })
}

// 查询类型详情
export function oneSecondAllocationType(params) {
    return request({
        url: '/secondAllocationType/getSecondAllocationTypeVO',
        method: 'get',
        params
    })
}

// 明细列表
export function secondAllocation(params) {
    return request({
        url: '/secondAllocation',
        method: 'get',
        params
    })
}

// 明细列表
export function secondAllocationpage(params) {
    return request({
        url: '/secondAllocation/page',
        method: 'get',
        params
    })
}

// 明细明细页
export function secondAllocationquery(params) {
    return request({
        url: '/secondAllocation/query',
        method: 'get',
        params,
    })
}

// 子表新增
export function secondAllocationadd(data) {
    return request({
        url: '/secondAllocation/add',
        method: 'post',
        data
    })
}

// 子表编辑
export function secondAllocationupdate(data) {
    return request({
        url: '/secondAllocation/update',
        method: 'post',
        data
    })
}



// 主表新增
export function secondAllocationTypeadd(data) {
    return request({
        url: '/secondAllocationType/add',
        method: 'post',
        data
    })
}

// 主表编辑
export function secondAllocationTypeupdate(data) {
    return request({
        url: '/secondAllocationType/update',
        method: 'post',
        data
    })
}

// 主表批量删除
export function secondAllocationTypedeleteByTypeIds(data) {
    return request({
        url: '/secondAllocationType/deleteByTypeIds',
        method: 'post',
        data
    })
}



// 批量删除
export function secondAllocationdeleteByIds(data) {
    return request({
        url: '/secondAllocation/deleteByIds',
        method: 'post',
        data
    })
}

// 主表导出
export function secondAllocationTypeexportExcel(params) {
    return request({
        url: '/secondAllocationType/exportExcel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}
// 明细导出
export function secondAllocationexportExcel(params) {
    return request({
        url: '/secondAllocation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}
// 明细导入
export function secondAllocationimportExcel(data) {
    return request({
        url: '/secondAllocation/importExcel',
        method: 'post',
        data,
    })
}


// 基础数据初始化
export function sectioninitLaunchInnerCode(params) {
    return request({
        url: '/section/initLaunchInnerCode',
        method: 'get',
        params,
    })
}











