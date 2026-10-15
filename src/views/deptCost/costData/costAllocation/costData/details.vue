<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="总账成本详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('costData:update') &&
              basicInfo.data.status === '0'
            "
              type="primary"
              class="el-button el-button--medium filter-button"
              @click="update"
          >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>成本数据</p>
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
                :isAddFlag="true"
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
                    :api="tableInfo.api"
                    :summary="false"
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
  <Modify
      v-if="dialogInfo.visible"
      :id="dialogInfo.id"
      v-model:visible="dialogInfo.visible"
      :title="dialogInfo.title"
      :type="dialogInfo.type"
      @returnModify="initData"
  />
</template>

<script setup>
import Modify from './modify'
import {getCurrentInstance} from "vue";
import {exportCostDataDetail, oneCostData, pageCostDataDetail} from "@/api/costData";
import moment from "moment";
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
    { label: '业务日期', value: 'businessTime', formatter: (row) => moment(row.businessTime).format('YYYY-MM-DD') },
    { label: '会计期间', value: 'accountingPeriod' },
    { label: '总金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '确认状态', value: 'statusValue' },
    { label: '备注', value: 'remark' },
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
    deptCostId: props.id
  },
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '资金来源', value: 'capitalSourceValue' },
    { label: '金额', value: 'money', align: 'right' },
    { label: '备注', value: 'remark' },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', event: () => exportData(tableInfo.copyQuery), },
    { type: 'slot', label: '成本项目', showLabel: true, value: 'costItemName' },
    { type: 'button', label: '查询', event: getList },
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
    tableInfo.value.api = pageCostDataDetail
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
function exportData() {
  exportCostDataDetail({
    ...filterInfo.value.query,
  }).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.title = '修改总账成本'
  dialogInfo.value.visible = true
}
async function initData() {
  oneCostData(props.id).then(({data}) => {
    basicInfo.value.data = data
    getList()
  })
}
const dialogInfoRef = ref()
function openCostItemSelector() {
  tableParameter.title = '成本项目'
  tableParameter.visible = true
  tableParameter.type = 'costItem'
  tableParameter.query = { last: true }
  tableParameter.filters = [
    { type: 'input', label: '名称', value: 'name' }
  ]
  tableParameter.callBack = costItemCallback
  openDialog(dialogInfoRef.value, 'table')
}
function costItemCallback(raw) {
  filterInfo.value.query.costItemId = raw.id
  filterInfo.value.query.costItemName = raw.name
}

function getList() {
  tableInfo.value.refresh = Math.random()
}
</script>

<style scoped></style>
