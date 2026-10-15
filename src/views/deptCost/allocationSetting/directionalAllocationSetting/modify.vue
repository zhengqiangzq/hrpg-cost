<script setup>
import {getCurrentInstance, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import AddDetail from "./addDetail.vue";
import {useStorage} from "@vueuse/core";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  addDirectionAllocationSetting,
  directApportionmentgetById,
  updateDirectionAllocationSetting
} from "@/api/directionalAllocationSetting";

const { proxy } = getCurrentInstance();
const setting = useStorage('setting', {}, sessionStorage)

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
  title: '定向分摊信息',
  fieldList: [
    { label: '定向规则编码', value: 'code', type: 'input', disabled: !!props.id },
    { label: '定向规则名称', value: 'name', type: 'input' },
    { label: '会计期间', value: 'periodName', type: 'slot' },
    { label: '源科室编码', value: 'sourceDeptCode', type: 'slot' },
    { label: '源科室名称', value: 'sourceDeptName', type: 'input', disabled: true },
    { label: '定向方法', value: 'directType', type: 'select-model', code: 'cost_apportionment_method', event: (val) => {
        changeWay(val)
        tableAreaInfo.value.data = []
      }
    },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    code: [{required: true, message: '请输入定向规则编码'}],
    name: [{required: true, message: '请输入定向规则名称'}],
    periodName: [{required: true, message: '请选择会计期间'}],
    sourceDeptCode: [{required: true, message: '请选择源科室'}],
    directType: [{required: true, message: '请选择定向方法'}],
  },
  data: {
    directType: '1',
  }
})

const tableAreaInfo = ref({
  title: '定向范围',
  fieldList: [
    { label: '成本项目编码', value: 'rangeCode' },
    { label: '成本项目名称', value: 'rangeName' },
  ],
  data: [],
  sectionRows: [],
  btnList: [
    { type: 'button', label: '添加', btType: 'primary', event: () => openAddAreaDetail(), show: proxy.$permission('directionalAllocationSetting:add') },
    { type: 'button', label: '删除', event: () => deleteAreaDetail(), show: proxy.$permission('directionalAllocationSetting:delete') },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '删除',
        show: proxy.$permission('directionalAllocationSetting:delete'),
        event: deleteAreaDetail,
      },
    ]
  },
})
const tableInfo = ref({
  title: '承担科室信息',
  fieldList: [
    { label: '承担科室编码', value: 'targetDeptCode' },
    { label: '承担科室名称', value: 'targetDeptName' },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  query: {
    splitRuleId: props.id
  },
  btnList: [
    { type: 'button', btType: 'primary', label: '添加科室', event: () => openAddDetail(), show: proxy.$permission('directionalAllocationSetting:add') },
    { type: 'button', label: '删除', event: () => deleteDetail(), show: proxy.$permission('directionalAllocationSetting:delete') },

  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('directionalAllocationSetting:update'),
        event: openAddDetail,
      },
      {
        label: '删除',
        show: proxy.$permission('directionalAllocationSetting:delete'),
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

watch(() => tableAreaInfo.value.sectionRows, (rows) => {
  const tableBtn = tableAreaInfo.value.btnList
  tableBtn[1].disabled = !rows.length
}, { immediate: true })
watch(() => tableInfo.value.sectionRows, (rows) => {
  const tableBtn = tableInfo.value.btnList
  tableBtn[1].disabled = !rows.length
}, { immediate: true })
watch(() => formInfo.value.data.periodId, (periodId) => {
  const tableBtn = tableInfo.value.btnList
  tableBtn[0].disabled = !periodId
}, { immediate: true })

onMounted(() => {
  if (props.id) {
    getMain()
  } else {
  }
})

function getMain() {
  directApportionmentgetById({id:props.id}).then(({data}) => {
    formInfo.value.data = data
    tableInfo.value.data = data.deptList
    if (data.directType != '1') {
      changeWay(data.directType)
      tableAreaInfo.value.data = data.rangeList || []
    }
  })
}

function changeWay(val) {
  if (val === '1') return
  const fields = {
    '2': [
      { label: '成本分类编码', value: 'rangeCode' },
      { label: '成本分类名称', value: 'rangeName' },
    ],
    '3': [
      { label: '成本项目编码', value: 'rangeCode' },
      { label: '成本项目名称', value: 'rangeName' },
    ]
  }
  tableAreaInfo.value.fieldList = fields[val]
}

function getList() {
  tableInfo.value.refresh = Math.random()
}

const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableAreaInfo.value.sectionRows = raw
  }
}
const tableDeptHandler = (eventName, raw) => {
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
    const depts = raw.targetDeptId
    const rows = depts.map((it, index) => {
      return {
        ...raw,
        targetDeptCode: raw.targetDeptCode[index],
        targetDeptId: raw.targetDeptId[index],
        targetDeptName: raw.targetDeptName[index],
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
  const sections = row ? [row] : tableAreaInfo.value.sectionRows
  tableAreaInfo.value.data = tableAreaInfo.value.data.filter(it => sections.indexOf(it) == -1)
}

const save = (err) => {
  if (err) return
  if(tableInfo.value.data.length === 0) return proxy.$message.warning('请填写明细数据')
  const isAdd = !props.id
  const api = isAdd ? addDirectionAllocationSetting : updateDirectionAllocationSetting
  const data = {
    ...formInfo.value.data,
    orgId: setting.value.hospitalId,
    deptList: tableInfo.value.data,
    rangeList: tableAreaInfo.value.data || [],
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


const dialogInfoRef = ref()
// 成本项目
function openCostItemSelector() {
  if(formInfo.value.data.directType == '2') {
    return costTypeInfo.visible = true
  }
  tableParameter.title = '成本项目'
  tableParameter.visible = true
  tableParameter.checkBox = true
  tableParameter.type = 'costItem'
  tableParameter.query = { last: true  }
  tableParameter.filters = [
    { type: 'input', label: '名称', value: 'name' }
  ]
  tableParameter.callBack = costItemCallback
  openDialog(formRef.value, 'table')
}
function costItemCallback(raw) {
  const newData = []
  raw?.forEach(it => {
    newData.push({
      costItemId: it.id,
      rangeCode: it.code,
      rangeName: it.name,
    })
  })
  tableAreaInfo.value.data = uniqueBy(tableAreaInfo.value.data.concat(newData), 'rangeCode')
}

// 成本分类
const costTypeInfo = reactive({
  title: '成本分类',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})

function costCategoryCallback(raw) {
  let datas = raw?.filter((it) => !it.children)
  const newData = []
  datas?.forEach(it => {
    newData.push({
      costCategoryId: it.id,
      rangeCode: it.code,
      rangeName: it.name,
    })
  })
  tableAreaInfo.value.data = uniqueBy(tableAreaInfo.value.data.concat(newData), 'rangeCode')
}
// 去重
const uniqueBy = (arr, key) => {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item[key];
    return seen.has(k) ? false : seen.add(k);
  });
};


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
  formInfo.value.data.periodId = raw.id
  formInfo.value.data.periodName = raw.periodYearAndMonth
}

// 科室
function openDeptSelector() {
  treeInfo.value.title = "科室";
  treeInfo.value.visible = true;
}

function treeCallback(raw) {
  treeInfo.value.visible = false
  formInfo.value.data.sourceDeptName = raw.name
  formInfo.value.data.sourceDeptId = raw.id
  formInfo.value.data.sourceDeptCode = raw.code
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm ref="formRef" :form-info="formInfo" @handle-event="formEvent">
      <template #form-periodName>
        <el-input
            v-model="formInfo.data.periodName"
            class="not-mongolia"
            placeholder="请选择会计期间"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-sourceDeptCode>
        <el-input
            v-model="formInfo.data.sourceDeptCode"
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
    <ModifyTable v-if="formInfo.data.directType != 1" :table-info="tableAreaInfo" @handleEvent="tableHandler">
    </ModifyTable>
    <ModifyTable
        ref="dialogInfoRef" :table-info="tableInfo" @handleEvent="tableDeptHandler">
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
      v-if="costTypeInfo.visible"
      v-model:showDialog="costTypeInfo.visible"
      :title="costTypeInfo.title"
      :checkStrictly="costTypeInfo.checkStrictly"
      :isLeaf="costTypeInfo.isLeaf"
      :query="costTypeInfo.query"
      :checkBox="costTypeInfo.checkBox"
      @callback="costCategoryCallback"
  />
</template>

<style scoped lang="scss">

</style>
