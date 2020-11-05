class WidgetQ {
    constructor(config) {
        this.template = config.template // 包含small、medium、large三个大小的模板
        this.data = config.data // 小组件需要用到的数据
    }
    async show() {
        const widgetAST = {
            small: this.template.small ? this.parse(this.template.small) : '',
            medium: this.template.medium ? this.parse(this.template.medium) : '',
            large: this.template.large ? this.parse(this.template.large) : '',
        }
        const type = config.widgetFamily
        if (!type) {
            let result = await this.generateAlert('预览大小', ['small', 'medium', 'large'])
            if (result === 0) { this.render(widgetAST.small).presentSmall() }
            if (result === 1) { this.render(widgetAST.medium).presentMedium() }
            if (result === 2) { this.render(widgetAST.large).presentLarge() }
            return
        }
        if (type === 'small') { Script.setWidget(this.render(widgetAST.small)) }
        if (type === 'medium') { Script.setWidget(this.render(widgetAST.medium)) }
        if (type === 'large') { Script.setWidget(this.render(widgetAST.large)) }
    }
    parse(content) {
        content = content.trim()
        let stack = []
        let currentParent, last, root, index, type, match
        while (content) {
            last = content
            index = content.indexOf('<')
            type = index === 0 ? 'tag' : 'inner'

            if (type === 'tag') {
                match = content.match(/^<\/\s*([a-zA-Z]+)\s*>/)
                if (match) {
                    advance(match[0].length)
                    handleEndTag(match[1])
                    continue
                }
                match = parseStartTag()
                if (match) {
                    handleStartTag(match)
                    continue
                }
            }

            if (type === 'inner') {
                match = content.substring(0, index)
                handleTextTag(match)
                advance(index)
            }

            if (last === content) {
                throw (new Error(content))
            }
        }
        log('parse successfully.')
        return root

        function advance(index) {
            content = content.substring(index)
        }

        function parseStartTag() {
            const start = content.match(/^<([a-zA-Z0-9]+)/)
            if (start) {
                const match = {
                    tagName: start[1],
                    attrs: []
                }
                advance(start[0].length)
                let end, attr
                while (!(end = content.match(/^\s*(\/?)>/)) &&
                    (attr = content.match(/^\s*([^\s"'<>\/=]+)(?:\s*=\s*(?:(true|false)|([0-9]+)|"([^"]*)"|'([^']*)'|\{([^\{\}]*)\}))?/))) {
                    advance(attr[0].length)
                    match.attrs.push(attr)
                }
                if (end) {
                    advance(end[0].length)
                    return match
                }
            }
        }

        function handleEndTag(match) {
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].tagName === match) {
                    stack.splice(i)
                    currentParent = stack[stack.length - 1]
                    break
                }
            }
        }

        function handleStartTag(match) {
            const attrs = createAttrs(match.attrs)
            let tag
            if (currentParent) {
                tag = createTag(match.tagName, attrs)
                currentParent.children.push(tag)
            } else {
                tag = createTag(match.tagName, attrs)
                root = tag
            }

            if (!match.selfClosing) {
                stack.push(tag)
                currentParent = tag
            }
        }

        function handleTextTag(match) {
            const text = match.match(/^(\s)+$/) ? match.trim() : match
            if (text !== '') {
                currentParent.children.push(text)
            }
        }

        function createTag(tagName, attrs, children = []) {
            return {
                tagName: tagName,
                attrs: attrs,
                children: children
            }
        }

        function createAttrs(attrs) {
            if (attrs.length === 0) {
                return null
            } else {
                let obj = {}
                attrs.forEach(attr => {
                    obj[attr[1]] = attr[2] || attr[3] || attr[4] || attr[5] || attr[6] || null
                })
                return obj
            }
        }
    }
    render(root) {
        const that = this
        const widget = new ListWidget()
        handleAttrs(widget, root.attrs)
        root.children.forEach(child => {
            handleTag(child, widget)
        })
        log('render successfully.')
        return widget

        function handleTag(child, parent) {
            switch (child.tagName) {
                case 'stack':
                    const stack = parent.addStack()
                    handleAttrs(stack, child.attrs)
                    child.children.forEach(element => {
                        handleTag(element, stack)
                    })
                    break
                case 'image':
                    const expOfImage = child.children[0].match(/(?:\{([^\{\}]*)\})/)[1]
                    const image = parent.addImage(getValFromExp(expOfImage))
                    handleAttrs(image, child.attrs)
                    break
                case 'text':
                    const text = parent.addText(handleMixedExp(child.children[0]))
                    handleAttrs(text, child.attrs)
                    break
                case 'date':
                    const expOfDate = child.children[0].match(/(?:\{([^\{\}]*)\})/)[1]
                    const date = parent.addDate(getValFromExp(expOfDate))
                    handleAttrs(date, child.attrs)
                    break
                case 'spacer':
                    const length = Number(child.children[0]) || null
                    parent.addSpacer(length)
                    break
                default:
                    log('wrong tag type.')
            }
        }
        function handleAttrs(obj, attrs) {
            if (!attrs) { return }
            for (const key in attrs) {
                const func = that.getAttrFunc(key)
                if (!func) { continue }
                const val = getValFromExp(attrs[key])
                func.apply(null, [obj].concat(val))
            }
        }
        function handleMixedExp(str) {
            let match, result = '', array = []
            while (match = str.match(/(?:\{([^\{\}]*)\})/)) {
                array.push(str.substring(0, match.index))
                array.push(getValFromExp(match[1]))
                str = str.substring(match.index + match[0].length)
            }
            array.push(str)
            for (const i in array) {
                result = result + array[i]
            }
            return result
        }
        function getValFromExp(exp) {
            if (!exp) { return null }
            let val = that.data
            if (exp.match(/true|false|[0-9\+\*\/\-\%]+|[\[\]]+|new\s[a-zA-Z0-9]+|[\"\']+/g)) {
                val = eval(exp)
            } else {
                exp.split('.').forEach(key => {
                    val = val[key]
                })
            }
            return val
        }
    }
    getAttrFunc(key) {
        return {
            // property:
            // widget、stack
            backgroundColor: (obj, color) => { obj.backgroundColor = color },
            backgroundGradient: (obj, gradient) => { obj.backgroundGradient = gradient },
            backgroundImage: (obj, image) => { obj.backgroundImage = image },
            spacing: (obj, number) => { obj.backgroundColor = number },
            // stack
            size: (obj, size) => { obj.size = size },
            // widget
            refreshAfterDate: (obj, date) => { obj.refreshAfterDate = date },
            // common
            url: (obj, url) => { obj.url = url },
            // text、date
            font: (obj, font) => { obj.font = font },
            lineLimit: (obj, number) => { obj.lineLimit = number },
            minimumScaleFactor: (obj, number) => { obj.minimumScaleFactor = number },
            shadowColor: (obj, color) => { obj.shadowColor = color },
            shadowOffset: (obj, offset) => { obj.shadowOffset = offset },
            shadowRadius: (obj, radius) => { obj.shadowRadius = radius },
            textColor: (obj, color) => { obj.textColor = color },
            textopacity: (obj, opacity) => { obj.textopacity = opacity },
            // stack、image
            borderColor: (obj, color) => { obj.borderColor = color },
            borderWidth: (obj, width) => { obj.borderWidth = width },
            cornerRadius: (obj, radius) => { obj.cornerRadius = radius },
            // image
            containerRelativeShape: (obj, bool) => { obj.containerRelativeShape = bool },
            imageOpacity: (obj, opacity) => { obj.imageOpacity = opacity },
            imageSize: (obj, size) => { obj.imageSize = size },
            resizable: (obj, bool) => { obj.resizable = bool },
            tintColor: (obj, color) => { obj.tintColor = color },
            // methods:
            // stack、widget
            padding: (obj, top, leading, bottom, trailing) => { obj.setPadding(top, leading, bottom, trailing) },
            // stack
            bottomAlignContent: (obj) => { obj.bottomAlignContent() },
            topAlignContent: (obj) => { obj.topAlignContent() },
            centerAlignContent: (obj) => { obj.centerAlignContent() },
            // stack
            layoutHorizontally: (obj) => { obj.layoutHorizontally() },
            layoutVertically: (obj) => { obj.layoutVertically() },
            // text、date
            centerAlignText: (obj) => { obj.centerAlignText() },
            leftAlignText: (obj) => { obj.leftAlignText() },
            rightAlignText: (obj) => { obj.rightAlignText() },
            // Image
            applyFillingContentMode: (obj) => { obj.applyFillingContentMode() },
            applyFittingContentMode: (obj) => { obj.applyFittingContentMode() },
            // Image
            centerAlignImage: (obj) => { obj.centerAlignImage() },
            leftAlignImage: (obj) => { obj.leftAlignImage() },
            rightAlignImage: (obj) => { obj.rightAlignImage() },
            // date
            applyDateStyle: (obj) => { obj.applyDateStyle() },
            applyOffsetStyle: (obj) => { obj.applyOffsetStyle() },
            applyRelativeStyle: (obj) => { obj.applyRelativeStyle() },
            applyTimerStyle: (obj) => { obj.applyTimerStyle() },
            applyTimeStyle: (obj) => { obj.applyTimeStyle() },
        }[key]
    }
    async generateAlert(message, options) {
        let alert = new Alert()
        alert.message = message
        for (const option of options) {
            alert.addAction(option)
        }
        return await alert.presentAlert()
    }
}

module.exports = { WQ: WidgetQ }