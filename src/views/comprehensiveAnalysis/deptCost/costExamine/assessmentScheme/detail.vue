<script setup>
import Modify from './modify.vue'
import {getCurrentInstance} from "vue";
import {useUpload} from "@/hooks/useUpload";
import {
  allAssessmentSchemeDetail,
  exportDetailAssessmentScheme,
  oneAssessmentScheme
} from "@/api/deptCost/assessmentScheme";

const PAGE_TITLE = '考核方案详情'
const PERMISSION_CODE = 'deptCost:assessmentScheme'
const API = {
  query: oneAssessmentScheme,
  queryDetail: allAssessmentSchemeDetail,
  export: exportDetailAssessmentScheme
}

const { proxy } = getCurrentInstance()

const {
  exportData
} = useUpload(API)

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
    { label: '考核方案编码', value: 'code' },
    { label: '考核方案名称', value: 'name' },
    { label: '开始会计期间', value: 'startPeriodName' },
    { label: '结束会计期间', value: 'endPeriodName' },
    { label: '评分方法', value: 'scoringMethodName' },
    { label: '极值', value: 'extremeWayName' },
    { label: '备注', value: 'remark' },
  ],
})
// 弹窗相关
const dialogInfo = reactive({
  title: '修改考核方案',
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
    { label: '指标代码', value: 'indicatorsCode' },
    { label: '指标名称', value: 'indicatorsName' },
    { label: '权重(%)', value: 'weight', align: 'center' },
    { label: '区间一得分', value: 'intervalOneScore', align: 'center' },
    { label: '最佳值', value: 'optimumValue', align: 'center' },
    { label: '区间二得分', value: 'intervalTwoScore', align: 'center' },
    { label: '目标值', value: 'targetValue', align: 'center' },
    { label: '区间三得分', value: 'intervalThreeScore', align: 'center' },
    { label: '基准值', value: 'referenceValue', align: 'center' },
    { label: '区间四得分', value: 'intervalFourScore', align: 'center' },
  ],
  summaryFieldList: [
    { value: 'value', formatter: proxy.$fn.TripartiteMethod },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(props.id), },
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
    schemeId: props.id,
  }
  tableInfo.refresh = Math.random()
}
</script>

<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          :title="PAGE_TITLE"
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
                v-model:query="tableInfo.query"
                :filter-list="tableInfo.btnList"
            ></PageFilter>
            <div class="flex_full_item">
              <!-- 表格 -->
              <page-table
                  :refresh="tableInfo.refresh"
                  :init-curpage="tableInfo.initCurpage"
                  v-model:data="tableInfo.data"
                  :pager="false"
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
