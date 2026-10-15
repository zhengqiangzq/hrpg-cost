<script setup name="collectionMethodDefinition">
import {onMounted, ref, watch} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import Modify from "./modify.vue";
import {
  deleteCollectionMethodDefinition,
  exportCollectionMethodDefinition,
  pageCollectionMethodDefinition
} from "@/api/diseaseCostCollectionMethodDefinition";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const PERMISSION_CODE = 'collectionMethodDefinition'
const {proxy} = getCurrentInstance()

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13081',
  action: '/methodService/diseaseApportionWay/import/excelRecord',
})
const filterInfo = ref({
  query: {
  },
  list: [
    { label: '科室信息', value: 'deptName', showLabel: true, type: 'slot', event: getList },
    { label: '归集方法', value: 'way', type: 'select-model', code: 'cost_apportionment_method', event: getList },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteRow() },
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
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '归集方法', value: 'wayValue' },
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
        event: (row) => openModify(JSON.parse(JSON.stringify(row))),
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteRow,
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '',
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

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { deep: true, immediate: true })

onMounted(() => {
  tableInfo.value.api = pageCollectionMethodDefinition
  getList()
})

function getList() {
  tableInfo.value.refresh = Math.random()
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    deptName: undefined
  }
}
function reset() {
  filterInfo.value.query = {}
  treeInfo.value.checkedList = [];
  getList()
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('归集方法定义导入模板', `${PERMISSION_CODE}:download`).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '归集方法定义导入模板')
    }
  })
}
function exportData() {
  exportCollectionMethodDefinition(filterInfo.value.copyQuery).then(res => {
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
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}归集方法定义`
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
    deleteCollectionMethodDefinition(ids).then(({ code }) => {
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
  let datas = raw?.filter((it) => !it.childList && checkPropCondition(it))
  filterInfo.value.query.deptIdIn = datas?.map((it) => it.id).join(',');
  filterInfo.value.query.deptName = datas?.map((it) => it.name).join(',');
}
function checkPropCondition(it) {
  return (it.accountAttribute == 1) && (it.diseaseAccountStatus == 1) && (it.sectionAttribute != 1)
}

</script>

<template>
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
        :batch="dialogInfo.batch"
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
        :checkedList="treeInfo.checkedList"
        :api="treeInfo.api"
        :accountAttribute="1"
        :diseaseAccountStatus="1"
        :sectionAttributeNot="1"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
