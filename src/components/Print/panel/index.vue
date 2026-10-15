<template>
  <div class="kr-collapse">
    <el-collapse v-model="activeNames">
      <el-collapse-item title name="1">
        <template #title>
          <span>页面参数</span>
        </template>
        <page />
      </el-collapse-item>
      <el-collapse-item name="2">
        <template #title>
          <span>样式</span>
        </template>
        <appearance class="pd-l-10" />
      </el-collapse-item>
      <el-collapse-item name="3">
        <template #title>
          <span>组件</span>
        </template>
        <options />
      </el-collapse-item>
      <el-collapse-item name="4">
        <template #title>
          <span>已加组件</span>
        </template>
        <layers />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import page from './page.vue'
import appearance from './style.vue'
import options from './options/index.vue'
import layers from './layers.vue'
const activeNames = ref(['1', '2', '3', '4'])
</script>
