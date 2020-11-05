const WQ = importModule('core.js').WQ
const wq = new WQ({
    data: {
        font: new Font('systemFont', 15),
        color: Color.yellow(),
        text: '我的第一个 WidegetQ 小组件!',
        img: img,
        idiom: idiom.content
    },
    template: {
        small: ``,
        medium: ``,
        large: ``
    }
})
await wq.show()
Script.complete()