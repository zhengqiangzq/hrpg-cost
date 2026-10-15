<script setup name="activityDriverVal">
import Modify from './modify.vue'
import Details from './details.vue'
import {getCurrentInstance, onMounted, ref} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import {ElLoading} from "element-plus";
import axios from "axios";
import {useStorage} from "@vueuse/core";
import DetailList from "./detailList.vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  itemActivityDriverValuedelByIds,
  itemActivityDriverValueexportExcel, itemActivityDriverValuequeryListByPage,
  itemActivityDriverValuesureByIds,
  itemActivityDriverValuecopyByCheckPeriodId,
  itemActivityDriverValueunSureByIds,
  itemActivityDriverValuecollect
} from "@/api/activityDriverVal";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)
const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'activityDriverVal',
  type: '13054',
  action: '/item/itemActivityDriverValue/import/excelRecord',
})
const filterInfo = ref({
  query: {},
  list: [
    { label: '核算期间', value: 'checkPeriodName', showLabel: true, type: 'slot' },
    { label: '作业动因', value: 'activityDriverName', showLabel: true, type: 'slot' },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission('activityDriverVal:add'), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission('activityDriverVal:delete'), event: () => deleteData() },
    { type: 'button', label: '采集', show: proxy.$permission('activityDriverVal:collect'), event: () => collect() },
    { type: 'button', label: '拉取日志查询', show: proxy.$permission('activityDriverVal:collect'), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '复制', show: proxy.$permission('activityDriverVal:copy'), event: copyData },
    { type: 'button', label: '确认', show: proxy.$permission('activityDriverVal:confirm'), event: () => enableData(1) },
    { type: 'button', label: '取消确认', show: proxy.$permission('activityDriverVal:confirm'), event: () => enableData(0) },
    { type: 'button', label: '下载模板', show: proxy.$permission('activityDriverVal:download'), event: downloadTemplate },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission('activityDriverVal:export'), event: exportData },
  ]
})
const { tableParameter, openDialog } = useSelectTableData()
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'slot' },
    { label: '核算期间', value: 'checkPeriodName' },
    { label: '开始会计期间', value: 'beginPeriodName' },
    { label: '结束会计期间', value: 'endPeriodName' },
    { label: '作业动因', value: 'activityDriverName' },
    { label: '总参数值', value: 'totalMoney', align: 'center' },
    { label: '确认状态', value: 'statusName' },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('activityDriverVal:update'),
        event: openModify,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission('activityDriverVal:delete'),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '作业动因值'
})

const detailsInfo = ref({
  visible: false,
})
const detailListInfo = ref({
  visible: false
})

const filterRef = ref()
const isFilters = ref()

const {
  visible: pullDataLogInfoVisible,
  code: pullDataLogInfoCode
} = usePullDataLog('作业动因值(项目成本)')


watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const copyBtn = btns.filter((it) => it.label === '复制')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
  copyBtn.disabled = rows.length !== 1
}, { immediate: true })

onMounted(() => {
  tableInfo.value.api = itemActivityDriverValuequeryListByPage
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {...filterInfo.value.query}
  tableInfo.value.refresh = Math.random()
}

function reset() {
  filterInfo.value.query = {}
  getList()
}

const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function openModify(row) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}作业动因值`
  dialogInfo.value.visible = true
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
  const api = status === 1 ? itemActivityDriverValuesureByIds : itemActivityDriverValueunSureByIds
  api(ids).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function deleteData(row) {
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
    itemActivityDriverValuedelByIds(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}


// 下载模板
function downloadTemplate() {
  exportTemplateExcel('ItemActivityDriverValueTemplate', 'activityDriverVal:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '作业动因值导入模板')
    }
  })
}

function exportData() {
  itemActivityDriverValueexportExcel(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

// 新增参数
const addInfo = ref({
  visible: false,
  ref: null,
  title: '采集',
  addOrUpdate: null,
  data: {
    orgName: setting.value.hospitalName,
    orgId: setting.value.hospitalId,
  },
  fieldList: [
    {
      label: "业务单元",
      value: "orgName",
      type: 'input',
      span: 12,
      disabled: true,
    },
    {
      label: "核算期间",
      value: "checkPeriodName",
      type: 'slot',
      span: 12,
      required: true,
    },
    {
      label: "作业动因",
      value: "activityDriverName",
      type: 'slot',
      span: 12,
      required: true,
    },
  ],
  rules: {
    checkPeriodName: [{required: true, message: '请选择核算期间'}],
    activityDriverName: [{required: true, message: '请选择作业动因'}],
  },
  btList: [
    {type: 'button', show: true, label: '取消', event: goback},
    {type: 'primary', show: true, label: '保存', event: collectSave},
  ],

})

function goback() {
  addInfo.value.visible = false;
}

async function collectSave() {
  let flag = 0;
  await addInfo.value.ref.validate((valid) => {
    console.log(valid);
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    const fromData = {
      ...addInfo.value.data,
      businessTypeName: `项目作业成本法-作业动因值(${addInfo.value.data.activityDriverName})`
    }
    itemActivityDriverValuecollect(fromData).then((res) => {
      if (res.success) {
        proxy.$message.success('保存成功')
        getList();
        addInfo.value.visible = false;
      }
    });
  }
}

const isCopy = ref()
// 复制
function copyData() {
  if(tableInfo.value.sectionRows.length !== 1) return proxy.$message.warning('请选择一条数据')
  isCopy.value = true;
  tableParameter.title = '核算期间'
  tableParameter.filters = []
  tableParameter.callBack = accountingPeriodCallback
  tableParameter.type = 'itemaccountingPeriod'
  openDialog(filterRef.value, 'table')
}
// 采集
function collect() {
  addInfo.value.visible = true;
}

// filter查询
function openAccountingPeriodSelector() {
  isFilters.value = true;
  isCopy.value = false;
  tableParameter.title = '核算期间'
  tableParameter.filters = []
  tableParameter.callBack = accountingPeriodCallback
  tableParameter.type = 'itemaccountingPeriod'
  openDialog(filterRef.value, 'table')
}

// 采集查询
function openPeriodSelector() {
  isFilters.value = false;
  isCopy.value = false;
  tableParameter.title = '核算期间'
  tableParameter.filters = []
  tableParameter.callBack = accountingPeriodCallback
  tableParameter.type = 'itemaccountingPeriod'
  openDialog(filterRef.value, 'table')
}

function accountingPeriodCallback(raw) {
  if(isCopy.value) {
    if(!raw.id) return proxy.$message.warning('请选择期间')
    return trueCopy(raw)
  }
  if (isFilters.value) {
    filterInfo.value.query.checkPeriodId = raw.id
    filterInfo.value.query.checkPeriodName = raw.name
  } else {
    addInfo.value.data.checkPeriodId = raw.id
    addInfo.value.data.checkPeriodName = raw.name
    addInfo.value.data.periodMonth = `${raw.name}(${raw.beginPeriod},${raw.endPeriod})`
  }
}

async function trueCopy(raw) {
  await itemActivityDriverValuecopyByCheckPeriodId({
    checkPeriod: raw.id,
    valueId: tableInfo.value.sectionRows[0].id
  }).then((res) => {
    if (res.success) {
      proxy.$message.success('复制成功')
      getList();
    }
  });
}
// filter查询
function openresourceSelector() {
  isFilters.value = true;
  tableParameter.title = '作业动因'
  tableParameter.filters = null
  tableParameter.pager = false
  tableParameter.callBack = resourceCallback
  tableParameter.type = 'driveractivity'
  openDialog(filterRef.value, 'table')
}
// 采集查询
function openresourcePeriodSelector() {
  isFilters.value = false;
  tableParameter.title = '作业动因'
  tableParameter.filters = null
  tableParameter.pager = false
  tableParameter.callBack = resourceCallback
  tableParameter.type = 'driveractivity'
  openDialog(filterRef.value, 'table')
}

function resourceCallback(raw) {
  if (isFilters.value) {
    filterInfo.value.query.activityDriverId = raw.id
    filterInfo.value.query.activityDriverName = raw.name
  } else {
    addInfo.value.data.activityDriverId = raw.id
    addInfo.value.data.activityDriverName = raw.name
  }
}
</script>

<template>
  <!--  作业动因值-->
  <div class="app-container">
    <div class="layui-card layui-col-md12"
         v-show="!detailsInfo.visible && !pullDataLogInfoVisible && !detailListInfo.visible && !dialogInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab currentTab">列表页</div>
          <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>
        </div>
        <div>
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-checkPeriodName>
              <el-input
                  v-model="filterInfo.query.checkPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择会计期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector">
                    <Search/>
                  </el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-activityDriverName>
              <el-input
                  v-model="filterInfo.query.activityDriverName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择资源动因"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openresourceSelector">
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
    <!-- 采集 -->
    <PageDialog
        :title="addInfo.title"
        :visible="addInfo.visible"
        :btList="addInfo.btList"
        @reset="goback"
    >
      <!-- 条件栏 -->
      <page-form
          className="paddingBox order-model-formBox flex_wrap_start_start"
          v-model:ref-obj="addInfo.ref"
          :data="addInfo.data"
          :field-list="addInfo.fieldList"
          :rules="addInfo.rules"
          :label-width="addInfo.labelWidth"
      >
        <template v-slot:form-checkPeriodName>
          <el-input
              v-model="addInfo.data.checkPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openPeriodSelector">
                <Search/>
              </el-icon>
            </template>
          </el-input>
        </template>
        <template v-slot:form-activityDriverName>
          <el-input
              v-model="addInfo.data.activityDriverName"
              class="not-mongolia"
              type="input"
              placeholder="请选择资源动因"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openresourcePeriodSelector">
                <Search/>
              </el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </PageDialog>
    <Modify
        v-if="dialogInfo.visible"
        v-model:visible="dialogInfo.visible"
        :id="dialogInfo.id"
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
  </div>
</template>

<style scoped lang="scss">

</style>
