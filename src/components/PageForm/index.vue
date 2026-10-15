<template>
  <el-form
    ref="form"
    :class="className"
    :model="data"
    class="padding pageForm"
    :rules="rules"
    :disabled="disabled"
    :label-width="labelWidth"
    :validate-on-rule-change="false"
    inline
  >
    <el-row style="width: 100%">
      <el-col
        :span="imageField && Object.keys(imageField).length ? 18 : 24"
        class="flex_wrap_start_start"
      >
        <el-row style="width: 100%">
            <el-col
                :span="item.span ?? spanNum.span"
                :xl="item.xl ?? item.span ?? spanNum.xl"
                :lg="item.lg ?? item.span ??  spanNum.lg"
                :md="item.md ?? item.span ?? spanNum.md"
                :sm="item.sm ?? item.span ?? spanNum.sm"
                v-for="(item, index) in getConfigList()"
                :key="item.value">
        <el-form-item
          :prop="item.value"
          :label="item.labelTip ? '' : item.label ? item.label + '：' : item.label"
          :error="item.error"
          :label-width="item.labelWidth"
          :class="item.className || { 'input-money': item.type === 'money' }"
        >
          <span v-if="item.type === 'text'">{{ item.formatter ? item.formatter(data) : data[item.value] }}</span>
          <!--label气泡-->
          <template v-if="item.labelTip" #label>
            <el-tooltip
              v-if="
                diffData[item.diffValue || item.value] ||
                diffData[item.diffValue || item.value] === 0 ||
                diffData[item.diffValue || item.value] === ''
              "
              placement="top"
              effect="light"
              :content="'改动前：' + diffData[item.diffValue || item.value]"
            >
              <span :style="{ color: '#ec808d' }">
                <el-icon><View /></el-icon>{{ item.label + '' }}</span
              >
            </el-tooltip>
            <span v-else>{{ item.label + '' }}</span>
            <el-tooltip placement="top" effect="light">
              <template #content>
                <span v-html="item.labelTip"></span>
              </template>
              <el-icon><QuestionFilled /></el-icon> </el-tooltip
            >：
          </template>
          <!-- 审核时标记颜色且鼠标经过需要看到更改之前的值，涉及页面：平台对接 -->
          <template
            v-else-if="
              diffData[item.diffValue || item.value] ||
              diffData[item.diffValue || item.value] === 0 ||
              diffData[item.diffValue || item.value] === ''
            "
            #label
          >
            <el-tooltip
              placement="top"
              effect="light"
              :content="'改动前：' + diffData[item.diffValue || item.value]"
            >
              <span :style="{ color: '#ec808d' }">
                <el-icon><View /></el-icon>{{ item.label + '：' }}</span
              >
            </el-tooltip>
          </template>
          <!-- solt -->
          <template v-if="item.type === 'slot' && !disabled">
            <slot :name="'form-' + item.value" />
          </template>
          <span v-if="disabled" class="printTxt">
            <template v-if="item.type === 'select-model'">
              {{ item.customOptions ?
                item.customOptions.find(it => it.code === data[item.value])?.name
                :
                dicts[item.code]?.find(it => it.code === data[item.value])?.name
              }}
            </template>
            <template v-else>{{ data[item.value] }}</template>
          </span>
          <!-- 普通输入框 -->
          <el-input
            v-if="
              (item.type === 'input' || item.type === 'password') && !disabled
            "
            v-model="data[item.value]"
            :type="item.type"
            :minlength="item.minlength || 0"
            :maxlength="item.maxlength || 50"
            :class="item.className"
            :disabled="item.disabled || false"
            :placeholder="item.placeholder || getPlaceholder(item)"
            @focus="handleEvent(item.event)"
            @blur="item.trim && (data[item.value] = $event.target.value.trim())"
            @input="(e) => (data[item.value] = validSe(e))"
          />
          <!-- 文本输入框 -->
          <el-input
            v-if="item.type === 'textarea' && !disabled && !item.isSpecialInput"
            v-model.trim="data[item.value]"
            :type="item.type"
            :disabled="item.disabled"
            :maxlength="item.maxlength || 200"
            :placeholder="getPlaceholder(item)"
            :autosize="item.autosize || { minRows: 2, maxRows: 3 }"
            @focus="handleEvent(item.event)"
            @input="(e) => (data[item.value] = validSe(e))"
          />
          <el-input
            v-if="item.type === 'textarea' && !disabled && item.isSpecialInput"
            v-model.trim="data[item.value]"
            :type="item.type"
            :disabled="item.disabled"
            :maxlength="item.maxlength || 200"
            :placeholder="getPlaceholder(item)"
            :autosize="item.autosize || { minRows: 2, maxRows: 10 }"
            @focus="handleEvent(item.event)"
          />
          <!-- 计数器 -->
          <el-input
            v-if="item.type === 'input_number' && !disabled"
            v-model.number.trim="data[item.value]"
            v-enterNumber
            type="number"
            :placeholder="getPlaceholder(item)"
            :disabled="item.disabled"
            :precision="item.precision ? item.precision : 0"
            :min="item.min ?? -99999999"
            :step="1"
            :max="item.max ?? 99999999"
            @input="(e) => (data[item.value] = validSe(e))"
          />
          <el-input-number
            v-if="item.type === 'number' && !disabled"
            v-model.number="data[item.value]"
            controls-position="right"
            style="width: 100%"
            :placeholder="getPlaceholder(item)"
            :disabled="item.disabled"
            :precision="item.precision ? Number(item.precision) : 0"
            :min="item.min ?? 0"
            :max="item.max ?? 99999999"
            @change="handleEvent(item.event, data[item.value])"
            @input.native="changeValidate($event, item.value)"
          />
          <!--金额-->
          <el-input-number
            v-if="item.type === 'money' && !disabled"
            v-model.number.trim="data[item.value]"
            controls-position="right"
            :precision="item.precision ? item.precision : 2"
            :min="item.min ? item.min : 0"
            :step="1"
            :disabled="item.disabled"
            :placeholder="getPlaceholder(item)"
            :max="item.max || 9999999999"
          >
            <template #append v-if="item.unit">
              <span>{{ item.unit }}</span>
            </template>
          </el-input-number>
          <!-- 选择框 -->
          <el-select
            v-if="item.type === 'select' && !disabled"
            :key="item.value"
            v-model="data[item.value]"
            :disabled="item.disabled"
            :clearable="item.clearable"
            filterable
            @visible-change="visibleChange($event, item.list)"
            :multiple="item.multiple"
            collapse-tags-tooltip
            :collapse-tags="item.collapseTags"
            :placeholder="getPlaceholder(item)"
            :filterMethod="filterMethod"
            @change="handleEvent(item, data[item.value])"
          >
            <el-option
              v-for="(childItem, childIndex) in listTypeOptionsInfo[item.list]"
              :key="childItem.key"
              :label="
                childItem.key?.length > (item.selectLen ? item.selectLen : 15)
                  ? childItem.key.substring(
                      0,
                      item.selectLen ? item.selectLen : 15
                    ) + '...'
                  : childItem.key
              "
              :value="childItem.value"
            />
          </el-select>
          <!--字典选择框-->
          <select-model
            v-if="item.type === 'select-model' && !disabled"
            :key="index + item.value"
            v-model:modelValue="data[item.value]"
            :type-code="item.code"
            :check-default="item.checkDefault"
            :disabled="item.disabled"
            :clearable="item.clearable"
            :multiple="item.multiple"
            :custom-options="item.customOptions"
            :only-show-option="item.onlyShowOption"
            :option-disabled="item.optionDisabled"
            :placeholder="getPlaceholder(item)"
            @change="handleEvent(item, data[item.value])"
          />

          <!-- 日期选择框 -->
          <el-date-picker
            v-if="item.type === 'date' && !disabled"
            v-model="data[item.value]"
            :type="item.dateType"
            :value-format="item.valueFormat || 'YYYY-MM-DD'"
            :disabled-date="
              item.TimePickerOptions && item.TimePickerOptions.disabledDate
            "
            :clearable="item.clearable"
            :disabled="item.disabled"
            :placeholder="getPlaceholder(item)"
            @focus="handleEvent(item.event)"
          />
        </el-form-item>
            </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-form>
  <SelectTableData
      v-if="tableInfo.visible"
      v-model:showDialog="tableInfo.visible"
      :query="tableInfo.query"
      :api="tableInfo.api"
      :pager="tableInfo.pager"
      :title="tableInfo.title"
      :modelType="tableInfo.type"
      :check-box="tableInfo.checkBox"
      :fieldList="tableInfo.fieldList"
      :checkedList="tableInfo.checkedList"
      :filterInfoList="tableInfo.filters"
      :no-search="tableInfo.noSearch"
      highlight-row
      @callback="tableCallback"
  ></SelectTableData>
  <!--  公用tree弹框-->
  <SelectTreeData
      v-if="treeInfo.visible"
      v-model:showDialog="treeInfo.visible"
      :title="treeInfo.title"
      :checkStrictly="treeInfo.checkStrictly"
      :isLeaf="treeInfo.isLeaf"
      :query="treeInfo.query"
      :str="treeInfo.str"
      :checkBox="treeInfo.checkBox"
      :saveEmpty="treeInfo.saveEmpty"
      :defaultProps="treeInfo.defaultProps"
      :checkedList="treeInfo.checkedList"
      :api="treeInfo.api"
      :highlight-current="true"
      @callback="treeCallback"
  />
  <SelectTreeTableData
      v-if="periodInfo.visible"
      v-model:showDialog="periodInfo.visible"
      @callback="periodCallback"
  ></SelectTreeTableData>
</template>

<script setup name="PageForm">
import SelectModel from '@/components/SelectModel'
import pinyin from 'js-pinyin'
import {computed, onBeforeUnmount} from "vue";
const { proxy } = getCurrentInstance()

const store = useStore()

const props = defineProps({
  // 自定义类名
  className: {
    type: String,
    default: '',
  },
  imageField: {
    type: Object,
    default: function () {
      return {}
    },
  },
  // 表单数据
  data: {
    type: Object,
    default: function () {
      return {}
    },
  },
  // 相关字段
  fieldList: {
    type: Array,
    default: function () {
      return []
    },
  },
  // 验证规则
  rules: {
    type: Object,
    default: function () {
      return {}
    },
  },
  // 相关的列表
  listTypeInfo: {
    type: Object,
    default: function () {
      return {}
    },
  },
  // label宽度
  labelWidth: {
    type: String,
    default: '120px',
  },
  refObj: {
    type: Object,
    default: function () {
      return {}
    },
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  diffData: {
    //差异数据
    type: Object,
    default: function () {
      return {}
    },
  },
})
const emit = defineEmits([
  'update',
  'handleEvent',
  'handleClick',
  'update:refObj',
])
const list = ref('')
const listTypeOptionsInfo = ref({})
const copyListTypeInfo = ref({})
const formElWidth = ref(1920)
const tableInfo = ref({})
const treeInfo = ref({})
const periodInfo = ref({})

const dicts = computed(() => store.state.permission.dict)

watch(
  () => props.data,
  () => {
    emit('update:refObj', proxy.$refs.form)
    proxy.$refs.form?.clearValidate()
  },
  {
    deep: true,
  }
)
watch(
  () => props.listTypeInfo,
  (val) => {
    listTypeOptionsInfo.value = proxy.$fn.deepClone(val)
    copyListTypeInfo.value = proxy.$fn.deepClone(val)
  },
  {
    immediate: true,
    deep: true,
  }
)

const spanNum = computed(() => {
  if (formElWidth.value >= 900) {
    return {
      span: 8,
      xl: 6,
      lg: 8,
      md: 12,
      sm: 12
    }
  } else if (formElWidth.value >= 850) {
    return {
      span: 8,
      xl: 8,
      lg: 8,
      md: 12,
      sm: 12
    }
  }
  return {
    span: 8,
    xl: 8,
    lg: 12,
    md: 24,
    sm: 24
  }
})
let resizer = null
onBeforeUnmount(() => {
  if (resizer != null) {
    resizer.unobserve(proxy.$refs.form.$el)
    resizer = null
  }
})
onMounted(() => {
  emit('update:refObj', proxy.$refs.form)
})
function changeValidate(value, str) {
  proxy.$nextTick(() => {
    props.refObj.clearValidate(str)
  })
}
function visibleChange(val, _list) {
  //下拉框出现/隐藏时触发
  list.value = _list
  if (!val) {
    listTypeOptionsInfo.value[_list] = copyListTypeInfo.value[_list]
  }
}
function filterMethod(value) {
  // //	自定义搜索方法
  if (value && list.value) {
    let result = []
    copyListTypeInfo.value[list.value].forEach((item) => {
      pinyin.setOptions({ checkPolyphone: false, charCase: 1 })
      const resultEng = pinyin.getCamelChars(item.key).toUpperCase()
      const matchResult =
        item.key.indexOf(value) !== -1 ||
        resultEng.indexOf(value.toUpperCase()) !== -1
      // let matchResult = PinYinMatch.match(item.key, value)
      if (matchResult) {
        result.push(item)
      }
    })
    listTypeOptionsInfo.value[list.value] = result
  } else {
    listTypeOptionsInfo.value[list.value] = copyListTypeInfo.value[list.value]
  }
}

const upDateUpload = (fileList) => {
  props.data[props.imageField.value] = fileList
}
// 获取字段列表
const getConfigList = () => {
  let fieldList = []
  props.fieldList.forEach(
      (item) => {
        if(!item.hasOwnProperty('show') || (item.hasOwnProperty('show') && item.show)) {
          item.type = item.label === '备注' ? 'textarea' : item.type;
          item.span = item.type === 'textarea' ? 24 : item.span || 6;
          fieldList.push(item)
        }
      }

  )
  if (!props.disabled) {
    return fieldList.filter((item) => !item.showDetail)
  } else {
    fieldList.forEach(
      (item) => (item.value = item.detailValue ? item.detailValue : item.value)
    )
  }
  setTimeout(() => {
    proxy.$store.dispatch('app/togglePageTable')
  }, 0)

  return fieldList
}
// 得到placeholder的显示
const getPlaceholder = (row) => {
  if (row.disabled || row.placeholder === false) {
    return ''
  }
  let placeholder
  if (
    row.type === 'input' ||
    row.type === 'textarea' ||
    row.type === 'number'
  ) {
    placeholder = '请输入' + row.label
  } else if (
    row.type === 'select' ||
    row.type === 'time' ||
    row.type === 'date' ||
    row.type === 'select-model'
  ) {
    placeholder = '请选择' + row.label
  } else {
    placeholder = row.label
  }
  return placeholder
}
// table确定弹框
function tableCallback(data) {
  tableInfo.value.callBack(data)
}
// table确定弹框
function treeCallback(data) {
  treeInfo.value.callBack(data)
}
// 期间确定弹框
function periodCallback(data) {
  periodInfo.value.callBack(data)
}
// 打开弹框
function openDialog(data, type) {
  if (type === 'tree') {
    treeInfo.value = data
  } else {
    if(data.type === 'accountingPeriod') {
      tableInfo.value = [];
      periodInfo.value = data;
    } else {
      periodInfo.value = [];
      tableInfo.value = data;
    }
  }
}
// 绑定的相关事件
const handleEvent = (event, data) => {
  emit('handleEvent', event, data)
}
// 派发按钮点击事件
const handleClick = (event, data) => {
  emit('handleClick', event, data)
}

function validate(callback) {
  proxy.$refs.form?.validate(callback)
}


defineExpose({ openDialog, validate })
</script>

<style lang="scss" scoped>
.printTxt {
  margin-left: -12px;
}
.el-input-number, .el-input-number--small {
  width: 100%;
}
:deep(.textareaInput) {
  width: 65% !important;
}
.padding {
  padding: 0 !important;
}
//:deep(.el-form-item:not(.not-br).w-full) {
//    width: calc(90% + 20px) !important;
//}
</style>
