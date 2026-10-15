<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import {deptRiskFundCostDetailexportExcelDetail, deptRiskFundCostDetailpage} from "@/api/deptCost/costData/riskFund";
const {proxy} = getCurrentInstance()
const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const filterInfo = ref({
  query: {
  },
  data: {
  },
  list: [
    { label: '会计期间', value: 'periodName', showLabel: true, type: 'slot' },
    { label: '科室名称', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '汇总显示', value: 'isGroup', type: 'checkbox' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission('riskFund:detailexport'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum' },
    { label: '会计期间', value: 'periodName' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '开单收入', value: 'income', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.income) },
    { label: '成本项目', value: 'costItemName' },
    { label: '资金来源', value: 'fundSourceName' },
    { label: '计提金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
})
const detailsInfo = ref({
  visible: false,
})
const treeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: [],
})
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
  tableInfo.value.api = deptRiskFundCostDetailpage
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    isGroup: filterInfo.value.query.isGroup ? '1' : '0'
  }
  if(filterInfo.value.query.isGroup) {
    tableInfo.value.fieldList = [
      { label: '会计期间', value: 'periodName' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '成本分类编码', value: 'costCategoryCode' },
      { label: '成本分类名称', value: 'costCategoryName' },
      { label: '资金来源', value: 'fundSourceName' },
      { label: '计提金额', value: 'money' },
    ]
  } else {
    tableInfo.value.fieldList = [
      { label: '单据号', value: 'docNum' },
      { label: '会计期间', value: 'periodName' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '开单收入', value: 'income' },
      { label: '成本项目', value: 'costItemName' },
      { label: '资金来源', value: 'fundSourceName' },
      { label: '计提金额', value: 'money' },
      { label: '备注', value: 'remark' },
    ]
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {
    isGroup: false,
  }
  getList()
}

function detail(row) {
  detailsInfo.value.id = row.deptIncomeId
  detailsInfo.value.visible = true
}

function exportData() {
  deptRiskFundCostDetailexportExcelDetail({
    ...filterInfo.value.query,
    isGroup: filterInfo.value.query.isGroup ? '1' : '0'
  }).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  treeInfo.value.checkedList = raw
  const datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptId = datas?.map((it) => it.id);
  filterInfo.value.query.deptName = datas?.map((it) => it.name);
  filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
}
const tableParameter = ref({
  visible: false,
  type: 'accountingPeriod',
  title: '会计期间',
  checkBox: false,
  pager: true,
  callback: null,
  filters: [],
  fieldList: [],
  query: {}
})

function openAccountingPeriodSelector() {
  tableParameter.value.query.sort = 'begin_date desc'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.periodId = raw.id
  filterInfo.value.query.periodName = raw.periodYearAndMonth
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
            <template #filter-periodName>
              <el-input
                  v-model="filterInfo.query.periodName"
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
                  placeholder="请选择科室名称"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
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
          <template #col-docNum="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.docNum }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <Details
        v-if="detailsInfo.visible"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
    <SelectDeptArchivesTree
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
  </div>
</template>

<style scoped lang="scss">

</style>
