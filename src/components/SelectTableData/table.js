


import { pageBudgetProject} from '@/api/budgetManagement'
import {pageCostItem} from "@/api/costItem";
import {pageAllocationParam} from "@/api/allocationParam";
import {pageAllocationLevel} from "@/api/allocationLevel";
import {pagePeriodMonth, pageFeeItem, pageFeeCategory, pageStaff} from "@/api/base";
import moment from "moment";
import {bdAccountpage} from "@/api/accountingSubjects";
import {costItemAccountRelationaccassItemValue} from "@/api/costItemRelation";
import {costCategory, costItemAccountRelationgetAccountList} from "@/api/costInformation";
import {pageICD9File} from "@/api/diseaseCostICD9File";
import {pageICD10File} from "@/api/diseaseCostICD10File";
import {pageAccountingPeriod} from "@/api/diseaseCostAccountingPeriod";
import {dipAccountingPeriodPage} from "@/api/DIPCost/DIPCostAccountingPeriod";
import {pageAccountingPeriod as pageDRGAccountingPeriod} from "@/api/DRGCostAccountingPeriod";
import {pageAggregationParams} from "@/api/diseaseCostAggregationParams";
import {pageAggregationParams as pageDRGAggregationParams} from "@/api/DRGCostAggregationParams";
import {pageAggregationParams as pageDIPAggregationParams} from "@/api/DIPCost/DIPCostAggregationParams";
import {pageAllocationParam as diseasePageAllocationParam} from "@/api/diseaseCostAllocationParam";
import {pageAllocationParam as DRGPageAllocationParam} from "@/api/DRGCostAllocationParam";
import {pageDiseaseDefinition} from "@/api/diseaseCostDiseaseDefinition";
import {pageAllocationParam as DIPpageAllocationParam } from "@/api/DIPCost/DIPCostAllocationParam";
import {drugItempage, productpage} from "@/api/personnelInfo";
import {itemaccountingPeriodpage, itemjob} from "@/api/projectBase";
import {pageServiceUnit} from "@/api/diseaseCostServiceUnit";
import {pageServiceUnit as pageDRGServiceUnit} from "@/api/DRGCostServiceUnit";
import {pageServiceUnit as pageDIPServiceUnit} from "@/api/DIPCost/DIPCostServiceUnit";
import {assetsItempage} from "@/api/personnelInfo";
import {pageMedicalRecordData} from "@/api/diseaseCostMedicalRecordData";
import {pageMedicalRecordData as DRGPageMedicalRecordData} from "@/api/DRGCostMedicalRecordData";
import {pageMedicalRecordData as DIPPageMedicalRecordData} from "@/api/DIPCost/DIPCostMedicalRecordData";
import {paramdirectModelgetCostItemPage, paramindirectModel} from "@/api/accountingModel";
import {itemdeptWorkRelation, itemfeeRelation} from "@/api/relation";
import {itemdriveractivity, itemdriverresource} from "@/api/agent";
import {pageGroupFile} from "@/api/DRGCostGroupFile";
import {pageApportionmentLevelList} from "@/api/deptCost/basicSituationAnalysis";
import {pageControlIndicators} from "@/api/deptCost/controlIndicators";
import {pageTargetConfig} from "@/api/deptCost/targetConfig";
import {pageForecastMethod} from "@/api/deptCost/forecastMethod";
import {pageAssessmentIndicators} from "@/api/deptCost/assessmentIndicators";
import {pageAssessmentScheme} from "@/api/deptCost/assessmentScheme";
import {pageGeneralLedgerDataDeptCostDataItem} from "@/api/generalLedgerDataDeptCostData";
import {dipDefinitionPage} from "@/api/DIPCost/DIPCostGroupFile";
import {pageStandardClinicalPathway} from "@/api/diseaseCost/standardClinicalPathway";
import {pageMsProgramRegulateLibrary} from "@/api/projectCost/MSProgramRegulateLibrary";
import {pageProfileConfigAssetArea} from "@/api/projectCost/profileConfigAssetArea";
import {pageProfileConfigKeyFactors} from "@/api/projectCost/profileConfigKeyFactors";
import {getUserList} from "@/api/user";
/**
 * table表头数据
 */
export function tableHeader(type) {
    type = type || 'project'
    const form = {
        api: null,
        title: '',
        query: {},
        header: [],
    }
    switch (type) {
        case 'project':
            form.api = pageBudgetProject
            form.header = [
                {label: '编码', value: 'code'},
                {label: '名称', value: 'name'},
            ]
            break
        case 'users':
            form.api = getUserList
            form.filters = [
                {
                    type: 'input',
                    label: '名称',
                    value: 'name'
                },
            ]
            form.header = [
                { label: '名称', value: 'name' },
                { label: '账号', value: 'accountNo' },
                { label: '部门', value: 'deptName' },
            ]
            break
        case 'costItem':
            form.api = pageCostItem
            form.title = '成本项目'
            form.header = [
                { label: '项目编码', value: 'code' },
                { label: '项目名称', value: 'name' },
                { label: '分类编码', value: 'costCategoryCode' },
                { label: '分类名称', value: 'costCategoryName' }
            ]
            form.filters = [
                { label: '编码/名称', value: 'name', type: 'input' },
            ]
            break
        case 'ModelgetCostItem':
            form.api = paramdirectModelgetCostItemPage
            form.title = '成本项目'
            form.header = [
                { label: '项目编码', value: 'code' },
                { label: '项目名称', value: 'name' },
            ]
            break
        case 'feeCategory':
            form.api = pageFeeCategory
            form.title = '费用类别'
            form.filters = [
                { label: '编码/名称', value: 'keyword', type: 'input' }
            ]
            form.header = [
                { label: '类别编码', value: 'code' },
                { label: '类别名称', value: 'name' }
            ]
            break
        case 'feeItem':
            form.api = pageFeeItem
            form.title = '费用项目'
            form.header = [
                { label: '项目编码', value: 'code' },
                { label: '项目名称', value: 'name' },
                { label: '类别编码', value: 'feeCategoryCode' },
                { label: '类别名称', value: 'feeCategoryName' }
            ]
            form.filters = [
                { label: '编码/名称', value: 'keyword', type: 'input' },
            ]
            break
        case 'allocationParam':
            form.api = pageAllocationParam
            form.title = '分摊参数'
            form.header = [
                { label: '分摊参数编码', value: 'code' },
                { label: '分摊参数名称', value: 'name' },
            ]
            break
        case 'Level':
            form.api = pageAllocationLevel
            form.title = '分摊级次'
            form.header = [
                { label: '分摊级次编码', value: 'code' },
                { label: '分摊级次名称', value: 'name' },
            ]
            break
        case 'analysisLevel':
            form.api = pageApportionmentLevelList
            form.pager = false
            form.noSearch = true
            form.title = '分摊级次'
            form.header = [
                { label: '分摊级次编码', value: 'code' },
                { label: '分摊级次名称', value: 'name' },
            ]
            break
        case 'accountingPeriod':
            form.api = pagePeriodMonth
            form.title = '会计期间'
            form.query = {
                sort: 'begin_date desc'
            }
            form.header = [
                { label: '会计期间', value: 'periodYearAndMonth' },
                { label: '开始日期', value: 'beginDate', formatter: (row) => moment(row.beginDate).format('YYYY-MM-DD') },
                { label: '结束日期', value: 'endDate', formatter: (row) => moment(row.endDate).format('YYYY-MM-DD') },
            ]
            form.noSearch = true
            break
        case 'accountingSubjects':
            form.api = bdAccountpage
            form.header = [
                { label: '会计科目编码', value: 'code' },
                { label: '会计科目名称', value: 'name' },
            ]
            break
        case 'costItemgetAccount':
            form.api = costItemAccountRelationgetAccountList
            form.header = [
                { label: '会计科目编码', value: 'accountCode' },
                { label: '会计科目名称', value: 'accountName' },
            ]
            break
        case 'accassItem':
            form.api = costItemAccountRelationaccassItemValue
            form.header = [
                { label: '编码', value: 'code' },
                { label: '名称', value: 'name' },
            ]
            break
        case 'ICD9File':
            form.api = pageICD9File
            form.title = '主要手术操作'
            form.header = [
                { label: '主要手术操作编码', value: 'code' },
                { label: '主要手术操作名称', value: 'name' },
                { label: '拼音码', value: 'pinyinCode' },
            ]
            form.filters = [
                { label: '编码/名称', value: 'OrBatchLike#code#name', type: 'input' },
            ]
            break
        case 'ICD10File':
            form.api = pageICD10File
            form.title = '主要诊断'
            form.header = [
                { label: '主要诊断编码', value: 'code' },
                { label: '主要诊断名称', value: 'name' },
                { label: '拼音码', value: 'pinyinCode' },
            ]
            form.filters = [
                { label: '编码/名称', value: 'OrBatchLike#code#name', type: 'input' },
            ]
            break
        case 'staff':
            form.api = pageStaff
            form.title = '人员'
            form.header = [
                {label: '人员编码', value: 'userCode'},
                {label: '人员名称', value: 'name'},
            ]
            form.filters = [
                { label: '编码/名称', value: 'OrBatchLike#userCode#name', type: 'input' },
            ]
            break
        case 'diseasePeriod':
            form.api = pageAccountingPeriod
            form.title = '核算期间'
            form.header = [
                { label: '核算期间编码', value: 'code' },
                { label: '核算期间名称', value: 'name' },
                { label: '开始期间', value: 'beginPeriodName' },
                { label: '结束期间', value: 'endPeriodName' },
            ]
            form.filters = [
                { label: '期间编码/名称', value: 'OrBatchLike#code#name', type: 'input' },
            ]
            break
        case 'itemaccountingPeriod':
            form.api = itemaccountingPeriodpage
            form.title = '核算期间'
            form.header = [
                { label: '核算期间编码', value: 'code' },
                { label: '核算期间名称', value: 'name' },
                { label: '开始期间', value: 'beginPeriod' },
                { label: '结束期间', value: 'endPeriod' },
            ]
            break
        case 'diseaseAggregationParams':
            form.api = pageAggregationParams
            form.title = '归集参数'
            form.header = [
                { label: '归集参数编码', value: 'code' },
                { label: '归集参数名称', value: 'name' },
            ]
            break
        case 'diseaseAllocationParam':
            form.api = diseasePageAllocationParam
            form.title = '分摊参数'
            form.header = [
                { label: '分摊参数编码', value: 'code' },
                { label: '分摊参数名称', value: 'name' },
            ]
            form.filters = [
                { label: '编码', value: 'codeLike', type: 'input' },
                { label: '名称', value: 'nameLike', type: 'input' },
            ]
            break
        case 'diseaseMedicalRecordData':
            form.api = pageMedicalRecordData
            form.title = '病案'
            form.header = [
                { label: '病案号', value: 'medicalRecordNumber' },
                { label: '住院号', value: 'hospitalAdmissionNumber' },
                { label: '出院科室', value: 'dischargeDeptName' },
                { label: '主诊医生', value: 'mainDoctorName' },
                { label: '患者姓名', value: 'patientName' },
                { label: '性别', value: 'sexName' },
                { label: '年龄', value: 'age' },
            ]
            break
        case 'diseaseServiceUnit':
            form.api = pageServiceUnit
            form.title = '服务单元'
            form.header = [
                { label: '服务单元编码', value: 'code' },
                { label: '服务单元名称', value: 'name' },
            ]
            form.filters = [
                { label: '编码/名称', value: 'OrBatchLike#code#name', type: 'input' },
            ]
            break
        case 'diseaseDefinition':
            form.api = pageDiseaseDefinition
            form.title = '病种'
            form.filters = [
                { label: '编码/名称', value: 'OrBatchLike#code#name', type: 'input' }
            ]
            form.header = [
                { label: '病种编码', value: 'code' },
                { label: '病种名称', value: 'name' },
                { label: '是否单病种', value: 'isSingleDiseaseName' },
            ]
            break
        case 'product':
            form.api = productpage
            form.title = '物资'
            form.header = [
                { label: '物资编码', value: 'code' },
                { label: '物资名称', value: 'name' },
                { label: '物资分类编码', value: 'productFinCategoryCode' },
                { label: '物资分类名称', value: 'productFinCategoryName' },
                { label: '是否收费', value: 'isChargeName' },
            ]
            form.filters = [
                { label: '物资编码/名称', value: 'name', type: 'input' },
            ]
            break
        case 'drugItem':
            form.api = drugItempage
            form.title = '药品'
            form.header = [
                { label: '药品编码', value: 'code' },
                { label: '药品名称', value: 'name' },
            ]
            form.filters = [
                { label: '药品名称', value: 'name', type: 'input' },
            ]
            break
        case 'assets':
            form.api = assetsItempage
            form.title = '资产'
            form.header = [
                { label: '资产卡片号', value: 'code', width: 100 },
                { label: '资产名称', value: 'name' },
                { label: '规格型号', value: 'model', width: 90 },
                { label: '计量单位', value: 'unit', width: 90 },
                { label: '资产分类编码', value: 'assetsFinCategoryCode' },
                { label: '资产分类名称', value: 'assetsFinCategoryName' },
            ]
            break
        case 'itemjob':
            form.api = itemjob
            form.header = [
                { label: '作业编码', value: 'code' },
                { label: '作业名称', value: 'name' },
                { label: '作业分类编码', value: 'itemJobClassCode' },
                { label: '作业分类名称', value: 'itemJobClassName' },
            ]
            break
        case 'eptWork':
            form.api = itemdeptWorkRelation
            form.header = [
                { label: '作业编码', value: 'itemJobCode' },
                { label: '作业名称', value: 'itemJobName' },
                { label: '作业分类编码', value: 'itemJobClassCode' },
                { label: '作业分类名称', value: 'itemJobClassName' },
            ]
            break
        case 'feeRelation':
            form.api = itemfeeRelation
            form.header = [
                { label: '开单科室编码', value: 'orderDeptCode' },
                { label: '开单科室名称', value: 'orderDeptName' },
            ]
            break
        case 'driverresource':
            form.api = itemdriverresource
            form.header = [
                { label: '资源动因编码', value: 'code' },
                { label: '资源动因名称', value: 'name' },
            ]
            break
        case 'driveractivity':
            form.api = itemdriveractivity
            form.header = [
                { label: '作业动因编码', value: 'code' },
                { label: '作业动因名称', value: 'name' },
            ]
            break
        case 'indirectModel':
            form.api = paramindirectModel
            form.header = [
                { label: '核算方法编码', value: 'code' },
                { label: '核算方法名称', value: 'name' },
            ]
            break
        case 'DRGPeriod':
            form.api = pageDRGAccountingPeriod
            form.title = '核算期间'
            form.header = [
                { label: '核算期间编码', value: 'code' },
                { label: '核算期间名称', value: 'name' },
                { label: '开始期间', value: 'beginPeriodName' },
                { label: '结束期间', value: 'endPeriodName' },
            ]
            form.filters = [
                { label: '期间编码/名称', value: 'OrBatchLike#code#name', type: 'input' },
            ]
            break
        case 'DIPPeriod':
            form.api = dipAccountingPeriodPage
            form.title = '核算期间'
            form.header = [
                { label: '核算期间编码', value: 'code' },
                { label: '核算期间名称', value: 'name' },
                { label: '开始期间', value: 'beginPeriodName' },
                { label: '结束期间', value: 'endPeriodName' },
            ]
            form.filters = [
                { label: '期间编码/名称', value: 'OrBatchLike#code#name', type: 'input' },
            ]
            break
        case 'DRGGroup':
            form.api = pageGroupFile
            form.title = 'DRG组'
            form.header = [
                { label: 'DRG组编码', value: 'code' },
                { label: 'DRG组名称', value: 'name' },
                { label: '支付标准', value: 'payStandard' },
            ]
            form.filters = [
                { label: '编码/名称', value: 'OrBatchLike#code#name', type: 'input' },
            ]
            break
        case 'DIPGroup':
            form.api = dipDefinitionPage
            form.title = 'DIP组'
            form.header = [
                { label: 'DIP组编码', value: 'code' },
                { label: 'DIP组名称', value: 'name' },
                { label: '支付标准', value: 'payStandard' },
            ]
            form.filters = [
                { label: '编码/名称', value: 'OrBatchLike#code#name', type: 'input' },
            ]
            break
        case 'DRGServiceUnit':
            form.api = pageDRGServiceUnit
            form.title = '服务单元'
            form.header = [
                { label: '服务单元编码', value: 'code' },
                { label: '服务单元名称', value: 'name' },
            ]
            form.filters = [
                { label: '编码/名称', value: 'OrBatchLike#code#name', type: 'input' },
            ]
            break
        case 'DIPServiceUnit':
            form.api = pageDIPServiceUnit
            form.title = '服务单元'
            form.header = [
                { label: '服务单元编码', value: 'code' },
                { label: '服务单元名称', value: 'name' },
            ]
            form.filters = [
                { label: '编码/名称', value: 'OrBatchLike#code#name', type: 'input' },
            ]
            break
        case 'DRGAggregationParams':
            form.api = pageDRGAggregationParams
            form.title = '归集参数'
            form.header = [
                { label: '归集参数编码', value: 'code' },
                { label: '归集参数名称', value: 'name' },
            ]
            break
        case 'DIPAggregationParams':
            form.api = pageDIPAggregationParams
            form.title = '归集参数'
            form.header = [
                { label: '归集参数编码', value: 'code' },
                { label: '归集参数名称', value: 'name' },
            ]
            break
        case 'DRGAllocationParam':
            form.api = DRGPageAllocationParam
            form.title = '分摊参数'
            form.header = [
                { label: '分摊参数编码', value: 'code' },
                { label: '分摊参数名称', value: 'name' },
            ]
            break
        case 'DIPAllocationParam':
            form.api = DIPpageAllocationParam
            form.title = '分摊参数'
            form.header = [
                { label: '分摊参数编码', value: 'code' },
                { label: '分摊参数名称', value: 'name' },
            ]
            break
        case 'DRGMedicalRecordData':
            form.api = DRGPageMedicalRecordData
            form.title = '病案'
            form.header = [
                { label: '病案号', value: 'medicalRecordNumber' },
                { label: '住院号', value: 'hospitalAdmissionNumber' },
                { label: '出院科室', value: 'dischargeDeptName' },
                { label: '主诊医生', value: 'mainDoctorName' },
                { label: '患者姓名', value: 'patientName' },
                { label: '性别', value: 'sexName' },
                { label: '年龄', value: 'age' },
            ]
            break
        case 'DIPMedicalRecordData':
            form.api = DIPPageMedicalRecordData
            form.title = '病案'
            form.header = [
                { label: '病案号', value: 'medicalRecordNumber' },
                { label: '住院号', value: 'hospitalAdmissionNumber' },
                { label: '出院科室', value: 'dischargeDeptName' },
                { label: '主诊医生', value: 'mainDoctorName' },
                { label: '患者姓名', value: 'patientName' },
                { label: '性别', value: 'sexName' },
                { label: '年龄', value: 'age' },
            ]
            break
        case 'controlIndicators':
            form.api = pageControlIndicators
            form.title = '成本控制指标'
            form.query = { enabledStatus: '1' }
            form.header = [
                { label: '指标代码', value: 'code' },
                { label: '指标名称', value: 'name' },
                { label: '所属指标分类', value: 'classificationName' },
                { label: '取值类型', value: 'valueTypeName' },
            ]
            break
        case 'targetConfig':
            form.api = pageTargetConfig
            form.title = '目标方案'
            form.query = { calculateStatus: '2' }
            form.header = [
                { label: '目标方案编码', value: 'code' },
                { label: '目标方案名称', value: 'name' },
                { label: '开始会计期间', value: 'startPeriodName' },
                { label: '结束会计期间', value: 'endPeriodName' },
            ]
            break
        case 'forecastScheme':
            form.api = pageForecastMethod
            form.title = '预测方案'
            form.query = { confirmStatus: '1' }
            form.header = [
                { label: '预算方案编码', value: 'code' },
                { label: '预算方案名称', value: 'name' },
                { label: '预测年度', value: 'year' },
            ]
            break
        case 'assessmentIndicators':
            form.api = pageAssessmentIndicators
            form.title = '考核指标'
            form.query = { enabledStatus: '1' }
            form.header = [
                { label: '指标代码', value: 'code' },
                { label: '指标名称', value: 'name' },
                { label: '所属指标分类', value: 'classificationName' },
                { label: '指标类型', value: 'typeName' },
                { label: '取值类型', value: 'valueTypeName' },
            ]
            break
        case 'assessmentScheme':
            form.api = pageAssessmentScheme
            form.title = '考核方案'
            form.query = { calculateStatus: '2' }
            form.header = [
                { label: '考核方案编码', value: 'code' },
                { label: '考核方案名称', value: 'name' },
                { label: '开始会计期间', value: 'startPeriodName' },
                { label: '结束会计期间', value: 'endPeriodName' },
            ]
            break
        case 'generalLedgerDataDeptCostDataItem':
            form.title = '部门预算支出经济分类'
            form.api = pageGeneralLedgerDataDeptCostDataItem
            form.filters = [
                { label: '编码', value: 'codeLike', type: 'input' },
                { label: '名称', value: 'nameLike', type: 'input' },
            ]
            form.header = [
                { label: '编码', value: 'code' },
                { label: '名称', value: 'name' },
            ]
            break
        case 'clinicalPathway':
            form.title = '临床路径'
            form.api = pageStandardClinicalPathway
            form.filters = [
                { type: 'input', label: '临床路径编码', value: 'wayCodeLike' },
                { type: 'input', label: '临床路径名称', value: 'wayNameLike' },
            ]
            form.header = [
                { label: '临床路径编码', value: 'wayCode' },
                { label: '临床路径名称', value: 'wayName' },
                { label: '标准住院床日', value: 'standardBedDays' },
                { label: '所属病种', value: 'diseaseDefinitionName' },
            ]
            break
        // 关键因素
        case 'keyFactors':
            form.title = '关键因素'
            form.api = pageProfileConfigKeyFactors
            form.filters = [
            ]
            form.header = [
                { label: '关键因素编码', value: 'code' },
                { label: '关键因素名称', value: 'name' },
            ]
            break
        // 分享当量法选择使用的资产面积
        case 'assetArea':
            form.title = '资产'
            form.api = pageProfileConfigAssetArea
            form.filters = [
            ]
            form.header = [
                { label: '卡片编码', value: 'assetsItemCode' },
                { label: '资产名称', value: 'assetsItemName' },
                { label: '面积(平方米)', value: 'area' },
            ]
            break
        case 'MSProgramRegulateLibrary':
            form.title = '规范服务项目'
            form.api = pageMsProgramRegulateLibrary
            form.query = { leftCatalogId: '-2' }
            form.filters = [
                {label: "项目信息", value: "OrBatchLike#name#code#nameEn", type: 'input',},
                {label: "项目内涵", value: "projectConnotationLike", type: 'input',},
                {label: "项目目录", value: "catalogKeyword", type: 'input',},
            ]
            form.header = [
                {label: '项目编码', value: 'code'},
                {label: '项目名称', value: 'name'},
                {label: '项目英文名称', value: 'nameEn'},
                {label: '项目目录', value: 'catalogName'},
                {label: '项目内涵', value: 'projectConnotation'},
                {label: '必选耗材', value: 'requiredConsumables'},
                {label: '可选耗材', value: 'optionalConsumables'},
                {label: '低值耗材分档', value: 'consumablesClassification'},
                {label: '基本人力消耗及耗时', value: 'manpowerAndTimeConsumption'},
                {label: '项目耗时(分钟)', value: 'timeConsumption'},
                {label: '技术难度', value: 'technicalDifficulty'},
                {label: '风险程度', value: 'riskLevel'},
                {label: '人力资源消耗相对值', value: 'manpowerConsumptionRelativeVal'},
                {label: '计量单位', value: 'measureUnit'},
                {label: '说明', value: 'remark'},
                {label: '特殊情况资源消耗调整系数', value: 'adjustmentCoefficient'},
                {label: '收费票据分类', value: 'billClassification'},
                {label: '会计科目分类', value: 'accountingSubjectsClassification'},
                {label: '病案首页费用分类', value: 'expenseClassification'},
            ]
            break
        // 分享当量法选择使用的资产面积
        case 'workDictionary':
            form.title = '作业字典'
            form.api = itemjob
            form.filters = [
                { label: "作业信息(编码/名称)", value: "keyword", type: 'input' },
            ]
            form.header = [
                {label: '作业编码', value: 'code'},
                {label: '作业名称', value: 'name'},
                {label: '所属作业分类', value: 'itemJobClassName'},
                {label: '是否人工作业', value: 'isPersonConfigName'},
                {label: '是否设备作业', value: 'isEquipmentConfigName'},
            ]
            break
    }


    return form;
}

