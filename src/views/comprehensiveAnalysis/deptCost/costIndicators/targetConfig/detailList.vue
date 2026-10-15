<script setup>
import {computed, getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import Modify from './modify.vue';
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {sectiontree} from "@/api/accountingDepartment";
import {exportDetailListTargetConfig, pageDetailListTargetConfig} from "@/api/deptCost/targetConfig";

const emits = defineEmits(['update:visible'])
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'deptCost:targetConfig'
const API = {
  query: pageDetailListTargetConfig,
  export: exportDetailListTargetConfig
}

const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '目标方案', value: 'configKeyword', type: 'input' },
    { label: '控制指标', value: 'indicatorsKeyword', type: 'input' },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: exportData }
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '目标方案编码', value: 'configCode' },
    { label: '目标方案名称', value: 'configName' },
    { label: '开始会计期间', value: 'startPeriodName' },
    { label: '结束会计期间', value: 'endPeriodName' },
    { label: '指标代码', value: 'indicatorsCode' },
    { label: '指标名称', value: 'indicatorsName' },
    { label: '指标分类', value: 'classificationName' },
    { label: '目标值', value: 'value', align: 'center' },
  ],
  data: [],
  summaryFieldList: [
    { value: 'value', formatter: proxy.$fn.TripartiteMethod },
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
  checkBox: false,
  checkStrictly: true,
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
  filterInfo.copyQuery = cloneDeep(filterInfo.query)
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

function exportData() {
  API.export(filterInfo.query).then((resp) => {
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

function openFeeCategorySelector() {
  tableParameter.type = 'feeCategory'
  tableParameter.query = {
    status: '1'
  }
  tableParameter.callBack = feeCategoryCallback
  openDialog(filterRef.value)
}
function feeCategoryCallback(raw) {
  filterInfo.query.feeCategoryId = raw.id
  filterInfo.query.feeCategoryName = raw.name
}

function openChargeItemSelector() {
  tableParameter.type = 'feeItem'
  tableParameter.query = {
    status: '1',
    accountingStatus: 1
  }
  tableParameter.callBack = chargeItemCallback
  openDialog(filterRef.value)
}
function chargeItemCallback(raw) {
  filterInfo.query.chargeItemId = raw.id
  filterInfo.query.chargeItemName = raw.name
}

function openDeptSelector(mark) {
  deptTreeInfo.checkBox = false
  deptTreeInfo.mark = mark
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  if (deptTreeInfo.mark === 'execute') {
    filterInfo.query.executeDeptId = raw.id
    filterInfo.query.executeDeptName = raw.name
  } else {
    filterInfo.query.orderDeptId = raw.id
    filterInfo.query.orderDeptName = raw.name
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
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
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
        :sectionAttributeNot="1"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
