<script setup>
import {getCurrentInstance, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {periodMonthByDate} from "@/api/base";
import moment from "moment";
import AddDetail from "./addDetail.vue";
import {
  addCostData, calcCostDataMoney,
  deleteCostDataDetail,
  exportCostDataDetail,
  oneCostData,
  pageCostDataDetail,
  updateCostData
} from "@/api/costData";
import {exportTemplateExcel} from "@/api/pub";
import {getToDay} from "@/utils/slp";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useUpload} from "@/hooks/useUpload";

const { proxy } = getCurrentInstance();

const { tableParameter, openDialog } = useSelectTableData()
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
  title: '成本单据',
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'input', disabled: true, show: props.id, },
    { label: '业务日期', value: 'businessTime', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '会计期间', value: 'accountingPeriod', type: 'input', disabled: true },
    { label: '总金额', value: 'money', type: 'input', disabled: true },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', disabled: true },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    businessTime: [{required: true, message: '请选择业务日期'}],
  },
  data: {
    status: 0
  }
})

const tableInfo = ref({
  initCurpage: 1,
  refresh: 1,
  title: '明细信息',
  api: null,
  query: {
    deptCostId: props.id
  },
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '资金来源', value: 'capitalSourceValue' },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', event: () => openAddDetail(), show: proxy.$permission('costData:add') },
    { type: 'button', label: '删除', event: () => deleteDetail(), show: proxy.$permission('costData:delete') },
    { type: 'button', label: '下载模板', event: downloadTemplate, show: proxy.$permission('costData:download') && props.id },
    { type: 'slot', label: '导入', value: 'uploadFile', show: proxy.$permission('costData:import') && props.id },
    { type: 'button', label: '导出', event: exportData, show: proxy.$permission('costData:export') && props.id },
    { type: 'slot', label: '成本项目', showLabel: true, show: !!props.id, value: 'costItemName' },
    { type: 'button', label: '查询', show: !!props.id, event: getList },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('costData:update'),
        event: openAddDetail,
      },
      {
        label: '删除',
        show: proxy.$permission('costData:delete'),
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
const {
  uploadInfo,
  uploadError,
  uploadSuccess,
  beforeUpload
} = useUpload({}, undefined, '/deptCost/detail/importDetailExcel', () => {
  getList()
  calcMoneyAmount()
}, 'costData:import')
uploadInfo.data = {
  deptCostId: props.id,
}

watch(() => tableInfo.value.sectionRows, (rows) => {
  const tableBtn = tableInfo.value.btnList
  tableBtn[1].disabled = !rows.length
}, { immediate: true })
watch(() => formInfo.value.data.accountingPeriodId, (accountingPeriodId) => {
  const tableBtn = tableInfo.value.btnList
  tableBtn[0].disabled = !accountingPeriodId
}, { immediate: true })

onMounted(() => {
  if (props.id) {
    tableInfo.value.api = pageCostDataDetail
    getMain()
  } else {
    formInfo.value.data.businessTime = getToDay()
    watchBusinessTime()
    watchAmount()
    updatePeriodMonth(formInfo.value.data.businessTime)
  }
})

function watchBusinessTime() {
  watch(() => formInfo.value.data.businessTime, (date) => {
    updatePeriodMonth(date)
  })
}
function watchAmount() {
  watch(() => tableInfo.value.data.map(row => row.money), (money) => {
    formInfo.value.data.money = money.reduce((pre, cur) => pre + cur, 0)
  }, { deep: true, immediate: true })
}

function getMain() {
  oneCostData(props.id).then(({data}) => {
    formInfo.value.data = data
    watchBusinessTime()
    getList()
  })
}

function getList() {
  tableInfo.value.refresh = Math.random()
}

function openAddDetail(row) {
  addDetailInfo.value.index = tableInfo.value.data.indexOf(row)
  addDetailInfo.value.row = row ? JSON.parse(JSON.stringify(row)) : {
    deptCostId: formInfo.value.data.id
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
        deptCostId: props.id
      })
    } else {
      tableInfo.value.data[addDetailInfo.value.index] = raw
    }
  } else {
    // 刷新明细
    getList()
    calcMoneyAmount()
  }
}

function calcMoneyAmount() {
  calcCostDataMoney(formInfo.value.data.id).then(res => {
    formInfo.value.data.money = res.data;
  })
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
    deleteCostDataDetail(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
        calcMoneyAmount()
      }
    })
  })
}

const updatePeriodMonth = (date) => {
  if(!date) return
  periodMonthByDate({ beginDate: moment(date).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    formInfo.value.data.accountingPeriodId = _data.id
    formInfo.value.data.accountingPeriod = _data.periodYearAndMonth
  })
}

const save = (err) => {
  if (err) return
  if(tableInfo.value.data.length === 0) return proxy.$message.warning('请填写明细数据')
  const isAdd = !props.id
  const api = isAdd ? addCostData : updateCostData
  const data = JSON.parse(JSON.stringify(formInfo.value.data))
    data.detailList = JSON.parse(JSON.stringify(tableInfo.value.data))
  api(data).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('deptCostDetailTemplate').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '成本数据明细信息导入模板')
    }
  })
}

function exportData() {
  exportCostDataDetail(tableInfo.value.query).then(res => {
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

const dialogInfoRef = ref()
function openCostItemSelector() {
  tableParameter.title = '成本项目'
  tableParameter.visible = true
  tableParameter.type = 'costItem'
  tableParameter.query = { last: true }
  tableParameter.filters = [
    { type: 'input', label: '名称', value: 'name' }
  ]
  tableParameter.callBack = costItemCallback
  openDialog(dialogInfoRef.value, 'table')
}
function costItemCallback(raw) {
  tableInfo.value.query.costItemId = raw.id
  tableInfo.value.query.costItemName = raw.name
}
function returnBack() {
  emit('returnModify', true)
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm :form-info="formInfo" />
    <ModifyTable
        ref="dialogInfoRef" :pager="!!formInfo.data.id" :is-dynamic="true" :table-info="tableInfo" @handleEvent="tableHandler">
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
      <template #filter-costItemName>
        <el-input
            v-model="tableInfo.query.costItemName"
            class="not-mongolia"
            type="input"
            placeholder="请选择成本项目"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openCostItemSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
  </ModifyPage>
  <add-detail :title="addDetailInfo.title" :table-row="addDetailInfo.row" :visible="addDetailInfo.visible" @callback="addDetailCallback" />
</template>

<style scoped lang="scss">

</style>
