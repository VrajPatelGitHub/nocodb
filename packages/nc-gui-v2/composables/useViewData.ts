import type { Api, PaginatedType, TableType } from 'nocodb-sdk'
import type { ComputedRef, Ref } from 'vue'
import { useNuxtApp } from '#app'
import useProject from '~/composables/useProject'

const formatData = (list: Array<Record<string, any>>) =>
  list.map((row) => ({
    row: { ...row },
    oldRow: { ...row },
    rowMeta: {},
  }))

export default (meta: Ref<TableType> | ComputedRef<TableType> | undefined) => {
  const data = ref<Array<Record<string, any>>>()
  const formattedData = ref<Array<{ row: Record<string, any>; oldRow: Record<string, any>; rowMeta?: any }>>()
  const paginationData = ref<PaginatedType>()

  const { project } = useProject()
  const { $api } = useNuxtApp()

  const loadData = async (params: Parameters<Api<any>['dbTableRow']['list']>[3] = {}) => {
    if (!project?.value?.id || !meta?.value?.id) return
    const response = await $api.dbTableRow.list('noco', project.value.id, meta.value.id, params)
    data.value = response.list
    formattedData.value = formatData(response.list)
  }

  const updateRowProperty = async (row: Record<string, any>, property: string) => {
    const id = meta?.value?.columns
      ?.filter((c) => c.pk)
      .map((c) => row[c.title as string])
      .join('___') as string

    const newData = await $api.dbTableRow.update(
      'noco',
      project?.value.id as string,
      meta?.value.id as string,
      id,
      {
        [property]: row[property],
      },
      // todo:
      // {
      //   query: { ignoreWebhook: !saved }
      // }
    )

    /*

        todo: audit

        // audit
          this.$api.utils
            .auditRowUpdate(id, {
              fk_model_id: this.meta.id,
              column_name: column.title,
              row_id: id,
              value: getPlainText(rowObj[column.title]),
              prev_value: getPlainText(oldRow[column.title])
            })
            .then(() => {})
        */
  }
  const insertRow = async (row: Record<string, any>, rowIndex = formattedData.value?.length) => {
    // todo: implement insert row

    const insertObj = meta?.value?.columns?.reduce((o: any, col) => {
      if (!col.ai && row?.[col.title as string] !== null) {
        o[col.title as string] = row?.[col.title as string]
      }
      return o
    }, {})

    const insertedData = await $api.dbTableRow.create('noco', project?.value.id as string, meta?.value.id as string, insertObj)

    formattedData.value?.splice(rowIndex ?? 0, 1, {
      row: insertedData,
      rowMeta: {},
      oldRow: { ...insertedData },
    })
  }

  return { data, loadData, paginationData, formattedData, insertRow, updateRowProperty }
}