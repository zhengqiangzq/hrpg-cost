import request from '@/utils/request'

// 分页查询归集方法定义
export function pageCollectionMethodDefinition(params) {
    return request(({
        url: '/dip/methodService/apportionWay/page',
        method: 'get',
        params,
        btnCode: 'DIPCostCollectionMethodDefinition:list'
    }))
}

// 查询归集方法定义
export function oneCollectionMethodDefinition(params) {
    return request({
        url: '/dip/methodService/apportionWay',
        method: 'get',
        params,
        btnCode: 'DIPCostCollectionMethodDefinition:list'
    })
}

// 新增归集方法定义
export function addCollectionMethodDefinition(data) {
    return request(({
        url: '/dip/methodService/apportionWay',
        method: 'post',
        data,
        btnCode: 'DIPCostCollectionMethodDefinition:add'
    }))
}

// 修改归集方法定义
export function updateCollectionMethodDefinition(data) {
    return request(({
        url: '/dip/methodService/apportionWay/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostCollectionMethodDefinition:update'
    }))
}

// 删除归集方法定义
export function deleteCollectionMethodDefinition(data) {
    return request({
        url: '/dip/methodService/apportionWay/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostCollectionMethodDefinition:delete'
    })
}

// 导出归集方法定义
export function exportCollectionMethodDefinition(data) {
    return request(({
        url: '/dip/methodService/apportionWay/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DIPCostCollectionMethodDefinition:export'
    }))
}
