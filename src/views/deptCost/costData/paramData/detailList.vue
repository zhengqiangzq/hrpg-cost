<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import moment from "moment";
import {exportParamDataDetailList, pageParamDataDetail} from "@/api/paramData";
import {getMonthFrist, getToDay} from "@/utils/slp";
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
    businessTimeStart: getMonthFrist(),
    businessTimeEnd: getToDay(),
  },
  list: [
    { label: '会计期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '业务开始日期', value: 'businessTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'businessTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '单据号', value: 'docNum', type: 'input' },
    { label: '服务科室信息', value: 'sourceDeptName', showLabel: true, type: 'slot' },
    { label: '收益科室信息', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '分摊参数', value: 'apportionmentParamName', showLabel: true, type: 'slot' },
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
    { label: '单据号', value: 'docNum', type: 'slot' },
    { label: '业务日期', value: 'businessTime', formatter: (row) => moment(row.businessTime).format('YYYY-MM-DD') },
    { label: '会计期间', value: 'accountingPeriodValue' },
    { label: '分摊参数', value: 'apportionmentParamName' },
    { label: '服务科室编码', value: 'sourceDeptCode' },
    { label: '服务科室名称', value: 'sourceDeptName' },
    { label: '收益科室编码', value: 'deptCode' },
    { label: '收益科室名称', value: 'deptName' },
    { label: '参数值', value: 'paramValue', align: 'center' },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
    { value: 'paramValue', formatter: proxy.$fn.TripartiteMethod },
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
  query: {}
})
const tableParameter = ref({
  visible: false,
  type: '',
  title: '成本项目',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {}
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
  tableInfo.value.api = pageParamDataDetail
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {
    businessTimeStart: getMonthFrist(),
    businessTimeEnd: getToDay(),}
  getList()
}

function detail(row) {
  detailsInfo.value.id = row.deptParamId
  detailsInfo.value.visible = true
}

function openAccountingPeriodSelector() {
  tableParameter.value.title = '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.query.sort = 'begin_date desc'
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.accountingPeriodId = raw.id
  filterInfo.value.query.accountingPeriodName = raw.periodYearAndMonth
}

function openApportionmentParamSelector() {
  tableParameter.value.title = '分摊参数'
  tableParameter.value.visible = true
  tableParameter.value.checkBox = false
  tableParameter.value.pager = false
  tableParameter.value.type = 'allocationParam'
  tableParameter.value.query = { status: 1 }
  tableParameter.value.callBack = apportionmentParamCallback
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}
function apportionmentParamCallback(raw) {
  filterInfo.value.query.apportionmentParamId = raw.id
  filterInfo.value.query.apportionmentParamName = raw.name
}

function exportData() {
  exportParamDataDetailList(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function openDeptSelector(target) {
  treeInfo.value.target = target
  treeInfo.value.title = target === 'source' ? '服务科室' : '收益科室'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  const datas = raw?.filter((it) => !it.childList)
  if (treeInfo.value.target === 'source') {
    filterInfo.value.query.sourceDeptId = datas?.map((it) => it.id);
    filterInfo.value.query.sourceDeptName = datas?.map((it) => it.name);
    filterInfo.value.query.sourceDeptIdList = datas?.map((it) => it.id);
  } else {
    filterInfo.value.query.deptId = datas?.map((it) => it.id);
    filterInfo.value.query.deptName = datas?.map((it) => it.name);
    filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
  }
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
            <template #filter-apportionmentParamName>
              <el-input
                  v-model="filterInfo.query.apportionmentParamName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择分摊参数"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openApportionmentParamSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-accountingPeriodName>
              <el-input
                  v-model="filterInfo.query.accountingPeriodName"
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
                  placeholder="请选择收益科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector('')"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-sourceDeptName>
              <el-input
                  v-model="filterInfo.query.sourceDeptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择服务科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector('source')"><Search /></el-icon>
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
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
