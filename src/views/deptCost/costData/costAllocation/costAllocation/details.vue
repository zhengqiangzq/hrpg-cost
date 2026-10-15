<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="成本归集详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <div class="model-panel">
          <div class="model-panel-title">
            <p>成本归集</p>
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
            <PageFilter
                ref="dialogInfoRef"
                v-model:query="filterInfo.query"
                :filter-list="tableInfo.btnList"
            >
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
            </PageFilter>
            <div class="flex_full_item">
              <el-form
                  ref="tableForm"
                  :model="tableInfo"
                  style="width: 100%">
                <!-- 表格 -->
                <page-table
                    :refresh="tableInfo.refresh"
                    :init-curpage="tableInfo.initCurpage"
                    v-model:data="tableInfo.data"
                    :pager="true"
                    :summary="true"
                    :api="tableInfo.api"
                    :summaryFieldList="tableInfo.summaryFieldList"
                    :tabIndex="true"
                    :check-box="false"
                    :query="filterInfo.query"
                    :field-list="tableInfo.fieldList"
                    :handle="tableInfo.handle"
                    :isDynamic="true"
                >
                </page-table>
              </el-form>
            </div>
          </div>
        </div>
      </NewFullScreen>
    </div>
  </div>
</template>

<script setup>
import {getCurrentInstance} from "vue";
import {
  exportCostAllocationDetail,
  oneCostAllocation,
  pageCostAllocationDetail
} from "@/api/costAllocation";
import {pageCostDataDetail} from "@/api/costData";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const { proxy } = getCurrentInstance()

const { tableParameter, openDialog } = useSelectTableData()
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
const basicInfo = ref({
  data: {},
  fieldList: [
    { label: '单据号', value: 'docNum' },
    { label: '会计期间', value: 'accountingPeriodMonth' },
    { label: '直接计入金额', value: 'directCountMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directCountMoney) },
    { label: '计算计入金额', value: 'calcuCountMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.calcuCountMoney) },
    { label: '金额', value: 'totalMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalMoney) },
    { label: '确认状态', value: 'statusValue' },
  ],
})
// 弹窗相关
const dialogInfo = ref({
  title: '',
  id: '',
  visible: false,
  type: '',
})

const filterInfo = ref({
  query: {
    deptCostMergeId: props.id
  },
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  btnList: [
    { type: 'button', label: '导出Excel', event: exportData, show: proxy.$permission('costAllocation:export') },
    { type: 'slot', label: '成本项目', showLabel: true, value: 'costItemName' },
    { type: 'button', label: '查询', event: getList },
  ],
  data: [],
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '资金来源', value: 'assetCapitalValue' },
    { label: '直接计入金额', value: 'directCountMoney' },
    { label: '计算计入金额', value: 'calcuCountMoney' },
    { label: '金额', value: 'totalMoney' },
  ],
  summaryFieldList: [
    { value: 'directCountMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'calcuCountMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'totalMoney', formatter: proxy.$fn.TripartiteMethod },
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
    tableInfo.value.api = pageCostAllocationDetail
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
async function initData() {
  oneCostAllocation(props.id).then(res => {
    basicInfo.value.data = res.data
    getList()
  })
}

function getList() {
  console.log('table数据')
  tableInfo.value.refresh = Math.random()
}

const dialogInfoRef = ref()
function openCostItemSelector() {
  tableParameter.title = '成本项目'
  tableParameter.visible = true
  tableParameter.checkBox = true
  tableParameter.type = 'costItem'
  tableParameter.query = { last: true }
  tableParameter.filters = [
    { type: 'input', label: '名称', value: 'name' }
  ]
  tableParameter.callBack = costItemCallback
  openDialog(dialogInfoRef.value, 'table')
}
function costItemCallback(raw) {
  tableParameter.checkedList = raw;
  filterInfo.value.query.costItemId = raw.map(it => it.id)
  filterInfo.value.query.costItemIdList = raw.map(it => it.id)
  filterInfo.value.query.costItemName = raw.map(it => it.name)
}
function exportData() {
  exportCostAllocationDetail({
    ...filterInfo.value.query,
    type: 'one'
  }).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
</script>

<style scoped></style>
