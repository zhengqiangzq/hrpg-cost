export function errorMessage(field) {
    const messageTemplate = '请{}{}'
    return messageTemplate
        .replace('{}', ['slot', 'select', 'select-model', 'date', 'daterange'].indexOf(field.type) > -1 ? '选择' : '输入')
        .replace('{}', field.label)
}