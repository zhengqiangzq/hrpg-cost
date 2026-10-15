<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import Modify from './modify.vue';
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {exportParamsDataDetailPage, pageParamsDataDetailPage} from "@/api/DIPCost/DIPCostServiceUnitParamsData";

const emits = defineEmits(['update:visible'])
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'DIPCostServiceUnitParamsData'
const API = {
  query: pageParamsDataDetailPage,
  export: exportParamsDataDetailPage
}

const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '归集参数', value: 'apportionmentParamName', showLabel: true, type: 'slot' },
    { label: '服务单元', value: 'serviceUnitName', showLabel: true, type: 'slot' },
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
    { label: '开始会计期间', value: 'timeStart' },
    { label: '结束会计期间', value: 'timeEnd' },
    { label: '归集参数', value: 'apportionmentParamName' },
    { label: '服务单元编码', value: 'serviceUnitCode' },
    { label: '服务单元名称', value: 'serviceUnitName' },
    { label: '参数值', value: 'paramValue', align: 'center' },
    { label: '备注', value: 'mark' },
  ],
  data: [],
  summaryFieldList: [
    { value: 'paramValue', formatter: proxy.$fn.TripartiteMethod },
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
    accountingPeriodName: undefined,
    apportionmentParamName: undefined,
    serviceUnitName: undefined,
  })
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
  tableParameter.type = 'DIPPeriod'
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

function openServiceUnitSelector() {
  tableParameter.type = 'DIPServiceUnit'
  tableParameter.query = {
    status: '1'
  }
  tableParameter.callBack = serviceUnitCallback
  const ref = filterRef.value
  openDialog(ref)
}
function serviceUnitCallback(raw) {
  const form = filterInfo.query
  form.serviceId = raw.id
  form.serviceUnitName = raw.name
}

function openApportionmentParam() {
  tableParameter.type = 'DIPAggregationParams'
  tableParameter.query = {
    status: 1
  }
  tableParameter.callBack = apportionmentParamCallback
  openDialog(filterRef.value)
}
function apportionmentParamCallback(raw) {
  const form = filterInfo.query
  form.apportionmentParamId = raw.id
  form.apportionmentParamName = raw.name
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
            <template #filter-serviceUnitName>
              <el-input
                  v-model="filterInfo.query.serviceUnitName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择服务单元"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openServiceUnitSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-apportionmentParamName>
              <el-input
                  v-model="filterInfo.query.apportionmentParamName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择归集参数"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openApportionmentParam"><Search /></el-icon>
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
  </div>
</template>

<style scoped lang="scss">

</style>
