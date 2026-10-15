<script setup name="pelSalaryDetails">
import Modify from './modify.vue'
import Details from './details.vue'
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import {
  collectItemStaffSalaryunSure, itemStaffSalarycheck,
  itemStaffSalarydelete, itemStaffSalaryexportExcel,
  itemStaffSalaryqueryListByPage,
  itemStaffSalarysureById,
  itemStaffSalaryunSureById
} from "@/api/pelSalaryDetails";
import {useStorage} from "@vueuse/core";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()
const direction = ref('rtl')
const setting = useStorage('setting', {}, sessionStorage)
const PERMISSION_CODE = 'pelSalaryDetails'
const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'pelSalaryDetails',
  type: '13046',
  action: '/item/itemStaffSalary/import/excelRecord',
})
const filterInfo = ref({
  query: {},
  list: [
    { label: '开始期间', value: 'beginPeriodName', showLabel: true, type: 'slot' },
    { label: '结束期间', value: 'endPeriodName', showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '人员信息', value: 'staffName', showLabel: true, type: 'slot' },
    { label: '技术职称', value: 'technicalTitleName', showLabel: true, type: 'slot' },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData() },
    { type: 'button', label: '采集', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => openCollectData() },
    { type: 'button', label: '拉取日志查询', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '检查', show: proxy.$permission(`${PERMISSION_CODE}:check`), event: () => opencheckData() },
    { type: 'button', label: '确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => enableData(1) },
    { type: 'button', label: '取消确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => enableData(0) },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: downloadTemplate },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    // { label: '单据号', value: 'docNum', type: 'slot' },
    { label: '会计期间', value: 'periodName', type: 'slot' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '人员编码', value: 'staffCode' },
    { label: '人员名称', value: 'staffName' },
    { label: '技术职称编码', value: 'technicalTitleCode' },
    { label: '技术职称名称', value: 'technicalTitleName' },
    { label: '薪资金额', value: 'totalMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalMoney) },
    { label: '确认状态', value: 'statusName' },
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
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '人员薪资明细'
})

const detailsInfo = ref({
  visible: false,
})


const filterRef = ref()

const collectInfoRef = ref()
const collectInfo = reactive({
  refObj: null,
  title: '采集',
  visible: false,
  data: {
    hospitalName: setting.value.hospitalName
  },
  fieldList: [
    { label: '核算期间', span: 12, value: 'accountingPeriodName', type: 'slot' },
    { label: '开始会计期间', span: 12, value: 'beginPeriod', type: 'input', disabled: true },
    { label: '结束会计期间', span: 12, value: 'endPeriod', type: 'input', disabled: true },
  ],
  rules: {
    accountingPeriodName: [{ required: true, message: '请选择核算期间', trigger: 'change' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: collectData }
  ]
})

const drawer = ref(false)
const tableAssetInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  query: {},
  fieldList: [
    {label: '薪酬项目编码', value: 'code', width: 120 },
    {label: '薪酬项目名称', value: 'name', width: 140 },
    {label: '是否设置薪酬项目关系', align: 'center', value: 'flag', formatter: (row) => row.flag === '0' ? '否' : '是' },
  ],
  data: []
})

const {
  visible: pullDataLogInfoVisible,
  code: pullDataLogInfoCode
} = usePullDataLog('人员薪资明细(项目成本)')


watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  const check = btns.filter((it) => it.label === '检查')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
  check.disabled = !rows.length
}, { immediate: true })

onMounted(() => {
  tableInfo.value.api = itemStaffSalaryqueryListByPage
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
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}人员薪资明细`
  dialogInfo.value.visible = true
}
function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}

// 检查
function opencheckData() {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  tableAssetInfo.value.data = [];
  itemStaffSalarycheck(ids).then(({ data, code }) => {
    if (code === 200) {
      proxy.$message.success('检查成功')
      tableAssetInfo.value.data = data;
      drawer.value = true
    }
  })
}


function enableData(status) {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  const api = status === 1 ? itemStaffSalarysureById : itemStaffSalaryunSureById
  api(ids).then(({ code }) => {
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
    itemStaffSalarydelete({ids: ids}).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

const { tableParameter: useTableParameter, openDialog } = useSelectTableData()
function openCollectData() {
  collectInfo.data.orgId = setting.value.hospitalId
  collectInfo.data.hospitalName = setting.value.hospitalName
  collectInfo.visible = true
}

function collectData() {
  collectInfo.refObj.validate(flag => {
    if (flag) {
      collectItemStaffSalaryunSure(collectInfo.data).then(res => {
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

const tableParameter = ref({
  visible: false,
  type: '',
  title: '会计期间',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {
    sort: 'begin_date desc'
  }
})
function openAccountingPeriodSelector(name) {
  tableParameter.value.title = `${name}期间`
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  filterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  if(tableParameter.value.title === '开始期间') {
    filterInfo.value.query.beginPeriodId = raw.id
    filterInfo.value.query.beginPeriodName = raw.periodYearAndMonth
  } else {
    filterInfo.value.query.endPeriodId = raw.id
    filterInfo.value.query.endPeriodName = raw.periodYearAndMonth
  }
}


const staffInfo = ref({
  visible: false,
  type: 'staff',
  title: '人员信息',
  checkBox: false,
  pager: true,
  callback: null,
  fieldList: [],
  query: {}
})
function openStaffSelector() {
  staffInfo.value.callBack = staffCallback
  staffInfo.value.visible = true
  filterRef.value.openDialog(staffInfo.value, 'table')
}
function staffCallback(raw) {
  filterInfo.value.query.staffId = raw.id
  filterInfo.value.query.staffName = raw.name
}
// 下载模板
function downloadTemplate() {
  exportTemplateExcel('itemStaffSalaryTemplate', `${PERMISSION_CODE}:download`).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '人员薪资明细导入模板')
    }
  })
}

function exportData() {
  itemStaffSalaryexportExcel(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

const treeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})
const TechnicalInfo = ref({
  title: '技术职称',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})

function opentechnology() {
  TechnicalInfo.value.title = "技术职称";
  treeInfo.value.title = "技术职称";
  TechnicalInfo.value.visible = true;
}
function openDeptSelector() {
  treeInfo.value.title = "核算科室";
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  if(treeInfo.value.title === '核算科室') {
    treeInfo.value.checkedList = raw;
    let datas = raw?.filter((it) => !it.childList)
    filterInfo.value.query.deptId = datas?.map((it) => it.id);
    filterInfo.value.query.deptName = datas?.map((it) => it.name);
    filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
  } else {
    let datas = raw?.filter((it) => !it.children)
    TechnicalInfo.value.checkedList = raw;
    filterInfo.value.query.technicalTitleId = datas?.map((it) => it.id);
    filterInfo.value.query.technicalTitleName = datas?.map((it) => it.name);
    filterInfo.value.query.technicalTitleIdList = datas?.map((it) => it.id);
  }
}


function openAccountingPeriod(mark) {
  useTableParameter.type = 'itemaccountingPeriod'
  useTableParameter.query = {}
  useTableParameter.mark = mark
  useTableParameter.callBack = (raw) => {
    collectInfo.data.itemAccountingPeriodId = raw.id
    collectInfo.data.accountingPeriodName = raw.name
    collectInfo.data.beginPeriod = raw.beginPeriod
    collectInfo.data.endPeriod = raw.endPeriod
    collectInfo.data.periodMonth = `${raw.name}(${raw.beginPeriod},${raw.endPeriod})`
  }
  const ref = collectInfoRef.value
  openDialog(ref)
}
</script>

<template>
<!-- 人员薪资明细 -->
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailsInfo.visible && !pullDataLogInfoVisible && !dialogInfo.visible">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-beginPeriodName>
              <el-input
                  v-model="filterInfo.query.beginPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择开始期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector('开始')"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-endPeriodName>
              <el-input
                  v-model="filterInfo.query.endPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择结束期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector('结束')"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-deptName>
              <el-input
                  v-model="filterInfo.query.deptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-staffName>
              <el-input
                  v-model="filterInfo.query.staffName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择人员信息"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openStaffSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-technicalTitleName>
              <el-input
                  v-model="filterInfo.query.technicalTitleName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择技术职称"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="opentechnology"><Search /></el-icon>
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
          <template #col-periodName="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.periodName }}</span>
          </template>
        </table-container>
      </div>
    </div>

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
              <el-icon @click="openAccountingPeriod('collect')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </dialog-form>
    <PullDataLog
        v-if="pullDataLogInfoVisible"
        :businessType="pullDataLogInfoCode"
        @returnBack="pullDataLogInfoVisible = false" />
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

    <el-drawer v-model="drawer" :direction="direction">
      <template #default>
        <table-container
            :refresh="tableAssetInfo.refresh"
            :init-curpage="tableAssetInfo.initCurpage"
            v-model:data="tableAssetInfo.data"
            :api="tableAssetInfo.api"
            :query="tableAssetInfo.query"
            :tabIndex="true"
            :pager="false"
            :checkBox="false"
            :isDynamic="false"
            :field-list="tableAssetInfo.fieldList"
            :handle="tableAssetInfo.handle"
        />
      </template>
      <template #footer>
        <div>
          <el-button @click="() => drawer = false">返回</el-button>
        </div>
      </template>
    </el-drawer>
    <SelectProDeptTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :checkedList="treeInfo.checkedList"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
    <SelectTechnicalTitleTree
        v-if="TechnicalInfo.visible"
        v-model:showDialog="TechnicalInfo.visible"
        :title="TechnicalInfo.title"
        :checkStrictly="TechnicalInfo.checkStrictly"
        :isLeaf="TechnicalInfo.isLeaf"
        :query="TechnicalInfo.query"
        :checkBox="TechnicalInfo.checkBox"
        :checkedList="TechnicalInfo.checkedList"
        :api="TechnicalInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
