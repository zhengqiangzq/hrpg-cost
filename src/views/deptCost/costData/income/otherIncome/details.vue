<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="其他收入详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('scienceIncome:update') &&
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
            <p>其他收入数据</p>
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
              <template #filter-incomeItemName>
                <el-input
                    v-model="filterInfo.query.incomeItemName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择收入项目"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openfeeItemSelector"><Search /></el-icon>
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
  <Modify
      v-if="dialogInfo.visible"
      :id="dialogInfo.id"
      v-model:visible="dialogInfo.visible"
      :title="dialogInfo.title"
      :type="dialogInfo.type"
      @returnModify="initData"
  />
  <SelectIncomeProject
      v-if="feeIteminfo.visible"
      v-model:showDialog="feeIteminfo.visible"
      :title="feeIteminfo.title"
      :checkStrictly="feeIteminfo.checkStrictly"
      :isLeaf="feeIteminfo.isLeaf"
      :query="feeIteminfo.query"
      :checkBox="feeIteminfo.checkBox"
      :api="feeIteminfo.api"
      :highlight-current="true"
      @callback="feeItemCallback" />
</template>

<script setup>
import Modify from './modify.vue'
import {getCurrentInstance} from "vue";
import moment from "moment";
import {otherdetail, otherDetailpage, OtherIncomedetailExcel} from "@/api/otherIncome";

const { proxy } = getCurrentInstance()

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
    { label: '业务日期', value: 'businessTime', formatter: (row) => moment(row.docTime).format('YYYY-MM-DD') },
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
    deptIncomeId: props.id,
    deptOtherIncomeId: props.id
  },
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    { label: '职能科室名称', value: 'deptName' },
    { label: '收入项目', value: 'incomeItemValue' },
    { label: '金额', value: 'money', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', event: () => exportData(tableInfo.copyQuery), },
    { type: 'slot', label: '收入项目', showLabel: true, value: 'incomeItemName' },
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
    tableInfo.value.api = otherDetailpage
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.title = '修改其他收入'
  dialogInfo.value.visible = true
}
async function initData() {
  otherdetail(props.id).then(({data}) => {
    basicInfo.value.data = data
    getList()
  })
}

const feeIteminfo = ref({
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  title: '收入项目',
  query: {
    name: ''
  }
})
function openfeeItemSelector() {
  feeIteminfo.value.visible = true

}
function exportData() {
  OtherIncomedetailExcel(filterInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function feeItemCallback(raw) {
  filterInfo.value.query.incomeItemName = raw?.map((it) => it.name)
  filterInfo.value.query.incomeItemIdList = raw?.map((it) => it.id);
}

function getList() {
  tableInfo.value.refresh = Math.random()
}
</script>

<style scoped></style>
