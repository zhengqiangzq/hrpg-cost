<script setup>
import {getCurrentInstance, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import AddDetail from "./addDetail.vue";
import {
  addCostSplitRule,
  oneCostSplitRule,
  updateCostSplitRule
} from "@/api/deptCostSplitRule";
import {exportTemplateExcel} from "@/api/pub";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useUpload} from "@/hooks/useUpload";

const { proxy } = getCurrentInstance();

const { tableParameter, openDialog } = useSelectTableData()
const formRef = ref()
const emit = defineEmits(['returnModify'])
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
  labelWidth: '140px',
  title: '成本拆分',
  fieldList: [
    { label: '拆分规则编码', value: 'splitCode', type: 'input', disabled: !!props.id },
    { label: '拆分规则名称', value: 'splitName', type: 'input' },
    { label: '会计期间', value: 'accountingPeriodValue', type: 'slot' },
    { label: '源科室编码', value: 'deptCode', type: 'slot' },
    { label: '源科室名称', value: 'deptName', type: 'input', disabled: true },
    { label: '拆分方法', value: 'way', type: 'select-model', code: 'cost_split_method', event: (val) => {
        changeWay(val)
        tableAreaInfo.value.data = []
      }
    },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    splitCode: [{required: true, message: '请输入拆分规则编码'}],
    splitName: [{required: true, message: '请输入拆分规则名称'}],
    accountingPeriodValue: [{required: true, message: '请选择会计期间'}],
    deptCode: [{required: true, message: '请选择源科室'}],
    way: [{required: true, message: '请选择拆分方法'}],
  },
  data: {
  }
})

const tableAreaInfo = ref({
  title: '拆分范围',
  fieldList: [
    { label: '成本项目编码', value: '' },
    { label: '成本项目名称', value: '' },
  ],
  data: [],
  sectionRows: [],
  btnList: [
    { type: 'button', label: '添加', event: () => openAddAreaDetail(), show: proxy.$permission('costBreakdown:add') },
    { type: 'button', label: '删除', event: () => deleteAreaDetail(), show: proxy.$permission('costBreakdown:delete') },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '删除',
        show: proxy.$permission('costBreakdown:delete'),
        event: deleteAreaDetail,
      },
    ]
  },
})
const tableInfo = ref({
  title: '承担科室信息',
  fieldList: [
    { label: '承担科室编码', value: 'deptCode' },
    { label: '承担科室名称', value: 'deptName' },
    { label: '参数值来源', value: 'paramSourceValue' },
    { label: '分摊参数', value: 'apportionmentParamName' },
    { label: '参数值', value: 'value', align: 'center' },
  ],
  data: [],
  query: {
    splitRuleId: props.id
  },
  btnList: [
    { type: 'button', label: '添加明细', event: () => openAddDetail(), show: proxy.$permission('costBreakdown:add') },
    { type: 'button', label: '删除', event: () => deleteDetail(), show: proxy.$permission('costBreakdown:delete') },
    { type: 'button', label: '下载模板', event: downloadTemplate, show: proxy.$permission('costBreakdown:download') },
    { type: 'slot', label: '导入', value: 'uploadFile', show: proxy.$permission('costBreakdown:import') },

  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('costBreakdown:update'),
        event: openAddDetail,
      },
      {
        label: '删除',
        show: proxy.$permission('costBreakdown:delete'),
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

// 系统科室
const treeInfo = ref({
  title: '源科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  api: null,
  query: {}
})

const selectCostType = ref({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
})
const {
  uploadInfo,
  uploadSuccess,
  uploadError,
  beforeUpload
} = useUpload({}, undefined, '/deptCost/deptSplitRule/import/excel', (resp) => {
  if (resp.data) {
    tableInfo.value.data.push(...resp.data)
  }
}, 'costBreakdown:import')

watch(() => tableAreaInfo.value.sectionRows, (rows) => {
  const tableBtn = tableAreaInfo.value.btnList
  tableBtn[1].disabled = !rows.length
}, { immediate: true })
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
    getMain()
  } else {
  }
})

function getMain() {
  oneCostSplitRule(props.id).then(({data}) => {
    formInfo.value.data = data
    tableInfo.value.data = data.detail
    const areaDataKey = { '2': 'costTypeList', '3': 'costItemList' }[data.way]
    if (data.way !== '1') {
      changeWay(data.way)
      tableAreaInfo.value.data = data[areaDataKey]
    }
  })
}

function changeWay(val) {
  if (val === '1') return
  const fields = {
    '2': [
      { label: '成本分类编码', value: 'code' },
      { label: '成本分类名称', value: 'name' },
    ],
    '3': [
      { label: '成本项目编码', value: 'code' },
      { label: '成本项目名称', value: 'name' },
    ]
  }
  tableAreaInfo.value.fieldList = fields[val]
}

function getList() {
  tableInfo.value.refresh = Math.random()
}

const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function deleteDetail(row) {
  const sections = row ? [row] : tableInfo.value.sectionRows
  tableInfo.value.data = tableInfo.value.data.filter(it => sections.indexOf(it) == -1)
}

function openAddDetail(row) {
  addDetailInfo.value.index = tableInfo.value.data.indexOf(row)
  addDetailInfo.value.row = row ? {
    ...row,
  } : { }
  addDetailInfo.value.title = row ? '修改明细数据' : '新增明细数据'
  addDetailInfo.value.visible = true
}

function addDetailCallback(raw) {
  addDetailInfo.value.visible = false
  if (!raw) return
  if (addDetailInfo.value.index === -1) {
    const depts = raw.deptId
    const rows = depts.map((it, index) => {
      return {
        ...raw,
        deptCode: raw.deptCode[index],
        deptId: raw.deptId[index],
        deptName: raw.deptName[index],
      }
    })
    tableInfo.value.data = tableInfo.value.data.concat(rows)
  } else {
    tableInfo.value.data[addDetailInfo.value.index] = raw
  }
}

function openAddAreaDetail() {
  openCostItemSelector()
}
function deleteAreaDetail(row) {
  const index = tableAreaInfo.value.data.indexOf(row)
  if (index !== -1) {
    tableAreaInfo.value.data.splice(index, 1)
  }
}

const save = (err) => {
  if (err) return
  if(tableInfo.value.data.length === 0) return proxy.$message.warning('请填写明细数据')
  const isAdd = !props.id
  const api = isAdd ? addCostSplitRule : updateCostSplitRule
  const data = {
    ...formInfo.value.data,
    detail: tableInfo.value.data,
    costTypeList: undefined,
    costItemList: undefined,
  }
  const areaDataKey = { '2': 'costTypeList', '3': 'costItemList' }[data.way]
  if (areaDataKey) {
    data[areaDataKey] = tableAreaInfo.value.data || []
  }
  api(data).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}
function returnBack() {
  emit('returnModify', true)
}

function formEvent(event, data) {
  if (typeof event === 'function') {
    event(data)
  } else {
    event.event && event.event(data)
  }
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('成本拆分导入模板', 'costBreakdown:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '成本拆分导入模板')
    }
  })
}

const dialogInfoRef = ref()
function openCostItemSelector() {
  if (formInfo.value.data.way == '3') {
    tableParameter.title = '成本项目'
    tableParameter.visible = true
    tableParameter.checkBox = true
    tableParameter.type = 'costItem'
    tableParameter.query = { last: true, idNotIn: tableAreaInfo.value.data.map(it => it.id).toString()  }
    tableParameter.filters = [
      { type: 'input', label: '名称', value: 'name' }
    ]
    tableParameter.callBack = costItemCallback
    openDialog(formRef.value, 'table')
  } else if (formInfo.value.data.way == '2') {
    selectCostType.value.visible = true
    selectCostType.value.query = { idNotIn: tableAreaInfo.value.data.map(it => it.id).toString() }
  }
}
function costItemCallback(raw) {
  tableAreaInfo.value.data.push(...(raw.filter(it => !tableAreaInfo.value.data.find(row => row.id === it.id))))
}

function openAccountingPeriodSelector() {
  tableParameter.title = '会计期间'
  tableParameter.checkBox = false
  tableParameter.pager = true
  tableParameter.type = 'accountingPeriod'
  tableParameter.callBack = accountingPeriodCallback
  tableParameter.visible = true
  openDialog(formRef.value, 'table')
}

function accountingPeriodCallback(raw) {
  formInfo.value.data.accountingPeriodId = raw.id
  formInfo.value.data.accountingPeriodValue = raw.periodYearAndMonth
}

// 科室
function openDeptSelector() {
  treeInfo.value.title = "科室";
  treeInfo.value.visible = true;
}

function treeCallback(raw) {
  treeInfo.value.visible = false
  formInfo.value.data.deptName = raw.name
  formInfo.value.data.deptId = raw.id
  formInfo.value.data.deptCode = raw.code
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm ref="formRef" :form-info="formInfo" @handle-event="formEvent">
      <template #form-accountingPeriodValue>
        <el-input
            v-model="formInfo.data.accountingPeriodValue"
            class="not-mongolia"
            placeholder="请选择会计期间"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-deptCode>
        <el-input
            v-model="formInfo.data.deptCode"
            class="not-mongolia"
            placeholder="请选择源科室"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openDeptSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable v-if="['2', '3'].includes(formInfo.data.way + '')" :table-info="tableAreaInfo">
    </ModifyTable>
    <ModifyTable
        ref="dialogInfoRef" :table-info="tableInfo" @handleEvent="tableHandler">
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
    </ModifyTable>
  </ModifyPage>
  <add-detail :title="addDetailInfo.title" :table-row="addDetailInfo.row" :visible="addDetailInfo.visible" @callback="addDetailCallback" />
  <!--    查询核算科室-->
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
  <SelectCostType
      v-if="selectCostType.visible"
      v-model:query="selectCostType.query"
      v-model:show-dialog="selectCostType.visible"
      title="成本分类"
      :checkStrictly="true"
      :check-box="true"
      :isLeaf="false"
      :highlightCurrent="true"
      :checkedKey="selectCostType.checkedKey"
      :saveEmpty="selectCostType.saveEmpty"
      @callback="costItemCallback"
  ></SelectCostType>
</template>

<style scoped lang="scss">

</style>
