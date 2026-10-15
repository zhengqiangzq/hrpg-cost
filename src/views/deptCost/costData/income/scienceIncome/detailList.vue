<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import moment from "moment";
import {financeAndEducdetailexportDetailExcel, financeAndEducDetailpage} from "@/api/scienceIncome";
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
    { label: '会计期间', value: 'accountingPeriod', showLabel: true, type: 'slot', event: getList },
    { label: '业务开始日期', value: 'businessTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'businessTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '单据号', value: 'docNum', type: 'input', event: getList },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot', event: getList },
    { label: '收入项目', value: 'incomeItemName', showLabel: true, type: 'slot', event: getList },
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
    { label: '业务日期', value: 'businessTime', formatter: (row) => moment(row.businessTime).format('YYYY-MM-DD') },
    { label: '会计期间', value: 'accountingPeriod' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '收入项目名称', value: 'incomeItemValue' },
    { label: '资金来源', value: 'fundSourceName' },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
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
  checkedList: []
})

const treeParameter = ref({
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  title: '收入项目',
  query: {
    name: ''
  },
  checkedList: []
})
const tableParameter = ref({
  visible: false,
  type: 'accountingPeriod',
  title: '会计期间',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {
    sort: 'begin_date desc'
  }
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
  tableInfo.value.api = financeAndEducDetailpage
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {}
  getList()
}

function detail(row) {
  detailsInfo.value.id = row.deptIncomeId
  detailsInfo.value.visible = true
}

function openAccountingPeriodSelector() {
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.accountingPeriod = raw.periodYearAndMonth
  filterInfo.value.query.accountingPeriodId = raw.id
}

function openFeeItemSelector() {
  treeParameter.value.visible = true
}
function feeItemCallback(raw) {
  treeParameter.value.checkedList = raw;
  filterInfo.value.query.incomeItemIdList = raw.map((it) => it.id)
  filterInfo.value.query.incomeItemName = raw.map((it) => it.name).join(',')
}

function exportData() {
  financeAndEducdetailexportDetailExcel(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
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
            <template #filter-incomeItemName>
              <el-input
                  v-model="filterInfo.query.incomeItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择收入项目"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openFeeItemSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-accountingPeriod>
              <el-input
                  v-model="filterInfo.query.accountingPeriod"
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
    <SelectIncomeProject
        v-if="treeParameter.visible"
        v-model:showDialog="treeParameter.visible"
        :title="treeParameter.title"
        :checkStrictly="treeParameter.checkStrictly"
        :isLeaf="treeParameter.isLeaf"
        :query="treeParameter.query"
        :checkBox="treeParameter.checkBox"
        :checkedList="treeParameter.checkedList"
        :api="treeParameter.api"
        :highlight-current="true"
        @callback="feeItemCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
