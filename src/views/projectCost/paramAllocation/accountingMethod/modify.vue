<script setup>
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useStorage} from "@vueuse/core";
import {
  indirectModelPramdetail,
  indirectModelPramparam,
  indirectModelPramupdate,
  paramindirectModelPramadd
} from "@/api/accountingMethod";

const store = useStore()
const { proxy } = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)

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
const {tableParameter, openDialog} = useSelectTableData()

const filterRef = ref()
const formInfo = ref({
  title: '基础信息',
  fieldList: [
    {label: '单据号', value: 'docNum', type: 'input', disabled: true, show: props.id,},
    {label: '核算期间', value: 'itemAccountingPeriodName', type: 'slot'},
    {label: '核算方法', value: 'itemParamIndirectModelName', type: 'slot'},
    {label: '总参数值', value: 'value', type: 'input', disabled: true},
    {
      label: '确认状态',
      value: 'status',
      type: 'select-model',
      code: 'cost_document_status',
      disabled: true,
      show: props.id
    },
    {label: '备注', value: 'remark', type: 'input'},
  ],
  rules: {
    itemAccountingPeriodName: [{required: true, message: '请选择核算期间'}],
    itemParamIndirectModelName: [{required: true, message: '请选择核算方法'}]
  },
  data: {
    status: '0'
  }
})

const tableInfo = ref({
  title: '明细信息',
  query: {
    itemProductCostId: props.id,
    orgId: setting.value.hospitalId,
  },
  fieldList: [
    {label: '科室编码', value: 'deptCode'},
    {label: '科室名称', value: 'deptName'},
    {label: '收费项目编码', value: 'feeItemCode'},
    {label: '收费项目名称', value: 'feeItemName'},
    {label: '参数值', value: 'value', type: 'money'},
  ],
  data: [],
  btnList: [
    {type: 'slot', label: '收费项目', showLabel: true, show: !!props.id, value: 'feeItemName'},
    {type: 'button', label: '查询', show: !!props.id, event: getTableList},
  ],
  sectionRows: []
})

const AllTableData = ref([])
const flagSelctPaiod = ref(false)

onMounted(() => {
  if (props.id) {
    getMain()
  } else {
    getList()

  }
})

function getMain() {
  indirectModelPramdetail(props.id).then(res => {
    formInfo.value.data = res.data
    tableInfo.value.data = res.data.detailList
    AllTableData.value = res.data.detailList
  })
}

watch(() => tableInfo.value.data.map(it => it.value), (rows) => {
  formInfo.value.data.value = rows.reduce((prev, cur) => (prev || 0) + (cur || 0), 0)
  formInfo.value.data.value = formInfo.value.data.value.toFixed(2)
}, {deep: true, immediate: true})

function handleEvent(even, data) {

}

function getTableList() {
  const allData = JSON.parse(JSON.stringify(AllTableData.value))
  if(!tableInfo.value.query.feeItemId) return tableInfo.value.data = allData;
  tableInfo.value.data = allData && allData.filter((it) => it.feeItemId === tableInfo.value.query.feeItemId)
}

function getList() {
  if(!flagSelctPaiod.value) return
  if (!formInfo.value.data.itemAccountingPeriodId) {
    return tableInfo.value.data = []
  }
  indirectModelPramparam({ itemAccountingPeriodId: formInfo.value.data.itemAccountingPeriodId }).then(res => {
    tableInfo.value.data = res.data
    AllTableData.value = res.data
  })
}

// 核算期间
function openPeriodSelector() {
  flagSelctPaiod.value = true;
  tableParameter.title = '核算期间'
  tableParameter.pager = true
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.query = {}
  tableParameter.filters = []
  tableParameter.callBack = accountingPeriodCallback
  openDialog(filterRef.value)
}

function accountingPeriodCallback(raw) {
  formInfo.value.data.itemAccountingPeriodId = raw.id
  formInfo.value.data.itemAccountingPeriodName = raw.name
  tableInfo.value.query.itemAccountingPeriodId = raw.id
  tableInfo.value.query.itemAccountingPeriodName = raw.name
  getList()
}

function openindirectSelector() {
  flagSelctPaiod.value = false;
  tableParameter.title = '核算方法'
  tableParameter.pager = false
  tableParameter.type = 'indirectModel'
  tableParameter.callBack = accounindirectCallback
  openDialog(filterRef.value)
}

function accounindirectCallback(raw) {
  formInfo.value.data.itemParamIndirectModelId = raw.id
  formInfo.value.data.itemParamIndirectModelName = raw.name
}


const save = (err) => {
  if (err) return
  if (tableInfo.value.data.length === 0) return proxy.$message.warning('请填写明细数据')
  const api = props.id ? indirectModelPramupdate : paramindirectModelPramadd
  const data = JSON.parse(JSON.stringify(formInfo.value.data))
  data.detailList = props.id ? hanlddata(tableInfo.value.data) : JSON.parse(JSON.stringify(tableInfo.value.data))
  api(data).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function hanlddata(data) {
  if(AllTableData.value.length === data.length) return data;
  AllTableData.value.forEach((it) => {
    data.forEach((item) => {
      if(it.deptId === item.deptId && it.feeItemId === item.feeItemId) {
        it.value = item.value
      }
    })
  })
  return AllTableData.value
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
  tableParameter.query = {status: 1}
  tableParameter.filters = [
    {type: 'input', label: '编码/名称', value: 'keyword'}
  ]
  tableParameter.callBack = costItemCallback
  openDialog(dialogInfoRef.value, 'table')
}

function costItemCallback(raw) {
  tableInfo.value.query.feeItemId = raw.id
  tableInfo.value.query.feeItemName = raw.name
}

</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @save="save">
    <ModifyForm ref="filterRef" :form-info="formInfo" @handleEvent="handleEvent">
      <template v-slot:form-itemAccountingPeriodName>
        <el-input
            class="not-mongolia"
            type="input"
            :disabled="true"
            placeholder="请选择核算期间"
            v-model="formInfo.data.itemAccountingPeriodName"
        >
          <template #append>
            <el-icon @click="openPeriodSelector">
              <Search/>
            </el-icon>
          </template>
        </el-input>
      </template>
      <template v-slot:form-itemParamIndirectModelName>
        <el-input
            class="not-mongolia"
            type="input"
            :disabled="true"
            placeholder="请选择核算方法"
            v-model="formInfo.data.itemParamIndirectModelName"
        >
          <template #append>
            <el-icon @click="openindirectSelector">
              <Search/>
            </el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable
        ref="dialogInfoRef"
        :table-info="tableInfo"
        :pager="false" is-dynamic
        @handleEvent="tableHandler">

      <template #filter-feeItemName>
        <el-input
            v-model="tableInfo.query.feeItemName"
            class="not-mongolia"
            type="input"
            placeholder="请选择收费项目"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openCostItemSelector">
              <Search/>
            </el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
