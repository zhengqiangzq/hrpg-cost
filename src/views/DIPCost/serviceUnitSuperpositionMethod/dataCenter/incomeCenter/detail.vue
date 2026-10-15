<script setup>
import {getCurrentInstance} from "vue";
import {useUpload} from "@/hooks/useUpload";
import {
  exportIncomeCenterDetail,
  oneIncomeCenter,
  pageIncomeCenterDetail
} from "@/api/DIPCost/DIPCostServiceUnitIncomeCenter";

const PAGE_TITLE = '收入中心'
const PERMISSION_CODE = 'DIPCostServiceUnitIncomeCenter'
const API = {
  query: oneIncomeCenter,
  queryDetail: pageIncomeCenterDetail,
  export: exportIncomeCenterDetail
}

const { proxy } = getCurrentInstance()

const {
  exportData
} = useUpload(API, null, null, null)

const emits = defineEmits()
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
  },
  visible: false,
  flowFormType: '',
})
const basicInfo = reactive({
  data: {},
  fieldList: [
    { label: '单据号', value: 'orderNo' },
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '总金额', value: 'totalMoney' },
    { label: '确认状态', value: 'statusName' },
    { label: '备注', value: 'remark' },
  ],
})

const tableInfo = reactive({
  refresh: 1,
  initCurpage: 1,
  query: {},
  data: [],
  fieldList: [
    { label: '服务单元编码', value: 'serviceUnitCode' },
    { label: '服务单元名称', value: 'serviceUnitName' },
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
  ],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: props.id && proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(tableInfo.query), },
  ],
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(val) {
    // 更新父组件visible
    emits('update:visible', val)
  },
})

onMounted(() => {
  if (props.id) {
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
async function initData() {
  API.query(props.id).then(({data}) => {
    basicInfo.data = data
  })
  getList()
}

function getList() {
  tableInfo.api = API.queryDetail
  tableInfo.query.orderId = props.id
  tableInfo.refresh = Math.random()
}
</script>

<template>
  <div class="view-fill">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          :title="PAGE_TITLE"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <div class="model-panel">
          <div class="model-panel-title">
            <p>{{ PAGE_TITLE }}</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information :info="basicInfo"> </basic-information>
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title">
            <Tooltip text="明细信息" />
          </div>
          <div class="model-panel-body">
            <!-- 条件栏 -->
            <NewPageFilter
                :isAddFlag="true"
                :filter-btn="tableInfo.btnList"
            ></NewPageFilter>
            <div class="flex_full_item">
              <!-- 表格 -->
              <page-table
                  :refresh="tableInfo.refresh"
                  :init-curpage="tableInfo.initCurpage"
                  v-model:data="tableInfo.data"
                  :pager="true"
                  :api="tableInfo.api"
                  :summary="!!tableInfo.summaryFieldList.length"
                  :summaryFieldList="tableInfo.summaryFieldList"
                  :tabIndex="true"
                  :check-box="false"
                  :query="tableInfo.query"
                  :field-list="tableInfo.fieldList"
                  :handle="tableInfo.handle"
                  :isDynamic="true"
              >
              </page-table>
            </div>
          </div>
        </div>
      </NewFullScreen>
    </div>
  </div>
</template>

<style scoped></style>
