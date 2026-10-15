import request from '@/utils/request'

const basicHost = import.meta.env.VITE_APP_BASIC_API


//    ---------------报告生成 ---------
//
export function basicanalysisreport(params) {
    return request({
        url: basicHost + '/analysis/report/page',
        method: 'get',
        params,
        btnCode: 'reportGeneration:list',
    })
}
//
export function analysisreportfilepage(params) {
    return request({
        url: basicHost + '/analysis/report/file/page',
        method: 'get',
        params,
        btnCode: 'reportGeneration:list',
    })
}

// 生成报告
export function analysisreportutilgenerate(params) {
    return request({
        url: basicHost + '/analysis/report/util/generate',
        method: 'get',
        params,
        btnCode: 'reportGeneration:report',
    })
}

// 保存报告
export function analysisreportfile(data) {
    return request({
        url: basicHost + '/analysis/report/file',
        method: 'post',
        data,
        btnCode: 'reportGeneration:list',
    })
}
//
export function analysisreportfilebyDelete(data) {
    return request({
        url: basicHost + '/analysis/report/file/byDelete',
        method: 'post',
        data,
        btnCode: 'reportGeneration:delete',
    })
}
