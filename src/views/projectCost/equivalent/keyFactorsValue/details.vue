<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="关键因素值"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('keyFactorsValue:update') &&
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
              :isAddFlag="true"
              ref="dialogInfoRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.btnList"
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
                    :summary="false"
                    :tabIndex="true"
                    :check-box="false"
                    :query="filterInfo.copyQuery"
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
import {useStorage} from "@vueuse/core";
import {oneKeyFactorsValue, pageDetailKeyFactorsValue} from "@/api/projectCost/keyFactorsValue";
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
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '关键因素', value: 'keyFactorSettingName' },
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
  },
  btnList: [
    { type: 'slot', label: '核算科室', showLabel: true, value: 'deptName' },
    { type: 'button', label: '查询', event: () => getList() },
  ],
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '服务项目编码', value: 'feeItemCode' },
    { label: '服务项目名称', value: 'feeItemName' },
    { label: '关键因素值', value: 'value' },
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
    tableInfo.value.api = pageDetailKeyFactorsValue
    getList()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.title = '修改关键因素值'
  dialogInfo.value.visible = true
}
async function initData() {
  oneKeyFactorsValue(props.id).then(({data}) => {
    basicInfo.value.data = data
  })
}

function getList() {
  filterInfo.value.copyQuery = {
    deptId: filterInfo.value.query.deptId,
    orgId: setting.value.hospitalId,
    keyFactorValueId: props.id
  }
  tableInfo.value.refresh = Math.random()
}

const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: false,
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
  filterInfo.value.query.deptId = raw.id;
  filterInfo.value.query.deptName = raw.name;
}
</script>

<style scoped></style>
