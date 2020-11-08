class WidgetQ {
    constructor(config) {
        this.template = config.template // small、medium、large
        this.data = config.data // ① attrs：{data.example}；② text：{{data.example}}
    }
    async show() {
        const widgetAST = {
            small: this.parse(this.template.small || ''),
            medium: this.parse(this.template.medium || ''),
            large: this.parse(this.template.large || ''),
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

    parse(labelText) {
        const regexs = {
            matchEndTag: /^<\/\s*([a-zA-Z]+)\s*>/,
            matchStartTag: /^<([a-zA-Z0-9]+)/,
            matchAttr: /^\s*([^\s"'<>\/=]+)(?:\s*=\s*(?:(true|false)|([0-9]+)|"([^"]*)"|'([^']*)'|(\{[^\{\}]*\})))?/,
        }
        let currentParent, last, root, index, match
        let stack = []

        labelText = labelText.trim()
        while (last = labelText) {
            if (index = labelText.indexOf('<')) {
                match = labelText.substring(0, index)
                handleInner(match)
                go(index)
            } else {
                if (match = labelText.match(regexs.matchEndTag)) {
                    go(match[0].length)
                    handleEndTag(match)
                    continue
                }
                if (match = labelText.match(regexs.matchStartTag)) {
                    go(match[0].length)
                    handleStartTag(match)
                    continue
                }
            }

            if (last === labelText) throw new Error('invalid template：check your template.')
        }

        return root || createTag('widget', null)

        function go(len) { labelText = labelText.substring(len) }

        function handleStartTag(match) {
            let attrMatch, rawAttrs = [], attrs = null
            while (attrMatch = labelText.match(regexs.matchAttr)) {
                go(attrMatch[0].length)
                rawAttrs.push(attrMatch)
            }
            go(labelText.match(/^\s*>/)[0].length)

            if (rawAttrs.length !== 0) {
                attrs = {}
                rawAttrs.forEach(attr => {
                    attrs[attr[1]] = attr[2] || attr[3] || attr[4] || attr[5] || attr[6] || null
                })
            }

            const tag = createTag(match[1], attrs)
            if (currentParent) {
                currentParent.children.push(tag)
            } else {
                root = tag
            }
            stack.push(tag)
            currentParent = tag
        }

        function handleEndTag(match) {
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].tagName === match[1]) {
                    stack.splice(i)
                    currentParent = stack[stack.length - 1]
                    break
                }
            }
        }

        function handleInner(match) {
            const inner = match.match(/^(\s)+$/) ? match.trim() : match
            if (inner !== '') {
                currentParent.children.push(inner)
            }
        }

        function createTag(tagName, attrs) {
            return {
                tagName: tagName,
                attrs: attrs,
                children: []
            }
        }
    }

    render(root) {
        const that = this
        const data = this.data
        if (root.tagName !== 'widget') throw new Error('the rootTag must be <widget>.')
        const widget = new ListWidget()
        applyAttrs(widget, root.attrs)
        root.children.forEach(child => { handleChild(child, widget) })
        return widget

        function handleChild(child, parent) {
            switch (child.tagName) {
                case 'stack':
                    const stack = parent.addStack()
                    applyAttrs(stack, child.attrs)
                    child.children.forEach(child => { handleChild(child, stack) })
                    break
                case 'image':
                    const image = parent.addImage(eval(child.children[0]))
                    applyAttrs(image, child.attrs)
                    break
                case 'text':
                    let match, array = [], str = child.children[0]
                    while (match = str.match(/\{\{([^\{^\}]*)\}\}/)) {
                        array.push(str.substring(0, match.index))
                        array.push(eval(match[1]))
                        str = str.substring(match.index + match[0].length)
                    }
                    array.push(str)
                    const text = parent.addText(array.join(''))
                    applyAttrs(text, child.attrs)
                    break
                case 'date':
                    const date = parent.addDate(eval(child.children[0]))
                    applyAttrs(date, child.attrs)
                    break
                case 'spacer':
                    parent.addSpacer(Number(child.children[0]) || null)
                    break
                default:
                    log('wrong tag type.')
            }
        }
        function applyAttrs(obj, attrs) {
            if (!attrs) { return }
            for (const key in attrs) {
                const func = that.getAttrFunc(key)
                if (!func) { continue }
                const match = attrs[key].match(/\{([^\{\}]*)\}/)
                const val = match ? eval(match[1]) : attrs[key]
                func.apply(null, [obj].concat(val))
            }
        }
    }

    getAttrFunc(key) {
        return {
            // property:
            // widget、stack
            backgroundColor(obj, color) { obj.backgroundColor = color },
            backgroundGradient(obj, gradient) { obj.backgroundGradient = gradient },
            backgroundImage(obj, image) { obj.backgroundImage = image },
            spacing(obj, number) { obj.backgroundColor = number },
            // stack
            size(obj, size) { obj.size = size },
            // widget
            refreshAfterDate(obj, date) { obj.refreshAfterDate = date },
            // common
            url(obj, url) { obj.url = url },
            // text、date
            font(obj, font) { obj.font = font },
            lineLimit(obj, number) { obj.lineLimit = number },
            minimumScaleFactor(obj, number) { obj.minimumScaleFactor = number },
            shadowColor(obj, color) { obj.shadowColor = color },
            shadowOffset(obj, offset) { obj.shadowOffset = offset },
            shadowRadius(obj, radius) { obj.shadowRadius = radius },
            textColor(obj, color) { obj.textColor = color },
            textopacity(obj, opacity) { obj.textopacity = opacity },
            // stack、image
            borderColor(obj, color) { obj.borderColor = color },
            borderWidth(obj, width) { obj.borderWidth = width },
            cornerRadius(obj, radius) { obj.cornerRadius = radius },
            // image
            containerRelativeShape(obj, bool) { obj.containerRelativeShape = bool },
            imageOpacity(obj, opacity) { obj.imageOpacity = opacity },
            imageSize(obj, size) { obj.imageSize = size },
            resizable(obj, bool) { obj.resizable = bool },
            tintColor(obj, color) { obj.tintColor = color },
            // methods:
            // stack、widget
            padding(obj, top, leading, bottom, trailing) { obj.setPadding(top, leading, bottom, trailing) },
            // stack
            bottomAlignContent(obj) { obj.bottomAlignContent() },
            topAlignContent(obj) { obj.topAlignContent() },
            centerAlignContent(obj) { obj.centerAlignContent() },
            // stack
            layoutHorizontally(obj) { obj.layoutHorizontally() },
            layoutVertically(obj) { obj.layoutVertically() },
            // text、date
            centerAlignText(obj) { obj.centerAlignText() },
            leftAlignText(obj) { obj.leftAlignText() },
            rightAlignText(obj) { obj.rightAlignText() },
            // Image
            applyFillingContentMode(obj) { obj.applyFillingContentMode() },
            applyFittingContentMode(obj) { obj.applyFittingContentMode() },
            // Image
            centerAlignImage(obj) { obj.centerAlignImage() },
            leftAlignImage(obj) { obj.leftAlignImage() },
            rightAlignImage(obj) { obj.rightAlignImage() },
            // date
            applyDateStyle(obj) { obj.applyDateStyle() },
            applyOffsetStyle(obj) { obj.applyOffsetStyle() },
            applyRelativeStyle(obj) { obj.applyRelativeStyle() },
            applyTimerStyle(obj) { obj.applyTimerStyle() },
            applyTimeStyle(obj) { obj.applyTimeStyle() },
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
module.exports = WidgetQ