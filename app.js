const WQ = importModule('core.js').WQ
const wq = new WQ({
    data: {},
    template: {
        small: ``,
        medium: ``,
        large: ``
    }
})
await wq.show()
Script.complete()