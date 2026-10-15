<script setup>
import {computed} from "vue";

const props = defineProps({
  modelValue: 0,
  switchs: {
    type: Array,
    default: () => []
  }
})
const emits = defineEmits(['update:modelValue'])

const active = computed({
  get: () => props.modelValue,
  set: (value) => emits('update:modelValue', value)
})
</script>

<template>
  <div class="chart-switch">
    <div v-for="(item, index) in switchs" :key="index" class="switch" :class="{ active: active === index }" @click="active = index">{{ item }}</div>
  </div>
</template>

<style scoped lang="scss">
.chart-switch {
  position: absolute;
  top: 2rem;
  left: 10px;
  display: flex;

  .switch {
    padding: 2px 10px;
    color: #AAAAAA;
    border: 1px solid rgba(170, 170, 170, 1);
    cursor: pointer;
  }
  .switch.active {
    background: #165DFF;
    color: #ffffff;
    border: none;
  }
}
</style>
