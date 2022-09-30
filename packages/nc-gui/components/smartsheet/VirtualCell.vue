<script setup lang="ts">
import type { ColumnType } from 'nocodb-sdk'
import {
  ActiveCellInj,
  CellValueInj,
  ColumnInj,
  RowInj,
  isBt,
  isCount,
  isFormula,
  isHm,
  isLookup,
  isMm,
  isRollup,
  provide,
  toRef,
} from '#imports'
import type { Row } from '~/lib'
import { NavigateDir } from '~/lib'

const props = defineProps<{
  column: ColumnType
  modelValue: any
  row: Row
  active?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'navigate'])

const column = toRef(props, 'column')
const active = toRef(props, 'active', false)
const row = toRef(props, 'row')

provide(ColumnInj, column)
provide(ActiveCellInj, active)
provide(RowInj, row)
provide(CellValueInj, toRef(props, 'modelValue'))
</script>

<template>
  <div
    class="nc-virtual-cell w-full"
    @keydown.stop.enter.exact="emit('navigate', NavigateDir.NEXT)"
    @keydown.stop.shift.enter.exact="emit('navigate', NavigateDir.PREV)"
  >
    <LazyVirtualCellHasMany v-if="isHm(column)" />
    <LazyVirtualCellManyToMany v-else-if="isMm(column)" />
    <LazyVirtualCellBelongsTo v-else-if="isBt(column)" />
    <LazyVirtualCellRollup v-else-if="isRollup(column)" />
    <LazyVirtualCellFormula v-else-if="isFormula(column)" />
    <LazyVirtualCellCount v-else-if="isCount(column)" />
    <LazyVirtualCellLookup v-else-if="isLookup(column)" />
  </div>
</template>
