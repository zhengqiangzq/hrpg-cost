<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  exportIncomeCenterDetailPage,
  pageIncomeCenterDetailPage
} from "@/api/DIPCost/DIPCostServiceUnitIncomeCenter";

const emits = defineEmits(['update:visible'])
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'DIPCostServiceUnitIncomeCenter'
const API = {
  query: pageIncomeCenterDetailPage,
  export: exportIncomeCenterDetailPage
}

const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '服务单元', value: 'serviceUnitName', showLabel: true, type: 'slot' },
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot' },
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
    { label: '服务单元编码', value: 'serviceUnitCode' },
    { label: '服务单元名称', value: 'serviceUnitName' },
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  summaryFieldList: [
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
  tableParameter.type = 'DIPPeriod'
  tableParameter.checkBox = false;
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

function costCategoryCallback(raw) {
  filterInfo.query.costCategoryId = raw.id
  filterInfo.query.costCategoryName = raw.name
}

function openFeeItemSelector() {
  tableParameter.type = 'feeItem'
  tableParameter.query = {
    status: '1',
    accountingStatus: 1
  }
  tableParameter.checkBox = true;
  tableParameter.callBack = feeItemCallback
  openDialog(filterRef.value)
}
function feeItemCallback(raw) {
  tableParameter.checkedList = raw;
  filterInfo.query.feeItemIds = raw?.map((it) => it.id).join(',');
  filterInfo.query.feeItemName = raw?.map((it) => it.name).join(',');
}

function treeCallback(raw) {
  filterInfo.query.deptId = raw.id
  filterInfo.query.deptName = raw.name
}

function openServiceUnitSelector() {
  tableParameter.type = 'DIPServiceUnit'
  tableParameter.checkBox = false;
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
</script>

<template>
  <div className="view-fill">
    <div class="layui-card layui-col-md12">
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
            <template #filter-feeItemName>
              <el-input
                  v-model="filterInfo.query.feeItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择收费项目"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openFeeItemSelector"><Search /></el-icon>
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
  </div>
</template>

<style scoped lang="scss">

</style>
