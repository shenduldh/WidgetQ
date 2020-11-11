const WidgetQ=importModule('core')

const wq = new WidgetQ({
    data: {
        font: new Font('systemFont', 20)
    },
    template: {
        small: ``,
        medium: ``,
        large: ``,
    },
    component: {
        tagName: {
            props: [],
            template: ``
        }
    }
})

await wq.show()
Script.complete()