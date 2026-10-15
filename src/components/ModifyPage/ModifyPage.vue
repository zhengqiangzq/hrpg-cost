<script setup>
import {computed, getCurrentInstance, ref} from "vue";

const { proxy } = getCurrentInstance()

const emit = defineEmits()

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  noFullButton: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  btnList: {
    type: Array,
    default: () => ([])
  },
  flowFormType: {
    type: String
  }
})

const fullInfo = ref({
  btnList: [{ label: '保存', event: () => save(), show: true }],
})

const fullInfoBtnList = computed(() => [...props.btnList, ...(props.noFullButton ? [] : fullInfo.value.btnList)])

const listeners = {}

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emit('update:visible', newValue)
  },
})

const save = async () => {
  try {
    await trigger('validate')
    emit('save')
  } catch(e) {
    emit('save', e)
  }
}

const on = (eventName, callback) => {
  if (!listeners[eventName]) {
    listeners[eventName] = []
  }
  listeners[eventName].push(callback)
}
const off = (eventName, callback) => {
  if (listeners[eventName]) {
    listeners[eventName] = listeners[eventName].filter(cb => cb !== callback)
  }
}

const trigger = async (eventName, data) => {
  if (listeners[eventName]) {
    for (const callback of listeners[eventName]) {
      await callback(data)
    }
  }
}

const validate = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await trigger('validate')
      resolve()
    } catch(e) {
      reject(e)
    }
  })
}
// // 绑定的相关事件
function returnBack() {
  emit('returnBack')
}

provide('on', on)
provide('off', off)

defineExpose({
  validate
})
</script>

<template>
  <div class="app-container-flex" v-if="showDialog">
    <NewFullScreen
        v-model="showDialog"
        :title="title"
        :btn-list="fullInfoBtnList"
        :needReturn="!flowFormType"
        @returnBack="returnBack"
    >
      <slot />
    </NewFullScreen>
  </div>
</template>

<style scoped lang="scss">

</style>
