<!-- 月结页面 -->
<script setup name="procostCheckout">
import {getCurrentInstance, onMounted} from "vue";
import {useStorage} from "@vueuse/core";
import {
  closeCheckMonthCloseclose,
  itemCloseMonthCloseclose,
  itemCloseMonthClosepage,
  itemCloseMonthClosereClose, reCloseCheckMonthCloseclose
} from "@/api/checkout";
import useMonthCheckout from "@/components/MonthCheckout/useMonthCheckout";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
const {proxy} = getCurrentInstance()
const { openCheckout, openReCheckout } = useMonthCheckout({
  costType: 2,
  api: {
    check: closeCheckMonthCloseclose,
    reCheck: reCloseCheckMonthCloseclose,
    closeCheck: itemCloseMonthCloseclose,
    cancelCloseCheck: itemCloseMonthClosereClose
  }
})

const { tableParameter, openDialog } = useSelectTableData()
const setting = useStorage('setting', {}, sessionStorage)

const filterInfo = ref({
  query: {
    orgId: setting.value.hospitalId
  },
  list: [
    { label: '核算期间', value: 'checkPeriodName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: []
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '核算期间', value: 'checkPeriodName' },
    { label: '开始会计期间', value: 'startPeriod' },
    { label: '结束会计期间', value: 'endPeriod' },
    { label: '结账状态', value: 'isClose', formatter: (row) => ({ '0': '未结账', '1': '已结账' }[row.isClose]) },
    { label: '结账人', value: 'operatorName' },
    { label: '结账时间', value: 'createTime' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '月结',
        show: proxy.$permission('procostCheckout:check'),
        event: (row) => checkoutData(row, 1),
        ifRender: (row) => row.isClose == '0'
      },
      {
        label: '反月结',
        show: proxy.$permission('procostCheckout:check'),
        event: (row) => checkoutData(row, 0),
        ifRender: (row) => row.isClose == '1'
      },
    ]
  },
  sectionRows: []
})

const filterRef = ref()

onMounted(async () => {
  tableInfo.value.api = itemCloseMonthClosepage
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {
    orgId: setting.value.hospitalId
  }
  getList()
}
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function checkoutData(row, isClose) {
  if (isClose) {
    openCheckout(row, getList)
  } else {
    openReCheckout(row, getList)
  }
}

function openAccountingPeriodSelector() {
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.query = {}
  tableParameter.filters = []
  tableParameter.title = '核算期间'
  tableParameter.callBack = accountingPeriodCallback
  openDialog(filterRef.value)
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.checkPeriodId = raw.id
  filterInfo.value.query.checkPeriodName = raw.name
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
            ref="filterRef"
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
            :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-checkPeriodName>
              <el-input
                v-model="filterInfo.query.checkPeriodName"
                class="not-mongolia"
                type="input"
                placeholder="请选择核算期间"
                :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector"><Search/></el-icon>
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
        <!-- 表格 -->
        <table-container
          :refresh="tableInfo.refresh"
          :init-curpage="tableInfo.initCurpage"
          v-model:data="tableInfo.data"
          :api="tableInfo.api"
          :query="filterInfo.copyQuery"
          :tabIndex="true"
          :pager="false"
          :check-box="false"
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
