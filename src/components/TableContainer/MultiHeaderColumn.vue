<script setup>

const props = defineProps({
  column: {
    required: true,
  }
})

</script>

<template>
  <el-table-column
      :formatter="column.formatter"
      :prop="column.value"
      :label="column.label"
      :align="column.align || 'left'"
      :headerAlign="column.headerAlign || 'center'"
      :sortable="column.sortable"
      :width="column.width"
      :min-width="column.minWidth || '85px'"
  >
    <template v-if="column.type === 'multiHeader'" v-slot="scope">
      <multi-header-column v-for="(childItem, childIndex) in column.children" :key="childIndex" :column="childItem">
        <template v-for="(slot, name) in $slots" :key="name" #[name]="scope">
          <slot
              :name="name"
              :row="scope.row"
              :$index="scope.$index"
          />
        </template>
      </multi-header-column>
    </template>
    <template v-else-if="column.type === 'slot'" v-slot="scope">
      <slot
          :name="'col-' + column.value"
          :row="scope.row"
          :$index="scope.$index"
      />
    </template>
  </el-table-column>
</template>

<style scoped lang="scss">

</style>