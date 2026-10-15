<script setup>
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import AddDetail from "./addDetail.vue";
import moment from "moment";
import {exportTemplateExcel} from "@/api/pub";
import {getToDay} from "@/utils/slp";
import {periodMonthByDate} from "@/api/base";
import {
  deptOtherIncomefinanceAndEducdetail,
  financeAndEducadd, financeAndEduccalculateTotalMoney, financeAndEducdetail,
  financeAndEducdetailExcel, financeAndEducDetailpage,
  financeAndEducupdate
} from "@/api/scienceIncome";
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
  title: '财政科教收入',
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'input', disabled: true, show: props.id, },
    { label: '业务日期', value: 'businessTime', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '会计期间', value: 'accountingPeriod', type: 'input', disabled: true },
    { label: '总金额', value: 'money', type: 'input', disabled: true },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', disabled: true },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    businessTime: [{ required: true, message: '请选择业务日期' }]
  },
  data: {
    status: 0
  }
})

const tableInfo = ref({
  title: '明细信息',
  query: {
    deptOtherIncomeId: props.id
  },
  fieldList: [
    { label: '职能科室名称', value: 'deptName' },
    { label: '收入项目', value: 'incomeItemValue' },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '资金来源', value: 'fundSourceName' },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', event: () => openAddDetail() },
    { type: 'button', label: '删除', event: () => deleteDetail() },
    { type: 'button', label: '下载模板', event: downloadTemplate, show: props.id },
    { type: 'slot', value: 'uploadFile', label: '导入', show: props.id },
    { type: 'button', label: '导出', event: exportData, show: props.id },
    { type: 'slot', label: '收入项目', showLabel: true, show: !!props.id, value: 'incomeItemName' },
    { type: 'button', label: '查询', show: !!props.id, event: getList },
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

const {
  uploadInfo,
  uploadSuccess,
  uploadError,
  beforeUpload
} = useUpload({}, undefined, '/deptOtherIncome/financeAndEduc/detail/importDetailExcel', () => {
  getList()
  getMainMoney()
}, 'scienceIncome:import')
uploadInfo.data = {
  deptOtherIncomeId: props.id,
}

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = tableInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { immediate: true })

onMounted(() => {
  if (props.id) {
    tableInfo.value.api = financeAndEducDetailpage
    getMain()
    getList()
  } else {
  //   默认数据
    DefaultData()
  }
})
watch(() => formInfo.value.data.businessTime, (date) => {
  updatePeriodMonth(date)
})
function calculateMoney() {
  formInfo.value.data.money = null
  tableInfo.value.data && tableInfo.value.data.map(it => formInfo.value.data.money += Number(it.money))
}

function DefaultData() {
  formInfo.value.data.businessTime = getToDay()
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
  financeAndEducdetail(props.id).then(res => {
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
    deptOtherIncomefinanceAndEducdetail(ids).then(({ code }) => {
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
  const api = isAdd ? financeAndEducadd : financeAndEducupdate
  const data = JSON.parse(JSON.stringify(formInfo.value.data))
    data.detailList = JSON.parse(JSON.stringify(tableInfo.value.data))
  data.businessTime = data.businessTime ? data.businessTime.substring(0,10) : ''
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
    deptOtherIncomeId: formInfo.value.data.id
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
        deptOtherIncomeId: props.id
      })
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
  financeAndEduccalculateTotalMoney(props.id).then(res => {
    formInfo.value.data.money = res.data
  })
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('deptOtherIncomeDetailTemplate', 'scienceIncome:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '财政科教收入明细导入模板')
    }
  })
}

function exportData() {
  financeAndEducdetailExcel(tableInfo.value.query).then(res => {
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

const feeIteminfo = ref({
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  title: '收入项目',
  checkedList: [],
  query: {
    name: ''
  }
})
function openfeeItemSelector() {
  feeIteminfo.value.visible = true

}
function feeItemCallback(raw) {
  feeIteminfo.value.checkedList = raw;
  tableInfo.value.query.incomeItemIdList = raw.map(it => it.id)
  tableInfo.value.query.incomeItemName = raw.map(it => it.name)
}
function returnBack() {
  emit('returnModify', true)
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm :form-info="formInfo" />
    <ModifyTable :table-info="tableInfo" :pager="!!props.id" is-dynamic @handleEvent="tableHandler">
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
      <template #filter-incomeItemName>
        <el-input
            v-model="tableInfo.query.incomeItemName"
            class="not-mongolia"
            type="input"
            placeholder="请选择收入项目"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openfeeItemSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
  </ModifyPage>
  <add-detail :title="addDetailInfo.title" :table-row="addDetailInfo.row" :visible="addDetailInfo.visible"
              @callback="addDetailCallback"/>
  <SelectIncomeProject
      v-if="feeIteminfo.visible"
      v-model:showDialog="feeIteminfo.visible"
      :title="feeIteminfo.title"
      :checkStrictly="feeIteminfo.checkStrictly"
      :isLeaf="feeIteminfo.isLeaf"
      :query="feeIteminfo.query"
      :checkBox="feeIteminfo.checkBox"
      :checkedList="feeIteminfo.checkedList"
      :api="feeIteminfo.api"
      :highlight-current="true"
      @callback="feeItemCallback" />
</template>

<style scoped lang="scss">

</style>
