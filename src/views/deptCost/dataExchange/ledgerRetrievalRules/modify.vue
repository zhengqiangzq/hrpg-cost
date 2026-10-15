<script setup>
import {getCurrentInstance, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import AddDetail from "./addDetail.vue";
import axios from "axios";
import {
  oneSecondAllocationType,
  secondAllocationpage,
  secondAllocationadd,
  secondAllocationdeleteByIds,
  secondAllocationimportExcel,
  secondAllocationTypeadd,
  secondAllocationTypeupdate, secondAllocationexportExcel,
} from "@/api/accountingDepartment";
import {costItem} from "@/api/costInformation";
import {exportTemplateExcel} from "@/api/pub";
import {
  finAccessRuleadd, finAccessRuledelete,
  finAccessRuledetail,
  finAccessRuledetaildelete, finAccessRuledetailexportDetailExcelByDeptCost, finAccessRuledetailpage,
  finAccessRuleupdate
} from "@/api/ledgerRetrievalRules";
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
  batch: false,
  id: '',
  flowFormType: ''
})
const pageBtn = ref([
])
const pageRef = ref()
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
  title: '总账取数规则',
  fieldList: [
    { label: '规则编码', value: 'code', type: 'input', disabled: false, },
    { label: '规则名称', value: 'name', type: 'input' },
    { label: '发生方向', value: 'direct', type: 'select-model', code: 'accounting_account_direction' },
    { label: '取值公式', value: 'formula', type: 'select-model', code: 'account_formula' },
  ],
  rules: {
    code: [{ required: true, message: '请填写编码' }],
    name: [{ required: true, message: '请填写名称' }],
    direct: [{ required: true, message: '请选择发生方向' }],
    formula: [{ required: true, message: '请选择取值公式' }],
  },
  data: {
    status: 0
  }
})
const {
  uploadInfo,
  uploadError,
  uploadSuccess,
  beforeUpload
} = useUpload({}, undefined, '/finAccessRule/detail/importDetailExcel', () => getDetail(), 'ledgerRetrievalRules:import')

const tableInfo = ref({
  refresh: 1,
  query: {
    ruleId: props.id
  },
  title: '明细信息',
  fieldList: [
    { label: '科目编码', value: 'accountCode', },
    { label: '科目名称', value: 'accountName' },
    { label: '辅助核算', value: 'accassItemValue' },
    { label: '有无部门辅助', value: 'isHaveDeptName' },
    { label: '部门', value: 'deptName' },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', show: proxy.$permission('ledgerRetrievalRules:add'), event: () => addDetail() },
    { type: 'button', label: '删除', show: proxy.$permission('ledgerRetrievalRules:delete'), event: delDetail },
    { type: 'button', show: props.id && proxy.$permission('ledgerRetrievalRules:download'), label: '下载模板', event: downloadTemplate },
    { type: 'slot', show: props.id && proxy.$permission('ledgerRetrievalRules:import'), label: '导入', value: 'uploadFile' },
    { type: 'button', show: props.id && proxy.$permission('ledgerRetrievalRules:export'), label: '导出', event: exportData },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('ledgerRetrievalRules:update'),
        event: editDetail,
      },
      {
        label: '删除',
        show: proxy.$permission('ledgerRetrievalRules:delete'),
        event: remove,
      },
    ]
  },
  sectionRows: []
})
const tableParameter = ref({
  title: '',
  type: '',
  checkBox: false,
  visible: false,
  callBack: null,
  query: {}
})

onMounted(() => {
  if (props.id) {
    tableInfo.value.api = finAccessRuledetailpage
    getMain()
    formInfo.value.fieldList[0].disabled = true;
  } else {

  }
})


watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = tableInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { deep: true, immediate: true })


function getMain() {
  finAccessRuledetail(props.id).then(res => {
    formInfo.value.data = res.data
    uploadInfo.data.ruleId = formInfo.value.data.id
    getDetail()
  })
}

function getDetail() {
  tableInfo.value.refresh = Math.random()
}

// 导出Excel
function exportData() {
  finAccessRuledetailexportDetailExcelByDeptCost({ruleId: formInfo.value.data.id}).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('finAccessRuleDetailTemplate').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '总账取数规则详情导入模板')
    }
  })
}

// 新增明细
const addDetailInfo = ref({
  visible: false,
  accassItems: [],
  row: null
})


// 打开新增明细
function addDetail(row) {
  addDetailInfo.value.index = tableInfo.value.data.indexOf(row)
  addDetailInfo.value.row = {
    ruleHid: formInfo.value.data.id,
    list: []
  }
  addDetailInfo.value.title = '新增总账取数规则'
  addDetailInfo.value.accassItems = []
  addDetailInfo.value.visible = true;
}

//  编辑明细
function editDetail(row) {
  addDetailInfo.value.index = tableInfo.value.data.indexOf(row)
  addDetailInfo.value.row = {
    ...row,
    ruleHid: formInfo.value.data.id,
    accountIds: [row.accountId],
    list: []
  }
  addDetailInfo.value.title = '修改总账取数规则'
  addDetailInfo.value.visible = true;

}

function addDetailCallback(raw) {
  addDetailInfo.value.visible = false
  if (!raw) return
  if (typeof raw == 'object') {
    if (addDetailInfo.value.index === -1) {
      const allData = tableInfo.value.data.concat(raw)
      tableInfo.value.data = setData(allData, 'accountCode')
    } else {
      raw.isHaveDeptName = raw.isHaveDept === 1 ? "有" : "无"
      tableInfo.value.data[addDetailInfo.value.index] = raw
    }
  } else {
    // 刷新明细
    getDetail()
  }
}

function setData(data, key) {
  let keys=[];
  let newData=[];
  data.forEach(item=>{
    if(!keys.includes(item[key])){
      item.accassItemValue = item.accassItemValue ? item.accassItemValue.toString() : ''
      keys.push(item[key])
      newData.push(item)
    }
  })

  return newData
}

function remove(row) {
  if (!formInfo.value.data.id) {
    const data = [row]
    tableInfo.value.data = tableInfo.value.data.filter(it => data.indexOf(it) === -1)
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    finAccessRuledetaildelete([row.id]).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getDetail()
      }
    })
  })
}
// 删除明细
function delDetail(row) {
  if (!formInfo.value.data.id) {
    const data = row.id ? [row] : tableInfo.value.sectionRows
    tableInfo.value.data = tableInfo.value.data.filter(it => data.indexOf(it) === -1)
    return
  }
  const ids = row.id ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    finAccessRuledetaildelete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getDetail()
      }
    })
  })
}

const save = (err, close = true) => {
  if (err) return
  if(tableInfo.value.data.length === 0) return proxy.$message.warning('请填写明细数据')
  const api = props.id ? finAccessRuleupdate : finAccessRuleadd
      api({...formInfo.value.data,
        detailList: tableInfo.value.data}).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

// table选择
function SelectionChange(val,data) {
  if (val === 'tableCheck') {
    tableInfo.value.sectionRows = data
  }
}

</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo">
    </ModifyForm>
    <ModifyTable @handleEvent="SelectionChange" :pager="!!props.id" :checkbox="true" :isDynamic="true" :table-info="tableInfo">
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
  <AddDetail
      :title="addDetailInfo.title"
      :table-row="addDetailInfo.row"
      :visible="addDetailInfo.visible"
      @callback="addDetailCallback"
  />
</template>

<style scoped lang="scss">

</style>
