<script setup name="assetCosts">
import Modify from './modify.vue'
import Details from './details.vue'
import {getCurrentInstance, onMounted, ref} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import {ElLoading} from "element-plus";
import axios from "axios";
import {useStorage} from "@vueuse/core";
import DetailList from "./detailList.vue";
import {
  itemAssetsCostpage,
  itemAssetsCostok,
  itemAssetsCostcancel,
  itemAssetsCostdelete, itemAssetsCostexportExcel,
  itemAssetsCostexportCollect, itemAssetsCostcheck
} from "@/api/assetCosts";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {itemProductCostcheck} from "@/api/materialCosts";
const {proxy} = getCurrentInstance()
const direction = ref('rtl')
const setting = useStorage('setting', {}, sessionStorage)
const PERMISSION_CODE = 'assetCosts'

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'assetCosts',
  type: '13048',
  action: '/itemAssetsCost/import/excelRecord',
})
const filterInfo = ref({
  query: {},
  list: [
    {label: '核算期间', value: 'checkPeriodName', showLabel: true, type: 'slot'},
    {label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status'},
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify()},
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData()},
    { type: 'button', label: '采集', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => collect()},
    { type: 'button', label: '拉取日志查询', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '检查', show: proxy.$permission(`${PERMISSION_CODE}:check`), event: () => opencheckData() },
    { type: 'button', label: '确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => enableData(1)},
    { type: 'button', label: '取消确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => enableData(0)},
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:dowmload`), event: downloadTemplate},
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: exportData},
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    {label: '单据号', value: 'docNum', type: 'slot'},
    {label: '核算期间', value: 'periodName'},
    {label: '开始会计期间', value: 'beginPeriodName'},
    {label: '结束会计期间', value: 'endPeriodName'},
    {label: '总金额', value: 'totalMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalMoney)},
    {label: '确认状态', value: 'statusName'},
    {label: '备注', value: 'remark'},
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
  title: '资产成本'
})

const detailsInfo = ref({
  visible: false,
})
const detailListInfo = ref({
  visible: false
})

const filterRef = ref()
const isFilters = ref()
const tableParameter = ref({
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
const drawer = ref(false)
const tableAssetInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  query: {},
  fieldList: [
    {label: '资产分类编码', value: 'code', width: 120 },
    {label: '资产分类名称', value: 'name', width: 140 },
    {label: '是否设置资产分类关系', align: 'center', value: 'flag', formatter: (row) => row.flag === '0' ? '否' : '是' },
  ],
  data: []
})

const subsysAndUrl = ref(proxy.$fn.getSubsysAndUrl())
const uploadInfo = reactive({
  action: axios.defaults.baseURL + '/itemAssetsCost/importExcel',
  headers: {
    Authorization: proxy.$store.state.user.token,
    'x-auth-token': proxy.$store.state.user.token,
    btnCode: 'materialCosts:import',
    'systemName': subsysAndUrl.value?.systemName || -2,
    'systemCode': subsysAndUrl.value?.systemCode || -2,
    'routeCode': subsysAndUrl.value?.routeCode || -2,
  },
  loading: {},
})

const {
  visible: pullDataLogInfoVisible,
  code: pullDataLogInfoCode
} = usePullDataLog('资产成本(项目成本)')

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  const check = btns.filter((it) => it.label === '检查')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
  check.disabled = !rows.length
}, {immediate: true})

onMounted(() => {
  tableInfo.value.api = itemAssetsCostpage
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
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}资产成本`
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
  const api = status === 1 ? itemAssetsCostok : itemAssetsCostcancel
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
    itemAssetsCostdelete(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

// 检查
function opencheckData() {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  tableAssetInfo.value.data = [];
  itemAssetsCostcheck(ids).then(({ data, code }) => {
    if (code === 200) {
      proxy.$message.success('检查成功')
      tableAssetInfo.value.data = data;
      drawer.value = true
    }
  })
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('itemAssetsCostTemplate', 'materialCosts:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '资产成本导入模板')
    }
  })
}

function exportData() {
  itemAssetsCostexportExcel(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
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
  ],
  rules: {
    checkPeriodName: [{required: true, message: '请选择核算期间', trigger: 'blur'}],
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
    console.log(valid);
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    const fromData = {
      ...addInfo.value.data,
    }
    itemAssetsCostexportCollect(fromData).then((res) => {
      if (res.success) {
        proxy.$message.success('采集成功')
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
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  filterRef.value.openDialog(tableParameter.value, 'table')
}

// 采集查询
function openPeriodSelector() {
  isFilters.value = false;
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  filterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  if (isFilters.value) {
    filterInfo.value.query.checkPeriodId = raw.id
    filterInfo.value.query.checkPeriodName = raw.name
  } else {
    addInfo.value.data.itemAccountingPeriodId = raw.id
    addInfo.value.data.checkPeriodName = raw.name
    addInfo.value.data.periodMonth = `${raw.name}(${raw.beginPeriod},${raw.endPeriod})`
  }
}

</script>

<template>
  <!--  资产成本 项目-->
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
      </page-form>
    </PageDialog>

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
