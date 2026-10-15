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
import {getToDay} from "@/utils/slp";
import {periodMonthByDate} from "@/api/base";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useUpload} from "@/hooks/useUpload";

const { proxy } = getCurrentInstance()

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
  title: '收入单据',
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'input', disabled: true, show: props.id, },
    { label: '业务日期', value: 'docTime', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '会计期间', value: 'accountingPeriod', type: 'input', disabled: true },
    { label: '总金额', value: 'totalMoney', type: 'input', disabled: true },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', disabled: true, show: props.id },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    docTime: [{ required: true, message: '请选择业务日期' }]
  },
  data: {}
})

const tableInfo = ref({
  title: '明细信息',
  query: {
    deptIncomeId: props.id
  },
  fieldList: [
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '收费类别编码', value: 'feeCategoryCode' },
    { label: '收费类别名称', value: 'feeCategoryName' },
    { label: '开单科室编码', value: 'orderDeptCode' },
    { label: '开单科室名称', value: 'orderDeptName' },
    { label: '执行科室编码', value: 'executeDeptCode' },
    { label: '执行科室名称', value: 'executeDeptName' },
    { label: '数量', value: 'qty', align: 'center' },
    { label: '单价', value: 'unitPrice', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.unitPrice) },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', event: () => openAddDetail() },
    { type: 'button', label: '删除', event: () => deleteDetail() },
    { type: 'button', label: '下载模板', event: downloadTemplate, show: props.id },
    { type: 'slot', value: 'uploadFile', label: '导入', show: props.id },
    { type: 'button', label: '导出', event: exportData, show: props.id },
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

const {
  uploadInfo,
  uploadError,
  uploadSuccess,
  beforeUpload
} = useUpload({}, undefined, '/deptIncomeDetail/importExcel', () => {
  getList()
  getMainMoney()
}, '')
uploadInfo.data = {
  deptIncomeId: props.id,
}

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = tableInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { immediate: true })
// watch(() => tableInfo.value.data.map(it => it.money).reduce((prev, cur) => prev + cur, 0), (money) => {
//   formInfo.value.data.totalMoney = money
// }, { immediate: true, deep: true })

onMounted(() => {
  if (props.id) {
    tableInfo.value.api = pageIncomeDataDetail
    getMain()
    getList()
  } else {
    watch(() => tableInfo.value.data, (data) => {
      data.forEach(it => {
        it.unitPrice = (it.money || 0) / (it.qty || 1)
        it.unitPrice = it.unitPrice.toFixed(2)
      })
    })
  //   默认数据
    DefaultData()
  }
})

watch(() => formInfo.value.data.docTime, (date) => {
  updatePeriodMonth(date)
})
function calculateMoney() {
  formInfo.value.data.totalMoney = null
  tableInfo.value.data && tableInfo.value.data.map(it => formInfo.value.data.totalMoney += Number(it.money))
}

function DefaultData() {
  formInfo.value.data.docTime = getToDay()
}

const updatePeriodMonth = (date) => {
  if(!date) return
  periodMonthByDate({beginDate: moment(date).format('YYYY-MM-DD 00:00:00')}).then(({data}) => {
    const _data = data ? data[0] : {}
    formInfo.value.data.accountingPeriodId = _data.id
    formInfo.value.data.accountingPeriod = _data.periodYearAndMonth
  })
}
function getMain() {
  oneIncomeData({ id: props.id }).then(res => {
    formInfo.value.data = res.data
  })
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
        deleteIncomeDataDetail(ids).then(({ code }) => {
          if (code === 200) {
            proxy.$message.success('删除成功')
            getList()
            getMainMoney()
          }
        })
      })
}

const save = (err) => {
  if (err) return
  if(tableInfo.value.data.length === 0) return proxy.$message.warning('请填写明细数据')
  const isAdd = !props.id
  const api = isAdd ? addIncomeData : updateIncomeData
  const data = JSON.parse(JSON.stringify(formInfo.value.data))
    data.details = JSON.parse(JSON.stringify(tableInfo.value.data))
  data.docTime = data.docTime ? data.docTime.substring(0,10) : ''
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
    deptIncomeId: formInfo.value.data.id
  }
  addDetailInfo.value.title = row ? '修改明细数据' : '新增明细数据'
  addDetailInfo.value.visible = true
}

function addDetailCallback(raw) {
  addDetailInfo.value.visible = false
  if (!raw) return
  if (typeof raw == 'object') {
    if (addDetailInfo.value.index === -1) {
      const orderDept = raw.orderDeptId
      const executeDept = raw.executeDeptId
      let addDetailRows = []
      for (let i = 0; i < orderDept.length; i++) {
        for (let k = 0; k < executeDept.length; k++) {
          addDetailRows.push({
            ...raw,
            orderDeptCode: raw.orderDeptCode[i],
            orderDeptId: raw.orderDeptId[i],
            orderDeptName: raw.orderDeptName[i],
            deptIncomeId: props.id,
            executeDeptCode: raw.executeDeptCode[k],
            executeDeptId: raw.executeDeptId[k],
            executeDeptName: raw.executeDeptName[k],
          })
        }
      }
      tableInfo.value.data = tableInfo.value.data.concat(addDetailRows)
    } else {
      tableInfo.value.data[addDetailInfo.value.index] = raw
    }
    calculateMoney()
  } else {
    // 刷新明细
    getList()
    getMainMoney()
  }
}

function getMainMoney() {
  oneIncomeData({ id: props.id }).then(res => {
    formInfo.value.data.totalMoney = res.data.totalMoney
  })
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('收入明细导入模板').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '收入明细导入模板')
    }
  })
}

function exportData() {
  exportIncomeDataDetail(tableInfo.value.query).then(res => {
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
  tableInfo.value.query.chargeItemId = raw.id
  tableInfo.value.query.feeItemName = raw.name
}
function returnBack() {
  emit('returnModify', true)
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm :form-info="formInfo" />
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
