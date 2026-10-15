<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="参数数据详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('paramData:update') &&
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
            <p>参数数据</p>
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
              <template #filter-deptName>
                <el-input
                    v-model="filterInfo.query.deptName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择科室信息"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="opendeptSelector"><Search /></el-icon>
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
                    :summary="true"
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
  <SelectDeptArchivesTree
      v-if="treeInfo.visible"
      v-model:showDialog="treeInfo.visible"
      :title="treeInfo.title"
      :checkStrictly="treeInfo.checkStrictly"
      :isLeaf="treeInfo.isLeaf"
      :query="treeInfo.query"
      :checkBox="treeInfo.checkBox"
      :api="treeInfo.api"
      :highlight-current="true"
      @callback="deptCallback" />
</template>

<script setup>
import Modify from './modify'
import {getCurrentInstance} from "vue";
import moment from "moment";
import {exportParamDataDetail, oneParamData, pageParamDataDetail} from "@/api/paramData";

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
    { label: '业务日期', value: 'businessTime', formatter: (row) => moment(row.businessTime).format('YYYY-MM-DD') },
    { label: '会计期间', value: 'accountingPeriodValue' },
    { label: '分摊参数', value: 'apportionmentParamName' },
    { label: '单据模板', value: 'apportionmentParamTemplateValue' },
    { label: '总参数值', value: 'totalValue' },
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
    deptParamId: props.id
  },
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  query: {},
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '参数值', value: 'paramValue', align: 'center' },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
    { value: 'paramValue', formatter: proxy.$fn.TripartiteMethod },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', event: () => exportData(tableInfo.copyQuery), },
    { type: 'slot', label: '科室信息', showLabel: true, value: 'deptName' },
    { type: 'button', label: '查询', event: getList },
  ],
})

watch(() => basicInfo.value.data.apportionmentParamTemplate, (apportionmentParamTemplate) => {
  const template_column = [
    [],
    [
      {label: '科室编码', value: 'deptCode'},
      {label: '科室名称', value: 'deptName'},
      {label: '参数值', value: 'paramValue'},
      {label: '备注', value: 'remark'},
    ],
    [
      {label: '服务科室编码', value: 'sourceDeptCode'},
      {label: '服务科室名称', value: 'sourceDeptName'},
      {label: '收益科室编码', value: 'deptCode'},
      {label: '收益科室名称', value: 'deptName'},
      {label: '参数值', value: 'paramValue'},
      {label: '备注', value: 'remark'},
    ]
  ]
  tableInfo.value.fieldList = template_column[apportionmentParamTemplate]
}, {immediate: true})
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
    tableInfo.value.api = pageParamDataDetail
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.title = '修改参数数据'
  dialogInfo.value.visible = true
}
async function initData() {
  oneParamData(props.id).then(({data}) => {
    basicInfo.value.data = data
    getList()
  })
}

function getList() {
  tableInfo.value.refresh = Math.random()
}
function exportData() {
  exportParamDataDetail(filterInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  callback: null
})

function opendeptSelector() {
  treeInfo.value.title = '科室信息'
  treeInfo.value.visible = true
}
function deptCallback(raw) {
  const datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptId = datas?.map((it) => it.id);
  filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
  filterInfo.value.query.deptName = datas?.map((it) => it.name);
}
</script>

<style scoped></style>
