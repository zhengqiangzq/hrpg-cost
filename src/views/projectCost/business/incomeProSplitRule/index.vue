<script setup name="incomeProSplitRule">
import Modify from './modify.vue'
import Details from './details.vue'
import DetailList from './detailList.vue'
import {onMounted} from "vue";
import CopyDetail from "./copyDetail.vue";
import {useUpload} from "@/hooks/useUpload";
import {
  ItemIncomeSplitRuledelete,
  ItemIncomeSplitRuleexcel,
  ItemIncomeSplitRulepage
} from "@/api/projectCost/incomeProSplitRule";
const {proxy} = getCurrentInstance()
const PERMISSION_CODE = 'incomeProSplitRule'
const filterInfo = ref({
  query: {
    docTime: ''
  },
  listType: {
    splitList: [
      { key: '按总额拆分', value: 1 },
      { key: '按收费分类拆分', value: 2 },
      { key: '按收费项目拆分', value: 3 },
    ]
  },
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '源科室信息', value: 'sourceDeptName', showLabel: true, type: 'slot' },
    { label: '拆分方法', value: 'splitMethod', type: 'select', list: 'splitList' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}：delete`), event: () => deleteData(), disabled: () => {
      return !tableInfo.value.sectionRows.length
      }
    },
    { type: 'button', label: '复制', show: proxy.$permission(`${PERMISSION_CODE}:copy`), event: () => copyData(), disabled: () => {
        return !tableInfo.value.sectionRows.length
      }
    },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: exportData },
  ]
})
const {
  uploadInfo,
  uploadSuccess,
  uploadError,
  beforeUpload
} = useUpload({}, undefined, '/deptCost/deptSplitRule/import/excel',() => getList(), `${PERMISSION_CODE}:import`)
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '拆分规则编码', value: 'code', type: 'slot' },
    { label: '拆分规则名称', value: 'name' },
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '源科室编码', value: 'sourceDeptCode' },
    { label: '源科室名称', value: 'sourceDeptName' },
    { label: '拆分方法', value: 'splitMethodName' },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '复制',
        show: proxy.$permission(`${PERMISSION_CODE}:copy`),
        event: copyData
      },
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}：delete`),
        event: deleteData,
      },
    ]
  },
  sectionRows: []
})
const pageFilterRef = ref()
const dialogInfo = ref({
  visible: false,
  title: ''
})
const copyInfo = ref({
  visible: false
})

const detailsInfo = ref({
  visible: false,
})
const detailListInfo = ref({
  visible: false
})
const tableParameter = ref({
  visible: false,
  type: '',
  title: '核算期间',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {}
})

// 系统科室
const treeInfo = ref({
  title: '源科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  api: null,
  query: {}
})

onMounted(() => {
  tableInfo.value.api = ItemIncomeSplitRulepage
  getList()
})

function getList() {
  // const times = (filterInfo.value.query.docTime || ',').split(',')
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    // startDocTime: times[0],
    // endDocTime: times[1],
    // docTime: undefined,
    sourceDeptName: undefined,
    accountingPeriodName: undefined,
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {}
  getList()
}
function openModify(row) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.title = row ? '编辑收入拆分' : '新增收入拆分'
  dialogInfo.value.visible = true
}
function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}
function copyData(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  copyInfo.value.row = {
    ids
  }
  copyInfo.value.visible = true
}
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) return
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    ItemIncomeSplitRuledelete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

const copyDetailCallback = (flag) => {
  copyInfo.value.visible = false
  if (flag) {
    getList()
  }
}

function openAccountingPeriodSelector() {
  tableParameter.value.title = '核算期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'itemaccountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.accountingPeriodId = raw.id
  filterInfo.value.query.accountingPeriodName = raw.name
}

// 科室
function openDeptSelector() {
  treeInfo.value.title = "科室";
  treeInfo.value.visible = true;
}

function treeCallback(raw) {
  treeInfo.value.visible = false
  const datas = raw.filter(it => !it.childList)
  filterInfo.value.query.sourceDeptName = datas.map(it => it.name).join(',')
  filterInfo.value.query.sourceDeptIdIn = datas.map(it => it.id).join(',')
}

function exportData() {
  ItemIncomeSplitRuleexcel(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
</script>

<template>
  <!--  收入拆分规则 项目-->
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailListInfo.visible && !detailsInfo.visible && !dialogInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab currentTab">列表页</div>
          <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>
        </div>
        <div>
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="pageFilterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :listTypeInfo="filterInfo.listType"
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
                  <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-sourceDeptName>
              <el-input
                  v-model="filterInfo.query.sourceDeptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择源科室信息"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
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
          <template #col-code="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.code }}</span>
          </template>
        </table-container>
      </div>
    </div>
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
    <CopyDetail title="项目收入拆分" :table-row="copyInfo.row" :visible="copyInfo.visible" @callback="copyDetailCallback" />
    <!--    查询核算科室-->
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
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
