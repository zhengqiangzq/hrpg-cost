<template>
  <div class="page-filter newFilter" :class="className">
    <div
      v-for="(item, index) in showFilterList"
      :key="index"
      class="filter-item"
      :class="item.type !== 'button' && !isAddFlag ? 'filter-search-item' : item.classBtnName"
    >
<!-- 必填标识 -->
      <!-- solt -->
      <template v-if="item.type === 'slot'">
        <label v-if="item.showLabel" class="filter-label" :class="index === 0 && showFilterList.length < 4  ? 'labelAuto' : item.labelClass">
          <span class="required" v-if="item.required"> * </span>
          {{ item.label }}</label>
        <span v-if="item.showLabel">：</span>
        <slot :name="'filter-' + item.value" />
      </template>
      <template v-else>
        <label
          class="filter-label"
          :class="index === 0 && showFilterList.length < 4  ? 'labelAuto' : item.labelClass"
          v-if="item.label && item.type != 'button'"
          ><span class="required" v-if="item.required"> * </span>{{ item.label }}</label
        >
        <span v-if="item.label && item.type != 'button'" class="colon">：</span>
        <!-- 输入框 -->
        <el-input
          v-if="item.type === 'input'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.type}`"
          :type="item.type"
          :disabled="item.disabled ? item.disabled : false"
          :clearable="item.clearable === false ? item.clearable : true"
          :placeholder="getPlaceholder(item)"
          @keyup.enter="item.event || (() => {})"
          @input="(e) => (searchQuery[item.value] = validSe(e))"
        />
        <!-- 查询框 -->
        <el-input
          v-if="item.type === 'search'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.type}`"
          :type="item.type"
          :disabled="item.disabled ? item.disabled : false"
          :placeholder="getPlaceholder(item)"
          @keyup.enter="item.event || (() => {})"
          @input="(e) => (searchQuery[item.value] = validSe(e))"
        >
          <template #append>
            <el-button :icon="Search" @click="item.event"></el-button>
          </template>
        </el-input>
        <el-checkbox
          v-if="item.type === 'checkbox'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.type}`"
          :disabled="item.disabled"
          :placeholder="getPlaceholder(item)"
          @change="item.event"
        ></el-checkbox>
        <!-- 选择框 -->
        <el-select
          v-if="item.type === 'select'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.type}`"
          :disabled="item.disabled"
          :multiple="item.multiple"
          :clearable="item.clearable === false ? item.clearable : true"
          filterable
          @visible-change="visibleChange($event, item.list)"
          :placeholder="getPlaceholder(item)"
          :filterMethod="filterMethod"
          @change="item.event"
        >
          <el-option
            v-for="childItem in listTypeOptionsInfo[item.list]"
            :key="childItem.key"
            :label="
              childItem.key.length > 8
                ? childItem.key.substring(0, 8) + '...'
                : childItem.key
            "
            :value="childItem.value"
          />
        </el-select>
        <!--字典选择框-->
        <select-model
          v-if="item.type === 'select-model'"
          v-model="searchQuery[item.value]"
          class="filter-select-model"
          :type-code="item.code"
          :multiple="item.multiple"
          :disabled="item.disabled"
          :clearable="item.clearable === false ? item.clearable : true"
          :check-default="item.checkDefault ? item.checkDefault : false"
          :placeholder="getPlaceholder(item)"
          :only-show-option="item.onlyShowOption"
          :class="`filter-${item.type}`"
          @change="item.event"
        />
        <!-- 时间选择框 -->
        <el-time-select
          v-if="item.type === 'time'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.type}`"
          :disabled-date="
            item.TimePickerOptions && item.TimePickerOptions.disabledDate
          "
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
          :placeholder="getPlaceholder(item)"
        />
        <!-- 日期选择框 -->
        <el-date-picker
          v-if="item.type === 'date'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.type}`"
          :disabled-date="
            (item.datePickerOptions && item.datePickerOptions.disabledDate) ||
            datePickerOptions.disabledDate
          "
          :type="item.dateType"
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
          :value-format="item.valueFormat || 'YYYY-MM-DD'"
          :placeholder="getPlaceholder(item)"
          @change="item.event"
        />
        <el-date-picker
          v-if="item.componentType === 'dateTime'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.componentType}`"
          :disabled-date="
            item.datePickerOptions && item.datePickerOptions.disabledDate
          "
          type="datetime"
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="item.defaultTime"
          @change="item.event"
        />
        <!-- 日期范围选择框 -->
        <el-date-picker
          v-if="item.type === 'daterange'"
          v-model="timeInfo[item.value]"
          :class="`filter-${item.type}`"
          format="YYYY-MM-DD"
          :value-format="item.valueFormat"
          type="daterange"
          range-separator="至"
          :shortcuts="$fn.pickerOptionsFn()"
          align="right"
          :start-placeholder="item.label + '开始日期'"
          :end-placeholder="item.label + '结束日期'"
          @change="timeChange($event, item.value)"
        ></el-date-picker>
        <!-- 按钮 -->
        <el-button
            v-if="item.type === 'button' && isAddFlag"
            :class="[
          `filter-${item.type}`,
          item.label === '删除' ? 'deleteBtnLight' : '',
        ]"
            :type="getItemType(item)"
            :icon="iconMap[item.label] || item.icon"
            :disabled="item.disabled"
            @click="item.event"
        >{{ item.label }}</el-button
        >
      </template>
    </div>
    <div class="filter-btn" v-if="!isAddFlag">
      <div
          v-for="(item, index) in getConfigList('btn')"
          :key="index"
          class="filter-item"
      >
        <template v-if="item.type === 'slot'">
          <slot :name="'filter-' + item.value" />
        </template>
        <!-- 按钮 -->
        <el-button
            v-else-if="item.type === 'button'"
            :class="[
            `filter-${item.type}`,
            item.label === '删除' ? 'deleteBtnLight' : '',
          ]"
            :type="getItemType(item)"
            :icon="iconMap[item.label] || item.icon"
            :disabled="setBtnDisabled(item.disabled)"
            @click="item.event"
        >{{ item.label }}</el-button
        >
      </div>
    </div>

    <slot name="modelTips" />
  </div>
  <SelectTableData
      v-if="tableInfo.visible"
      v-model:showDialog="tableInfo.visible"
      :query="tableInfo.query"
      :title="tableInfo.title"
      :api="tableInfo.api"
      :pager="tableInfo.pager"
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

<script setup name="PageFilter">
import SelectModel from '@/components/SelectModel/index'
import pinyin from 'js-pinyin'
import { Search } from '@element-plus/icons-vue'
const { proxy } = getCurrentInstance()
const emits = defineEmits()
const props = defineProps({
  // 自定义类名
  className: {
    type: String,
    default: '',
  },
  // 是否新增页
  isAddFlag: {
    type: Boolean,
    default: false,
  },
  // 相关列表
  listTypeInfo: {
    type: Object,
    default: () => {
      return {}
    },
  },
  // 过滤器列表
  filterList: {
    type: Array,
    default: () => {
      return []
    },
  },
  // 参数
  query: {
    type: Object,
    default: () => {
      return {}
    },
  },
})

// 时间相关设置
const datePickerOptions = ref({
  disabledDate(time) {
    // 大于当前的时间都不能选 (+十分钟让点击此刻的时候可以选择到当前时间)
    return time.getTime() > +new Date() + 1000 * 600 * 1
  },
})
const iconMap = ref({
  // 新增: 'Plus',
  // 编辑: 'Edit',
  // 删除: 'Delete',
  // 查询: 'Search',
  // 返回: 'CircleClose',
  // 保存: 'Document',
})

const tableInfo = ref({})
const treeInfo = ref({})
const periodInfo = ref({})
const flag = ref('inner') // 内 inner  外outside
const searchQuery = ref({})
const timeInfo = ref({})
const oldQuery = ref({})
const list = ref('')
const listTypeOptionsInfo = ref({})
const copyListTypeInfo = ref({})
const showFilterList = ref([])
watch(
  () => searchQuery.value,
  (val) => {
    // 传入参数修改，不派发
    if (flag.value === 'outside') {
      flag.value = 'inner'
      return
    }
    // 修改传入进来的参数
    emits('update:query', { ...props.query, ...val })
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
watch(
  () => props.query,
  (val) => {
    flag.value = 'outside' // 标识为传入参数修改
    searchQuery.value = val
    props.filterList.forEach((item) => {
      if (item.type === 'daterange' || item.type === 'datetimerange') {
        if (
          val &&
          val[item.value] &&
          !proxy.$fn.isEmptyString(val[item.value].value)
        ) {
          proxy.$nextTick(() => {
            let arr = proxy.$fn.splitArr(val[item.value].value)
            timeInfo.value[item.value] = Array.from(arr)
          })
        }
      }
    })
  }
)
watch(
    () => props.filterList,
    (val) => {
      if (val && val.length) {
        showFilterList.value = props.filterList.filter(
            (item) =>
                !item.hasOwnProperty('show') ||
                (item.hasOwnProperty('show') && item.show)
        )
      } else {
        showFilterList.value = []
      }
    },
    {
      immediate: true,
      deep: true,
    }
)
function visibleChange(val, _list) {
  //下拉框出现/隐藏时触发
  list.value = _list
  if (!val) {
    listTypeOptionsInfo.value[_list] = copyListTypeInfo.value[_list]
  }
}
function filterMethod(value) {
  // //	自定义查询方法
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
function initParams() {
  const obj = {}
  for (const key in props.query) {
    if (props.query[key]) {
      obj[key] = props.query[key]
    }
  }
  searchQuery.value = obj
}
// 获取列表
function getConfigList(str) {
  // let firstBtn = true
  // showFilterList.value = props.filterList.filter(
  //     (item) =>{
  //       const show = !item.hasOwnProperty('show') || (item.hasOwnProperty('show') && item.show)
  //       if(show && item.type === 'button' && firstBtn) {
  //         firstBtn = false
  //         item.classBtnName = 'filter-search-item-button firstBtn'
  //       } else if(show && item.type === 'button' && !firstBtn) {
  //         item.classBtnName = 'filter-search-item-button'
  //       }
  //       return show
  //     }
  // )
  const btnList = props.filterList.filter(
      (item) =>
          (item.type === 'button')
  )
  const labels = props.filterList.filter(it => it.showLabel)[0]
  if(labels) {
    labels['classBtnName'] = 'detailQuery'
  }
    return btnList
}
// 得到placeholder的显示
function getPlaceholder(row) {
  let placeholder
  if (row.type === 'input' || row.type === 'textarea') {
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
// // 绑定的相关事件
// handleEvent(evnet) {
//     this.$emit('handleEvent', evnet)
// },
// // 派发按钮点击事件
// handleClick(event, data) {
//     this.$emit('handleClick', event, data)
// }
function timeChange(val, str) {
  if (val && val.length) {
    searchQuery.value[str] = val[0] + ',' + val[1]
  } else {
    searchQuery.value[str] = null
  }
}
function setBtnDisabled(btnDisabled) {
  if (typeof btnDisabled === 'string' || typeof btnDisabled === 'boolean') {
    return btnDisabled
  } else if (btnDisabled && typeof btnDisabled === 'function') {
    return btnDisabled()
  }
}
function getItemType(item) {
  if(item.btType && item.label !== '重置') {
    return item.btType
  }
  const primaryArr = ['新增', '查询', '导出Excel', '打印', '添加明细']
  if(primaryArr.includes(item.label)) {
    return 'primary'
  }
  return 'default'
}
onUnmounted(() => {
  emits('update:query', { ...oldQuery.value })
})
oldQuery.value = Object.assign(oldQuery.value, props.query)
initParams()
getConfigList()

// table确定弹框
function tableCallback(data) {
  tableInfo.value.callBack(data)
}
// tree确定弹框
function treeCallback(data) {
  treeInfo.value.callBack(data)
}
// 期间确定弹框
function periodCallback(data) {
  periodInfo.value.callBack(data)
}
// 打开弹框
function openDialog(data, type) {
  console.log('1313131', data)
  if (type === 'tree') {
    treeInfo.value = data
    return
  }
  // 会计期间
  if(data.type === 'accountingPeriod') {
    tableInfo.value = [];
    periodInfo.value = data;
  } else {
    periodInfo.value = [];
    tableInfo.value = data;
  }
}

defineExpose({ openDialog })
</script>

<style lang="scss" scoped>
// 自定义过滤相关
.page-filter {
  width: 100%;
  .required {
    color: red;
  }
}
</style>
