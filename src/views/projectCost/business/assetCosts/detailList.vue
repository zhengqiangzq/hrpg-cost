<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import {useStorage} from "@vueuse/core";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

import {
  itemAssetsCostDetailExportDetailExcell,
  itemAssetsCostDetailpage
} from "@/api/assetCosts";
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
    { label: '核算期间', value: 'checkPeriodName', showLabel: true, type: 'slot'},
    { label: '科室名称', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '资金来源', value: 'fundSource', type: 'select-model', multiple: true, code: 'asset_capital_source' },
    { label: '资产分类', value: 'assetsFinCategoryName', showLabel: true, type: 'slot' },
    { label: '资产卡片', value: 'assetsItemName', showLabel: true, type: 'slot'},
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
    { label: '单据号', value: 'docNum' },
    { label: '核算期间', value: 'periodName' },
    { label: '开始会计期间', value: 'beginPeriodName' },
    { label: '结束会计期间', value: 'endPeriodName' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '资产编码', value: 'assetsItemCode' },
    { label: '资产名称', value: 'assetsItemName' },
    { label: '资产分类编码', value: 'assetsFinCategoryCode' },
    { label: '资产分类名称', value: 'assetsFinCategoryName' },
    { label: '资金来源', value: 'fundSourceName' },
    { label: '原值', value: 'originalAmount', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.originalAmount) },
    { label: '累计折旧', value: 'totalDepreciationAmount', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalDepreciationAmount) },
    { label: '月折旧金额', value: 'epreciationAmount', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.epreciationAmount) },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
    { value: 'originalAmount', formatter: proxy.$fn.TripartiteMethod },
    { value: 'totalDepreciationAmount', formatter: proxy.$fn.TripartiteMethod },
    { value: 'epreciationAmount', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
})
const detailsInfo = ref({
  visible: false,
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
  tableInfo.value.api = itemAssetsCostDetailpage
  getList()
})

function getList() {
  const times = (filterInfo.value.query.docTime || ',').split(',')
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    start: times[0],
    end: times[1],
    isGroup: filterInfo.value.query.isGroup ? '1' : '0',
    docTime: undefined,
    fundSourceList: filterInfo.value.query.fundSource ? filterInfo.value.query.fundSource.split(',') : []
  }
  delete filterInfo.value.copyQuery.deptName
  if(filterInfo.value.query.isGroup) {
    tableInfo.value.fieldList = [
      { label: '核算期间', value: 'periodName' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '资产分类编码', value: 'assetsFinCategoryCode' },
      { label: '资产分类名称', value: 'assetsFinCategoryName' },
      { label: '资金来源', value: 'fundSourceName' },
      { label: '原值', value: 'originalAmount' },
      { label: '累计折旧', value: 'totalDepreciationAmount' },
      { label: '月折旧金额', value: 'epreciationAmount' },
    ]
  } else {
    tableInfo.value.fieldList = [
      { label: '单据号', value: 'docNum' },
      { label: '核算期间', value: 'periodName' },
      { label: '开始会计期间', value: 'beginPeriodName' },
      { label: '结束会计期间', value: 'endPeriodName' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '资产编码', value: 'assetsItemCode' },
      { label: '资产名称', value: 'assetsItemName' },
      { label: '资产分类编码', value: 'assetsFinCategoryCode' },
      { label: '资产分类名称', value: 'assetsFinCategoryName' },
      { label: '资金来源', value: 'fundSourceName' },
      { label: '原值', value: 'originalAmount' },
      { label: '累计折旧', value: 'totalDepreciationAmount' },
      { label: '月折旧金额', value: 'epreciationAmount' },
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

function openFeeItemSelector() {
  tableParameter.title = '资产卡片'
  tableParameter.visible = true
  tableParameter.checkBox = false
  tableParameter.type = 'assets'
  tableParameter.query = { status: 1, assetsFinCategoryId: filterInfo.value.query?.assetsFinCategoryId }
  tableParameter.callBack = feeItemCallback
  openDialog(pageFilterRef.value, 'table')
}
function feeItemCallback(raw) {
  filterInfo.value.query.assetsItemId = raw.id
  filterInfo.value.query.assetsItemName = raw.name
}

function exportData() {
  itemAssetsCostDetailExportDetailExcell(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

const treeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})
function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  treeInfo.value.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptId = datas?.map((it) => it.id);
  filterInfo.value.query.deptName = datas?.map((it) => it.name);
  filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
}

const assetsInfo = ref({
  title: '资产分类',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})
function openassetsSelector() {
  assetsInfo.value.visible = true
}
function treeassetsCallback(raw) {
  assetsInfo.value.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.assetsFinCategoryId = datas?.map((it) => it.id);
  filterInfo.value.query.assetsFinCategoryName = datas?.map((it) => it.name);
  filterInfo.value.query.assetsFinCategoryIdList = datas?.map((it) => it.id);
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
            <template #filter-assetsFinCategoryName>
              <el-input
                  v-model="filterInfo.query.assetsFinCategoryName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择资产分类"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openassetsSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-assetsItemName>
              <el-input
                  v-model="filterInfo.query.assetsItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择资产卡片"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openFeeItemSelector"><Search /></el-icon>
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
    <SelectProDeptTree
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
    <SelectAssetsTree
        v-if="assetsInfo.visible"
        v-model:showDialog="assetsInfo.visible"
        :title="assetsInfo.title"
        :checkStrictly="assetsInfo.checkStrictly"
        :isLeaf="assetsInfo.isLeaf"
        :query="assetsInfo.query"
        :checkBox="assetsInfo.checkBox"
        :api="assetsInfo.api"
        :highlight-current="true"
        @callback="treeassetsCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
