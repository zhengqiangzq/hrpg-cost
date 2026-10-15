import {defineAsyncComponent} from "vue";

export default {
    // 科室成本 - 收入数据
    '101': loadComponent(import('@/views/deptCost/costData/income/incomeData')), // 医疗收入
    '102': loadComponent(import('@/views/deptCost/costData/income/scienceIncome')), // 财政科教收入
    '103': loadComponent(import('@/views/deptCost/costData/income/otherIncome')), // 其他收入
    // 科室成本 - 业务数据
    '104': loadComponent(import('@/views/deptCost/costData/businessCost/manpower/salaryData')), // 薪酬数据
    '105': loadComponent(import('@/views/deptCost/costData/businessCost/manpower/workAttendance')), // 考勤数据
    '106': loadComponent(import('@/views/deptCost/costData/businessCost/materialsData')), // 物资数据
    '107': loadComponent(import('@/views/deptCost/costData/businessCost/assetData')), // 资产数据
    '108': loadComponent(import('@/views/deptCost/costData/businessCost/drugData')), // 药品数据
    '109': loadComponent(import('@/views/deptCost/costData/businessCost/riskFund')), // 风险基金
    '110': loadComponent(import('@/views/deptCost/costData/businessCost/busOtherCost')), // 其他成本
    '111': loadComponent(import('@/views/deptCost/costData/businessCost/largeUsers')), // 大用户
    '112': loadComponent(import('@/views/deptCost/costData/costAllocation/costData')), // 总账成本
    // 科室成本 - 成本归集
    '113': loadComponent(import('@/views/deptCost/costData/costAllocation/costAllocation')), // 成本归集
    // 科室成本 - 参数数据
    '114': loadComponent(import('@/views/deptCost/costData/paramData')), // 参数数据
    // 科室成本 - 分摊计算
    '115': loadComponent(import('@/views/deptCost/allocationCalc/allocationCalc')), // 分摊计算
    '116': loadComponent(import('@/views/deptCost/allocationCalc/visitAllocationCalc')), // 诊次成本计算
    '117': loadComponent(import('@/views/deptCost/allocationCalc/bedDayCostCalc')), // 床日成本计算

    // 项目成本 - 业务数据
    '201': loadComponent(import('@/views/projectCost/business/incomeProData')), // 收入数据
    '202': loadComponent(import('@/views/projectCost/business/laborCosts/pelSalaryDetails')), // 人员薪酬明细
    '203': loadComponent(import('@/views/projectCost/business/laborCosts/technicalSalary')), // 技术职称薪资
    '204': loadComponent(import('@/views/projectCost/business/materialCosts')), // 物资成本
    '205': loadComponent(import('@/views/projectCost/business/assetCosts')), // 资产成本
    '206': loadComponent(import('@/views/projectCost/business/costProData')), // 成本数据
    // 项目成本 - 作业成本法
    '207': loadComponent(import('@/views/projectCost/jobCost/costCalculation/resourceDriverVal')), // 资源动因值
    '208': loadComponent(import('@/views/projectCost/jobCost/costCalculation/activityDriverVal')), // 作业动因值
    '209': loadComponent(import('@/views/projectCost/jobCost/costCalculation/calculationCost')), // 成本计算
    // 项目成本 - 参数分配法
    '210': loadComponent(import('@/views/projectCost/paramAllocation/accountingMethod')), // 核算方法参数
    '211': loadComponent(import('@/views/projectCost/paramAllocation/countCost/costCalculate')), // 成本计算
    // 项目成本 - 分项当量法
    '212': loadComponent(import('@/views/projectCost/equivalent/keyFactorsValue')), // 关键因素值
    '213': loadComponent(import('@/views/projectCost/equivalent/costCount/eqcalculation')), // 成本计算

    // 病种成本 - 业务数据
    '301': loadComponent(import('@/views/diseaseCost/diseaseBusinessData/medicalRecordInformation/medicalRecordData')), // 病案数据
    '302': loadComponent(import('@/views/diseaseCost/diseaseBusinessData/chargeData')), // 收费数据
    // 病种成本 - 参数分配法
    '303': loadComponent(import('@/views/diseaseCost/parameterAssignmentMethod/costData')), // 成本数据
    '304': loadComponent(import('@/views/diseaseCost/parameterAssignmentMethod/paramsData')), // 参数数据
    '305': loadComponent(import('@/views/diseaseCost/parameterAssignmentMethod/costCalc')), // 成本计算
    // 病种成本 - 项目叠加法
    '306': loadComponent(import('@/views/diseaseCost/itemStackMethod/costData')), // 成本数据
    '307': loadComponent(import('@/views/diseaseCost/itemStackMethod/costCalc')), // 成本计算
    // 病种成本 - 服务单元叠加法
    '308': loadComponent(import('@/views/diseaseCost/serviceUnitSuperpositionMethod/costData')), // 成本数据
    '309': loadComponent(import('@/views/diseaseCost/serviceUnitSuperpositionMethod/paramsData')), // 参数数据
    '310': loadComponent(import('@/views/diseaseCost/serviceUnitSuperpositionMethod/dataCenter/costCenter')), // 成本中心
    '311': loadComponent(import('@/views/diseaseCost/serviceUnitSuperpositionMethod/dataCenter/incomeCenter')), // 收入中心
    '312': loadComponent(import('@/views/diseaseCost/serviceUnitSuperpositionMethod/costCalc')), // 成本计算

    // DRG成本 - 业务数据
    '401': loadComponent(import('@/views/DRGCost/DRGBusinessData/medicalRecordInformation/medicalRecordData')), // 病案数据
    '402': loadComponent(import('@/views/DRGCost/DRGBusinessData/chargeData')), // 收费数据
    // DRG成本 - 参数分配法
    '403': loadComponent(import('@/views/DRGCost/parameterAssignmentMethod/costData')), // 成本数据
    '404': loadComponent(import('@/views/DRGCost/parameterAssignmentMethod/paramsData')), // 参数数据
    '405': loadComponent(import('@/views/DRGCost/parameterAssignmentMethod/costCalc')), // 成本计算
    // DRG成本 - 项目叠加法
    '406': loadComponent(import('@/views/DRGCost/itemStackMethod/costData')), // 成本数据
    '407': loadComponent(import('@/views/DRGCost/itemStackMethod/costCalc')), // 成本计算
    // DRG成本 - 服务单元叠加法
    '408': loadComponent(import('@/views/DRGCost/serviceUnitSuperpositionMethod/costData')), // 成本数据
    '409': loadComponent(import('@/views/DRGCost/serviceUnitSuperpositionMethod/paramsData')), // 参数数据
    '410': loadComponent(import('@/views/DRGCost/serviceUnitSuperpositionMethod/dataCenter/costCenter')), // 成本中心
    '411': loadComponent(import('@/views/DRGCost/serviceUnitSuperpositionMethod/dataCenter/incomeCenter')), // 收入中心
    '412': loadComponent(import('@/views/DRGCost/serviceUnitSuperpositionMethod/costCalc')), // 成本计算

    // DIP成本 - 业务数据
    '501': loadComponent(import('@/views/DIPCost/DIPBusinessData/medicalRecordInformation/medicalRecordData')), // 病案数据
    '502': loadComponent(import('@/views/DIPCost/DIPBusinessData/chargeData')), // 收费数据
    // DIP成本 - 参数分配法
    '503': loadComponent(import('@/views/DIPCost/parameterAssignmentMethod/costData')), // 成本数据
    '504': loadComponent(import('@/views/DIPCost/parameterAssignmentMethod/paramsData')), // 参数数据
    '505': loadComponent(import('@/views/DIPCost/parameterAssignmentMethod/costCalc')), // 成本计算
    // DIP成本 - 项目叠加法
    '506': loadComponent(import('@/views/DIPCost/itemStackMethod/costData')), // 成本数据
    '507': loadComponent(import('@/views/DIPCost/itemStackMethod/costCalc')), // 成本计算
    // DIP成本 - 服务单元叠加法
    '508': loadComponent(import('@/views/DIPCost/serviceUnitSuperpositionMethod/costData')), // 成本数据
    '509': loadComponent(import('@/views/DIPCost/serviceUnitSuperpositionMethod/paramsData')), // 参数数据
    '510': loadComponent(import('@/views/DIPCost/serviceUnitSuperpositionMethod/dataCenter/costCenter')), // 成本中心
    '511': loadComponent(import('@/views/DIPCost/serviceUnitSuperpositionMethod/dataCenter/incomeCenter')), // 收入中心
    '512': loadComponent(import('@/views/DIPCost/serviceUnitSuperpositionMethod/costCalc')), // 成本计算

    // 计算页面编码组
    calcPageCode: [115, 116, 117, 209, 211, 213, 305, 307, 312, 405, 407, 412, 505, 507, 512]
}

function loadComponent(source) {
    return defineAsyncComponent(() => source)
}