<script setup name="keyFactorsValue">
import {onMounted, reactive, ref, watch} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import Modify from "./modify.vue";
import Details from "./details.vue";
import {
  collectKeyFactorsValue,
  deleteKeyFactorsValue,
  enableKeyFactorsValue,
  exportKeyFactorsValue,
  pageKeyFactorsValue
} from "@/api/projectCost/keyFactorsValue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import DetailList from "./detailList.vue";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const PERMISSION_CODE = 'keyFactorsValue'
const store = useStore()
const {proxy} = getCurrentInstance()
const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13064',
  action: '/item/itemizeKeyFactorValue/import/excelRecord',
})

const { tableParameter, openDialog } = useSelectTableData()

const filterRef = ref()
const filterInfo = ref({
  query: {},
  list: [
    {label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot', event: getList},
    {label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', event: getList},
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    {
      type: 'button',
      label: '新增',
      show: proxy.$permission(`${PERMISSION_CODE}:add`),
      event: () => openModify()
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission(`${PERMISSION_CODE}:delete`),
      event: () => deleteRow()
    },
    { type: 'button', label: '采集', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => openCollectData() },
    { type: 'button', label: '拉取日志查询', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '确认', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => enableData(1) },
    { type: 'button', label: '取消确认', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => enableData(0) },

    {
      type: 'button',
      label: '下载模板',
      show: proxy.$permission(`${PERMISSION_CODE}:download`),
      event: downloadTemplate
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      show: proxy.$permission(`${PERMISSION_CODE}:export`),
      event: exportData
    },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    {label: '单据号', value: 'docNum', type: 'slot'},
    {label: '核算期间', value: 'accountingPeriodName'},
    {label: '开始会计期间', value: 'beginPeriodMth'},
    {label: '结束会计期间', value: 'endPeriodMth'},
    {label: '关键因素', value: 'keyFactorSettingName'},
    {label: '确认状态', value: 'statusName'},
    {label: '备注', value: 'remark'},
    {label: '制单人', value: 'createUserName'},
    {label: '制单时间', value: 'createTime', align: 'center'},
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
        event: (row) => openModify(JSON.parse(JSON.stringify(row))),
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteRow,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '关键因素值',
  id: null
})

const treeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})
const detailsInfo = ref({
  visible: false
})
const detailListInfo = ref({
  visible: false
})

const collectInfoRef = ref()
const collectInfo = reactive({
  refObj: null,
  title: '采集',
  visible: false,
  data: {
  },
  fieldList: [
    { label: '关键因素', span: 12, value: 'keyFactorSettingName', type: 'slot' },
    { label: '核算期间', span: 12, value: 'accountingPeriodName', type: 'slot' },
  ],
  rules: {
    keyFactorSettingName: [{ required: true, message: '请选择关键因素', trigger: 'change' }],
    accountingPeriodName: [{ required: true, message: '请选择核算期间', trigger: 'change' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: collectData }
  ]
})

const {
  visible: pullDataLogInfoVisible,
  code: pullDataLogInfoCode
} = usePullDataLog('关键因素值')


watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
}, {deep: true, immediate: true})

onMounted(() => {
  tableInfo.value.api = pageKeyFactorsValue
  getList()
})

function getList() {
  tableInfo.value.refresh = Math.random()
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    accountingPeriodName:undefined,
  }
}

function reset() {
  filterInfo.value.query = {}
  getList()
}
function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}

function enableData(status) {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  enableKeyFactorsValue({
    ids,
    status
  }).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('itemItemizeKeyFactorValueTemplate', `${PERMISSION_CODE}:download`).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '关键因素值导入模板')
    }
  })
}

function exportData() {
  exportKeyFactorsValue(filterInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function openModify(row, batch = false) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.batch = batch
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}关键因素值`
  dialogInfo.value.visible = true
}

function openCollectData() {
  collectInfo.data = {}
  collectInfo.visible = true
}

function collectData() {
  collectInfo.refObj.validate(flag => {
    if (flag) {

      collectInfo.data.businessTypeName = `项目分项当量法-关键因素值(${collectInfo.data.keyFactorSettingName})`
      collectKeyFactorsValue(collectInfo.data).then(res => {
        if (res.success) {
          proxy.$message.success('采集成功')
          collectInfo.data = {}
          collectInfo.visible = false
          getList()
        }
      })
    }
  })
}

function deleteRow(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    deleteKeyFactorsValue(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function openAccountingPeriodSelector(mark) {
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.callBack = (raw) => {
    const data = { collect: collectInfo.data, query: filterInfo.value.query }[mark]
    data.accountingPeriodId = raw.id
    data.accountingPeriodName = raw.name
    data.periodMonth = `${raw.name}(${raw.beginPeriod},${raw.endPeriod})`
  }
  tableParameter.visible = true
  openDialog({ query: filterRef.value, collect: collectInfoRef.value }[mark])
}

function openKeyFactorsSelector() {
  tableParameter.type = 'keyFactors'
  tableParameter.title = '关键因素'
  tableParameter.query = { builtIn: 1 }
  tableParameter.callBack = (raw) => {
    collectInfo.data.keyFactorSettingId = raw.id
    collectInfo.data.keyFactorSettingCode = raw.code
    collectInfo.data.keyFactorSettingName = raw.name
  }
  tableParameter.visible = true
  openDialog(collectInfoRef.value)
}
</script>

<template>
  <!--  作业动因设置-->
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!dialogInfo.visible && !pullDataLogInfoVisible && !detailsInfo.visible && !detailListInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab currentTab">列表页</div>
          <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>
        </div>
        <div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter
            ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
            :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-accountingPeriodName>
              <el-input
                  v-model="filterInfo.query.accountingPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector('query')">
                    <Search/>
                  </el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :pager="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
          <template #col-docNum="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.docNum }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <PullDataLog
        v-if="pullDataLogInfoVisible"
        :businessType="pullDataLogInfoCode"
        @returnBack="pullDataLogInfoVisible = false" />
    <dialog-form :title="collectInfo.title" width="800px" :btList="collectInfo.btList" v-model:visible="collectInfo.visible">
      <page-form
        ref="collectInfoRef"
        v-model:ref-obj="collectInfo.refObj"
        :label-width="collectInfo.labelWidth"
        :data="collectInfo.data"
        :field-list="collectInfo.fieldList"
        :rules="collectInfo.rules"
      >
        <template #form-accountingPeriodName>
          <el-input
            v-model="collectInfo.data.accountingPeriodName"
            class="not-mongolia"
            type="input"
            placeholder="请选择核算期间"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriodSelector('collect')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #form-keyFactorSettingName>
          <el-input
            v-model="collectInfo.data.keyFactorSettingName"
            class="not-mongolia"
            placeholder="请选择关键因素"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="openKeyFactorsSelector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </dialog-form>
    <Modify
        v-if="dialogInfo.visible"
        v-model:visible="dialogInfo.visible"
        :id="dialogInfo.id"
        :batch="dialogInfo.batch"
        :title="dialogInfo.title"
        @returnModify="getList"
    />
    <Details
        v-if="detailsInfo.visible"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
    <DetailList
      v-if="detailListInfo.visible"
      v-model:visible="detailListInfo.visible"
      @callback="getList"
    ></DetailList>
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
        @callback="treeCallback"/>
  </div>
</template>

<style scoped lang="scss">

</style>
