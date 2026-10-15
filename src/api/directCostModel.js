import request from '@/utils/request'


//    ---------------直接成本模型 -作业 ---------
// 列表
export function itemDirectModelqueryIncomeItemList(data) {
    return request({
        url: '/item/itemDirectModel/queryIncomeItemList',
        method: 'post',
        data,
        btnCode: 'directCostModel:list'
    })
}

// -----------------人工配置
// 人工配置列表
export function itemDirectModelLaborqueryModelLaborList(params) {
    return request({
        url: '/item/itemDirectModelLabor/queryModelLaborList',
        method: 'get',
        params,
        btnCode: 'directCostModel:list'
    })
}
// 新增人工配置
export function itemDirectModelLaborsave(data) {
    return request({
        url: '/item/itemDirectModelLabor/save',
        method: 'post',
        data,
        btnCode: 'directCostModel:artificialadd'
    })
}

// 修改人工配置
export function itemDirectModelLaborupdateById(data) {
    return request({
        url: '/item/itemDirectModelLabor/updateById',
        method: 'post',
        data,
        btnCode: 'directCostModel:artificialupdate'
    })
}
// 删除人工配置
export function itemDirectModelLabordelByIds(data) {
    return request({
        url: '/item/itemDirectModelLabor/delByIds',
        method: 'post',
        data,
        btnCode: 'directCostModel:artificialdel'
    })
}

// ---------------协作配置
// 协作配置列表
export function itemDirectLaborReceivequeryModelLaborReceiveList(params) {
    return request({
        url: '/item/itemDirectLaborReceive/queryModelLaborReceiveList',
        method: 'get',
        params,
        btnCode: 'directCostModel:list'
    })
}
// 新增协作配置
export function itemDirectLaborReceivesave(data) {
    return request({
        url: '/item/itemDirectLaborReceive/save',
        method: 'post',
        data,
        btnCode: 'directCostModel:coopadd'
    })
}

// 修改协作配置
export function itemDirectLaborReceiveupdateById(data) {
    return request({
        url: '/item/itemDirectLaborReceive/updateById',
        method: 'post',
        data,
        btnCode: 'directCostModel:coopupdate'
    })
}
// 删除协作配置
export function itemDirectLaborReceivedelByIds(data) {
    return request({
        url: '/item/itemDirectLaborReceive/delByIds',
        method: 'post',
        data,
        btnCode: 'directCostModel:coopdel'
    })
}

// --------------材料消耗
// 材料消耗列表
export function itemDirectModelSuppliesqueryModelSupplierList(params) {
    return request({
        url: '/item/itemDirectModelSupplies/queryModelSupplierList',
        method: 'get',
        params,
        btnCode: 'directCostModel:list'
    })
}
// 新增材料消耗
export function itemDirectModelSuppliessave(data) {
    return request({
        url: '/item/itemDirectModelSupplies/save',
        method: 'post',
        data,
        btnCode: 'directCostModel:consumeadd'
    })
}

// 修改材料消耗
export function itemDirectModelSuppliesupdateById(data) {
    return request({
        url: '/item/itemDirectModelSupplies/updateById',
        method: 'post',
        data,
        btnCode: 'directCostModel:consumeupdate'
    })
}

// 删除材料消耗
export function itemDirectModelSuppliesdelByIds(data) {
    return request({
        url: '/item/itemDirectModelSupplies/delByIds',
        method: 'post',
        data,
        btnCode: 'directCostModel:consumedel'
    })
}

// --------------设备配置
// 设备配置列表
export function itemDirectModelAssetsqueryModelAssetsList(params) {
    return request({
        url: '/item/itemDirectModelAssets/queryModelAssetsList',
        method: 'get',
        params,
        btnCode: 'directCostModel:list'
    })
}
// 新增设备配置
export function itemDirectModelAssetssave(data) {
    return request({
        url: '/item/itemDirectModelAssets/save',
        method: 'post',
        data,
        btnCode: 'directCostModel:equipadd'
    })
}
// 修改设备配置
export function itemDirectModelAssetsupdateById(data) {
    return request({
        url: '/item/itemDirectModelAssets/updateById',
        method: 'post',
        data,
        btnCode: 'directCostModel:equipupdate'
    })
}


// 删除设备配置
export function itemDirectModelAssetsdelByIds(data) {
    return request({
        url: '/item/itemDirectModelAssets/delByIds',
        method: 'post',
        data,
        btnCode: 'directCostModel:equipdel'
    })
}

// --------------其他成本
// 其他成本列表
export function itemDirectModelOtherCostqueryModelOtherList(params) {
    return request({
        url: '/item/itemDirectModelOtherCost/queryModelOtherList',
        method: 'get',
        params,
        btnCode: 'directCostModel:list'
    })
}
// 新增其他成本
export function itemDirectModelOtherCostsave(data) {
    return request({
        url: '/item/itemDirectModelOtherCost/save',
        method: 'post',
        data,
        btnCode: 'directCostModel:otheradd'
    })
}

// 修改其他成本
export function itemDirectModelOtherCostupdateById(data) {
    return request({
        url: '/item/itemDirectModelOtherCost/updateById',
        method: 'post',
        data,
        btnCode: 'directCostModel:otherupdate'
    })
}

// 删除其他成本
export function itemDirectModelOtherCostdelByIds(data) {
    return request({
        url: '/item/itemDirectModelOtherCost/delByIds',
        method: 'post',
        data,
        btnCode: 'directCostModel:otherdel'
    })
}


// 全部确认
export function itemDirectModelallSure(data) {
    return request({
        url: '/item/itemDirectModel/allSure',
        method: 'post',
        data,
        btnCode: 'directCostModel:confirm'
    })
}

// 确认
export function itemDirectModelsure(params) {
    return request({
        url: '/item/itemDirectModel/sure',
        method: 'get',
        params,
        btnCode: 'directCostModel:confirm'
    })
}


// 取消确认
export function itemDirectModelunSure(params) {
    return request({
        url: '/item/itemDirectModel/unSure',
        method: 'get',
        params,
        btnCode: 'directCostModel:unconfirm'
    })
}

// 复制
export function itemDirectModelCopy(data) {
    return request({
        url: `/item/itemDirectModel/copy`,
        method: 'post',
        data,
        btnCode: 'directCostModel:copy'
    })
}
// 导出数据
export function itemDirectModelexportExcel(data) {
    return request({
        url: '/item/itemDirectModel/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'directCostModel:export'
    })
}

//  ---------------------  通过收费项目 过滤 核算科室  ---------------------------
// tree
export function itemitemDirectModelqueryCopyItemDepts(params) {
    return request({
        url: '/item/itemDirectModel/queryCopyItemDepts',
        method: 'get',
        params,
    })
}


