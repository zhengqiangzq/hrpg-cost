<script setup name="directionalAllocationSetting">
import {getCurrentInstance,onMounted, watch} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import {
  deleteDirectionAllocationSetting, directApportionmentcopy, exportDirectionAllocationSetting,
  pageDirectionAllocationSetting,
} from "@/api/directionalAllocationSetting";
import {useUpload} from "@/hooks/useUpload";
import Modify from "./modify.vue";
import DetailList from "./detailList.vue";
import Details from "./details.vue";
const {proxy} = getCurrentInstance()
const {
  uploadInfo,
  uploadSuccess,
  uploadError,
  beforeUpload
} = useUpload({}, undefined, '/directApportionment/importExcel', () => getList(), 'directionalAllocationSetting:import')
const filterInfo = ref({
  query: {
  },
  list: [
    { label: '会计期间', value: 'periodName', showLabel: true, type: 'slot' },
    { label: '源科室', value: 'sourceDeptName', showLabel: true, type: 'slot' },
    { label: '定向方法', value: 'directType', type: 'select-model', code: 'cost_apportionment_method' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission('directionalAllocationSetting:add'), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission('directionalAllocationSetting:delete'), event: () => deleteRow() },
    { type: 'button', label: '复制', show: proxy.$permission('directionalAllocationSetting:copy'), event: () => copyData() },
    { type: 'button', label: '下载模板', show: proxy.$permission('directionalAllocationSetting:download'), event: downloadTemplate },
    { type: 'slot', label: '导入', show: proxy.$permission('directionalAllocationSetting:import'), value: 'uploadFile' },
    { type: 'button', label: '导出Excel', show: proxy.$permission('directionalAllocationSetting:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '定向规则编码', value: 'code', type: 'slot' },
    { label: '定向规则名称', value: 'name' },
    { label: '会计期间', value: 'periodName' },
    { label: '源科室编码', value: 'sourceDeptCode' },
    { label: '源科室名称', value: 'sourceDeptName' },
    { label: '定向方法', value: 'directTypeName' },
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
        show: proxy.$permission('directionalAllocationSetting:update'),
        event: (row) => openModify(JSON.parse(JSON.stringify(row))),
      },
      {
        label: '删除',
        show: proxy.$permission('directionalAllocationSetting:delete'),
        event: deleteRow,
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  ref: null,
  visible: false,
  id: '',
  title: '定向分摊设置',
})
const detailListInfo = ref({
  visible: false
})
const detailsInfo = ref({
  visible: false,
})

function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: [],
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const copyBtn = btns.filter((it) => it.label === '复制')[0]
  deleteBtn.disabled = !rows.length
  copyBtn.disabled = !rows.length
}, { deep: true, immediate: true })

onMounted(() => {
  tableInfo.value.api = pageDirectionAllocationSetting
  getList()
})

function getList() {
  tableInfo.value.refresh = Math.random()
  filterInfo.value.copyQuery = JSON.parse(JSON.stringify(filterInfo.value.query))
}
function reset() {
  filterInfo.value.query = {}
  getList()
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('directApportionmentTemplate', 'directionalAllocationSetting:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '定向分摊设置导入模板')
    }
  })
}
function exportData() {
  exportDirectionAllocationSetting(filterInfo.value.copyQuery).then(res => {
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

function openModify(row) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}定向分摊设置`
  dialogInfo.value.visible = true
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
    deleteDirectionAllocationSetting(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function openDeptSelector() {
  treeInfo.value.title = '源科室';
  treeInfo.value.visible = true
  treeInfo.value.query = {
    status: '1',
    shareStatus: '1',
  }
}
function treeCallback(raw) {
  const data = filterInfo.value.query
  treeInfo.value.checkedList = raw
  const datas = raw?.filter((it) => !it.childList)
  data.sourceDeptName = datas?.map((it) => it.name);
  data.sourceDeptId = datas?.map((it) => it.id);
  data.sourceDeptIdList = datas?.map((it) => it.id);
}
const filterRef = ref()

const tableParameter = ref({
  visible: false,
  type: 'accountingPeriod',
  title: '会计期间',
  isFilter: true,
  checkBox: false,
  pager: true,
  callback: null,
  filters: [],
  fieldList: [],
  query: {
    sort: 'begin_date desc'
  }
})
// 复制
function copyData() {
  if(tableInfo.value.sectionRows.length === 0) return proxy.$message.warming('请勾选数据')
  openAccountingPeriodSelector(false)
}
function openAccountingPeriodSelector(type) {
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  tableParameter.value.isFilter = type
  filterRef.value.openDialog(tableParameter.value, 'table')
}

async function accountingPeriodCallback(raw) {
  if(tableParameter.value.isFilter) {
    filterInfo.value.query.periodId = raw.id
    filterInfo.value.query.periodName = raw.periodYearAndMonth
  } else {
    if(!raw?.id) return
  //   复制
    const { code, msg } = await directApportionmentcopy({
      ids: tableInfo.value.sectionRows.map(it => it.id),
      periodId: raw.id
    })
    if( code === 200 ) {
      proxy.$message.success('复制成功')
      await getList()
    } else {
      proxy.$message.error(msg)
    }
  }

}
</script>

<template>
<!-- 定向分摊设置 -->
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
            ref="filterRef"
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
            :filter-btn="filterInfo.filterbtn"
        >
          <template #filter-periodName>
            <el-input
                v-model="filterInfo.query.periodName"
                class="not-mongolia"
                type="input"
                placeholder="请选择会计期间"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openAccountingPeriodSelector(true)"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #filter-sourceDeptName>
            <el-input
                v-model="filterInfo.query.sourceDeptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择源科室"
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
            <template v-slot:filter-uploadFile>
              <el-upload
                  :headers="uploadInfo.headers"
                  :show-file-list="false"
                  :data="uploadInfo.data"
                  :on-error="uploadError"
                  :on-success="uploadSuccess"
                  :before-upload="beforeUpload"
                  :action="uploadInfo.action"
              >
                <el-button>导入</el-button>
              </el-upload>
            </template>
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
    <SelectDeptArchivesTree
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
  </div>
</template>

<style scoped lang="scss">

</style>
