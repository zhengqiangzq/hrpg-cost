import request from '@/utils/request'

export function pageResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModel/queryIncomeItemList',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:list'
    })
}

export function treeResourceConsumptionLibDirectCostModelDept(params) {
    return request({
        url: '/item/itemizeDirectModel/queryCopyItemDepts',
        method: 'get',
        params,
        btnCode: 'resourceConsumptionLibDirectCostModel:list'
    })
}

export function copyResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModel/copy',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:copy'
    })
}

export function confirmResourceConsumptionLibDirectCostModel(params) {
    return request({
        url: '/item/itemizeDirectModel/sure',
        method: 'get',
        params,
        btnCode: 'resourceConsumptionLibDirectCostModel:enable'
    })
}

export function cancelResourceConsumptionLibDirectCostModel(params) {
    return request({
        url: '/item/itemizeDirectModel/unSure',
        method: 'get',
        params,
        btnCode: 'resourceConsumptionLibDirectCostModel:enable'
    })
}


export function exportResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModel/exportExcel',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:export',
        responseType: 'blob'
    })
}

export function pageLaborResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelLabor/queryModelLaborList',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:list'
    })
}

export function updateLaborResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelLabor/saveOrUpdate',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:update'
    })
}

export function deleteLaborResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelLabor/byDelete',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:delete'
    })
}

export function pageCooperationResourceConsumptionLibDirectCostModel(params) {
    return request({
        url: '/item/itemizeDirectModelCooperation/queryModelCooperationList',
        method: 'get',
        params,
        btnCode: 'resourceConsumptionLibDirectCostModel:list'
    })
}

export function addCooperationResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelCooperation/save',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:add'
    })
}

export function updateCooperationResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelCooperation/byPost',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:update'
    })
}

export function deleteCooperationResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelCooperation/byDelete',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:delete'
    })
}

export function pageSuppliesResourceConsumptionLibDirectCostModel(params) {
    return request({
        url: '/item/itemizeDirectModelSupplies/queryModelSupplierList',
        method: 'get',
        params,
        btnCode: 'resourceConsumptionLibDirectCostModel:list'
    })
}

export function addSuppliesResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelSupplies/save',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:add'
    })
}

export function updateSuppliesResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelSupplies/byPost',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:update'
    })
}

export function deleteSuppliesResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelSupplies/byDelete',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:delete'
    })
}

export function pageAssetsResourceConsumptionLibDirectCostModel(params) {
    return request({
        url: '/item/itemizeDirectModelAssets/queryModelAssetsList',
        method: 'get',
        params,
        btnCode: 'resourceConsumptionLibDirectCostModel:list'
    })
}

export function addAssetsResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelAssets/save',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:add'
    })
}

export function updateAssetsResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelAssets/byPost',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:update'
    })
}

export function deleteAssetsResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelAssets/byDelete',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:delete'
    })
}

export function pageBuildingResourceConsumptionLibDirectCostModel(params) {
    return request({
        url: '/item/itemizeDirectModelHouse/queryModelHouseList',
        method: 'get',
        params,
        btnCode: 'resourceConsumptionLibDirectCostModel:list'
    })
}

export function addBuildingResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelHouse/save',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:add'
    })
}

export function updateBuildingResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelHouse/byPost',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:update'
    })
}

export function deleteBuildingResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelHouse/byDelete',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:delete'
    })
}

export function pageOtherResourceConsumptionLibDirectCostModel(params) {
    return request({
        url: '/item/itemizeDirectModelOtherCost/queryModelOtherList',
        method: 'get',
        params,
        btnCode: 'resourceConsumptionLibDirectCostModel:list'
    })
}

export function addOtherResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelOtherCost/save',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:add'
    })
}

export function updateOtherResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelOtherCost/byPost',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:update'
    })
}

export function deleteOtherResourceConsumptionLibDirectCostModel(data) {
    return request({
        url: '/item/itemizeDirectModelOtherCost/byDelete',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibDirectCostModel:delete'
    })
}