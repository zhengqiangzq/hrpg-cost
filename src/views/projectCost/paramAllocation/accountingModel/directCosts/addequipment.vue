<template>
  <div class="checkBox">
    <el-dialog
        draggable
        :append-to-body="true"
        :title="title"
        v-model="state.dialogVisible"
        custom-class="page-dialog"
        :close-on-click-modal="false"
        :modal="false"
        @close="cancel"
    >
      <div class="model-panel-body paddingBox order-model-formBox flex_wrap_start_start" v-if="state.dialogVisible">
        <page-form
            ref="pageFormRef"
            v-model:ref-obj="formRef"
            :data="state.data"
            :field-list="state.fieldList"
            :rules="state.rules"
            :label-width="state.labelWidth">
          <template #form-assetsItemName>
            <el-input
                v-model="state.data.assetsItemName"
                class="not-mongolia"
                type="input"
                placeholder="请选择资产卡片"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="opentechnology"><Search /></el-icon>
              </template>
            </el-input>
          </template>
        </page-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="userUpdate">{{
              $t('btn_confirm')
            }}</el-button>
          <el-button @click="cancel">{{ $t('btn_cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {ref, watch, getCurrentInstance} from "vue";
import {
  paramdirectModeladdAssets,
  paramdirectModelupdateAssets,
} from "@/api/accountingModel";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  colTemplate: 1,
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

const pageFormRef = ref()
const formRef = ref()

const { tableParameter, openDialog } = useSelectTableData()
const state = reactive({
  dialogVisible: false,
  labelWidth: '120px',
  fieldList: [
    {label: '资产卡片', span: 12, value: 'assetsItemName', type: 'slot'},
    {label: '设备耗时', span: 12, value: 'duration', type: 'money' },
  ],
  data: {},
  rules: {
    assetsItemName: [{ required: true, message: '请选择资产卡片', trigger: 'blur'}],
    duration: [{ required: true, message: '请输入设备耗时', trigger: 'blur'}],
  },
})

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
    () => props.tableRow,
    (val) => {
      state.data = Object.assign(state.data, val)
    },
    {
      immediate: true,
    }
)

function cancel() {
  state.dialogVisible = false
  state.data = {}
  emit('callback', false)
}
function userUpdate() {
  const id = props.tableRow.id
  //新增or编辑用户
  const api = id ? paramdirectModelupdateAssets : paramdirectModeladdAssets
  formRef.value.validate((valid) => {
    if (valid) {
      const laborList = state.data.id ? '' : lador(state.data)
      const fromData = state.data.id ? {...state.data} :{
        executeDeptId: state.data.executeDeptId,
        feeItemId: state.data.feeItemId,
        itemParamDirectModelId: state.data.itemParamDirectModelId,
        assetsList: laborList,
      }
          api(fromData).then(({ code, data }) => {
        if (code === 200) {
          state.dialogVisible = false
          emit('callback', data)
        }
      })
    }
  })
}

function lador(row) {
  const data = []
  row.assetsItemId.forEach((it) => {
    data.push({
      assetsItemId: it,
      duration: row.duration,
    })
  })
  return data;
}

function opentechnology() {
  tableParameter.checkBox = !state.data.id
  tableParameter.title = '资产卡片'
  tableParameter.visible = true
  tableParameter.type = 'assets'
  tableParameter.filters = [
    { type: 'input', label: '编码', value: 'code' },
    { type: 'input', label: '名称', value: 'name' }
  ]
  tableParameter.query = { deptId: state.data.deptId }
  tableParameter.callBack = feeItemCallback
  openDialog(pageFormRef.value, 'table')
}
function feeItemCallback(raw) {
  if(!raw) return
  if(typeof raw === 'object' && !raw.length) {
    state.data.assetsItemId = raw.id
    state.data.assetsItemCode = raw.code
    state.data.assetsItemName = raw.name
  } else {
    state.data.assetsItemId = raw.map((it) => it.id)
    state.data.assetsItemName = raw.map((it) => it.name)
  }
}

</script>
