<script setup>
import Modify from './modify.vue'
import {getCurrentInstance} from "vue";
import {exportDetailChargeData, oneChargeData, pageDetailChargeData} from "@/api/DIPCost/DIPCostChargeData";
import {useUpload} from "@/hooks/useUpload";

const PAGE_TITLE = '收费数据'
const PERMISSION_CODE = 'DIPCostChargeData'
const API = {
  query: oneChargeData,
  queryDetail: pageDetailChargeData,
  export: exportDetailChargeData
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
// 弹窗相关
const dialogInfo = reactive({
  title: '编辑',
  id: '',
  visible: false,
  type: '',
})

const tableInfo = reactive({
  refresh: 1,
  initCurpage: 1,
  query: {},
  data: [],
  fieldList: [
    { label: '住院号', value: 'hospitalAdmissionNumber' },
    { label: '收费项目编码', value: 'chargeItemCode' },
    { label: '收费项目名称', value: 'chargeItemName' },
    { label: '收费类别编码', value: 'feeCategoryCode' },
    { label: '收费类别名称', value: 'feeCategoryName' },
    { label: '开单科室编码', value: 'orderDeptCode' },
    { label: '开单科室名称', value: 'orderDeptName' },
    { label: '执行科室编码', value: 'executeDeptCode' },
    { label: '执行科室名称', value: 'executeDeptName' },
    { label: '数量', value: 'qty', align: 'center' },
    { label: '单价', value: 'unitPrice', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.unitPrice) },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
    { value: 'qty', formatter: proxy.$fn.TripartiteMethod },
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(tableInfo.copyQuery), },
    { type: 'slot', label: '住院号', showLabel: true, value: 'hospitalAdmissionNumberLike' },
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
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.id = basicInfo.data.id
  dialogInfo.title = '修改收费数据'
  dialogInfo.visible = true
}
async function initData() {
  API.query(props.id).then(({data}) => {
    basicInfo.data = data
    getList()
  })
}

function getList() {
  tableInfo.api = API.queryDetail
  tableInfo.copyQuery = {
    ...tableInfo.query,
    dipChargeDataId: props.id,
    sort: 'hospital_admission_number desc, create_time desc'
  }
  tableInfo.refresh = Math.random()
}
</script>

<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          :title="PAGE_TITLE + '详情'"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission(`${PERMISSION_CODE}:update`) &&
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
            <PageFilter
                :isAddFlag="true"
                v-model:query="tableInfo.query"
                :filter-list="tableInfo.btnList"
            >
              <template #filter-hospitalAdmissionNumberLike>
                <el-input
                    v-model="tableInfo.query.hospitalAdmissionNumberLike"
                    class="not-mongolia"
                    type="input"
                >
                </el-input>
              </template>
            </PageFilter>
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
                  :query="tableInfo.copyQuery"
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
  <Modify
      v-if="dialogInfo.visible"
      :id="dialogInfo.id"
      v-model:visible="dialogInfo.visible"
      :title="dialogInfo.title"
      :type="dialogInfo.type"
      @returnModify="initData"
  />
</template>

<style scoped></style>
