<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="科目详情"
          :needReturn="true"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              :plain="true"
              @click="update"
          >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>科目信息</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information :info="basicInfo"> </basic-information>
          </div>
        </div>
        <div v-if="auxiliaryTableInfo.data.length" class="model-panel">
          <div class="model-panel-title">
            <p>辅助核算信息</p>
          </div>
          <div class="model-panel-body">
            <div class="flex_full_item">
              <page-table
                  :refresh="auxiliaryTableInfo.refresh"
                  :init-curpage="auxiliaryTableInfo.initCurpage"
                  v-model:data="auxiliaryTableInfo.data"
                  :pager="false"
                  :tabIndex="true"
                  :check-box="false"
                  :field-list="auxiliaryTableInfo.fieldList"
                  :handle="auxiliaryTableInfo.handle"
                  :isDynamic="false"
              >
              </page-table>
            </div>
          </div>
        </div>
      </NewFullScreen>
    </div>
  </div>
  <Modify
      v-if="dialogInfo.visible"
      :id="dialogInfo.id"
      v-model:visible="dialogInfo.visible"
      :title="dialogInfo.title"
      :tableRow="dialogInfo.row"
      @callback="initData"
  />
</template>

<script setup>
import Modify from './modify'
import {getCurrentInstance} from "vue";

const { proxy } = getCurrentInstance()
const emits = defineEmits()
const props = defineProps({
  id: {
    type: String,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  row: {
    type: Object,
    default: () => ({})
  }
})

const basicInfo = ref({
  data: {},
  fieldList: [
    { label: '科目表', value: 'accountTableName' },
    { label: '编码规则', value: 'codeRule' },
    { label: '科目编码', value: 'code' },
    { label: '科目名称', value: 'name' },
    { label: '科目全称', value: 'fullName' },
    { label: '科目类型', value: 'accountTypeName' },
    { label: '科目方向', value: 'directionName' },
    { label: '现金分类', value: 'cashCategoryName' },
    { label: '科目属性', value: 'accountAttributeName' },
    { label: '科目控制级次', value: 'controlLevelName' },
    { label: '生效日期', value: 'effectiveDate' },
    { label: '启用状态', value: 'statusName' },
    { label: '科目说明', value: 'remark' },
  ],
})

const dialogInfo = ref({
  title: '编辑',
  id: '',
  visible: false,
  row: {}
})

const auxiliaryTableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    { label: '序号', value: 'index', type: 'index' },
    { label: '辅助核算编码', value: 'auxiliaryCode' },
    { label: '辅助核算名称', value: 'auxiliaryName' },
    { label: '余额方向控制', value: 'balanceControlName' },
    { label: '是否可为空', value: 'canBeNullName' },
    { label: '是否可选非末级', value: 'canSelectNonLastName' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '80',
    btList: []
  }
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(val) {
    emits('update:visible', val)
  },
})

onMounted(() => {
  if (props.id || (props.row && Object.keys(props.row).length)) {
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}

function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.title = '编辑会计科目'
  dialogInfo.value.row = basicInfo.value.data
  dialogInfo.value.visible = true
}

async function initData(flag) {
  if (flag) {
    console.log('从编辑页返回，刷新数据')
  }
  
  if (props.row && Object.keys(props.row).length) {
    basicInfo.value.data = props.row
    auxiliaryTableInfo.data = props.row.auxiliaryList || []
  } else if (props.id) {
    console.log('根据ID获取详情:', props.id)
  }
}
</script>