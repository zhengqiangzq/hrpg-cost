<script setup>
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import AddDetail from "./addDetail.vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {exportTemplateExcel} from "@/api/pub";
import {ElLoading} from "element-plus";
import {useStorage} from "@vueuse/core";
import axios from "axios";
import {
  itemActivityDriverValueadd,
  itemActivityDriverValueDetaildelete, itemActivityDriverValueDetailDetailExcel,
  itemActivityDriverValueDetailqueryListPageByValueId,
  itemActivityDriverValuegetById,
  itemActivityDriverValueupdateById
} from "@/api/activityDriverVal";

const store = useStore()
const { proxy } = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)

const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  id: '',
  flowFormType: ''
})
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emit('update:visible', newValue)
  },
})
const { tableParameter, openDialog } = useSelectTableData()

const filterRef = ref()
const formInfo = ref({
  title: '基础信息',
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'input', disabled: true, show: props.id, },
    // { label: '业务日期', value: 'docTime', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '核算期间', value: 'checkPeriodName', type: 'slot' },
    { label: '作业动因', value: 'activityDriverName', type: 'slot' },
    { label: '总参数值', value: 'totalMoney', type: 'input', disabled: true },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', disabled: true, show: props.id },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    checkPeriodName: [{ required: true, message: '请选择核算期间' }],
    activityDriverName: [{ required: true, message: '请选择作业动因' }]
  },
  data: {
    status: '0',
    orgId: setting.value.hospitalId,
  }
})

function formatterValue(val) {
  const source = store.state.permission.dict['asset_capital_source']
  if(!source) return ''
  return source.filter((it) => it.code === val)[0].name;
}

const tableInfo = ref({
  title: '明细信息',
  query: {
    valueId: props.id,
    activityDriverValueId: props.id,
    orgId: setting.value.hospitalId,
  },
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '作业编码', value: 'itemJobCode' },
    { label: '作业名称', value: 'itemJobName' },
    { label: '参数值', value: 'paramValue', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.paramValue) },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', event: () => openAddDetail() },
    { type: 'button', label: '删除', event: () => deleteDetail() },
    { type: 'button', label: '下载模板', show: props.id, event: downloadTemplate },
    { type: 'slot', value: 'uploadFile', show: props.id, label: '导入' },
    { type: 'button', label: '导出', show: props.id, event: exportData },
    { type: 'slot', label: '收费项目', showLabel: true, show: !!props.id, value: 'feeItemName' },
    { type: 'button', label: '查询', show: !!props.id, event: getList },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('incomeData:update'),
        event: openAddDetail,
      },
      {
        label: '删除',
        show: proxy.$permission('incomeData:delete'),
        event: deleteDetail,
      },
    ]
  },
  sectionRows: []
})
const addDetailInfo = ref({
  visible: false,
  row: null
})

const subsysAndUrl = ref(proxy.$fn.getSubsysAndUrl())
const uploadInfo = reactive({
  action: axios.defaults.baseURL + '/item/itemActivityDriverValueDetail/importExcel',
  headers: {
    Authorization: proxy.$store.state.user.token,
    'x-auth-token': proxy.$store.state.user.token,
    btnCode: 'activityDriverVal:import',
    'systemName': subsysAndUrl.value?.systemName || -2,
    'systemCode': subsysAndUrl.value?.systemCode || -2,
    'routeCode': subsysAndUrl.value?.routeCode || -2,
  },
  data: {
    activityDriverValueId: props.id,
  },
  loading: {},
})

function watchAmount() {
  watch(() => tableInfo.value.data.map(row => row.paramValue), (paramValue) => {
    formInfo.value.data.totalMoney = paramValue.reduce((pre, cur) => pre + cur, 0)
  }, { deep: true, immediate: true })
}

onMounted(() => {
  if (props.id) {
    tableInfo.value.api = itemActivityDriverValueDetailqueryListPageByValueId
    getMain()
    getList()
  } else {
    watchAmount()
  }
})

function getMain(flag) {
  itemActivityDriverValuegetById({id: props.id}).then(res => {
    if(flag) {
      return  formInfo.value.data.totalMoney = res.data.totalMoney
    }
    formInfo.value.data = res.data
  })
}

function getList() {
  tableInfo.value.refresh = Math.random()
}

// 核算期间
function openPeriodSelector() {
  tableParameter.title = '核算期间'
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.query = {}
  tableParameter.filters = []
  tableParameter.callBack = accountingPeriodCallback
  openDialog(filterRef.value)
}
function accountingPeriodCallback(raw) {
  formInfo.value.data.checkPeriodId = raw.id
  formInfo.value.data.checkPeriodName = raw.name
}

// 作业动因
function openresourceSelector() {
  tableParameter.title = '作业动因'
  tableParameter.type = 'driveractivity'
  tableParameter.pager = false
  tableParameter.query = {}
  tableParameter.callBack = resourceCallback
  openDialog(filterRef.value)
}
function resourceCallback(raw) {
  formInfo.value.data.activityDriverId = raw.id
  formInfo.value.data.activityDriverName = raw.name
}

function deleteDetail(row) {
  if (!formInfo.value.data.id) {
    const sections = row ? [row] : tableInfo.value.sectionRows
    tableInfo.value.data = tableInfo.value.data.filter(it => sections.indexOf(it) == -1)
    return
  }
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
    itemActivityDriverValueDetaildelete(ids).then(({ code }) => {
          if (code === 200) {
            proxy.$message.success('删除成功')
            getList()
            getMain(true)
          }
        })
      })
}

function returnBack() {
  emit('returnModify', true)
}
const save = (err) => {
  if (err) return
  if(tableInfo.value.data.length === 0) return proxy.$message.warning('请填写明细数据')
  const api = props.id ? itemActivityDriverValueupdateById : itemActivityDriverValueadd
  const data = JSON.parse(JSON.stringify(formInfo.value.data))
    data.detailVOList = JSON.parse(JSON.stringify(tableInfo.value.data))
  api(data).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function openAddDetail(row) {
  addDetailInfo.value.index = tableInfo.value.data.indexOf(row)
  addDetailInfo.value.row = row ? JSON.parse(JSON.stringify(row)) : {
    activityDriverValueId: formInfo.value.data.id
  }
  addDetailInfo.value.title = row ? '修改明细数据' : '新增明细数据'
  addDetailInfo.value.visible = true
}

function addDetailCallback(raw) {
  addDetailInfo.value.visible = false
  if (!raw) return
  if (typeof raw == 'object') {
    if (addDetailInfo.value.index === -1) {
      tableInfo.value.data.push({
        ...raw,
        activityDriverValueId: props.id
      })
    } else {
      tableInfo.value.data[addDetailInfo.value.index] = raw
    }
    watchAmount()
  } else {
    // 刷新明细
    getList()
    getMain(true)
  }
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('ItemActivityDriverValueDetailTemplate', 'activityDriverVal:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '作业动因值明细导入模板')
    }
  })
}

function exportData() {
  itemActivityDriverValueDetailDetailExcel(tableInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
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
    getMain(true)
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
const dialogInfoRef = ref()
function openCostItemSelector() {
  tableParameter.title = '收费项目'
  tableParameter.visible = true
  tableParameter.type = 'feeItem'
  tableParameter.query = { status: 1 }
  tableParameter.filters = [
    { type: 'input', label: '编码/名称', value: 'keyword' }
  ]
  tableParameter.callBack = costItemCallback
  openDialog(dialogInfoRef.value, 'table')
}
function costItemCallback(raw) {
  tableInfo.value.query.feeItemId = raw.id
  tableInfo.value.query.feeItemName = raw.name
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm ref="filterRef" :form-info="formInfo">
      <template v-slot:form-checkPeriodName>
        <el-input
            class="not-mongolia"
            type="input"
            :disabled="true"
            placeholder="请选择核算期间"
            v-model="formInfo.data.checkPeriodName"
        >
          <template #append>
            <el-icon @click="openPeriodSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template v-slot:form-activityDriverName>
        <el-input
            class="not-mongolia"
            type="input"
            :disabled="true"
            placeholder="请选择作业动因"
            v-model="formInfo.data.activityDriverName"
        >
          <template #append>
            <el-icon @click="openresourceSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable ref="dialogInfoRef" :table-info="tableInfo" :pager="!!props.id" is-dynamic @handleEvent="tableHandler">
      <template v-slot:filter-uploadFile="scope">
        <el-upload
            :headers="uploadInfo.headers"
            :show-file-list="false"
            :data="uploadInfo.data"
            :on-error="uploadError"
            :on-success="uploadSuccess"
            :before-upload="beforeUpload"
            :action="uploadInfo.action"
        >
          <el-button :disabled="scope.disabled">导入</el-button>
        </el-upload>
      </template>
      <template #filter-feeItemName>
        <el-input
            v-model="tableInfo.query.feeItemName"
            class="not-mongolia"
            type="input"
            placeholder="请选择收费项目"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openCostItemSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
  </ModifyPage>
  <add-detail :title="addDetailInfo.title" :table-row="addDetailInfo.row" :visible="addDetailInfo.visible"
              @callback="addDetailCallback"/>
</template>

<style scoped lang="scss">

</style>
