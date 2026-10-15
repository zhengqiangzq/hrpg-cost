<template>
  <div class="checkBox">
    <el-dialog
        draggable
        :append-to-body="true"
        :title="titleName"
        v-model="state.dialogVisible"
        custom-class="page-dialog"
        :close-on-click-modal="false"
        :modal="false"
        @close="cancel"
    >
      <div class="model-panel-body paddingBox order-model-formBox">
      <page-form
          ref="from"
          v-model:ref-obj="state.ref"
          :data="state.formData"
          :field-list="state.fieldList"
          :rules="state.rules"
          :label-width="state.labelWidth"
      >
        <template v-slot:form-parentCode>
          <el-input
              class="not-mongolia"
              type="input"
              :disabled="true"
              placeholder="请选择上级科室"
              v-model="state.formData.parentCode"
          >
            <template #append>
              <el-icon @click="openCategoryList"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template v-slot:form-shareLevelName>
          <el-input
              class="not-mongolia"
              type="input"
              :disabled="true"
              placeholder="请选择分摊级次"
              v-model="state.formData.shareLevelName"
          >
            <template #append>
              <el-icon @click="openshareLevel"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="saveAdd()">
             保存新增
            </el-button>
          <el-button type="primary" @click="userUpdate('ruleForm')">{{
              $t('btn_confirm')
            }}</el-button>
          <el-button @click="cancel">{{ $t('btn_cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
    <!--      科室 tree-->
    <SelectDeptArchivesTree
        v-if="selecttreeinfo.visible"
        v-model:showDialog="selecttreeinfo.visible"
        :title="selecttreeinfo.title"
        :checkStrictly="selecttreeinfo.checkStrictly"
        :isLeaf="selecttreeinfo.isLeaf"
        :query="selecttreeinfo.query"
        :checkBox="selecttreeinfo.checkBox"
        :api="selecttreeinfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>
<script setup name="vehicleAddEdit">

import PageForm from "@/components/PageForm/index.vue";
import {useStorage} from "@vueuse/core";
import {sectionadd, sectionupdate} from "@/api/accountingDepartment";

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  tableRow: {
    type: Object,
    default: {},
  },
  visible: {
    type: Boolean,
    default: false,
  },
})
const { proxy } = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)
const state = reactive({
  ref: null,
  dialogVisible: false,
  formData: {
    status: "1",
  },
  fieldList: [
    { label: "科室编码", span: 12, value: "code", type: "input", disabled: false, required: true },
    { label: "科室名称", span: 12, value: "name", type: "input", required: true },
    { label: "上级科室编码", span: 12, value: "parentCode", type: "slot" },
    { label: "上级科室名称", span: 12, value: "parentName", type: "input", disabled: true },
    { label: '核算属性', span: 12, type: 'select-model', value: 'accountAttribute', code: 'dept_type' },
    { label: '科室属性', span: 12, type: 'select-model', clearable: true, required: false, value: 'sectionAttribute', code: 'cost_dept_attribute' },
    { label: "分摊级次", span: 12, value: "shareLevelName", type: "slot" },
    { label: '是否向下分摊', span: 12, type: 'select-model', value: 'shareStatus', disabled: true, code: 'yes_or_no' },
    { label: '是否参与分摊', span: 12, type: 'select-model', value: 'deptShareStatus', code: 'yes_or_no' },
    { label: '是否项目核算', span: 12, type: 'select-model', value: 'itemAccountStatus', code: 'yes_or_no' },
    { label: '是否病种核算', span: 12, type: 'select-model', value: 'diseaseAccountStatus', code: 'yes_or_no' },
    { label: "启用状态", span: 12, value: "status", code: "enabled_type", type: 'select-model', disabled: true },
    { label: "备注", value: "remark", type: "textarea" },
  ],
  rules: {
    code: [{ required: true, message: '请填写科室编码' }],
    name: [{ required: true, message: '请选择科室名称' }],
    deptShareStatus: [{ required: true, message: '是否科室分摊计算' }],
  },
})

const from = ref()
const titleName = ref('')
const emit = defineEmits()

watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
    },
    {
      immediate: true,
    }
)
watch(
    () => props.title,
    (val) => {
      titleName.value = val
    },
    {
      immediate: true,
    }
)
watch(
    () => props.tableRow,
    (val) => {
      state.formData = Object.assign(state.formData, val)
      state.fieldList[0].disabled = !!val?.id
    },
    {
      immediate: true,
    }
)
watch(
    () => state.formData.shareLevelName,
    (val) => {
      state.formData.shareStatus = val ? '1' : '0'
    },
    {
      deep: true,
    }
)
const selecttreeinfo = ref({
  title: '上级科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})

function openCategoryList() {
  selecttreeinfo.value.visible = true
}

function treeCallback(data) {
  state.formData.parentName = data.name;
  state.formData.parentId = data.id;
  state.formData.parentCode = data.code;
  selecttreeinfo.value.visible = false
}

const Levelinfo = ref({
  title: '分摊级次',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  type: 'Level',
  pager: false,
  callBack: callBackName,
  query: {}
})
const formRef = ref()

function openshareLevel() {
  Levelinfo.value.visible = true
  from.value.openDialog(Levelinfo.value, 'table')
}
function callBackName(data) {
  state.formData.shareLevelName = data.name;
  state.formData.shareLevelId = data.id;
  Levelinfo.value.visible = false
}

function cancel() {
  state.dialogVisible = false
  state.formData = {}
  emit('callback', false)
}

async function saveAdd() {
  const api = props.id ? sectionupdate : sectionadd
  if(state.formData.code === state.formData.parentCode) {
    return proxy.$message.warning('科室编码不能与上级科室编码相同，请重新填写')
  }
  state.ref.validate((valid) => {
    if (valid) {
      if(state.formData.accountAttribute === '1') {
        if(!state.formData.sectionAttribute) return proxy.$message.warning('核算属性为临床服务类，科室属性必填')
      }
      if(state.formData.shareStatus === '1') {
        if(!state.formData.shareLevelName) return proxy.$message.warning('请选择分摊级次')
      }
      const fromData = {
        ...state.formData,
        orgId: setting.value.hospitalId,
      }
      api(fromData).then((resp) => {
        if (resp.code === 200) {
          proxy.$message.success('保存成功')
          state.formData.id = '';
          state.formData.code = '';
          state.formData.name = '';
          state.formData.remark = '';
          titleName.value = '新增成本项目'
          state.fieldList[0].disabled = false
          emit('callback', true)
        }
      })
    } else {
      return false
    }
  })
}

function userUpdate(formName) {
  //新增or编辑用户
  const api = props.id ? sectionupdate : sectionadd
  if(state.formData.code === state.formData.parentCode) {
    return proxy.$message.warning('科室编码不能与上级科室编码相同，请重新填写')
  }
  state.ref.validate((valid) => {
    if (valid) {
      api(state.formData).then((resp) => {
        if (resp.code === 200) {
          proxy.$message.success('保存成功')
          state.dialogVisible = false
          emit('callback', true)
          emit('callback', false)
        }
      })
    } else {
      return false
    }
  })
}
</script>

