<template>
  <div>
    <div class="head-container show-placeholder">
      <el-input
        v-model="typeName"
        maxlength="100"
        placeholder="请输入分类名称"
        clearable
        size="small"
        prefix-icon="Search"
        style="margin-bottom: 20px"
        @change="typeChange"
      />
    </div>
    <div class="head-container">
      <el-tree
        :data="deptOptions"
        :props="{ label: 'name', children: 'children' }"
        :expand-on-click-node="true"
        :filter-node-method="filterNode"
        :highlight-current="true"
        ref="treeRef"
        default-expand-all
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <span class="span-ellipsis">
            <span :title="node.label">{{ node.label }}</span>
            <span v-if="views === 'commissionTask' && data.taskCount">
              <span class="colorRed">{{ data.taskCount }}</span>
            </span>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  deptOptions: {
    type: Array,
    default: () => {
      return []
    },
  },
  views: {
    type: String,
    default: '',
  },
})
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const typeName = ref('')

/** 根据名称筛选部门树 */
watch(typeName, (val) => {
  proxy.$refs['treeRef'].filter(val)
})

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true
  return data.name.indexOf(value) !== -1
}
function typeChange(val) {
  emits('typeChange', val)
}
function handleNodeClick(val) {
  emits('handleNodeClick', val)
}
</script>

<style lang="scss" scoped>
.colorRed {
  display: inline-block;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border-radius: 12px;
  background-color: #F46F6F;
  color: #FFF;
  padding: 0 2px;
  margin-left: 6px;
  font-size: 12px;
}
</style>