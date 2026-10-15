<script setup>
import {computed, inject, onMounted, onUnmounted, ref} from "vue";

const on = inject('on')
const off = inject('off')

const emits = defineEmits(['handleEvent'])

const props = defineProps({
  tableInfo: {
    type: Object,
    required: true
  },
  pager: {
    type: Boolean,
    default: false
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  isDynamic: {
    type: Boolean,
    default: false
  },
  checkbox: {
    type: Boolean,
    default: true
  }
})

const tableForm = ref()
const tableRef = ref()

const queryComputed = computed(() => {
  return props.tableInfo.copyQuery || props.tableInfo.query
})

const validate = () => {
  return new Promise((resolve, reject) => {
    tableForm.value.validate((valid, data) => {
      if (!valid) {
        reject(data)
      }
      resolve(true)
    })
  })
}

function handleEvent(...args) {
  emits('handleEvent', ...args)
}

const openDialog = (...args) => {
  tableRef.value.openDialog(...args)
}

onMounted(() => {
  on('validate', validate)
  props.tableInfo.tableRef = tableRef.value
})
onUnmounted(() => off('validate', validate))

defineExpose({
  openDialog
})
</script>

<template>
  <div class="model-panel">
    <div class="model-panel-title">
      <p>{{ tableInfo.title ?? '明细信息' }}</p>
    </div>
    <div class="model-panel-body">
      <!-- 条件栏 -->
      <PageFilter
          :isAddFlag="true"
          v-model:query="tableInfo.query"
          :filter-list="tableInfo.btnList"
      >
        <template
            v-for="(slotKey, index) in Object.keys($slots).filter(key => /^filter-.+/.test(key))"
            #[slotKey]="scope"
            :key="index">
          <slot :name="slotKey" v-bind="scope" />
        </template>
      </PageFilter>
      <div class="flex_full_item">
        <el-form
            ref="tableForm"
            :model="tableInfo"
            style="width: 100%">
          <!-- 表格 -->
          <page-table
              ref="tableRef"
              :refresh="tableInfo.refresh || Math.random()"
              :init-curpage="tableInfo.initCurpage ?? 1"
              v-model:data="tableInfo.data"
              :pager="pager"
              :rowKey="rowKey"
              :api="tableInfo.api"
              :highlight-row="tableInfo.highlightRow"
              :summary="!!tableInfo.summaryFieldList?.length"
              :summaryFieldList="tableInfo.summaryFieldList"
              :tabIndex="true"
              :check-box="checkbox"
              :query="queryComputed"
              :field-list="tableInfo.fieldList"
              :isDynamic="isDynamic"
              :handle="tableInfo.handle"
              @handleEvent="handleEvent"
          >
            <template
                v-for="(slotKey, index) in Object.keys($slots).filter(key => /^col-.+/.test(key))"
                #[slotKey]="scope"
                :key="index">
              <slot :name="slotKey" v-bind="scope" />
            </template>
          </page-table>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
