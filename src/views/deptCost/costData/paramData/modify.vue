<script setup>
import {getCurrentInstance, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {periodMonthByDate} from "@/api/base";
import moment from "moment";
import AddDetail from "./addDetail.vue";
import {exportTemplateExcel} from "@/api/pub";
import {
  addParamData,
  calcParamDataAmount,
  deleteParamDataDetail, exportParamDataDetail,
  oneParamData,
  pageParamDataDetail, updateParamData
} from "@/api/paramData";
import {getToDay} from "@/utils/slp";
import {useUpload} from "@/hooks/useUpload";

const { proxy } = getCurrentInstance();

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
  title: '参数单据',
  fieldList: [
    {label: '单据号', value: 'docNum', type: 'input', disabled: true, show: !!props.id,},
    {label: '业务日期', value: 'businessTime', type: 'date', valueFormat: 'YYYY-MM-DD'},
    {label: '会计期间', value: 'accountingPeriodValue', type: 'input', disabled: true},
    {label: '单据模板', value: 'apportionmentParamTemplateValue', type: 'input', disabled: true },
    {label: '分摊参数', value: 'apportionmentParamName', type: 'slot' },
    {label: '总参数值', value: 'totalValue', type: 'input', disabled: true},
    {label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', disabled: true},
    {label: '备注', value: 'remark', type: 'input'},
  ],
  rules: {
    businessTime: [{required: true, message: '请选择业务日期'}],
    apportionmentParamName: [{required: true, message: '请选择分摊参数'}]
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
    deptParamId: props.id
  },
  fieldList: [
    {label: '科室编码', value: 'deptCode'},
    {label: '科室名称', value: 'deptName'},
    {label: '参数值', value: 'capitalSourceValue', align: 'center'},
    {label: '备注', value: 'remark'},
  ],
  data: [],
  btnList: [
    {type: 'button', label: '添加明细', event: () => openAddDetail(), show: proxy.$permission('paramData:add')},
    {type: 'button', label: '删除', event: () => deleteDetail(), show: proxy.$permission('paramData:delete')},
    {type: 'button', label: '下载模板', event: downloadTemplate, show: proxy.$permission('paramData:download') && props.id},
    {type: 'slot', label: '导入', value: 'uploadFile', show: proxy.$permission('paramData:import') && props.id},
    {type: 'button', label: '导出', event: exportData, show: proxy.$permission('paramData:export') && props.id},
    { type: 'slot', label: '科室信息', showLabel: true, show: !!props.id, value: 'deptName' },
    { type: 'button', label: '查询', show: !!props.id, event: getList },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('paramData:update'),
        event: openAddDetail,
      },
      {
        label: '删除',
        show: proxy.$permission('paramData:delete'),
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
} = useUpload({}, undefined, '/deptApportionmentParam/detail/importDetailExcel', () => {
  // 刷新明细
  getList()
  calcMoneyAmount()
}, 'paramData:import')
uploadInfo.data = {
  deptCostId: props.id,
}

const tableParameter = ref({
  visible: false,
  type: '',
  title: '',
  callback: null,
  filters: [],
  fieldList: [],
  query: {}
})
const pageFormRef = ref()

watch(() => tableInfo.value.sectionRows, (rows) => {
  const tableBtn = tableInfo.value.btnList
  tableBtn[1].disabled = !rows.length
}, {immediate: true})
watch(() => formInfo.value.data.apportionmentParamId, (apportionmentParamId) => {
  const tableBtn = tableInfo.value.btnList
  tableBtn[0].disabled = !apportionmentParamId
}, {immediate: true})
watch(() => formInfo.value.data.apportionmentParamTemplate, (apportionmentParamTemplate) => {
  const template_column = [
      [],
      [
        {label: '科室编码', value: 'deptCode'},
        {label: '科室名称', value: 'deptName'},
        {label: '参数值', value: 'paramValue'},
        {label: '备注', value: 'remark'},
      ],
      [
        {label: '服务科室编码', value: 'sourceDeptCode'},
        {label: '服务科室名称', value: 'sourceDeptName'},
        {label: '收益科室编码', value: 'deptCode'},
        {label: '收益科室名称', value: 'deptName'},
        {label: '参数值', value: 'paramValue'},
        {label: '备注', value: 'remark'},
      ]
  ]
  tableInfo.value.fieldList = template_column[apportionmentParamTemplate]
}, {immediate: true})

onMounted(() => {
  if (props.id) {
    tableInfo.value.api = pageParamDataDetail
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
  watch(() => tableInfo.value.data.map(row => row.paramValue), (paramValue) => {
    formInfo.value.data.totalValue = paramValue.reduce((pre, cur) => pre + cur, 0)
  }, {deep: true, immediate: true})
}

function getMain() {
  oneParamData(props.id).then(({data}) => {
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
    deptParamId: formInfo.value.data.id
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
        deptParamId: props.id
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
  calcParamDataAmount(formInfo.value.data.id).then(res => {
    formInfo.value.data.totalValue = res.data
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
    deleteParamDataDetail(ids).then(({code}) => {
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
  periodMonthByDate({beginDate: moment(date).format('YYYY-MM-DD 00:00:00')}).then(({data}) => {
    const _data = data ? data[0] : {}
    formInfo.value.data.accountingPeriodId = _data.id
    formInfo.value.data.accountingPeriodValue = _data.periodYearAndMonth
  })
}

const save = (err) => {
  if (err) return
  if(tableInfo.value.data.length === 0) return proxy.$message.warning('请填写明细数据')
  const isAdd = !props.id
  const api = isAdd ? addParamData : updateParamData
  const data = JSON.parse(JSON.stringify(formInfo.value.data))
    data.detail = JSON.parse(JSON.stringify(tableInfo.value.data))
  data.businessTime = data.businessTime ? data.businessTime.substring(0,10) : ''
  api(data).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function openApportionmentParamSelector() {
  if (!!props.id) return
  tableParameter.value.title = '分摊参数'
  tableParameter.value.visible = true
  tableParameter.value.checkBox = false
  tableParameter.value.pager = false
  tableParameter.value.type = 'allocationParam'
  tableParameter.value.query = { status: 1 }
  tableParameter.value.callBack = apportionmentParamCallback
  pageFormRef.value.openDialog(tableParameter.value, 'table')
}
function apportionmentParamCallback(raw) {
  formInfo.value.data.apportionmentParamId = raw.id
  formInfo.value.data.apportionmentParamName = raw.name
  formInfo.value.data.apportionmentParamTemplate = raw.template
  formInfo.value.data.apportionmentParamTemplateValue = raw.templateValue
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('deptApportionmentParamDetailTemplate').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '参数数据明细信息导入模板')
    }
  })
}

function exportData() {
  exportParamDataDetail(tableInfo.value.query).then(res => {
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
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  callback: null
})

function opendeptSelector() {
  treeInfo.value.title = '科室信息'
  treeInfo.value.visible = true
}
function deptCallback(raw) {
  const datas = raw?.filter((it) => !it.childList)
  tableInfo.value.query.deptId = datas?.map((it) => it.id);
  tableInfo.value.query.deptIdList = datas?.map((it) => it.id);
  tableInfo.value.query.deptName = datas?.map((it) => it.name);
}
function returnBack() {
  emit('returnModify', true)
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm :form-info="formInfo" ref="pageFormRef">
      <template #form-apportionmentParamName>
        <el-input
            v-model="formInfo.data.apportionmentParamName"
            :class="{ 'not-mongolia': !id }"
            type="input"
            placeholder="请选择分摊参数"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openApportionmentParamSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable :pager="!!formInfo.data.id" :is-dynamic="true" :table-info="tableInfo" @handleEvent="tableHandler">
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
            <el-icon @click="opendeptSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
  </ModifyPage>
  <add-detail :title="addDetailInfo.title" :colTemplate="formInfo.data.apportionmentParamTemplate" :table-row="addDetailInfo.row" :visible="addDetailInfo.visible"
              @callback="addDetailCallback"/>
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
      @callback="deptCallback" />
</template>

<style scoped lang="scss">

</style>
