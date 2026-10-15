<script setup>
import {computed, getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
    exportDetailClinicalPathwayCostCompare,
    pageDetailClinicalPathwayCostCompare
} from "@/api/diseaseCost/clinicalPathwayCostCompare";

const props = defineProps({
    mainQuery: {
        type: Object,
        default: () => ({})
    },
    visible: false,
})
const emits = defineEmits(['update:visible'])
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'clinicalPathwayCostCompare'
const API = {
  query: pageDetailClinicalPathwayCostCompare,
  export: exportDetailClinicalPathwayCostCompare
}

const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '服务项目', value: 'chargeItemName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
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
    { label: '服务项目编码', value: 'wayCode' },
    { label: '服务项目名称', value: 'wayName' },
    { label: '本院临床路径', type: 'multiHeader', children: [
            { label: '例均成本', value: 'avgCost', align: 'right' },
            { label: '占比(%)', value: 'num', align: 'center' },
        ] },
    { label: '标准临床路径', type: 'multiHeader', children: [
            { label: '例均成本', value: 'avgCostWay', align: 'right' },
            { label: '占比(%)', value: 'numWay', align: 'center' },
        ] },
      { label: '例均成本增减率(%)', value: 'growthRate', align: 'center' },
  ],
  data: [],
  summaryFieldList: [
  ],
  handle: null,
  sectionRows: []
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
  filterInfo.copyQuery = {
      ...filterInfo.query,
      ...props.mainQuery
  }
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = { ...props.mainQuery }
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

function openChargeItemSelector() {
  tableParameter.type = 'feeItem'
  tableParameter.query = {
    status: '1',
    accountingStatus: 1
  }
  tableParameter.callBack = (raw) => {
        filterInfo.query.feeItemId = raw.id
        filterInfo.query.chargeItemName = raw.name
    }
  openDialog(filterRef.value)
}
</script>

<template>
  <div className="view-fill">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-chargeItemName>
              <el-input
                  v-model="filterInfo.query.chargeItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择服务项目"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openChargeItemSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
          <el-button @click="showDialog = false">返回</el-button>
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
            :pager="false"
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
