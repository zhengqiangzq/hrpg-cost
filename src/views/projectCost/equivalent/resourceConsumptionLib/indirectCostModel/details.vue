<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="间接成本模型"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('resourceConsumptionLibIndirectCostModel:update') &&
              basicInfo.data.status === '0'
            "
              type="primary"
              class="el-button el-button--medium filter-button"
              @click="update"
          >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>基础信息</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information :info="basicInfo"> </basic-information>
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
                    :pager="false"
                    :api="tableInfo.api"
                    :summary="false"
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
import {useStorage} from "@vueuse/core";
import {
  itemActivityDriverConfigId,
} from "@/api/indirectCostModel";
import {lastLeafCostCategory} from "@/api/costCategory";
import {itemdeptWorkRelation} from "@/api/relation";
import {oneResourceConsumptionLibIndirectCostModel} from "@/api/projectCost/resourceConsumptionLibIndirectCostModel";
import {lastLeafCostItem} from "@/api/costItem";
import {allProfileConfigKeyFactors} from "@/api/projectCost/profileConfigKeyFactors";
const { proxy } = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)

const TABLE_FILED = {
  '1': [],
  '2': [
    { label: '成本分类编码', value: 'costCategoryCode' },
    { label: '成本分类名称', value: 'costCategoryName' },
  ],
  '3': [
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
  ]
}
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
    { label: '核算科室', value: 'deptName' },
    { label: '分摊方法', value: 'apportionmentMethodName' },
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
    valueId: props.id,
    orgId: setting.value.hospitalId,
  },
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [],
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
  dialogInfo.value.title = '修改间接成本模型'
  dialogInfo.value.visible = true
}
async function initData() {
  oneResourceConsumptionLibIndirectCostModel({id: props.id}).then(({data}) => {
    basicInfo.value.data = data
    tableInfo.value.data = data.detailVOList
    changeMethod(basicInfo.value.data.apportionmentMethod,true)
  })
}

async function changeMethod(way,flag) {
  if (basicInfo.value.isDetailInited) {
    delete basicInfo.value.isDetailInited
    return
  }
  if (way == 1 && !flag) {
    tableInfo.value.data = [{ modelId: props.id }]
  } else if (way == 2 && !flag) {
    await lastLeafCostCategory({ enable: 1 }).then(res => {
      tableInfo.value.data = res.data.map(row => {
        return {
          modelId: props.id,
          costCategoryId: row.id,
          costCategoryCode: row.code,
          costCategoryName: row.name
        }
      })
    })
  } else if (way == 3 && !flag) {
    await lastLeafCostItem({ enable: 1 }).then(res => {
      tableInfo.value.data = res.data.map(row => {
        return {
          modelId: props.id,
          costItemId: row.id,
          costItemCode: row.code,
          costItemName: row.name
        }
      })
    })
  }
  way = way || '1'
  tableInfo.value.fieldList = [
    ...TABLE_FILED[way],
    { label: '关键因素编码', value: 'keyFactorSettingCode' },
    { label: '关键因素名称', value: 'keyFactorSettingName' },
    { label: '备注', value: 'remark' },
  ]
}
</script>

<style scoped></style>
