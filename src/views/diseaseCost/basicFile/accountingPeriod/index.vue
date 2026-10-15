<!-- 病种成本核算期间 -->
<script setup name="diseaseCostAccountingPeriod">
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {
  addAccountingPeriod,
  deleteAccountingPeriod, diseaseAccountingPeriodallocationData, diseaseAccountingPeriodcancelAllocationData,
  pageAccountingPeriod,
  updateAccountingPeriod
} from "@/api/diseaseCostAccountingPeriod";
import moment from "moment";
import SelectAllocationOrgDetails from "@/components/SelectAllocationOrg/details.vue";
import {useAllocation} from "@/hooks/useAllocation";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'diseaseCostAccountingPeriod'
const API = {
  query: pageAccountingPeriod,
  add: addAccountingPeriod,
  update: updateAccountingPeriod,
  delete: deleteAccountingPeriod,
  download: exportTemplateExcel,
}


const {
  selectAllocationInfo,
  selectAllocationDetailInfo,
  selectLoids,
  allocation,
  allocationDataType,
  selectAllocationCallBack,
  allocationDetail,
  cancelAllocation
} = useAllocation('diseaseAccountingPeriod', { allocation: diseaseAccountingPeriodallocationData, cancel: diseaseAccountingPeriodcancelAllocationData }, getList)

const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '核算期间编码', value: 'code' },
    { label: '核算期间名称', value: 'name' },
    { label: '开始期间', value: 'beginPeriodName' },
    { label: '结束期间', value: 'endPeriodName' },
    { label: '项目核算期间', value: 'itemAccountingPeriodName' },
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
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
      },
      {
        label: '分配详情',
        show: proxy.$permission(`${PERMISSION_CODE}:add`) && proxy.$fn.getControl(allocationDataType),
        event: allocationDetail,
      },
    ]
  },
  sectionRows: []
})

const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '期间编码/名称', value: 'OrBatchLike#code#name', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    {
      type: 'button',
      label: '分配',
      event: () => allocation(),
      show: proxy.$permission(`${PERMISSION_CODE}:add`) && proxy.$fn.getControl(allocationDataType),
      disabled: () => {
        return !tableInfo.sectionRows.length
      },
    },
    {
      type: 'button',
      label: '取消全部分配',
      event: () => cancelAllocation(),
      show: proxy.$permission(`${PERMISSION_CODE}:add`) && proxy.$fn.getControl(allocationDataType),
    },
  ]
})
const dialogInfoRef = ref(null)
const dialogInfo = reactive({
  refObj: null,
  row: {},
  title: '核算期间',
  visible: false,
  fieldList: [
    { label: '核算期间编码', span: 12, value: 'code', type: 'input' },
    { label: '核算期间名称', span: 12, value: 'name', type: 'input' },
    { label: '开始期间', span: 12, value: 'beginPeriodName', type: 'slot' },
    { label: '结束期间', span: 12, value: 'endPeriodName', type: 'slot' },
    { label: '项目核算期间', span: 12, value: 'itemAccountingPeriodName', type: 'slot' },
    { label: '备注', span: 12, value: 'remark', type: 'input' },
  ],
  rules: {
    code: [{ required: true, message: '请输入核算期间代码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入核算期间名称', trigger: 'blur' }],
    beginPeriodName: [
        { required: true, message: '请选择开始会计期间', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            const data = dialogInfo.row
            const startDate = moment(value), endDate = moment(data.endPeriodName)
            if (startDate.isAfter(endDate)) {
              callback('开始期间应该小于结束期间')
            }
            callback()
          }, trigger: 'blur'
        }
    ],
    endPeriodName: [
      { required: true, message: '请选择结束会计期间', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          const data = dialogInfo.row
          const startDate = moment(data.beginPeriodName), endDate = moment(value)
          if (startDate.isAfter(endDate)) {
            callback('开始期间应该小于结束期间')
          }
          callback()
        }, trigger: 'blur'
      }
    ],
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
})

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

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  deleteBtn.disabled = !rows.length
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
  dialogInfo.row = row ? cloneDeep(row) : {}
  dialogInfo.title = `${!!row?.id ? '修改' : '新增'}核算期间`
  dialogInfo.visible = true
}

function saveData() {
  dialogInfo.refObj.validate(flag => {
    if (flag) {
      const data = dialogInfo.row
      const api = data.id ? API.update : API.add
      api(data).then(res => {
        if (res.success) {
          proxy.$message.success('保存成功')
          dialogInfo.visible = false
          getList()
        }
      })
    }
  })
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

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
    selectLoids.value = raw.map(it => it.id)
  }
}

function openAccountingPeriodSelector(mark) {
  tableParameter.value.title = '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  tableParameter.value.mark = mark
  dialogInfoRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  if (tableParameter.value.mark === 'end') {
    dialogInfo.row.endPeriodId = raw.id
    dialogInfo.row.endPeriodName = raw.periodYearAndMonth
  } else {
    dialogInfo.row.beginPeriodId = raw.id
    dialogInfo.row.beginPeriodName = raw.periodYearAndMonth
  }
}

const paramsParameter = ref({
  visible: false,
  type: 'itemaccountingPeriod',
  title: '核算期间',
  checkBox: false,
  pager: true,
  callback: null,
  filters: [],
  fieldList: [],
  query: {}
})

function openProPeriodSelector() {
  paramsParameter.value.callBack = ProPeriodCallback
  paramsParameter.value.visible = true
  dialogInfoRef.value.openDialog(paramsParameter.value, 'table')
}

function ProPeriodCallback(raw) {
  dialogInfo.row.itemAccountingPeriodId = raw.id
  dialogInfo.row.itemAccountingPeriodName = raw.name
}

</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          ></NewPageFilter>
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
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          @handleEvent="tableHandler"
      >
      </table-container>
    </div>
    <dialog-form :title="dialogInfo.title" :btList="dialogInfo.btList" v-model:visible="dialogInfo.visible">
      <page-form
          ref="dialogInfoRef"
          v-model:ref-obj="dialogInfo.refObj"
          :label-width="dialogInfo.labelWidth"
          :data="dialogInfo.row"
          :field-list="dialogInfo.fieldList"
          :rules="dialogInfo.rules"
      >
        <template #form-beginPeriodName>
          <el-input
              v-model="dialogInfo.row.beginPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择开始期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #form-endPeriodName>
          <el-input
              v-model="dialogInfo.row.endPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择结束期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriodSelector('end')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #form-itemAccountingPeriodName>
          <el-input
              v-model="dialogInfo.row.itemAccountingPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择结束期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openProPeriodSelector()"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </dialog-form>
    <SelectAllocationOrg
        v-if="selectAllocationInfo.visible"
        v-model:query="selectAllocationInfo.query"
        v-model:show-dialog="selectAllocationInfo.visible"
        title="选择组织"
        :saveEmpty="true"
        :checkStrictly="true"
        :check-box="true"
        :highlightCurrent="true"
        @callback="selectAllocationCallBack"
    ></SelectAllocationOrg>
    <SelectAllocationOrgDetails
        v-if="selectAllocationDetailInfo.visible"
        v-model:query="selectAllocationDetailInfo.query"
        v-model:show-dialog="selectAllocationDetailInfo.visible"
        :allocationApi="selectAllocationDetailInfo.allocation"
        :cancelApi="selectAllocationDetailInfo.cancel"
        :loids="selectLoids"
        @reset="getList"
    ></SelectAllocationOrgDetails>
  </div>
</template>

<style scoped lang="scss">

</style>
