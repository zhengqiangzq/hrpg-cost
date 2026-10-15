<template>
  <div>
    <el-form label-width="80px" :model="pageInfo" class="kr-form">
      <el-row>
        <el-form-item label="模板名称">
          <el-input v-model="pageInfo.title" class="full-w"></el-input>
        </el-form-item>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="模板宽度">
            <el-input-number
              v-model="pageInfo.width"
              controls-position="right"
              :min="0"
              class="min-input"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板高度">
            <el-input-number
              v-model="pageInfo.height"
              controls-position="right"
              :min="0"
              class="min-input"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="纸张宽度">
          <el-input-number
            v-model="pageInfo.pageWidth"
            controls-position="right"
            :min="0"
            class="min-input"
          ></el-input-number>
          <span class="unit-text">(mm)</span>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="纸张高度">
          <el-input-number
            v-model="pageInfo.pageHeight"
            controls-position="right"
            :min="0"
            class="min-input"
          ></el-input-number>
          <span class="unit-text">(mm)</span>
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="打印方向">
          <el-select
            style="width: 100px"
            v-model="pageInfo.horizontally"
            placeholder="请选择打印方向"
          >
            <el-option
              v-for="(item, index) in printType"
              :key="index"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
const { proxy } = getCurrentInstance()
const printType = ref([])
const pageInfo = computed(() => {
  return proxy.$store.state.print.page
})

onMounted(() => {
  let option = proxy.$store.state.permission.dict['print-type'] || []
  if (option.length) {
    option.forEach((item) => {
      item.code = Number(item.code)
    })
  }
  printType.value = option
})
</script>
