import request from '@/utils/request'

// 校验病案
export function checkMedicalRecordCheck(id) {
    return request({
        url: `/dip/businessData/medicalRecordData/checkData/${id}`,
        method: 'get',
        btnCode: 'DIPCostMedicalRecordCheck:check'
    })
}
