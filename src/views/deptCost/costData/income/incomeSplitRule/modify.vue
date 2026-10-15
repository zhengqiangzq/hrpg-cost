<script setup>
import {getCurrentInstance, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import AddDetail from "./addDetail.vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  deptIncomeSplitRuleadd,
  deptIncomeSplitRuledetail,
  deptIncomeSplitRuleupdate
} from "@/api/deptCost/incomeSplitRule";
import {useStorage} from "@vueuse/core";
import {exportTemplateExcel} from "@/api/pub";
import {useUpload} from "@/hooks/useUpload";
const setting = useStorage('setting', {}, sessionStorage)

const { proxy } = getCurrentInstance();

const { tableParameter, openDialog } = useSelectTableData()
const formRef = ref()
const emit = defineEmits(['returnModify'])
const PERMISSION_CODE = 'incomeSplitRule'
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
  batch: true,
  flowFormType: ''
})
const detailId = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emit('update:visible', newValue)
  },
})
const pageRef = ref()
const pageBtn = ref([
  { label: '保存并新增', event: saveAndAdd, show: true }
])

const formInfo = ref({
  title: '收入拆分',
  listType: {
    splitList: [
      { key: '按总额拆分', value: 1 },
      { key: '按收费分类拆分', value: 2 },
      { key: '按收费项目拆分', value: 3 },
    ]
  },
  fieldList: [
    { label: '拆分规则编码', value: 'code', type: 'input', disabled: !!props.id },
    { label: '拆分规则名称', value: 'name', type: 'input' },
    { label: '会计期间', value: 'accountingPeriodName', type: 'slot' },
    { label: '源科室编码', value: 'sourceDeptCode', type: 'slot' },
    { label: '源科室名称', value: 'sourceDeptName', type: 'input', disabled: true },
    { label: '拆分方法', value: 'splitMethod', type: 'select', list: 'splitList', event: (val) => {
        changeWay(val)
        tableAreaInfo.value.data = []
      }
    },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    code: [{required: true, message: '请输入拆分规则编码'}],
    name: [{required: true, message: '请输入拆分规则名称'}],
    accountingPeriodName: [{required: true, message: '请选择会计期间'}],
    sourceDeptCode: [{required: true, message: '请选择源科室'}],
    splitMethod: [{required: true, message: '请选择拆分方法'}],
  },
  data: {
  }
})

const tableAreaInfo = ref({
  title: '拆分范围',
  fieldList: [
    { label: '收费项目编码', value: '' },
    { label: '收费项目名称', value: '' },
  ],
  data: [],
  sectionRows: [],
  btnList: [
    { type: 'button', label: '添加', btType: 'primary', event: () => openAddAreaDetail(), show: proxy.$permission(`${PERMISSION_CODE}:add`) },
    { type: 'button', label: '删除', event: () => deleteAreaDetail(), show: proxy.$permission(`${PERMISSION_CODE}：delete`) },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '删除',
        show: true,
        event: deleteAreaDetail,
      },
    ]
  },
})
const {
  uploadInfo,
  uploadSuccess,
  uploadError,
  beforeUpload
} = useUpload({}, undefined, '/deptIncomeSplitRule/import/excel', (resp) => {
  if (resp.data) {
    tableInfo.value.data.push(...resp.data)
  }
},`${PERMISSION_CODE}:import`)

const tableInfo = ref({
  title: '承担科室信息',
  fieldList: [
    { label: '承担科室编码', value: 'deptCode' },
    { label: '承担科室名称', value: 'deptName' },
    { label: '参数值来源', value: 'paramSourceName' },
    { label: '分摊参数', value: 'apportionmentParamName' },
    { label: '参数值', value: 'paramValue', align: 'center' },
  ],
  data: [],
  query: {
    splitRuleId: props.id
  },
  btnList: [
    { type: 'button', label: '添加明细', event: () => openAddDetail(), show: proxy.$permission(`${PERMISSION_CODE}:add`) },
    { type: 'button', label: '删除', event: () => deleteDetail(), show: proxy.$permission(`${PERMISSION_CODE}：delete`) },
    { type: 'button', label: '下载模板', event: downloadTemplate, show: proxy.$permission(`${PERMISSION_CODE}：download`) },
    { type: 'slot', label: '导入', value: 'uploadFile', show: proxy.$permission(`${PERMISSION_CODE}:import`) },

  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openAddDetail,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}：delete`),
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


watch(() => props.id, (val) => {
  detailId.value = val
}, { immediate: true })
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
    formInfo.value.data.splitMethod = 1
  }
})

function getMain() {
  deptIncomeSplitRuledetail(props.id).then(({data}) => {
    formInfo.value.data = data
    tableInfo.value.data = data.detailList
    const areaDataKey = { 2: 'feeCategoryLists', 3: 'feeItemList' }[data.splitMethod]
    if (data.splitMethod !== 1) {
      changeWay(data.splitMethod)
      tableAreaInfo.value.data = data[areaDataKey]
    }
  })
}

function changeWay(val) {
  if (val === 1) return
  const fields = {
    2: [
      { label: '收费类别编码', value: 'code' },
      { label: '收费类别名称', value: 'name' },
    ],
    3: [
      { label: '收费项目编码', value: 'code' },
      { label: '收费项目名称', value: 'name' },
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

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('科室成本-收入拆分规则导入模版', `${PERMISSION_CODE}:download`).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '科室成本-收入拆分规则导入模版')
    }
  })
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

function saveAndAdd() {
  pageRef.value.validate().then(res => {
    save(null, false)
  }).catch(err => {
    save(err)
  })
}

const save = (err, close = true) => {
  if (err) return
  if(tableInfo.value.data.length === 0) return proxy.$message.warning('请填写明细数据')
  const api = detailId.value ? deptIncomeSplitRuleupdate : deptIncomeSplitRuleadd
  const data = {
    ...formInfo.value.data,
    detailList: tableInfo.value.data,
    orgId: setting.value.hospitalId
  }
  const areaDataKey = { 2: 'feeCategoryLists', 3: 'feeItemList' }[data.splitMethod]
  if(areaDataKey) {
    data[areaDataKey] = tableAreaInfo.value.data || []
  }
  api(data).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        detailId.value = ''
        formInfo.value.fieldList[0].disabled = false;
        tableInfo.value.data = []
        tableAreaInfo.value.data = []
        formInfo.value.data = {splitMethod: 1}
        return
      }
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
function openCostItemSelector() {
  if (formInfo.value.data.splitMethod == 3) {
    tableParameter.title = '收费项目'
    tableParameter.visible = true
    tableParameter.checkBox = true
    tableParameter.type = 'feeItem'
    tableParameter.query = { status: 1, idNotIn: tableAreaInfo.value.data.map(it => it.id).toString()  }
    tableParameter.filters = [
      { type: 'input', label: '编码/名称', value: 'keyword' }
    ]
    tableParameter.callBack = costItemCallback
    openDialog(formRef.value, 'table')
  } else if (formInfo.value.data.splitMethod == 2) {
    tableParameter.title = '收费类别'
    tableParameter.visible = true
    tableParameter.checkBox = true
    tableParameter.type = 'feeCategory'
    tableParameter.query = { status: 1, idNotIn: tableAreaInfo.value.data.map(it => it.id).toString()  }
    tableParameter.callBack = costItemCallback
    openDialog(formRef.value, 'table')
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
  formInfo.value.data.accountingPeriodName = raw.periodYearAndMonth
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
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @returnBack="returnBack" @save="save">
    <ModifyForm ref="formRef" :form-info="formInfo" :listTypeInfo="formInfo.listType" @handle-event="formEvent">
      <template #form-accountingPeriodName>
        <el-input
            v-model="formInfo.data.accountingPeriodName"
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
    <ModifyTable v-if="[2, 3].includes(formInfo.data.splitMethod)" :table-info="tableAreaInfo">
    </ModifyTable>
    <ModifyTable
        ref="dialogInfoRef" :table-info="tableInfo" rowKey="uuid" @handleEvent="tableHandler">
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
</template>

<style scoped lang="scss">

</style>
