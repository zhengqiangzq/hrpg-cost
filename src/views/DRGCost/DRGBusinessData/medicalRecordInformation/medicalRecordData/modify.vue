<script setup>
import {getCurrentInstance, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {addMedicalRecordData, oneMedicalRecordData, updateMedicalRecordData} from "@/api/DRGCostMedicalRecordData";
import {sectiontree} from "@/api/accountingDepartment";
import {allNation} from "@/api/base";
import moment from "moment";

const { proxy } = getCurrentInstance();
const API = {
  one: oneMedicalRecordData,
  add: addMedicalRecordData,
  batchAdd: null,
  update: updateMedicalRecordData
}

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
  { label: '保存并新增', event: saveAndAdd, show: props.batch }
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
  modifyFormRef: null,
  title: '病案信息',
  listType: {
    nation: []
  },
  fieldList: [
    { label: '病案号', value: 'medicalRecordNumber', type: 'input' },
    { label: '住院号', value: 'hospitalAdmissionNumber', type: 'input' },
    { label: '患者姓名', value: 'patientName', type: 'input' },
    { label: '性别', value: 'sex', type: 'select-model', code: 'sex_type' },
    { label: '年龄', value: 'age', type: 'number' },
    { label: '民族', value: 'nationId', type: 'select', list: 'nation' },
    { label: '婚姻状况', value: 'marriageStatus', type: 'select-model', code: 'marriage_status' },
    { label: '主诊医生', value: 'mainDoctorName', type: 'slot' },
    { label: '入院日期', value: 'admissionTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '出院日期', value: 'dischargeTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '入院科室', value: 'admissionDeptName', type: 'slot' },
    { label: '出院科室', value: 'dischargeDeptName', type: 'slot' },
    { label: 'DRG组', value: 'drgDefinitionName', type: 'slot' },
    { label: '主要诊断', value: 'icdTenName', type: 'input' },
    { label: '主要手术操作', value: 'icdNineName', type: 'input' },
    { label: '手术等级', value: 'surgeryLevel', type: 'select-model', code: 'cost_surgery_level' },
  ],
  rules: {
    medicalRecordNumber: [{ required: true, message: '请输入病案号', trigger: 'blur' }],
    hospitalAdmissionNumber: [{ required: true, message: '请输入住院号', trigger: 'blur' }],
    patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
    age: [{ type: 'number', min: 0, message: '请输入正确的年龄', trigger: 'blur' }],
    admissionTime: [
      { required: true, message: '请选择入院日期', trigger: 'change' },
      { validator: (rule, value, callback) => {
          if (moment(value).isAfter(moment(formInfo.value.data.dischargeTime))) {
            callback(new Error('出院日期不能小于入院日期'))
          } else {
            callback()
          }
        }, trigger: 'change' }
    ],
    dischargeTime: [
      { required: true, message: '请选择出院日期', trigger: 'change' },
      { validator: (rule, value, callback) => {
        if (moment(value).isBefore(moment(formInfo.value.data.admissionTime))) {
          callback(new Error('出院日期不能小于入院日期'))
        } else {
          callback()
        }
      }, trigger: 'change' }
    ],
    dischargeDeptName: [{ required: true, message: '请选择出院科室', trigger: 'change' }],
    drgDefinitionName: [{ required: true, message: '请选择DRG组', trigger: 'change' }],
    icdTenName: [{ required: true, message: '请输入主要诊断', trigger: 'blur' }],
  },
  data: {}
})

const tableParameter = reactive({
  title: '',
  type: '',
  pager: true,
  checkBox: false,
  visible: false,
  filters: [],
  fieldList: [],
  callBack: null,
  query: {}
})

// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: true,
  isLeaf: true,
  mark: null,
  api: sectiontree,
  query: {}
})

onMounted(() => {
  loadNationData()
  if (props.id) {
    getMain()
  }
})

function loadNationData() {
  allNation().then(res => {
    if (res.success) {
      formInfo.value.listType.nation = res.data.map(it => { return { key: it.nation, value: it.id } })
    }
  })
}

function getMain() {
  API.one(props.id).then(res => {
    formInfo.value.data = {
      ...res.data,
      age: Number(res.data.age)
    }
  })
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
  const api = props.id ? API.update : props.batch ? API.batchAdd : API.add
  api({
    ...formInfo.value.data,
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        formInfo.value.data = {}
        return
      }
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function openDeptSelector(mark) {
  deptTreeInfo.checkBox = false
  deptTreeInfo.mark = mark
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  if (deptTreeInfo.mark == 'out') {
    formInfo.value.data.dischargeDept = raw.id
    formInfo.value.data.dischargeDeptName = raw.name
  } else {
    formInfo.value.data.admissionDept = raw.id
    formInfo.value.data.admissionDeptName = raw.name
  }
}

function openDRGGroupSelector() {
  tableParameter.title = 'DRG组'
  tableParameter.type = 'DRGGroup'
  tableParameter.query = {}
  tableParameter.visible = true
  tableParameter.callBack = DRGGroupCallback
  formInfo.value.formRef.openDialog(tableParameter, 'table')
}
function DRGGroupCallback(raw) {
  formInfo.value.data.drgDefinitionId = raw.id
  formInfo.value.data.drgDefinitionName = raw.name
}

function openStaffSelector() {
  tableParameter.title = '主诊医生'
  tableParameter.type = 'staff'
  tableParameter.query = {}
  tableParameter.visible = true
  tableParameter.callBack = staffCallback
  formInfo.value.formRef.openDialog(tableParameter, 'table')
}
function staffCallback(raw) {
  formInfo.value.data.mainDoctor = raw.id
  formInfo.value.data.mainDoctorName = raw.name
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo" :listTypeInfo="formInfo.listType">
      <template #form-drgDefinitionName>
        <el-input
            v-model="formInfo.data.drgDefinitionName"
            class="not-mongolia"
            type="input"
            placeholder="请选择DRG组"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openDRGGroupSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-mainDoctorName>
        <el-input
            v-model="formInfo.data.mainDoctorName"
            class="not-mongolia"
            type="input"
            placeholder="请选择主诊医生"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openStaffSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-admissionDeptName>
        <el-input
            v-model="formInfo.data.admissionDeptName"
            class="not-mongolia"
            type="input"
            placeholder="请选择入院科室"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openDeptSelector('')"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-dischargeDeptName>
        <el-input
            v-model="formInfo.data.dischargeDeptName"
            class="not-mongolia"
            type="input"
            placeholder="请选择出院科室"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openDeptSelector('out')"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
  </ModifyPage>
  <!--    查询核算科室-->
  <SelectDeptArchivesTree
      v-if="deptTreeInfo.visible"
      v-model:showDialog="deptTreeInfo.visible"
      :title="deptTreeInfo.title"
      :checkStrictly="deptTreeInfo.checkStrictly"
      :isLeaf="deptTreeInfo.isLeaf"
      :query="deptTreeInfo.query"
      :checkBox="deptTreeInfo.checkBox"
      :api="deptTreeInfo.api"
      accountAttribute="1,2"
      :diseaseAccountStatus="1"
      :sectionAttributeNot="1"
      :highlight-current="true"
      @callback="treeCallback" />
</template>

<style scoped lang="scss">

</style>
