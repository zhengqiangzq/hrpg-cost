<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="定向分摊设置详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('directionalAllocationSetting:update')
            "
              type="primary"
              class="el-button el-button--medium filter-button"
              @click="update"
          >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>定向分摊设置</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information :info="basicInfo"> </basic-information>
          </div>
        </div>
        <div class="model-panel" v-if="basicInfo.data.directType !== 1">
          <div class="model-panel-title">
            <Tooltip text="定向范围" />
          </div>
          <div class="model-panel-body">
            <div class="flex_full_item">
              <el-form
                  ref="tableForm"
                  :model="tableAreaInfo"
                  style="width: 100%">
                <!-- 表格 -->
                <page-table
                    :refresh="tableAreaInfo.refresh"
                    :init-curpage="tableAreaInfo.initCurpage"
                    v-model:data="tableAreaInfo.data"
                    :pager="false"
                    :summary="false"
                    :tabIndex="true"
                    :check-box="false"
                    :api="tableAreaInfo.api"
                    :query="tableAreaInfo.query"
                    :field-list="tableAreaInfo.fieldList"
                    :handle="tableAreaInfo.handle"
                    :isDynamic="false"
                >
                </page-table>
              </el-form>
            </div>
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title">
            <Tooltip text="承担科室信息" />
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
                    :pager="false"
                    :summary="false"
                    :tabIndex="true"
                    :check-box="false"
                    :api="tableInfo.api"
                    :query="filterInfo.query"
                    :field-list="tableInfo.fieldList"
                    :handle="tableInfo.handle"
                    :isDynamic="false"
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
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {directApportionmentgetById} from "@/api/directionalAllocationSetting";

const { proxy } = getCurrentInstance()

const { tableParameter, openDialog } = useSelectTableData()
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
const basicInfo = ref({
  data: {},
  fieldList: [
    { label: '定向规则编码', value: 'code' },
    { label: '定向规则名称', value: 'name' },
    { label: '会计期间', value: 'periodName' },
    { label: '源科室编码', value: 'sourceDeptCode' },
    { label: '源科室名称', value: 'sourceDeptName' },
    { label: '定向方法', value: 'directTypeName' },
    { label: '备注', value: 'remark' },
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
  },
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  query: {},
  fieldList: [
    { label: '承担科室编码', value: 'targetDeptCode' },
    { label: '承担科室名称', value: 'targetDeptName' },
    { label: '备注', value: 'remark' },
  ],
  btnList: [
  ],
})
const tableAreaInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  query: {},
  fieldList: [],
  btnList: [
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
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.title = '修改定向分摊设置'
  dialogInfo.value.visible = true
}
async function initData() {
  directApportionmentgetById({id:props.id}).then(({ data }) => {
    basicInfo.value.data = data
    tableInfo.value.data = data.deptList
    const fields = {
      '2': [
        { label: '成本分类编码', value: 'rangeCode' },
        { label: '成本分类名称', value: 'rangeName' },
      ],
      '3': [
        { label: '成本项目编码', value: 'rangeCode' },
        { label: '成本项目名称', value: 'rangeName' },
      ]
    }
    tableAreaInfo.value.fieldList = fields[data.directType]
    tableAreaInfo.value.data = data.rangeList || []
  })
}
const dialogInfoRef = ref()
</script>

<style scoped></style>
