<template>
  <div class="kr-designer">
    <viewport class="kr-designer-view" />
    <div class="kr-designer-tool">
      <el-scrollbar class="kr-designer-tool_con">
        <panel class="control-panel" />
      </el-scrollbar>
      <div class="kr-designer-tool_bar">
        <el-button type="success" @click="saveTemp">保存</el-button>
        <el-button type="primary" @click="previewTemp">预览</el-button>
      </div>
    </div>
    <span v-show="false">{{ designerInit }}</span>
  </div>
</template>

<script setup name="kr-print-designer">
import Viewport from './viewport/index.vue'
import Panel from './panel/index.vue'
import cloneDeep from 'lodash/cloneDeep'
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
  widgetOptions: {
    type: Array,
    default: () => [],
  },
  tempValue: {
    type: Object,
    default: () => ({
      title: 'demo',
      width: 750,
      height: 550,
      pageWidth: 750,
      pageHeight: 550,
      horizontally: 1,
      tempItems: [],
    }),
  },
})

const tempValues = ref({})
const options = ref({})

const designerInit = computed(() => {
  let _tempValue = cloneDeep(props.tempValue)
  if (_tempValue.tempItems && _tempValue.tempItems.length) {
    _tempValue.tempItems.forEach((item) => {
      if (item.type === 'braid-table') {
        if (item.columns && item.columns.length) {
          item.columns.forEach((el) => {
            el.width = el.printWidth || 0
          })
        }
      }
    })
  }
  proxy.$store.dispatch('print/designerInit', {
    tempValue: _tempValue,
    options: cloneDeep(props.widgetOptions),
  })
  return ''
})

// 保存模板
function saveTemp() {
  let page = proxy.$store.state.print.page
  emits('save', cloneDeep(page))
}
// 预览模板
function previewTemp() {
}
</script>

<style lang="scss">
.kr-designer {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  text-align: left;
  display: flex;
  flex-direction: row;
  .kr-designer-view {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .kr-designer-tool {
    width: 400px;
    height: 100%;
    display: flex;
    flex-direction: column;
    .el-scrollbar__wrap {
      overflow: auto;
    }
    &_con {
      flex: 1;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
    &_bar {
      padding: 10px;
      text-align: center;
    }
  }
}

.kr-form {
  .el-form-item--mini.el-form-item {
    margin-bottom: 10px;
  }
  .min-input {
    width: 100px;
  }
  .unit-text {
    font-size: 12px;
    color: #999999;
    margin-left: 5px;
  }
}

.kr-collapse {
  color: #555555;
  width: 400px;

  .el-collapse-item__header {
    box-sizing: border-box;
    padding-left: 10px;
  }

  .el-collapse-item__content {
    box-sizing: border-box;
    padding: 10px;
  }
}
.widgets {
  outline: none;
  font-size: 12px;
  &:hover {
    outline: 1px solid #ddd !important;
  }
  &.active {
    outline: 1px solid #2196f3 !important;
    &:hover {
      outline: 1px solid #2196f3 !important;
    }
  }
}
</style>
