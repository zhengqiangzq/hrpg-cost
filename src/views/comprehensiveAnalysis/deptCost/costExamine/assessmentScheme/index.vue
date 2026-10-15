<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import Modify from './modify.vue';
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import DetailList from "./detailList.vue";
import Detail from "./detail.vue";
import {useUpload} from "@/hooks/useUpload";
import {useStorage} from "@vueuse/core";
import {
  calcAssessmentScheme,
  cancelAssessmentScheme,
  confirmAssessmentScheme,
  deleteAssessmentScheme, exportAssessmentScheme,
  pageAssessmentScheme
} from "@/api/deptCost/assessmentScheme";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'deptCost:assessmentScheme'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageAssessmentScheme,
  delete: deleteAssessmentScheme,
  enable: confirmAssessmentScheme,
  disable: cancelAssessmentScheme,
  calc: calcAssessmentScheme,
  export: exportAssessmentScheme
}
const setting = useStorage('setting', {}, sessionStorage)

const {
  exportData,
} = useUpload(API)

const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '考核方案名称', value: 'OrBatchLike#name', type: 'input' },
    { label: '确认状态', value: 'confirmStatus', type: 'select-model', code: 'cost_document_status', event: getList },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => enableData() },
    { type: 'button', label: '取消确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => disabledData() },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '考核方案编码', value: 'code', type: 'slot' },
    { label: '考核方案名称', value: 'name' },
    { label: '开始会计期间', value: 'startPeriodName' },
    { label: '结束会计期间', value: 'endPeriodName' },
    { label: '备注', value: 'remark' },
    { label: '确认状态', value: 'confirmStatusName' },
    { label: '计算状态', value: 'calculateStatusName' },
    { label: '制单人', value: 'createUserName' },
    { label: '制单时间', value: 'createTime', align: 'center' },
  ],
  summaryFieldList: [
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
        ifRender: (row) => row.confirmStatus === '0'
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.confirmStatus === '0'
      },
      {
        label: '执行计算',
        show: proxy.$permission(`${PERMISSION_CODE}:calc`),
        event: calcData,
        ifRender: (row) => row.confirmStatus === '1' && ['0', '1'].indexOf(row.calculateStatus) !== -1
      },
    ]
  },
  sectionRows: []
})

const detailListInfo = ref({
  visible: false
})
const modifyInfo = reactive({
  id: null,
  title: '考核方案',
  batch: false,
  visible: false
})
const detailInfo = reactive({
  visible: false,
})

const { tableParameter, openDialog } = useSelectTableData()

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  const enableBtn = btns.find(btn => btn.label === '确认')
  const disabledBtn = btns.find(btn => btn.label === '取消确认')
  deleteBtn.disabled = !rows.length
  enableBtn.disabled = !rows.length || !!rows.find(it => it.confirmStatus == 1)
  disabledBtn.disabled = !rows.length || !!rows.find(it => it.confirmStatus == 0)
}, { immediate: true })

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
  filterInfo.query = {}
  getList()
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  modifyInfo.id = row?.id
  modifyInfo.title = row ? '修改考核方案' : '新增考核方案'
  modifyInfo.visible = true
}

// 删除数据
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.delete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function calcData(row) {
  API.calc(row.id).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function enableData(row) {
  const rows = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  API.enable(rows).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function disabledData(row) {
  const rows = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  API.disable(rows).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function detail(row) {
  detailInfo.id = row.id
  detailInfo.visible = true
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}
</script>

<template>
<!-- 考核方案 -->
  <div className="app-container">
    <div class="layui-card layui-col-md12" v-show="!modifyInfo.visible && !detailInfo.visible && !detailListInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab currentTab">列表页</div>
          <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>
        </div>
        <div>
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
        </div>
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :summary="true"
            :summaryFieldList="tableInfo.summaryFieldList"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
          <template #col-code="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.code }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <Modify
        v-if="modifyInfo.visible"
        v-model:visible="modifyInfo.visible"
        :id="modifyInfo.id"
        :batch="modifyInfo.batch"
        :title="modifyInfo.title"
        @returnModify="getList"
    />
    <Detail
        v-if="detailInfo.visible"
        :id="detailInfo.id"
        v-model:visible="detailInfo.visible"
        @returnBack="getList"
    ></Detail>
    <DetailList
        v-if="detailListInfo.visible"
        v-model:visible="detailListInfo.visible"
        @callback="getList"
    ></DetailList>
  </div>
</template>

<style scoped lang="scss">

</style>
