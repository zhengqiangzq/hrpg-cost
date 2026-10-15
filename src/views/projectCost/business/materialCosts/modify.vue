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
  itemdeptIncomeupdate,
  itemProductCostadd,
  itemProductCostcalculateTotalMoney, itemProductCostdetail, itemProductCostDetaildelete,
  itemProductCostDetailExcel,
  itemProductCostDetailpage
} from "@/api/materialCosts";

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
    { label: '总金额', value: 'totalMoney', type: 'input', disabled: true },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', disabled: true, show: props.id },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    checkPeriodName: [{ required: true, message: '请选择核算期间' }]
  },
  data: {
    status: '0'
  }
})

function formatterValue(val) {
  const source = store.state.permission.dict['asset_capital_source']
  if(!source) return ''
  return source.filter((it) => it.code === val)[0].name;
}

function yesNoValue(val) {
  const source = store.state.permission.dict['yes_or_no']
  if(!source) return ''
  return source.filter((it) => it.code === val)[0].name;
}

const tableInfo = ref({
  title: '明细信息',
  query: {
    itemProductCostId: props.id,
    orgId: setting.value.hospitalId,
  },
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '物资编码', value: 'productCode' },
    { label: '物资名称', value: 'productName' },
    { label: '物资分类编码', value: 'productFinCategoryCode' },
    { label: '物资分类名称', value: 'productFinCategoryName' },
    { label: '资金来源', value: 'fundSource', formatter: (row) => formatterValue(row.fundSource) },
    { label: '是否收费', value: 'isCharge', formatter: (row) => yesNoValue(row.isCharge) },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '数量', value: 'qty', align: 'center' },
    { label: '单价', value: 'unitPrice', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.unitPrice) },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', event: () => openAddDetail() },
    { type: 'button', label: '删除', event: () => deleteDetail() },
    { type: 'button', label: '下载模板', show: props.id, event: downloadTemplate },
    { type: 'slot', value: 'uploadFile', show: props.id, label: '导入' },
    { type: 'button', label: '导出', show: props.id, event: exportData },
    { type: 'slot', label: '科室信息', showLabel: true, show: !!props.id, value: 'deptName' },
    { type: 'slot', label: '物资信息', showLabel: true, show: !!props.id, value: 'productName' },
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

const treeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  checkedList: [],
  query: {}
})

const subsysAndUrl = ref(proxy.$fn.getSubsysAndUrl())
const uploadInfo = reactive({
  action: axios.defaults.baseURL + '/itemProductCostDetail/importExcel',
  headers: {
    Authorization: proxy.$store.state.user.token,
    'x-auth-token': proxy.$store.state.user.token,
    btnCode: 'materialCosts:import',
    'systemName': subsysAndUrl.value?.systemName || -2,
    'systemCode': subsysAndUrl.value?.systemCode || -2,
    'routeCode': subsysAndUrl.value?.routeCode || -2,
  },
  data: {
    itemProductCostId: props.id,
  },
  loading: {},
})

function watchAmount() {
  watch(() => tableInfo.value.data.map(row => row.money), (money) => {
    formInfo.value.data.totalMoney = money.reduce((pre, cur) => pre + cur, 0)
    formInfo.value.data.totalMoney = formInfo.value.data.totalMoney.toFixed(2)
  }, { deep: true, immediate: true })
}

onMounted(() => {
  if (props.id) {
    tableInfo.value.api = itemProductCostDetailpage
    getMain()
    getList()
  } else {
    watch(() => tableInfo.value.data, (data) => {
      data.forEach(it => {
        it.unitPrice = (it.money || 0) / (it.qty || 1)
      })
    })
    watchAmount()
  }
})

function getMain() {
  itemProductCostdetail({id: props.id}).then(res => {
    formInfo.value.data = res.data
    formInfo.value.data.checkPeriodName = res.data.periodName
    treeInfo.value.checkedList = [];
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
    itemProductCostDetaildelete(ids).then(({ code }) => {
          if (code === 200) {
            proxy.$message.success('删除成功')
            getList()
            getMainMoney()
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
  const api = props.id ? itemdeptIncomeupdate : itemProductCostadd
  const data = JSON.parse(JSON.stringify(formInfo.value.data))
    data.itemProductCostDetails = JSON.parse(JSON.stringify(tableInfo.value.data))
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
    itemProductCostId: formInfo.value.data.id
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
        itemProductCostId: props.id
      })
    } else {
      tableInfo.value.data[addDetailInfo.value.index] = raw
    }
    watchAmount()
  } else {
    // 刷新明细
    getList()
    getMainMoney()
  }
}

function getMainMoney() {
  itemProductCostcalculateTotalMoney({itemProductCostId:props.id}).then(res => {
    formInfo.value.data.totalMoney = res.data
  })
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('itemProductCostDetailTemplate', 'materialCosts:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '物资成本明细导入模板')
    }
  })
}

function exportData() {
  itemProductCostDetailExcel(tableInfo.value.query).then(res => {
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
    getMainMoney()
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
function openFinCategorySelector() {
  tableParameter.title = '物资信息'
  tableParameter.visible = true
  tableParameter.type = 'product'
  tableParameter.query = { status: '1' }
  tableParameter.callBack = costItemCallback
  openDialog(dialogInfoRef.value, 'table')
}
function costItemCallback(raw) {
  tableInfo.value.query.productId = raw.id
  tableInfo.value.query.productName = raw.name
}

function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  treeInfo.value.checkedList = raw;
  const rows = raw.filter(it => !it.childList)
  tableInfo.value.query.deptIdList = rows.map(it =>it.id)
  tableInfo.value.query.deptName = rows.map(it => it.name).join(',')
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
    </ModifyForm>
    <ModifyTable
        ref="dialogInfoRef" :table-info="tableInfo" :pager="!!props.id" is-dynamic @handleEvent="tableHandler">
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
      <template #filter-deptName>
        <el-input
            v-model="tableInfo.query.deptName"
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
      <template #filter-productName>
        <el-input
            v-model="tableInfo.query.productName"
            class="not-mongolia"
            type="input"
            placeholder="请选择物资信息"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openFinCategorySelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
  </ModifyPage>
  <add-detail :title="addDetailInfo.title" :table-row="addDetailInfo.row" :visible="addDetailInfo.visible"
              @callback="addDetailCallback"/>

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
</template>

<style scoped lang="scss">

</style>
