<script setup>
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import AddDetail from "./addDetail.vue";
import moment from "moment";
import {
  addIncomeData,
  updateIncomeData,
  deleteIncomeDataDetail,
  exportIncomeDataDetail,
  pageIncomeDataDetail, oneIncomeData
} from "@/api/incomeData";
import {exportTemplateExcel} from "@/api/pub";
import {ElLoading} from "element-plus";
import axios from "axios";
import {getToDay} from "@/utils/slp";
import {periodMonthByDate} from "@/api/base";
const store = useStore()
import {
  deptProductCostadd, deptProductCostdetail, deptProductCostDetaildelete, deptProductCostDetailexportExcel,
  deptProductCostDetailpage,
  deptProductCostupdate
} from "@/api/deptCost/costData/materialsData";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const { proxy } = getCurrentInstance()

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

const formInfo = ref({
  title: '基础信息',
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'input', disabled: true, show: props.id, },
    { label: '会计期间', value: 'periodName', type: 'slot' },
    { label: '总金额', value: 'totalMoney', type: 'input', disabled: true },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', disabled: true },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    periodName: [{ required: true, message: '请选择会计期间' }],
  },
  data: {
    status: '0',
  }
})
function formatterValue(val) {
  const source = store.state.permission.dict['asset_capital_source']
  if(!source) return ''
  return source.filter((it) => it.code === val)[0].name;
}
function formatterYesValue(val) {
  const source = store.state.permission.dict['yes_or_no']
  if(!source) return ''
  return source.filter((it) => it.code === val)[0].name;
}

const tableInfo = ref({
  title: '明细信息',
  query: {
    id: props.id,
    majorId: props.id,
    majorIdList: [props.id]
  },
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '物资分类编码', value: 'productFinCategoryCode' },
    { label: '物资分类名称', value: 'productFinCategoryName' },
    { label: '物资编码', value: 'productCode' },
    { label: '物资名称', value: 'productName' },
    { label: '资金来源', value: 'fundSource', formatter: (row) => formatterValue(row.fundSource) },
    { label: '是否收费', value: 'isChargeName', formatter: (row) => formatterYesValue(row.isCharge) },
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
    { type: 'button', label: '导出Excel', show: props.id, event: exportData },
    {type: 'slot', label: '物资信息', showLabel: true, show: !!props.id, value: 'productName'},
    {type: 'button', label: '查询', show: !!props.id, event: getList},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: true,
        event: openAddDetail,
      },
      {
        label: '删除',
        show: true,
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
  action: axios.defaults.baseURL + '/deptProductCostDetail/importExcel',
  headers: {
    Authorization: proxy.$store.state.user.token,
    'x-auth-token': proxy.$store.state.user.token,
    btnCode: 'materialsData:import',
    'systemName': subsysAndUrl.value?.systemName || -2,
    'systemCode': subsysAndUrl.value?.systemCode || -2,
    'routeCode': subsysAndUrl.value?.routeCode || -2,
  },
  data: {
    majorId: props.id,
  },
  loading: {},
})

function watchAmount() {
  watch(() => tableInfo.value.data.map(row => row.money), (money) => {
    formInfo.value.data.totalMoney = money.reduce((pre, cur) => pre + cur, 0)
    formInfo.value.data.totalMoney = formInfo.value.data.totalMoney.toFixed(2)
  }, { deep: true, immediate: true })
}

onMounted(async () => {
  if (props.id) {
    tableInfo.value.api = deptProductCostDetailpage
    await getMain()
    await getList()
  } else {
  //   默认数据
    DefaultData()
    watchAmount()
  }
})

function DefaultData() {
  const docTime = getToDay()
  updatePeriodMonth(docTime)
}

const updatePeriodMonth = (date) => {
  if(!date) return
  periodMonthByDate({beginDate: moment(date).format('YYYY-MM-DD 00:00:00')}).then(({data}) => {
    const _data = data ? data[0] : {}
    formInfo.value.data.periodId = _data.id
    formInfo.value.data.periodName = _data.periodYearAndMonth
  })
}
async function getMain(flag) {
  const { data, code, msg } = await deptProductCostdetail({id:props.id})
      if(code === 200) {
        formInfo.value.data = data
        if(flag) formInfo.value.data.totalMoney = data.totalMoney
      }
}

function getList() {
  tableInfo.value.refresh = Math.random()
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
    deptProductCostDetaildelete(ids).then(({ code }) => {
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
  const api = props.id ? deptProductCostupdate : deptProductCostadd
  const data = JSON.parse(JSON.stringify(formInfo.value.data))
    data.details = JSON.parse(JSON.stringify(tableInfo.value.data))
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
    majorId: formInfo.value.data.id
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
        majorId: props.id
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
  exportTemplateExcel('科室物资成本详情导入模板').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '科室物资成本详情导入模板')
    }
  })
}

function exportData() {
  deptProductCostDetailexportExcel({majorId: tableInfo.value.query.majorId}).then(res => {
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

const filterRef = ref()
const tableParameter = ref({
  visible: false,
  type: 'accountingPeriod',
  title: '会计期间',
  checkBox: false,
  pager: true,
  callback: null,
  filters: [],
  fieldList: [],
  query: {
    sort: 'begin_date desc'
  }
})
function openperiodSelector() {
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  filterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  formInfo.value.data.periodId = raw.id
  formInfo.value.data.periodName = raw.periodYearAndMonth
}


const treeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  query: {}
})
function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  formInfo.value.data.deptId = raw.id
  formInfo.value.data.deptCode = raw.code
  formInfo.value.data.deptName = raw.name
}

const staffInfo = ref({
  visible: false,
  type: 'staff',
  title: '人员信息',
  checkBox: false,
  pager: true,
  callback: null,
  fieldList: [],
  query: {}
})
function openStaffSelector() {
  staffInfo.value.callBack = staffCallback
  staffInfo.value.visible = true
  filterRef.value.openDialog(staffInfo.value, 'table')
}
function staffCallback(raw) {
  formInfo.value.data.staffId = raw.id
  formInfo.value.data.staffCode = raw.userCode
  formInfo.value.data.staffName = raw.name
}

const TechnicalInfo = ref({
  title: '技术职称',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})

function opentechnology() {
  TechnicalInfo.value.title = "技术职称";
  TechnicalInfo.value.visible = true;
}
function technologyCallback(raw) {
  formInfo.value.data.technicalTitleId = raw.id
  formInfo.value.data.technicalTitleCode = raw.code
  formInfo.value.data.technicalTitleName = raw.name
}

const pageFormRef = ref()
const { tableParameter: projectParameter, openDialog } = useSelectTableData()
// 物资信息
function openProjectSelector() {
  projectParameter.title = '物资信息'
  projectParameter.visible = true
  projectParameter.type = 'product'
  projectParameter.query = {
    itemAccountStatus: '1',
    last: true,
  }
  projectParameter.callBack = projectCallback
  openDialog(pageFormRef.value, 'table')
}
function projectCallback(raw) {
  tableInfo.value.query.productId = raw.id
  tableInfo.value.query.productName = raw.name
}

</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm ref="filterRef" :form-info="formInfo">
      <template v-slot:form-periodName>
        <el-input
            class="not-mongolia"
            type="input"
            :disabled="true"
            placeholder="请选择会计期间"
            v-model="formInfo.data.periodName"
        >
          <template #append>
            <el-icon @click="openperiodSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template v-slot:form-staffCode>
        <el-input
            v-model="formInfo.data.staffCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择人员信息"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openStaffSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template v-slot:form-deptCode>
        <el-input
            v-model="formInfo.data.deptCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择核算科室"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openDeptSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template v-slot:form-technicalTitleCode>
        <el-input
            v-model="formInfo.data.technicalTitleCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择技术职称"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="opentechnology"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable ref="pageFormRef" :table-info="tableInfo" :pager="!!props.id" is-dynamic @handleEvent="tableHandler">
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
      <template v-slot:filter-productName>
        <el-input
            v-model="tableInfo.query.productName"
            class="not-mongolia"
            type="input"
            placeholder=""
        >
          <template #append>
            <el-icon @click="openProjectSelector"><Search /></el-icon>
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
      :api="treeInfo.api"
      :highlight-current="true"
      @callback="treeCallback" />
  <SelectTechnicalTitleTree
      v-if="TechnicalInfo.visible"
      v-model:showDialog="TechnicalInfo.visible"
      :title="TechnicalInfo.title"
      :checkStrictly="TechnicalInfo.checkStrictly"
      :isLeaf="TechnicalInfo.isLeaf"
      :query="TechnicalInfo.query"
      :checkBox="TechnicalInfo.checkBox"
      :api="TechnicalInfo.api"
      :highlight-current="true"
      @callback="technologyCallback" />
</template>

<style scoped lang="scss">

</style>
