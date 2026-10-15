import request from '@/utils/request'

// 校验病案
export function checkMedicalRecordCheck(id) {
    return request({
        url: `/businessData/diseaseMedicalRecordData/checkData/${id}`,
        method: 'get',
        btnCode: 'medicalRecordCheck:check'
    })
}
