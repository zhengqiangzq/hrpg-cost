<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import {useStorage} from "@vueuse/core";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

import {itemProductCostDetailExportDetailExcell, itemProductCostDetailpage} from "@/api/materialCosts";
const {proxy} = getCurrentInstance()
const emit = defineEmits()
const setting = useStorage('setting', {}, sessionStorage)
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const filterInfo = ref({
  query: {
    orgId: setting.value.hospitalId,
  },
  data: {
  },
  list: [
    { label: '核算期间', value: 'checkPeriodName', showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '资金来源', value: 'fundSource', type: 'select-model', multiple: true, code: 'asset_capital_source' },
    { label: '是否收费', value: 'isCharge', type: 'select-model', code: 'yes_or_no' },
    { label: '物资分类', value: 'productFinCategoryName', showLabel: true, type: 'slot' },
    { label: '汇总显示', value: 'isGroup', type: 'checkbox' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission('costData:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', width: 155, value: 'docNum' },
    { label: '核算期间', value: 'periodName' },
    { label: '开始会计期间', value: 'beginPeriodName' },
    { label: '结束会计期间', value: 'endPeriodName' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '物资编码', value: 'productCode' },
    { label: '物资名称', value: 'productName' },
    { label: '物资分类编码', value: 'productFinCategoryCode' },
    { label: '物资分类名称', value: 'productFinCategoryName' },
    { label: '资金来源', value: 'fundSourceName' },
    { label: '是否收费', value: 'isChargeName' },
    { label: '数量', value: 'qty', align: 'center' },
    { label: '单价', value: 'unitPrice', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.unitPrice) },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
    { value: 'qty', formatter: proxy.$fn.TripartiteMethod },
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
})
const detailsInfo = ref({
  visible: false,
})
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})
const { tableParameter, openDialog } = useSelectTableData()

const pageFilterRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue) // 更新父组件visible
  },
})

onMounted(() => {
  tableInfo.value.api = itemProductCostDetailpage
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    isGroup: filterInfo.value.query.isGroup ? '1' : '0',
    fundSourceList: filterInfo.value.query.fundSource ? filterInfo.value.query.fundSource.split(',') : []
  }
  if(filterInfo.value.query.isGroup) {
    tableInfo.value.fieldList = [
      { label: '核算期间', value: 'periodName' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '物资分类编码', value: 'productFinCategoryCode' },
      { label: '物资分类名称', value: 'productFinCategoryName' },
      { label: '资金来源', value: 'fundSourceName' },
      { label: '数量', value: 'qty' },
      { label: '金额', value: 'money' },
    ]
  } else {
    tableInfo.value.fieldList = [
      { label: '单据号', value: 'docNum' },
      { label: '核算期间', value: 'periodName' },
      { label: '开始会计期间', value: 'beginPeriodName' },
      { label: '结束会计期间', value: 'endPeriodName' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '物资编码', value: 'productCode' },
      { label: '物资名称', value: 'productName' },
      { label: '物资分类编码', value: 'productFinCategoryCode' },
      { label: '物资分类名称', value: 'productFinCategoryName' },
      { label: '资金来源', value: 'fundSourceName' },
      { label: '是否收费', value: 'isChargeName' },
      { label: '数量', value: 'qty' },
      { label: '单价', value: 'unitPrice' },
      { label: '金额', value: 'money' },
      { label: '备注', value: 'remark' },
    ]
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {
    orgId: setting.value.hospitalId,
    isGroup: false
  }
  getList()
}

function openAccountingPeriodSelector() {
  tableParameter.title = '核算期间'
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.query = {}
  tableParameter.filters = []
  tableParameter.callBack = accountingPeriodCallback
  openDialog(pageFilterRef.value)
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.checkPeriodId = raw.id
  filterInfo.value.query.checkPeriodName = raw.name
}


function exportData() {
  itemProductCostDetailExportDetailExcell(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function openCategorySelector() {
  treeInfo.value.title = '物资分类'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  treeInfo.value.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.productFinCategoryName = datas?.map((it) => it.name);
  filterInfo.value.query.productFinCategoryIdList = datas?.map((it) => it.id);
}
const deptInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})
function openDeptSelector() {
  deptInfo.value.visible = true
}
function treedeptCallback(raw) {
  deptInfo.value.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptName = datas?.map((it) => it.name);
  filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
}

</script>

<template>
  <div class="view-fill">
    <div class="layui-card layui-col-md12" v-if="!detailsInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab otherTab" @click="showDialog = false">列表页</div>
          <div class="tab currentTab">明细页</div>
        </div>
        <div>
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="pageFilterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-productFinCategoryName>
              <el-input
                  v-model="filterInfo.query.productFinCategoryName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择物资分类"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCategorySelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-deptName>
              <el-input
                  v-model="filterInfo.query.deptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-checkPeriodName>
              <el-input
                  v-model="filterInfo.query.checkPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择会计期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="true"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :check-box="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
        >
        </table-container>
      </div>
    </div>
    <Details
        v-if="detailsInfo.visible"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
    <SelectMaterialTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :checkedList="treeInfo.checkedList"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
    <SelectProDeptTree
        v-if="deptInfo.visible"
        v-model:showDialog="deptInfo.visible"
        :title="deptInfo.title"
        :checkStrictly="deptInfo.checkStrictly"
        :isLeaf="deptInfo.isLeaf"
        :query="deptInfo.query"
        :checkBox="deptInfo.checkBox"
        :checkedList="deptInfo.checkedList"
        :api="deptInfo.api"
        :highlight-current="true"
        @callback="treedeptCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
