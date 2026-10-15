<script setup>
import Modify from './modify.vue'
import {oneDetailsStandardClinicalPathway, oneStandardClinicalPathway} from "@/api/diseaseCost/standardClinicalPathway";

const PERMISSION_CODE = 'standardClinicalPathway'

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
})
const basicInfo = reactive({
  data: {},
  fieldList: [
    { label: '临床路径编码', value: 'wayCode' },
    { label: '临床路径名称', value: 'wayName' },
    { label: '标准住院床日', value: 'standardBedDays' },
    { label: '所属病种', value: 'diseaseDefinitionName' },
  ],
})
// 弹窗相关
const dialogInfo = reactive({
  title: '',
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
    { label: '收费项目编码', value: 'chargeItemCode', },
    { label: '收费项目名称', value: 'chargeItemName' },
    { label: '工作量', value: 'workNum' }
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
    getMain()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.id = basicInfo.data.id
  dialogInfo.title = '修改标准临床路径'
  dialogInfo.visible = true
}

function getMain() {
  oneStandardClinicalPathway(props.id).then(res => {
    basicInfo.data = res.data
  })
  oneDetailsStandardClinicalPathway({ wayId: props.id }).then(res => {
    tableInfo.data = res.data
  })
}
</script>

<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="标准临床路径详情"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission(`${PERMISSION_CODE}:update`)
            "
              type="primary"
              class="el-button el-button--medium filter-button"
              @click="update"
          >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>标准临床路径</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information :info="basicInfo"> </basic-information>
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title">
            <Tooltip text="标准收费项目" />
          </div>
          <div class="model-panel-body">
            <!-- 条件栏 -->
            <PageFilter
                :isAddFlag="true"
                ref="filterInfoRef"
                v-model:query="tableInfo.query"
                :filter-list="tableInfo.btnList"
            >
            </PageFilter>
            <div class="flex_full_item">
              <!-- 表格 -->
              <page-table
                  :refresh="tableInfo.refresh"
                  :init-curpage="tableInfo.initCurpage"
                  v-model:data="tableInfo.data"
                  :pager="false"
                  :tabIndex="true"
                  :check-box="false"
                  :query="tableInfo.copyQuery"
                  :field-list="tableInfo.fieldList"
                  :handle="tableInfo.handle"
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
      @returnModify="getMain"
  />
</template>

<style scoped></style>
