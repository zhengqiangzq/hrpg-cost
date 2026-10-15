<script setup>
import {computed, getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import Modify from './modify.vue';
import {exportDetailPageChargeData, pageDetailPageChargeData} from "@/api/DIPCost/DIPCostChargeData";
import moment from "moment";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {sectiontree} from "@/api/accountingDepartment";

const emits = defineEmits(['update:visible'])
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'DIPCostChargeData'
const API = {
  query: pageDetailPageChargeData,
  export: exportDetailPageChargeData
}

const filterRef = ref()
const chargeType = ref([])
const chargePro = ref([])
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '单据号', value: 'orderNo', type: 'input' },
    { label: '住院号', value: 'hospitalAdmissionNumber', type: 'input' },
    { label: '收费类别', value: 'feeCategoryName', showLabel: true, type: 'slot' },
    { label: '收费项目', value: 'chargeItemName', showLabel: true, type: 'slot' },
    { label: '开单科室', value: 'orderDeptName', showLabel: true, type: 'slot' },
    { label: '执行科室', value: 'executeDeptName', showLabel: true, type: 'slot' },
    { label: '汇总显示', value: 'isGroup', type: 'checkbox' },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: exportData }
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '单据号', value: 'orderNo' },
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '开始会计期间', value: 'startPeriod' },
    { label: '结束会计期间', value: 'endPeriod' },
    { label: '开单日期', value: 'billDate', formatter: (row) => moment(row.billDate).format('YYYY-MM-DD') },
    { label: '住院号', value: 'hospitalAdmissionNumber' },
    { label: '开单科室编码', value: 'orderDeptCode' },
    { label: '开单科室名称', value: 'orderDeptName' },
    { label: '收费项目编码', value: 'chargeItemCode' },
    { label: '收费项目名称', value: 'chargeItemName' },
    { label: '收费类别编码', value: 'feeCategoryCode' },
    { label: '收费类别名称', value: 'feeCategoryName' },
    { label: '执行科室编码', value: 'executeDeptCode' },
    { label: '执行科室名称', value: 'executeDeptName' },
    { label: '数量', value: 'qty', align: 'center' },
    { label: '单价', value: 'unitPrice', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.unitPrice) },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
  ],
  data: [],
  summaryFieldList: [
    { value: 'qty', formatter: proxy.$fn.TripartiteMethod },
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  handle: null,
  sectionRows: []
})
const modifyInfo = reactive({
  id: null,
  title: '编辑',
  batch: false,
  visible: false
})

// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  mark: null,
  api: sectiontree,
  query: {}
})

const { tableParameter, openDialog } = useSelectTableData()

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emits('update:visible', newValue) // 更新父组件visible
  },
})

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    isGroup: filterInfo.query.isGroup ? '1' : '0',
  })
  delete filterInfo.copyQuery.executeDeptId
  delete filterInfo.copyQuery.executeDeptName
  delete filterInfo.copyQuery.orderDeptId
  delete filterInfo.copyQuery.orderDeptName
  if(filterInfo.query.isGroup) {
    tableInfo.fieldList = [
      { label: '核算期间', value: 'accountingPeriodName' },
      { label: '开始会计期间', value: 'startPeriod' },
      { label: '结束会计期间', value: 'endPeriod' },
      { label: '开单科室编码', value: 'orderDeptCode' },
      { label: '开单科室名称', value: 'orderDeptName' },
      { label: '收费项目编码', value: 'chargeItemCode' },
      { label: '收费项目名称', value: 'chargeItemName' },
      { label: '收费类别编码', value: 'feeCategoryCode' },
      { label: '收费类别名称', value: 'feeCategoryName' },
      { label: '执行科室编码', value: 'executeDeptCode' },
      { label: '执行科室名称', value: 'executeDeptName' },
      { label: '数量', value: 'qty' },
      { label: '金额', value: 'money' },
    ]
  } else {
    tableInfo.fieldList = [
      { label: '单据号', value: 'orderNo' },
      { label: '核算期间', value: 'accountingPeriodName' },
      { label: '开始会计期间', value: 'startPeriod' },
      { label: '结束会计期间', value: 'endPeriod' },
      { label: '开单日期', value: 'billDate', formatter: (row) => moment(row.billDate).format('YYYY-MM-DD') },
      { label: '住院号', value: 'hospitalAdmissionNumber' },
      { label: '开单科室编码', value: 'orderDeptCode' },
      { label: '开单科室名称', value: 'orderDeptName' },
      { label: '收费项目编码', value: 'chargeItemCode' },
      { label: '收费项目名称', value: 'chargeItemName' },
      { label: '收费类别编码', value: 'feeCategoryCode' },
      { label: '收费类别名称', value: 'feeCategoryName' },
      { label: '执行科室编码', value: 'executeDeptCode' },
      { label: '执行科室名称', value: 'executeDeptName' },
      { label: '数量', value: 'qty', align: 'center' },
      { label: '单价', value: 'unitPrice', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.unitPrice) },
      { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    ]
  }
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {isGroup: false}
  getList()
}

function exportData() {
  API.export(filterInfo.copyQuery).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function openAccountingPeriodSelector() {
  tableParameter.type = 'DIPPeriod'
  tableParameter.query = {
    status: '1'
  }
  tableParameter.checkBox = false;
  tableParameter.callBack = accountingPeriodCallback
  openDialog(filterRef.value)
}
function accountingPeriodCallback(raw) {
  filterInfo.query.accountingPeriodId = raw.id
  filterInfo.query.accountingPeriodName = raw.name
}

function openFeeCategorySelector() {
  tableParameter.type = 'feeCategory'
  tableParameter.query = {
    status: '1'
  }
  tableParameter.checkBox = true;
  tableParameter.checkedList = chargeType.value;
  tableParameter.callBack = feeCategoryCallback
  openDialog(filterRef.value)
}
function feeCategoryCallback(raw) {
  chargeType.value = raw;
  filterInfo.query.feeCategoryIdList = raw?.map((it) => it.id);
  filterInfo.query.feeCategoryName = raw?.map((it) => it.name).join(',');
}

function openChargeItemSelector() {
  tableParameter.type = 'feeItem'
  tableParameter.query = {
    status: '1',
    accountingStatus: 1
  }
  tableParameter.checkBox = true;
  tableParameter.checkedList = chargePro.value;
  tableParameter.callBack = chargeItemCallback
  openDialog(filterRef.value)
}
function chargeItemCallback(raw) {
  chargePro.value = raw;
  filterInfo.query.chargeItemIdList = raw?.map((it) => it.id);
  filterInfo.query.chargeItemName = raw?.map((it) => it.name).join(',');
}

function openDeptSelector(mark) {
  deptTreeInfo.checkBox = true
  deptTreeInfo.mark = mark
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  let datas = raw?.filter((it) => !it.childList)
  if (deptTreeInfo.mark === 'execute') {
    filterInfo.query.executeDeptIdList = datas?.map((it) => it.id)
    filterInfo.query.executeDeptName = datas?.map((it) => it.name)
  } else {
    filterInfo.query.orderDeptIdList = datas?.map((it) => it.id)
    filterInfo.query.orderDeptName = datas?.map((it) => it.name)
  }
}
</script>

<template>
  <div className="view-fill">
    <div class="layui-card layui-col-md12" v-if="!modifyInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab otherTab" @click="showDialog = false">列表页</div>
          <div class="tab currentTab">明细页</div>
        </div>
        <div>
        <div class="filter-wrapper">
          <PageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          >
            <template #filter-accountingPeriodName>
              <el-input
                  v-model="filterInfo.query.accountingPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-feeCategoryName>
              <el-input
                  v-model="filterInfo.query.feeCategoryName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择收费类别"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openFeeCategorySelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-chargeItemName>
              <el-input
                  v-model="filterInfo.query.chargeItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择收费项目"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openChargeItemSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-orderDeptName>
              <el-input
                  v-model="filterInfo.query.orderDeptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择开单科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector()"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-executeDeptName>
              <el-input
                  v-model="filterInfo.query.executeDeptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择执行科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector('execute')"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </PageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        </div>
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :check-box="false"
            :summary="true"
            :summaryFieldList="tableInfo.summaryFieldList"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <Modify
        v-if="modifyInfo.visible"
        v-model:visible="modifyInfo.visible"
        :id="modifyInfo.id"
        :batch="modifyInfo.batch"
        :title="modifyInfo.title"
        @returnModify="getList"
    />
    <!--    查询核算科室-->
    <SelectDeptArchivesTree
        v-if="deptTreeInfo.visible"
        v-model:showDialog="deptTreeInfo.visible"
        :title="deptTreeInfo.title"
        :checkStrictly="deptTreeInfo.checkStrictly"
        :isLeaf="deptTreeInfo.isLeaf"
        :query="deptTreeInfo.query"
        :checkBox="deptTreeInfo.checkBox"
        :api="deptTreeInfo.api"
        :accountAttribute="1"
        :diseaseAccountStatus="1"
        :sectionAttributeNot="1"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
