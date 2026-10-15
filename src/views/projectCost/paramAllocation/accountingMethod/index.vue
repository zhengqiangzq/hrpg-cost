<script setup name="accountingMethod">
import Modify from './modify.vue'
import Details from './details.vue'
import {onMounted} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import {useStorage} from "@vueuse/core";
import DetailList from "./detailList.vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  indirectModelPramcollection,
  indirectModelPramconfirm,
  indirectModelPramdel,
  indirectModelPramexportExcel,
  indirectModelPrampage
} from "@/api/accountingMethod";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)
const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'accountingMethod',
  type: '13056',
  action: '/item/param/indirectModelPram/import/excelRecord',
})

const { tableParameter, openDialog } = useSelectTableData()

const filterInfo = ref({
  query: {},
  list: [
    { label: '核算期间', value: 'itemAccountingPeriodName', showLabel: true, type: 'slot' },
    { label: '单据号', value: 'docNum', type: 'input' },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status' },
    { label: '核算方法', value: 'itemParamIndirectModelName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    {
      type: 'button',
      label: '新增',
      event: () => openModify(),
      show: proxy.$permission('accountingMethod:add'),
    },
    { type: 'button', label: '删除', show: proxy.$permission('accountingMethod:delete'), event: () => deleteData() },
    {
      type: 'button',
      label: '采集',
      show: true,
      event: () => collect()
    },
    { type: 'button', label: '拉取日志查询', show: proxy.$permission('accountingMethod:collect'), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '确认',show: proxy.$permission('accountingMethod:confirm'), event: () => enableData(1) },
    { type: 'button', label: '取消确认',show: proxy.$permission('accountingMethod:confirm'), event: () => enableData(0) },
    { type: 'button', label: '下载模板', show: proxy.$permission('accountingMethod:download'), event: downloadTemplate },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission('accountingMethod:export'), event: exportData },
  ]
})



const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'slot' },
    { label: '核算期间', value: 'itemAccountingPeriodName' },
    { label: '开始会计期间', value: 'itemAccountingPeriodStartDate' },
    { label: '结束会计期间', value: 'itemAccountingPeriodEndDate' },
    { label: '核算方法', value: 'itemParamIndirectModelName' },
    { label: '总参数值', value: 'value', align: 'center' },
    { label: '确认状态', value: 'statusValue' },
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
        show: proxy.$permission('accountingMethod:update'),
        event: openModify,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission('accountingMethod:delete'),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '核算方法参数'
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
} = usePullDataLog('核算方法参数')

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
}, { immediate: true })

onMounted(() => {
  tableInfo.value.api = indirectModelPrampage
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
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}核算方法参数`
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
  const api = indirectModelPramconfirm
  api({
    ids,
    status,
  }).then(({code}) => {
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
    indirectModelPramdel(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}


// 下载模板
function downloadTemplate() {
  exportTemplateExcel('itemParamIndirectModelParam', 'accountingMethod:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '核算方法参数导入模板')
    }
  })
}

function exportData() {
  indirectModelPramexportExcel(filterInfo.value.copyQuery).then(res => {
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
      label: "核算方法",
      value: "itemParamIndirectModelName",
      type: 'slot',
      span: 12,
      required: true,
    },
    {
      label: "核算期间",
      value: "itemAccountingPeriodName",
      type: 'slot',
      span: 12,
      required: true,
    },
  ],
  rules: {
    itemParamIndirectModelName: [{required: true, message: '请选择核算方法'}],
    itemAccountingPeriodName: [{required: true, message: '请选择核算期间'}],
  },
  btList: [
    {type: 'button', show: true, label: '取消', event: goback},
    {type: 'primary', show: true, label: '保存', event: save},
  ],

})

function goback() {
  addInfo.value.visible = false;
}

async function save() {
  let flag = 0;
  await addInfo.value.ref.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    const fromData = {
      ...addInfo.value.data,
      businessTypeName: `项目参数分配法-核算方法参数(${addInfo.value.data.itemParamIndirectModelName})`
    }
    indirectModelPramcollection(fromData).then((res) => {
      if (res.success) {
        proxy.$message.success('保存成功')
        getList();
        addInfo.value.visible = false;
      }
    });
  }
}

// 采集
function collect() {
  addInfo.value.visible = true;
}

// filter查询
function openAccountingPeriodSelector() {
  isFilters.value = true;
  tableParameter.title = '核算期间'
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.visible = true
  tableParameter.filters = []
  tableParameter.callBack = accountingPeriodCallback
  openDialog(filterRef.value)
}

// 采集查询
function openPeriodSelector() {
  isFilters.value = false;
  tableParameter.title = '核算期间'
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.visible = true
  tableParameter.filters = []
  tableParameter.callBack = accountingPeriodCallback
  openDialog(filterRef.value)
}

function accountingPeriodCallback(raw) {
  if (isFilters.value) {
    filterInfo.value.query.itemAccountingPeriodId = raw.id
    filterInfo.value.query.itemAccountingPeriodName = raw.name
  } else {
    addInfo.value.data.itemAccountingPeriodId = raw.id
    addInfo.value.data.itemAccountingPeriodName = raw.name
    addInfo.value.data.periodMonth = `${raw.name}(${raw.beginPeriod},${raw.endPeriod})`
  }
}

function openindirectSelector() {
  isFilters.value = true;
  tableParameter.title = '核算方法'
  tableParameter.type = 'indirectModel'
  tableParameter.pager = false
  tableParameter.callBack = accounindirectCallback
  openDialog(filterRef.value)
}

function opendirectSelector() {
  isFilters.value = false;
  tableParameter.title = '核算方法'
  tableParameter.type = 'indirectModel'
  tableParameter.pager = false
  tableParameter.callBack = accounindirectCallback
  openDialog(filterRef.value)
}

function accounindirectCallback(raw) {
  if (isFilters.value) {
    filterInfo.value.query.itemParamIndirectModelId = raw.id
    filterInfo.value.query.itemParamIndirectModelName = raw.name
  } else {
    addInfo.value.data.itemParamIndirectModelId = raw.id
    addInfo.value.data.itemParamIndirectModelName = raw.name
  }
}

</script>

<template>
  <!--  核算方法参数-->
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
            <template #filter-itemAccountingPeriodName>
              <el-input
                  v-model="filterInfo.query.itemAccountingPeriodName"
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
            <template #filter-itemParamIndirectModelName>
              <el-input
                  v-model="filterInfo.query.itemParamIndirectModelName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算方法"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openindirectSelector">
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
        <template v-slot:form-itemParamIndirectModelName>
          <el-input
              v-model="addInfo.data.itemParamIndirectModelName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算方法"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="opendirectSelector">
                <Search/>
              </el-icon>
            </template>
          </el-input>
        </template>
        <template v-slot:form-itemAccountingPeriodName>
          <el-input
              v-model="addInfo.data.itemAccountingPeriodName"
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
