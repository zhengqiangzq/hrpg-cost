<!-- 会计科目 -->
<script setup name="accountingSubjects">
import {onMounted} from "vue";

import Modify from "./modify.vue";
import {exportTemplateExcel} from "@/api/pub";
import {
  bdAccountcollection,
  bdAccountdelete,
  bdAccountenable,
  bdAccountexportExcel,
  bdAccountpage
} from "@/api/accountingSubjects";
import {useStorage} from "@vueuse/core";
import {useUpload} from "@/hooks/useUpload";
const {proxy} = getCurrentInstance()

const setting = useStorage('setting', {}, sessionStorage)
const filterInfo = ref({
  query: {
  },
  list: [
    { label: '科目编码', value: 'code', showLabel: true, type: 'input' },
    { label: '科目名称', value: 'name', showLabel: true, type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    // { type: 'button', label: '新增', show: proxy.$permission('accountingSubjects:add'), event: openModify },
    { type: 'button', label: '删除', show: proxy.$permission('accountingSubjects:delete'), event: () => deleteBtn() },
    { type: 'button', label: '采集', show: proxy.$permission('accountingSubjects:collection'), event: collection },
    { type: 'button', label: '启用', show: proxy.$permission('accountingSubjects:enable'), event: () => enable() },
    { type: 'button', label: '停用', show: proxy.$permission('accountingSubjects:deactivate'), event: () => deactivatet() },
    // { type: 'button', label: '下载模版', show: proxy.$permission('accountingSubjects:download'), event: downloadTemplate },
    // { type: 'slot', label: '导入', show: proxy.$permission('accountingSubjects:upload'), value: 'uploadFile' },
    { type: 'button', label: '导出Excel', show: proxy.$permission('accountingSubjects:export'), event: showExportExcel },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '科目编码', value: 'code' },
    { label: '科目名称', value: 'name' },
    { label: '科目全称', value: 'fullName' },
    { label: '上级项目编码', value: 'parentCode' },
    { label: '上级项目名称', value: 'parentName' },
    { label: '辅助核算', value: 'accassItemValue' },
    { label: '科目类型', value: 'accTypeValue' },
    { label: '科目方向', value: 'directValue' },
    { label: '是否末级', value: 'lastValue' },
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
        show: proxy.$permission('accountingSubjects:update'),
        event: openModify,
        ifRender: (row) => row.enableStatus != 1
      },
      {
        label: '删除',
        show: proxy.$permission('accountingSubjects:delete'),
        popconfirmText: '删除后将改变数据,是否继续？',
        event: romove,
        ifRender: (row) => row.enableStatus != 1
      },
      {
        label: '启用',
        show: proxy.$permission('accountingSubjects:enable'),
        popconfirmText: '操作后将改变数据,是否继续？',
        event: enable,
        ifRender: (row) => row.enableStatus != 1
      },
      {
        label: '停用',
        show: proxy.$permission('accountingSubjects:enable'),
        popconfirmText: '操作后将改变数据,是否继续？',
        event: deactivatet,
        ifRender: (row) => row.enableStatus == 1
      },
    ]
  },
  sectionRows: []
})

const filterRef = ref()
const dialogInfo = ref({
  visible: false,
  title: '会计科目'
})

const {
  uploadInfo,
  uploadError,
  uploadSuccess,
  beforeUpload
} = useUpload({}, undefined, '/bdAccount/importExcel', () => search(), 'accountingSubjects:upload')

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '启用')[0]
  const cancelBtn = btns.filter((it) => it.label === '停用')[0]
  deleteBtn.disabled = !rows.length || !!rows.filter(row => row.enableStatus !== '0').length
  confirmBtn.disabled = !rows.length || !!rows.filter(row => row.enableStatus !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.enableStatus === '0').length
}, { immediate: true })

onMounted(async () => {
  tableInfo.value.api = bdAccountpage
  search()
})

function search() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {}
  search()
}

const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function openModify(row) {
  console.log(row)
  console.log(row.id)
  dialogInfo.value.id = row?.id
  dialogInfo.value.visible = true
}

async function romove(row) {
    await bdAccountdelete([row.id]).then((res) => {
      if (res.success) {
        proxy.$message.success('删除成功')
        search()
      }
    })
}
// 删除成本项目
function deleteBtn() {
  const ids = tableInfo.value.sectionRows.map((it) => it.id)
  proxy
      .$confirm("是否确认删除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        bdAccountdelete(ids).then((res) => {
          if (res.success) {
            proxy.$message.success('删除成功')
            search()
          }
        });
      })
      .catch(() => {});
}

function showExportExcel() {
  bdAccountexportExcel(filterInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

function downloadTemplate() {
  exportTemplateExcel('bdAccountTemplate').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '会计科目导入模板')
    }
  })
}

// 采集
function collection() {
  bdAccountcollection().then((res) => {
    if (res && res.success) {
      proxy.$message.success('采集成功')
      search();
    }
  })
}

// 启用
function enable(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  bdAccountenable({enable: '1',ids: ids}).then((res) => {
    if (res.success) {
      proxy.$message.success('启用成功')
      search();
    }
  })
}

// 停用
function deactivatet(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  bdAccountenable({enable: '0',ids: ids}).then((res) => {
    if (res.success) {
      proxy.$message.success('停用成功')
      search();
    }
  })
}

</script>

<template>
<!--  会计科目-->
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!dialogInfo.visible">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">

            <template v-slot:filter-uploadFile>
              <el-upload
                  :headers="uploadInfo.headers"
                  :show-file-list="false"
                  :on-success="uploadSuccess"
                  v-model:file-list="uploadInfo.fileList"
                  :on-error="uploadError"
                  :before-upload="beforeUpload"
                  :action="uploadInfo.action"
              >
                <el-button>导入</el-button>
              </el-upload>
            </template>
          </NewPageFilter>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="false"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :pager="true"
            :check-box="true"
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
        @returnModify="search"
    />

  </div>
</template>

<style scoped lang="scss">

</style>
