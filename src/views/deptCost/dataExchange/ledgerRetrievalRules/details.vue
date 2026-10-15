<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="总账取数规则详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('ledgerRetrievalRules:update')
            "
              type="primary"
              class="el-button el-button--medium filter-button"
              @click="update"
          >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>总账取数规则</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information :info="formInfo"> </basic-information>
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title">
            <Tooltip text="明细信息" />
          </div>
          <div class="model-panel-body">
            <div class="flex_full_item">
              <el-form
                  ref="tableForm"
                  :model="tableInfo"
                  style="width: 100%">
                <!-- 表格 -->
                <page-table
                    :refresh="tableInfo.refresh"
                    :init-curpage="tableInfo.initCurpage"
                    v-model:data="tableInfo.data"
                    :pager="true"
                    :api="tableInfo.api"
                    :summary="false"
                    :summaryFieldList="tableInfo.summaryFieldList"
                    :tabIndex="true"
                    :check-box="false"
                    :query="filterInfo.query"
                    :field-list="tableInfo.fieldList"
                    :handle="tableInfo.handle"
                    :isDynamic="true"
                >
                </page-table>
              </el-form>
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
      :type="dialogInfo.type"
      @returnModify="initData"
  />
</template>

<script setup>
import Modify from './modify'
import {getCurrentInstance} from "vue";
import {finAccessRuledetail, finAccessRuledetailpage} from "@/api/ledgerRetrievalRules";

const { proxy } = getCurrentInstance()

const emits = defineEmits()
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
  },
  visible: false,
  flowFormType: '',
})
const formInfo = ref({
  data: {},
  fieldList: [
    { label: '规则编码', value: 'code' },
    { label: '规则名称', value: 'name' },
    { label: '发生方向', value: 'directValue' },
    { label: '取数公式', value: 'formulaValue' },
  ],
})
// 弹窗相关
const dialogInfo = ref({
  title: '',
  id: '',
  visible: false,
  type: '',
})

const filterInfo = ref({
  query: {
    ruleId: props.id
  },
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    { label: '科目编码', value: 'accountCode', },
    { label: '科目名称', value: 'accountName' },
    { label: '辅助核算', value: 'accassItemValue' },
    { label: '有无部门辅助', value: 'isHaveDeptName' },
    { label: '部门', value: 'deptName' },
  ],
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(val) {
    // 更新父组件visible
    emits('update:visible', val)
  },
})

onMounted(() => {
  if (props.id) {
    tableInfo.value.api = finAccessRuledetailpage
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.value.id = formInfo.value.data.id
  dialogInfo.value.title = '修改总账取数规则'
  dialogInfo.value.visible = true
}
async function initData() {
  finAccessRuledetail(props.id).then(res => {
    formInfo.value.data = res.data
    getDetail()
  })
}
function getDetail() {
  console.log('筛选页面')
  tableInfo.value.refresh = Math.random()
}
</script>

<style scoped></style>
