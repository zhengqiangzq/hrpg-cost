import request from '@/utils/request'

// 校验病案
export function checkMedicalRecordCheck(id) {
    return request({
        url: `/drg/businessData/medicalRecordData/checkData/${id}`,
        method: 'get',
        btnCode: 'DRGCostMedicalRecordCheck:check'
    })
}
