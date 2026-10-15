import request from '@/utils/request'

export function pageResourceConsumptionLibIndirectCostModel(params) {
    return request({
        url: '/item/itemizeIndirectModel/page',
        method: 'get',
        params,
        btnCode: 'resourceConsumptionLibIndirectCostModel:list'
    })
}

export function oneResourceConsumptionLibIndirectCostModel(params) {
    return request({
        url: '/item/itemizeIndirectModel/getById',
        method: 'get',
        params,
        btnCode: 'resourceConsumptionLibIndirectCostModel:list'
    })
}

export function addResourceConsumptionLibIndirectCostModel(data) {
    return request({
        url: '/item/itemizeIndirectModel/save',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibIndirectCostModel:add'
    })
}

export function updateResourceConsumptionLibIndirectCostModel(data) {
    return request({
        url: '/item/itemizeIndirectModel/updateById',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibIndirectCostModel:update'
    })
}

export function deleteResourceConsumptionLibIndirectCostModel(data) {
    return request({
        url: '/item/itemizeIndirectModel/delByIds',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibIndirectCostModel:delete'
    })
}

export function enableResourceConsumptionLibIndirectCostModel(data) {
    return request({
        url: '/item/itemizeIndirectModel/sureByIds',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibIndirectCostModel:enable'
    })
}

export function disableResourceConsumptionLibIndirectCostModel(data) {
    return request({
        url: '/item/itemizeIndirectModel/unSureByIds',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibIndirectCostModel:enable'
    })
}

export function exportResourceConsumptionLibIndirectCostModel(data) {
    return request({
        url: '/item/itemizeIndirectModel/exportExcel',
        method: 'post',
        data,
        btnCode: 'resourceConsumptionLibIndirectCostModel:export',
        responseType: 'blob'
    })
}