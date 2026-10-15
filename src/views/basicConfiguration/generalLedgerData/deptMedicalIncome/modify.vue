<script setup>
import {getCurrentInstance, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {periodMonthByDate} from "@/api/base";
import moment from "moment";
import AddDetail from "./addDetail.vue";
import {
  addDeptMedicalIncome,
  deleteDeptMedicalIncomeDetail,
  oneDeptMedicalIncome,
  updateDeptMedicalIncome,
  pageDeptMedicalIncomeDetail
} from "@/api/deptMedicalIncome";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

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
  title: '收入单据',
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'input', disabled: true, show: props.id, },
    { label: '业务日期', value: 'docTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '会计期间', value: 'accountingPeriodName', type: 'input', disabled: true },
    { label: '总金额', value: 'totalMoney', type: 'input', disabled: true },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', disabled: true },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    docTime: [{required: true, message: '请选择业务日期'}],
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
    deptIncomeId: props.id
  },
  fieldList: [
    // { label: '摘要', value: 'remark' },
    // { label: '凭证号', value: 'voucher' },
    { label: '会计科目', value: 'accountName', formatter: (row) => row.accountCode + '-' + row.accountName },
    { label: '核算科室', value: 'deptName' },
    { label: '资金来源', value: 'fundSourceName' },
    { label: '金额', value: 'money', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.money) },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', event: () => openAddDetail(), show: proxy.$permission('deptMedicalIncome:add') },
    { type: 'button', label: '删除', event: () => deleteDetail(), show: proxy.$permission('deptMedicalIncome:delete') },
    { type: 'slot', label: '核算科室', showLabel: true, show: !!props.id, value: 'deptName' },
    { type: 'button', label: '查询', show: !!props.id, event: getList },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('deptMedicalIncome:update'),
        event: openAddDetail,
      },
      {
        label: '删除',
        show: proxy.$permission('deptMedicalIncome:delete'),
        event: deleteDetail,
      },
    ]
  },
  sectionRows: []
})
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})

const addDetailInfo = ref({
  visible: false,
  row: null
})

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
    tableInfo.value.api = pageDeptMedicalIncomeDetail
    getMain()
  } else {
    formInfo.value.data.docTime = moment().format('YYYY-MM-DD 00:00:00')
    watchBusinessTime()
    watchAmount()
    updatePeriodMonth(formInfo.value.data.docTime)
  }
})

function watchBusinessTime() {
  watch(() => formInfo.value.data.docTime, (date) => {
    updatePeriodMonth(date)
  })
}
function watchAmount() {
  watch(() => tableInfo.value.data.map(row => row.money), (money) => {
    formInfo.value.data.totalMoney = money.reduce((pre, cur) => pre + cur, 0)
  }, { deep: true, immediate: true })
}

function getMain() {
  oneDeptMedicalIncome(props.id).then(({data}) => {
    formInfo.value.data = data
    watchBusinessTime()
    getList()
  })
}

function getList() {
  tableInfo.value.copyQuery = {
    ...tableInfo.value.query,
    deptName: undefined
  }
  tableInfo.value.refresh = Math.random()
}

function openAddDetail(row) {
  addDetailInfo.value.index = tableInfo.value.data.indexOf(row)
  addDetailInfo.value.row = row ? JSON.parse(JSON.stringify(row)) : {
    deptIncomeId: formInfo.value.data.id,
    fundSource: '4'
  }
  addDetailInfo.value.title = row ? '修改明细数据' : '新增明细数据'
  addDetailInfo.value.visible = true
}

function addDetailCallback(raw, update) {
  addDetailInfo.value.visible = false
  if (!raw) return
  if (typeof raw == 'object') {
    if (addDetailInfo.value.index === -1) {
      tableInfo.value.data.push({
        ...raw,
        deptIncomeId: props.id
      })
    } else {
      tableInfo.value.data[addDetailInfo.value.index] = raw
    }
  } else {
    // 刷新明细
    getList()
    formInfo.value.data.totalMoney = update.totalMoney;
  }
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
    deleteDeptMedicalIncomeDetail(ids).then(({ code, data }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
        formInfo.value.data.totalMoney = data.totalMoney
      }
    })
  })
}

const updatePeriodMonth = (date) => {
  if(!date) return
  periodMonthByDate({ beginDate: moment(date).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    formInfo.value.data.accountingPeriodId = _data?.id || ''
    formInfo.value.data.accountingPeriodName = _data?.periodYearAndMonth || ''
  })
}

const save = (err) => {
  if (err) return
  if(tableInfo.value.data.length === 0) return proxy.$message.warning('请填写明细数据')
  const isAdd = !props.id
  const api = isAdd ? addDeptMedicalIncome : updateDeptMedicalIncome
  const data = JSON.parse(JSON.stringify(formInfo.value.data))
    data.details = JSON.parse(JSON.stringify(tableInfo.value.data))
  api(data).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

const dialogInfoRef = ref()
function openDeptSelector() {
  treeInfo.value.title = '科室'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  tableInfo.value.query.deptId = raw.id
  tableInfo.value.query.deptName = raw.name
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
      <template #filter-deptName>
        <el-input
            v-model="tableInfo.query.deptName"
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
    </ModifyTable>
  </ModifyPage>
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
  <add-detail :title="addDetailInfo.title" :table-row="addDetailInfo.row" :visible="addDetailInfo.visible" @callback="addDetailCallback" />
</template>

<style scoped lang="scss">

</style>
