<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="资源动因值详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('incomeData:update') &&
              basicInfo.data.status === '0'
            "
              :plain="true"
              @click="update"
          >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>基础信息</p>
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
              <template #filter-deptName>
                <el-input
                    v-model="filterInfo.query.deptName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择科室信息"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDeptSelector"><Search /></el-icon>
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
  <SelectProDeptTree
      v-if="treeInfo.visible"
      v-model:showDialog="treeInfo.visible"
      :title="treeInfo.title"
      :checkStrictly="treeInfo.checkStrictly"
      :isLeaf="treeInfo.isLeaf"
      :query="treeInfo.query"
      :checkBox="treeInfo.checkBox"
      :api="treeInfo.api"
      :highlight-current="true"
      @callback="treeCallback" />
</template>

<script setup>
import Modify from './modify'
import {getCurrentInstance} from "vue";
import {useStorage} from "@vueuse/core";
import {
  itemActivityDriverConfigDetailqueryListByConfigId,
  itemResourceDriverValueDetailexportExcel,
  itemResourceDriverValuegetById,
} from "@/api/resourceDriverVal";
const { proxy } = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)

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
    { label: '核算期间', value: 'checkPeriodName' },
    { label: '资源动因', value: 'resourceDriverName' },
    { label: '总参数值', value: 'totalMoney' },
    { label: '确认状态', value: 'statusName' },
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
    valueId: props.id,
    resourceDriverId: props.id,
    resourceDriverValueId: props.id,
    orgId: setting.value.hospitalId,
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
    { label: '作业编码', value: 'itemJobCode' },
    { label: '作业名称', value: 'itemJobName' },
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
    tableInfo.value.api = itemActivityDriverConfigDetailqueryListByConfigId
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
function exportData() {
  itemResourceDriverValueDetailexportExcel(filterInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.title = '修改资源动因值'
  dialogInfo.value.visible = true
}
async function initData() {
  itemResourceDriverValuegetById({id: props.id}).then(({data}) => {
    basicInfo.value.data = data
    getList()
  })
}

function getList() {
  tableInfo.value.refresh = Math.random()
}
const treeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})
// 科室
function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  filterInfo.value.query.deptId = raw.id
  filterInfo.value.query.deptCode = raw.code
  filterInfo.value.query.deptName = raw.name
}
</script>

<style scoped></style>
