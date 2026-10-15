<script setup>
import {getCurrentInstance, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {
    addStandardClinicalPathway, oneDetailsStandardClinicalPathway,
    oneStandardClinicalPathway,
    updateStandardClinicalPathway
} from "@/api/diseaseCost/standardClinicalPathway";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const { proxy } = getCurrentInstance();

const PERMISSION_CODE = 'diseaseCostStandardClinicalPathway'

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
  { label: '保存', event: saveAndAdd, show: false }
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
const formRef = ref()
const formInfo = ref({
    labelWidth: '160px',
    title: '临床路径信息',
    fieldList: [
        { label: '临床路径编码', value: 'wayCode', type: 'input' },
        { label: '临床路径名称', value: 'wayName', type: 'input' },
        { label: '标准住院床日', value: 'standardBedDays', type: 'number', min: 0 },
        { label: '所属病种', value: 'diseaseDefinitionName', type: 'slot' },
    ],
    rules: {
        wayCode: [{ required: true, message: '请输入临床路径编码', trigger: 'blur' }],
        wayName: [{ required: true, message: '请输入临床路径名称', trigger: 'blur' }],
        standardBedDays: [{ required: true, message: '请输入标准住院床日', trigger: 'blur' }],
    },
  data: {}
})

const tableInfo = ref({
  refresh: 1,
  query: {
    id: props.id
  },
  title: '标准收费项目',
  fieldList: [
    { label: '收费项目编码', value: 'chargeItemCode', },
    { label: '收费项目名称', value: 'chargeItemName' },
    { label: '工作量', value: 'workNum' }
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', event: () => addDetail() },
    { type: 'button', label: '删除', event: delDetail },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: addDetail,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: delDetail,
      },
    ]
  },
  sectionRows: []
})
const { tableParameter, openDialog } = useSelectTableData()

onMounted(() => {
  if (props.id) {
    getMain()
  } else {

  }
})


watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = tableInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { deep: true, immediate: true })


function getMain() {
    oneStandardClinicalPathway(props.id).then(res => {
        formInfo.value.data = res.data
    })
    oneDetailsStandardClinicalPathway({ wayId: props.id }).then(res => {
        tableInfo.value.data = res.data
    })
}

const addDetailInfoRef = ref()
// 新增明细
const addDetailInfo = ref({
    refObj: null,
    row: {},
    title: '标准收费项目',
    visible: false,
    fieldList: [
        { label: '收费项目', span: 12, value: 'chargeItemName', type: 'slot' },
        { label: '工作量', span: 12, value: 'workNum', type: 'number', min: 0 },
    ],
    rules: {
      chargeItemName: [{ required: true, message: '请选择收费项目', trigger: 'change' }],
      workNum: [{ required: true, message: '请输入工作量', trigger: 'blur' }],
    },
    btList: [
        { type: 'primary', label: '确认', event: addDetailCallback }
    ]
})

// 打开新增明细
function addDetail(row) {
  addDetailInfo.value.index = tableInfo.value.data.indexOf(row)
  addDetailInfo.value.row = row ? JSON.parse(JSON.stringify(row)) : {}
  addDetailInfo.value.visible = true;
}

async function addDetailCallback() {
    const raw = addDetailInfo.value.row
  let isValid = true
  await addDetailInfo.value.refObj.validate(flag => isValid = flag)
  if (!isValid) return
  if (!raw) return
    if (addDetailInfo.value.index === -1) {
        // 判断重复
      const flag = tableInfo.value.data.filter(it => it.chargeItemId === raw.chargeItemId)[0]
      if(flag) return proxy.$message.warning('存在已选择的收费项目，请修改')
        tableInfo.value.data.push({
            ...raw,
        })
      addDetailInfo.value.visible = false
    } else {
        tableInfo.value.data[addDetailInfo.value.index] = raw
      addDetailInfo.value.visible = false
    }
}

// 删除明细
function delDetail(row) {
    const data = row.id ? [row] : tableInfo.value.sectionRows
    tableInfo.value.data = tableInfo.value.data.filter(it => data.indexOf(it) === -1)
}


function saveAndAdd() {
  pageRef.value.validate().then(res => {
    save(null, false)
  }).catch(err => {
    save(err)
  })
}
const save = (err, close = true) => {
  console.log('保存数据-----', err)
  if (err) return
    if (tableInfo.value.data.length === 0) {
        proxy.$message.warning('请添加标准收费项目')
        return
    }
  const api = props.id ? updateStandardClinicalPathway : addStandardClinicalPathway
      api({...formInfo.value.data,
        details: tableInfo.value.data}).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        props.id = '';
        tableInfo.value.btnList[2].show = false;
        tableInfo.value.btnList[3].show = false;
        tableInfo.value.btnList[4].show = false;
        formInfo.value.data = {}
        tableInfo.value.data = []
        emit('returnModify', false)
        return
      }
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

function openChargeItemSelector() {
    tableParameter.type = 'feeItem'
    tableParameter.query = {
        status: '1',
        accountingStatus: 1
    }
    tableParameter.callBack = chargeItemCallback
    openDialog(addDetailInfoRef.value)
}
function chargeItemCallback(raw) {
    addDetailInfo.value.row.chargeItemId = raw.id
    addDetailInfo.value.row.chargeItemCode = raw.code
    addDetailInfo.value.row.chargeItemName = raw.name
}

function openDiseaseDefinitionSelector() {
    tableParameter.title = '病种'
    tableParameter.type = 'diseaseDefinition'
    tableParameter.query = {}
    tableParameter.visible = true
    tableParameter.callBack = diseaseDefinitionCallback
    openDialog(formRef.value)
}
function diseaseDefinitionCallback(raw) {
    formInfo.value.data.diseaseDefinitionId = raw.id
    formInfo.value.data.diseaseDefinitionName = raw.name
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm ref="formRef" :form-info="formInfo">
        <template #form-diseaseDefinitionName>
            <el-input
                v-model="formInfo.data.diseaseDefinitionName"
                class="not-mongolia"
                type="input"
                placeholder="请选择病种"
                :disabled="true"
            >
                <template #append>
                    <el-icon @click="openDiseaseDefinitionSelector"><Search /></el-icon>
                </template>
            </el-input>
        </template>
    </ModifyForm>
    <ModifyTable @handleEvent="SelectionChange" :pager="false" :checkbox="true" :isDynamic="true" :table-info="tableInfo">
    </ModifyTable>
  </ModifyPage>
    <dialog-form :title="addDetailInfo.title" :btList="addDetailInfo.btList" v-model:visible="addDetailInfo.visible">
        <page-form
            ref="addDetailInfoRef"
            v-model:ref-obj="addDetailInfo.refObj"
            :label-width="addDetailInfo.labelWidth"
            :data="addDetailInfo.row"
            :field-list="addDetailInfo.fieldList"
            :rules="addDetailInfo.rules"
        >
            <template #form-chargeItemName>
                <el-input
                    v-model="addDetailInfo.row.chargeItemName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择收费项目"
                    :disabled="true"
                >
                    <template #append>
                        <el-icon @click="openChargeItemSelector"><Search /></el-icon>
                    </template>
                </el-input>
            </template>
        </page-form>
    </dialog-form>
</template>

<style scoped lang="scss">

</style>
