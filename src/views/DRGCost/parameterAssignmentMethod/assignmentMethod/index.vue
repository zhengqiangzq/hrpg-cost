<script setup name="DRGAssignmentMethod">
import {onMounted, watch} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import Modify from "./modify.vue";
import {
  deleteAssignmentMethod,
  exportAssignmentMethod,
  pageAssignmentMethod
} from "@/api/DRGCost/assignmentMethod";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'DRGAssignmentMethod',
  type: '130891',
  action: '/drg/apportionMethod/import/excelRecord',
})
const filterInfo = ref({
  query: {
  },
  list: [
    { label: '科室信息', value: 'deptName', showLabel: true, type: 'slot', event: getList },
    { label: '分摊方法', value: 'method', type: 'select-model', code: 'cost_apportionment_method', event: getList },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission('DRGAssignmentMethod:add'), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission('DRGAssignmentMethod:delete'), event: () => deleteRow() },
    { type: 'button', label: '下载模板', show: proxy.$permission('DRGAssignmentMethod:download'), event: downloadTemplate },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission('DRGAssignmentMethod:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '分摊方法', value: 'methodValue' },
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
        show: proxy.$permission('DRGAssignmentMethod:update'),
        event: (row) => openModify(JSON.parse(JSON.stringify(row))),
      },
      {
        label: '删除',
        show: proxy.$permission('DRGAssignmentMethod:delete'),
        event: deleteRow,
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '分摊方法定义',
  id: null
})

const treeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  api: null,
  checkedList: [],
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { deep: true, immediate: true })

onMounted(() => {
  tableInfo.value.api = params => pageAssignmentMethod(params, 'DRGAssignmentMethod:list')
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
  exportTemplateExcel('drgApportionMethodTemplate', 'DRGAssignmentMethod:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, 'DRG分摊方法导入模板')
    }
  })
}
function exportData() {
  exportAssignmentMethod(filterInfo.value.copyQuery).then(res => {
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
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}分摊方法`
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
    deleteAssignmentMethod(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function openDeptSelector(name) {
  treeInfo.value.type = name
  treeInfo.value.title = '科室信息'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  treeInfo.value.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptId = datas?.map((it) => it.id);
  filterInfo.value.query.deptName = datas?.map((it) => it.name);
  filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
}
</script>

<template>
<!-- 分摊方法定义 -->
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!dialogInfo.visible">
      <div class="layui-card-body">
        <div class="filter-wrapper">
        <!-- 条件栏 -->
        <NewPageFilter
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
            :filter-btn="filterInfo.filterbtn"
        >
          <template #filter-deptName>
            <el-input
                v-model="filterInfo.query.deptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择科室信息"
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
    <SelectDeptArchivesTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :api="treeInfo.api"
        :checkedList="treeInfo.checkedList"
        :accountAttribute="1"
        :diseaseAccountStatus="1"
        :sectionAttributeNot="1"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
