import request from '@/utils/request'



const prePath = '/deptAssetsCost'
// -----------------  资产数据  -------------------
// 分页查询
export function deptAssetsCostpage(data) {
    return request({
        url: prePath + '/page',
        method: 'post',
        data,
        btnCode: 'assetData:list'
    })
}

// 查询详情
export function deptAssetsCostdetail(params) {
    return request({
        url: prePath + '/detail',
        method: 'get',
        params,
        btnCode: 'assetData:list'
    })
}

// 主表新增
export function deptAssetsCostadd(data) {
    return request({
        url: prePath + '/add',
        method: 'post',
        data,
        btnCode: 'assetData:add'
    })
}
// 主表编辑
export function deptAssetsCostupdate(data) {
    return request({
        url: prePath + '/update',
        method: 'post',
        data,
        btnCode: 'assetData:update'
    })
}

// 确认单据
export function deptAssetsCostok(data) {
    return request({
        url: prePath + '/ok',
        method: 'post',
        data,
        btnCode: 'assetData:confirm'
    })
}

// 取消确认单据
export function deptAssetsCostcancel(data) {
    return request({
        url: prePath + '/cancel',
        method: 'post',
        data,
        btnCode: 'assetData:unconfirm'
    })
}

// 采集单据
export function deptAssetsCostcollection(params) {
    return request({
        url: prePath + '/collection',
        method: 'get',
        params,
        btnCode: 'assetData:collect'
    })
}

// 检查
export function deptAssetsCostcheck(data) {
    return request({
        url: prePath + '/check',
        method: 'post',
        data,
        btnCode: 'assetData:check'
    })
}

// 删除
export function deptAssetsCostdelete(data) {
    return request({
        url: prePath + '/delete',
        method: 'post',
        data,
        btnCode: 'assetData:delete'
    })
}

// 导出参数数据
export function deptAssetsCostexportExcel(params) {
    return request({
        url: prePath + '/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'assetData:export'
    })
}


// -----------------  明细  -------------------

const prePath2 = '/deptAssetsCostDetail'
// 分页查询
export function deptAssetsCostDetailpage(data) {
    return request({
        url: prePath2 + '/page',
        method: 'post',
        data,
        btnCode: 'assetData:list'
    })
}

// 子表新增
export function deptAssetsCostDetailadd(data) {
    return request({
        url: prePath2 + '/add',
        method: 'post',
        data,
        btnCode: 'assetData:add'
    })
}

// 子表修改
export function deptAssetsCostDetailupdate(data) {
    return request({
        url: prePath2 + '/update',
        method: 'post',
        data,
        btnCode: 'assetData:update'
    })
}

// 子表删除
export function deptAssetsCostDetaildelete(data) {
    return request({
        url: prePath2 + '/delete',
        method: 'post',
        data,
        btnCode: 'assetData:delete'
    })
}

// 导出 明细数据
export function deptAssetsCostDetailexportExcel(params) {
    return request({
        url: prePath2 + '/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'assetData:detailexport'
    })
}
// 导出参数数据
export function deptAssetsCostDetailexportExcelDetail(data) {
    return request({
        url: prePath2 + '/exportExcelDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'assetData:detailexport'
    })
}

