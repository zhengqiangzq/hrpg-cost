<script setup>
import {computed, getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {pageDetailAssessmentCalculateRecords} from "@/api/deptCost/assessmentCalculateRecords";

const { proxy } = getCurrentInstance()
const API = {
  query: pageDetailAssessmentCalculateRecords,
}
const emits = defineEmits(['returnBack'])

const PAGE_TITLE = '考核方案'
const props = defineProps({
  visible: Boolean,
  schemeId: [String, Number],
  deptId: [String, Number],
  flowFormType: '',
})

const filterRef = ref()
const filterInfo = reactive({
  query: {
    schemeId: props.schemeId,
    deptId: props.deptId
  },
  copyQuery: {},
  list: [
    { label: '考核指标', value: 'indicatorsKeyword', type: 'input' },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '考核方案', value: 'schemeName' },
    { label: '核算科室', value: 'deptName' },
    { label: '考核指标', value: 'indicatorsName' },
    { label: '权重', value: 'weight', align: 'center' },
    { label: '考核得分得分', value: 'score', align: 'center' },
  ],
  data: [],
  summaryFieldList: [
  ],
  handle: null,
  sectionRows: []
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emits('update:visible', newValue) // 更新父组件visible
  },
})

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep(filterInfo.query)
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    schemeId: props.schemeId,
    deptId: props.deptId
  }
  getList()
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function returnBack() {
  emits('returnBack')
}
</script>

<template>
  <div className="view-fill">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          :title="PAGE_TITLE"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <div class="layui-card-body">
          <div class="filter-wrapper">
            <PageFilter
                ref="filterRef"
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.list"
            >
            </PageFilter>
          </div>
          <div class="filter-wrapper">
            <!-- 条件栏 -->
            <NewPageFilter :filter-btn="filterInfo.btnList">
            </NewPageFilter>
          </div>
          <table-container
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurpage"
              v-model:data="tableInfo.data"
              :api="tableInfo.api"
              :query="filterInfo.copyQuery"
              :tabIndex="true"
              :check-box="false"
              :summary="true"
              :summaryFieldList="tableInfo.summaryFieldList"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              @handleEvent="tableHandler"
          >
          </table-container>
        </div>
      </NewFullScreen>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
