<!-- 结账 -->
<script setup name="DIPCostCheckout">
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  pageCheckout,
  checkout,
  disCheckout,
  closeCheckCheckout,
  reCloseCheckCheckout
} from "@/api/DIPCost/DIPCostCheckout";
import useMonthCheckout from "@/components/MonthCheckout/useMonthCheckout";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'DIPCostCheckout'
const API = {
  query: pageCheckout,
  checkout: checkout,
  disCheckout: disCheckout
}

const { openCheckout, openReCheckout } = useMonthCheckout({
  costType: 4,
  api: {
    check: closeCheckCheckout,
    reCheck: reCloseCheckCheckout,
    closeCheck: API.checkout,
    cancelCloseCheck: API.disCheckout
  }
})

const { tableParameter, openDialog } = useSelectTableData()
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: []
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '开始会计期间', value: 'startPeriod' },
    { label: '结束会计期间', value: 'endPeriod' },
    { label: '结账状态', value: 'isClose', formatter: (row) => ({ '0': '未结账', '1': '已结账' }[row.isClose]) },
    { label: '操作人', value: 'updateUserName' },
    { label: '操作时间', value: 'updateTime' },
  ],
  summaryFieldList: [
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '结账',
        show: proxy.$permission(`${PERMISSION_CODE}:checkout`),
        event: checkoutData,
        ifRender: (row) => row.isClose === '0'
      },
      {
        label: '反结账',
        show: proxy.$permission(`${PERMISSION_CODE}:checkout`),
        event: disCheckoutData,
        ifRender: (row) => row.isClose === '1'
      },
    ]
  },
  sectionRows: []
})

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

function checkoutData(row) {
  openCheckout(row, getList)
}

function disCheckoutData(row) {
  openReCheckout(row, getList)
}

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    accountingPeriodName: undefined
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function openAccountingPeriod() {
  tableParameter.type = 'DIPPeriod'
  tableParameter.query = {}
  tableParameter.callBack = accountingPeriodCallback
  openDialog(filterRef.value)
}
function accountingPeriodCallback(raw) {
  filterInfo.query.accountingPeriodId = raw.id
  filterInfo.query.accountingPeriodName = raw.name
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
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
                  <el-icon @click="openAccountingPeriod"><Search /></el-icon>
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
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :check-box="false"
            :summary="!!tableInfo.summaryFieldList?.length"
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
