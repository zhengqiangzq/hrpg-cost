<script setup name="allocationMethodDefinition">
import {onMounted, watch} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import axios from "axios";
import DetailList from './detailList.vue'
import {ElLoading} from "element-plus";
import Modify from "./modify.vue";
import {
  secondAllocationTypedeleteByTypeIds, secondAllocationTypeexportExcel,
  secondAllocationTypepage
} from "@/api/accountingDepartment";
import Details from "./details.vue";
const {proxy} = getCurrentInstance()
const uploadInfo = reactive({
  action: axios.defaults.baseURL + '/secondAllocationType/importExcel',
  headers: {
    Authorization: proxy.$store.state.user.token,
    'x-auth-token': proxy.$store.state.user.token,
  },
  loading: {},
})

const dialogInfo = ref({
  visible: false,
  title: '二次分配',
  id: null
})
const filterInfo = ref({
  query: {
  },
  list: [
    { label: '成本来源', value: 'costSource', type: 'select-model', code: 'cost_source', event: getList },
    { type: 'button', label: '查询', btType: 'primary', event: getList, show: true, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, show: true, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission('secondaryAllocation:add'), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission('secondaryAllocation:delete'), event: () => deleteRow() },
    { type: 'button', label: '下载模板', show: proxy.$permission('secondaryAllocation:download'), event: downloadTemplate },
    { type: 'slot', label: '导入', show: proxy.$permission('secondaryAllocation:import'), value: 'uploadFile' },
    { type: 'button', label: '导出Excel', show: proxy.$permission('secondaryAllocation:export'), event: exportData },
  ]
})

//由pageInfo更新
const page = ref({
  page: true,
  curPage: 1, // 当前页
  pageSize: 20, // 每页条数
})
function pageInfo(obj) {
  page.value = obj
}

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '成本来源', value: 'costSourceName', type: 'slot' },
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
        show: proxy.$permission('secondaryAllocation:update'),
        event: (row) => openModify(JSON.parse(JSON.stringify(row))),
      },
      {
        label: '删除',
        show: proxy.$permission('secondaryAllocation:delete'),
        popconfirmText: '删除后将改变数据,是否继续？',
        event: remove,
      },
    ]
  },
  sectionRows: []
})
const detailInfo = ref({
  visible: false,
  title: '明细页',
  id: null
})

const detailsInfo = ref({
  visible: false,
})

const treeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { deep: true, immediate: true })

onMounted(() => {
  tableInfo.value.api = secondAllocationTypepage
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
  exportTemplateExcel('二次分配类型导入模板').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '二次分配类型导入模板')
    }
  })
}

// 导出Excel
function exportData() {
  secondAllocationTypeexportExcel(filterInfo.value.query).then(res => {
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

function ModifyBack(data) {
  if(data) {
    getList()
  } else {
    openModify()
  }
}

function openModify(row) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.title = row ? '修改数据' : '新增数据'
  dialogInfo.value.visible = true
}

function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}

// 打开明细页
function opendetail() {
  detailInfo.value.visible = true
}

function deleteRow() {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('是否删除所选数据', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    secondAllocationTypedeleteByTypeIds(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function remove(row) {
  secondAllocationTypedeleteByTypeIds([row.id]).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('删除成功')
      getList()
    }
  })
}

function beforeUpload(file) {
  //发生请求时打开加载动画
  uploadInfo.loading = ElLoading.service({
    fullscreen: true,
    background: 'rgba(255,255,255,.4)',
  })
  let fileType = ['xlsx']
  let fileSize = proxy.$store.state.permission.systemConfig.max_file_size
  let isFileType = fileType.some(
      (type) => file.name.split('.')[file.name.split('.').length - 1] === type
  )
  const isLt = file.size / 1024 / 1024 < fileSize
  if (!isFileType) {
    proxy.$message.error({
      message: `文件格式不正确, 请上传 ${fileType.join(' / ')} 格式文件!`,
      showClose: true,
      duration: 3500,
    })
    uploadInfo.loading.close()
    return false
  }
  if (!isLt) {
    proxy.$message.error({
      message: `上传文件大小不能超过 ${fileSize} MB!`,
      showClose: true,
      duration: 3500,
    })
    uploadInfo.loading.close()
    return false
  }
  return isFileType && isLt
}

function uploadSuccess(resp) {
  uploadInfo.loading.close()
  if (resp && resp.success) {
    proxy.$message.success({
      duration: 3000,
      showClose: true,
      message: resp.msg,
    })
    getList()
  } else {
    proxy.$message.error({
      message: resp.msg,
      duration: 3000,
      showClose: true,
    })
  }
}
function uploadError(err) {
  if (err) {
    proxy.$message.error({
      message: JSON.parse(err.message).msg || '系统错误',
      duration: 3000,
      showClose: true,
    })
  }
  uploadInfo.loading.close()
}
function openDeptSelector(name) {
  treeInfo.value.type = name
  treeInfo.value.title = '科室信息'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  filterInfo.value.query.deptId = raw.id
  filterInfo.value.query.deptName = raw.name
}
</script>

<template>
<!--  二次分配-->
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible && !detailsInfo.visible && !dialogInfo.visible">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <div class="filter-wrapper">
        <PageFilter
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
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
        </PageFilter>
        <el-button @click="opendetail">明细页</el-button>
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
            @pageInfo="pageInfo"
        >
          <template #col-costSourceName="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.costSourceName }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <Modify
        v-if="dialogInfo.visible"
        v-model:visible="dialogInfo.visible"
        :id="dialogInfo.id"
        :title="dialogInfo.title"
        @returnModify="ModifyBack"
    />
    <Details
        v-if="detailsInfo.visible"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
    <DetailList
        v-if="detailInfo.visible"
        v-model:visible="detailInfo.visible"
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
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
