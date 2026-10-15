<!-- 月结页面 -->
<script setup name="allocationCalcMonthlyBalance">
import {getCurrentInstance, onMounted} from "vue";
import moment from "moment";
import {useStorage} from "@vueuse/core";
import {periodMonthByDate} from "@/api/base";
import {
  cancelCloseMonthlyBalance,
  closeCheckMonthlyBalance,
  closeMonthlyBalance,
  pageMonthlyBalance, reCloseCheckMonthlyBalance
} from "@/api/monthlyBalance";
import useMonthCheckout from "@/components/MonthCheckout/useMonthCheckout";
const {proxy} = getCurrentInstance()
const { openCheckout, openReCheckout } = useMonthCheckout({
  costType: 1,
  api: {
    check: closeCheckMonthlyBalance,
    reCheck: reCloseCheckMonthlyBalance,
    closeCheck: closeMonthlyBalance,
    cancelCloseCheck: cancelCloseMonthlyBalance
  }
})

const setting = useStorage('setting', {}, sessionStorage)

const filterInfo = ref({
  query: {
    orgId: setting.value.hospitalId
  },
  list: [
    { label: '会计期间', value: 'monthName', showLabel: true, type: 'slot' },
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
    { label: '会计期间', value: 'periodmonth' },
    { label: '开始日期', value: 'startPeriod' },
    { label: '结束日期', value: 'endPeriod' },
    { label: '结账状态', value: 'isClose', formatter: (row) => ({ '0': '未结账', '1': '已结账' }[row.isClose]) },
    { label: '结账人', value: 'createUserName' },
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
        show: proxy.$permission('allocationCalcMonthlyBalance:checkout'),
        event: (row) => checkoutData(row, 1),
        ifRender: (row) => row.isClose == '0'
      },
      {
        label: '反月结',
        show: proxy.$permission('allocationCalcMonthlyBalance:checkout'),
        event: (row) => checkoutData(row, 0),
        ifRender: (row) => row.isClose == '1'
      },
    ]
  },
  sectionRows: []
})

const filterRef = ref()
const tableParameter = ref({
  visible: false,
  type: '',
  title: '会计期间',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {}
})

onMounted(async () => {
  tableInfo.value.api = pageMonthlyBalance
  updatePeriodMonth()
})

const updatePeriodMonth = () => {
  periodMonthByDate({ beginDate: moment(new Date()).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    filterInfo.value.query.monthId = _data?.id
    filterInfo.value.query.monthName = _data?.periodYearAndMonth
    getList()
  })
}
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
  tableParameter.value.title = '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  filterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.monthId = raw.id
  filterInfo.value.query.monthName = raw.periodYearAndMonth
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
            <template #filter-monthName>
              <el-input
                  v-model="filterInfo.query.monthName"
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
            :summary="true"
            :summaryFieldList="tableInfo.summaryFieldList"
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
