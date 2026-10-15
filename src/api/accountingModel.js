import request from '@/utils/request'



//    ---------------间接成本模型 ---------
// 列表
export function paramindirectModel(params) {
    return request({
        url: '/item/param/indirectModel',
        method: 'get',
        params,
        btnCode: 'indirectCosts:list'
    })
}

// 启用
export function paramindirectModelenable(id) {
    return request({
        url: '/item/param/indirectModel/enable/' + id,
        method: 'post',
        btnCode: 'indirectCosts:confirm'
    })
}

//    ---------------直接成本模型 ---------
// 列表
export function paramdirectModel(data) {
    return request({
        url: '/item/param/directModel',
        method: 'post',
        data,
        btnCode: 'directCosts:list'
    })
}

// -----------------人工配置
// 人工配置列表
export function paramdirectModellaborList(params) {
    return request({
        url: '/item/param/directModel/laborList',
        method: 'get',
        params,
        btnCode: 'directCosts:list'
    })
}
// 新增人工配置
export function paramdirectModeladdLabor(data) {
    return request({
        url: '/item/param/directModel/addLabor',
        method: 'post',
        data,
        btnCode: 'directCosts:artificialadd'
    })
}

// 修改人工配置
export function paramdirectModelupdateLabor(data) {
    return request({
        url: '/item/param/directModel/updateLabor',
        method: 'post',
        data,
        btnCode: 'directCosts:artificialupdate'
    })
}
// 删除人工配置
export function paramdirectModeldelLabor(data) {
    return request({
        url: '/item/param/directModel/delLabor',
        method: 'post',
        data,
        btnCode: 'directCosts:artificialdel'
    })
}

// ---------------协作配置
// 协作配置列表
export function paramdirectModellaborReceiveList(params) {
    return request({
        url: '/item/param/directModel/laborReceiveList',
        method: 'get',
        params,
        btnCode: 'directCosts:list'
    })
}
// 新增协作配置
export function paramdirectModeladdLaborReceive(data) {
    return request({
        url: '/item/param/directModel/addLaborReceive',
        method: 'post',
        data,
        btnCode: 'directCosts:coopadd'
    })
}

// 修改协作配置
export function paramdirectModelupdateLaborReceive(data) {
    return request({
        url: '/item/param/directModel/updateLaborReceive',
        method: 'post',
        data,
        btnCode: 'directCosts:coopupdate'
    })
}
// 删除协作配置
export function paramdirectModeldelLaborRe(data) {
    return request({
        url: '/item/param/directModel/delLaborReceive',
        method: 'post',
        data,
        btnCode: 'directCosts:coopdel'
    })
}

// --------------材料消耗
// 材料消耗列表
export function paramdirectModelsuppliesList(params) {
    return request({
        url: '/item/param/directModel/suppliesList',
        method: 'get',
        params,
        btnCode: 'directCosts:list'
    })
}
// 新增材料消耗
export function paramdirectModeladdSupplies(data) {
    return request({
        url: '/item/param/directModel/addSupplies',
        method: 'post',
        data,
        btnCode: 'directCosts:consumeadd'
    })
}

// 修改材料消耗
export function paramdirectModelupdateSupplies(data) {
    return request({
        url: '/item/param/directModel/updateSupplies',
        method: 'post',
        data,
        btnCode: 'directCosts:consumeupdate'
    })
}

// 删除材料消耗
export function paramdirectModeldelLaborReceive(data) {
    return request({
        url: '/item/param/directModel/delSupplies',
        method: 'post',
        data,
        btnCode: 'directCosts:consumedel'
    })
}

// --------------设备配置
// 设备配置列表
export function paramdirectModelassetsList(params) {
    return request({
        url: '/item/param/directModel/assetsList',
        method: 'get',
        params,
        btnCode: 'directCosts:list'
    })
}
// 新增设备配置
export function paramdirectModeladdAssets(data) {
    return request({
        url: '/item/param/directModel/addAssets',
        method: 'post',
        data,
        btnCode: 'directCosts:equipadd'
    })
}
// 修改设备配置
export function paramdirectModelupdateAssets(data) {
    return request({
        url: '/item/param/directModel/updateAssets',
        method: 'post',
        data,
        btnCode: 'directCosts:equipupdate'
    })
}


// 删除设备配置
export function paramdirectModeldelAssets(data) {
    return request({
        url: '/item/param/directModel/delAssets',
        method: 'post',
        data,
        btnCode: 'directCosts:equipdel'
    })
}

// --------------其他成本
// 其他成本列表
export function paramdirectModelotherCostList(params) {
    return request({
        url: '/item/param/directModel/otherCostList',
        method: 'get',
        params,
        btnCode: 'directCosts:list'
    })
}
// 新增其他成本
export function paramdirectModeladdOtherCost(data) {
    return request({
        url: '/item/param/directModel/addOtherCost',
        method: 'post',
        data,
        btnCode: 'directCosts:otheradd'
    })
}

// 修改其他成本
export function paramdirectModelupdateOtherCost(data) {
    return request({
        url: '/item/param/directModel/updateOtherCost',
        method: 'post',
        data,
        btnCode: 'directCosts:otherupdate'
    })
}

// 删除其他成本
export function paramdirectModeldelOtherCost(data) {
    return request({
        url: '/item/param/directModel/delOtherCost',
        method: 'post',
        data,
        btnCode: 'directCosts:otherdel'
    })
}


// 全部确认
export function paramdirectModelAllSure(data) {
    return request({
        url: '/item/param/directModel/allSure',
        method: 'post',
        data,
        btnCode: 'directCosts:confirm'
    })
}

// 确认
export function paramdirectModelsure(data) {
    return request({
        url: '/item/param/directModel/sure',
        method: 'post',
        data,
        btnCode: 'directCosts:confirm'
    })
}

// 取消确认
export function paramdirectModelunsure(id) {
    return request({
        url: '/item/param/directModel/unsure/' + id,
        method: 'post',
        btnCode: 'directCosts:confirm'
    })
}
// 导出
export function paramdirectModelexportExcel(data) {
    return request({
        url: '/item/param/directModel/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'directCosts:export'
    })
}

// 复制
export function paramdirectModelCopy(data) {
    return request({
        url: `/item/param/directModel/copy`,
        method: 'post',
        data,
        btnCode: 'directCosts:copy'
    })
}


// 获取成本项目
export function paramdirectModelgetCostItemPage(params) {
    return request({
        url: '/item/param/directModel/getCostItemPage',
        method: 'get',
        params,
    })
}
//  ---------------------  通过收费项目 过滤 核算科室  ---------------------------
// tree
export function paramdirectModelqueryCopyItemDepts(params) {
    return request({
        url: '/item/param/directModel/queryCopyItemDepts',
        method: 'get',
        params,
    })
}

