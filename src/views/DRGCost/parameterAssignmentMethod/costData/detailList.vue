<script setup>
import {computed, getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import Modify from './modify.vue';
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {sectiontree} from "@/api/accountingDepartment";
import {exportCostDataDetailPage, pageCostDataDetailPage} from "@/api/DRGCostParameterCostData";

const emits = defineEmits(['update:visible'])
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'DRGParameterCostData'
const API = {
  query: pageCostDataDetailPage,
  export: exportCostDataDetailPage
}

const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '资金来源', value: 'capitalSource', type: 'select-model', multiple: true, code: 'asset_capital_source' },
    { label: '成本分类', value: 'costCategoryName', showLabel: true, type: 'slot' },
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot' },
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
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类', value: 'costCategoryName' },
    { label: '资金来源', value: 'capitalSourceName' },
    { label: '总金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '直接成本', value: 'directCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directCost) },
    { label: '间接成本', value: 'indirectCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.indirectCost) },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  summaryFieldList: [
    { value: 'directCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'indirectCost', formatter: proxy.$fn.TripartiteMethod },
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
  query: {},
  checkedList: []
})

const costTypeInfo = reactive({
  title: '成本分类',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
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
    capitalSource: null,
    capitalSourceList: filterInfo.query.capitalSource ? filterInfo.query.capitalSource.split(',') : []
  })
  delete filterInfo.copyQuery.deptId
  delete filterInfo.copyQuery.deptName
  delete filterInfo.copyQuery.costCategoryId
  delete filterInfo.copyQuery.costCategoryName
  if(filterInfo.query.isGroup) {
    tableInfo.fieldList = [
      { label: '核算期间', value: 'accountingPeriodName' },
      { label: '开始会计期间', value: 'startPeriod' },
      { label: '结束会计期间', value: 'endPeriod' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '成本分类编码', value: 'costCategoryCode' },
      { label: '成本分类名称', value: 'costCategoryName' },
      { label: '资金来源', value: 'capitalSourceName' },
      { label: '总金额', value: 'money' },
      { label: '直接成本', value: 'directCost' },
      { label: '间接成本', value: 'indirectCost' },
    ]
  } else {
    tableInfo.fieldList = [
      { label: '单据号', value: 'orderNo' },
      { label: '核算期间', value: 'accountingPeriodName' },
      { label: '开始会计期间', value: 'startPeriod' },
      { label: '结束会计期间', value: 'endPeriod' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '成本项目编码', value: 'costItemCode' },
      { label: '成本项目名称', value: 'costItemName' },
      { label: '成本分类', value: 'costCategoryName' },
      { label: '资金来源', value: 'capitalSourceName' },
      { label: '总金额', value: 'money' },
      { label: '直接成本', value: 'directCost' },
      { label: '间接成本', value: 'indirectCost' },
      { label: '备注', value: 'remark' },
    ]
  }
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {isGroup:false}
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
  tableParameter.type = 'DRGPeriod'
  tableParameter.checkBox = false
  tableParameter.query = {
    status: '1'
  }
  tableParameter.callBack = accountingPeriodCallback
  openDialog(filterRef.value)
}
function accountingPeriodCallback(raw) {
  filterInfo.query.accountingPeriodId = raw.id
  filterInfo.query.accountingPeriodName = raw.name
}

function openCostCategorySelector() {
  costTypeInfo.visible = true
}
function costCategoryCallback(raw) {
  costTypeInfo.checkedList = raw;
  let datas = raw?.filter((it) => !it.children)
  filterInfo.query.costCategoryId = datas?.map((it) => it.id)
  filterInfo.query.costCategoryIdList = datas?.map((it) => it.id)
  filterInfo.query.costCategoryName = datas?.map((it) => it.name)
}

function openCostItemSelector() {
  tableParameter.type = 'costItem'
  tableParameter.checkBox = true
  tableParameter.query = {
    status: '1',
    last: true,
    diseaseAccountStatus: 1
  }
  tableParameter.callBack = costItemCallback
  openDialog(filterRef.value)
}
function costItemCallback(raw) {
  tableParameter.checkedList = raw
  filterInfo.query.costItemIdList = raw?.map((it) => it.id);
  filterInfo.query.costItemName = raw?.map((it) => it.name).join(',');
}

function openDeptSelector() {
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  deptTreeInfo.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList && checkPropCondition(it))
  filterInfo.query.deptIdList = datas?.map((it) => it.id)
  filterInfo.query.deptName = datas?.map((it) => it.name)
}
function checkPropCondition(it) {
  return (it.accountAttribute == 1) && (it.diseaseAccountStatus == 1) && (it.sectionAttribute != 1)
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
            <template #filter-costCategoryName>
              <el-input
                  v-model="filterInfo.query.costCategoryName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择成本分类"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCostCategorySelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-costItemName>
              <el-input
                  v-model="filterInfo.query.costItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择成本项目"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCostItemSelector"><Search /></el-icon>
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
        :checkedList="deptTreeInfo.checkedList"
        :api="deptTreeInfo.api"
        :accountAttribute="1"
        :diseaseAccountStatus="1"
        :sectionAttributeNot="1"
        :highlight-current="true"
        @callback="treeCallback" />
    <SelectCostType
        v-if="costTypeInfo.visible"
        v-model:showDialog="costTypeInfo.visible"
        :title="costTypeInfo.title"
        :checkStrictly="costTypeInfo.checkStrictly"
        :isLeaf="costTypeInfo.isLeaf"
        :checkedList="costTypeInfo.checkedList"
        :query="costTypeInfo.query"
        :checkBox="costTypeInfo.checkBox"
        @callback="costCategoryCallback"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
