const WidgetQ = importModule('core')

const wq = new WidgetQ({
    data: {
        example: 'hello'
    },
    template: {
        small: ``,
        medium: ``,
        large: ``,
    },
    component: {
        tagName: ``
    }
})

await wq.show()
Script.complete()