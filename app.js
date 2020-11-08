const WidgetQ=importModule('core')

const wq = new WidgetQ({
    data: {
        font: new Font('systemFont', 20)
    },
    template: {
        small: ``,
        medium: ``,
        large: ``,
    }
})

await wq.show()
Script.complete()