class WidgetQ {
    constructor(config) {
        this.template = config.template // small、medium、large
        this.data = config.data // ① attrs：{data.example}；② text：{{data.example}}
        this.component = config.component // { tagName: { props: [], template: ``} , ... }
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
        const data = this.data
        const component = this.component
        const regexp = {
            matchEndTag: /^<\/\s*([a-zA-Z]+)\s*>/,
            matchStartTag: /^<([a-zA-Z0-9]+)/,
            matchAttr: /^\s*([^\s"'<>\/=]+)(?:\s*=\s*(?:(true|false)|([0-9\.]+)|("[^"]*")|('[^']*')|\{([^\{\}]*)\}))?/,
            matchFor: /<[^<>]+(for\s*=\s*"\s*([^\s]+)\s*").*>.*<\s*\/[^<>\/]+>/
        }
        let currentParent, last, root, index, match
        let stack = []

        labelText = labelText.trim()
        pretreat() // for：index、key、value；component
        while (last = labelText) {
            if (index = labelText.indexOf('<')) {
                match = labelText.substring(0, index)
                handleInner(match)
                go(index)
            } else {
                if (match = labelText.match(regexp.matchEndTag)) {
                    go(match[0].length)
                    handleEndTag(match)
                    continue
                }
                if (match = labelText.match(regexp.matchStartTag)) {
                    go(match[0].length)
                    handleStartTag(match)
                    continue
                }
            }

            if (last === labelText) throw new Error('invalid template：check your template.')
        }

        return root || createTag('widget', null)

        function go(len) { labelText = labelText.substring(len) }

        function pretreat() {
            let match
            while (match = labelText.match(regexp.matchFor)) {
                const oldStr = match[0]
                const forStr = match[1]
                const dataStr = match[2]
                let newStr = ''
                let index = 1
                for (const key in eval(dataStr)) {
                    newStr = newStr + oldStr.replace(forStr, '')
                        .replace(/\{\s*?value\s*?\}/g, '{' + dataStr + `['${key}']` + '}')
                        .replace(/\{\s*?key\s*?\}/g, `{"${key}"}`)
                        .replace(/\{\s*?index\s*?\}/g, `{${index}}`)
                    index++
                }
                labelText = labelText.replace(oldStr, newStr)
            }
            if (component) {
                for (let tagName in component) {
                    const pattern = new RegExp(`(<${tagName})(.*?)>[^<>\\/]*?(<\\/\\s*?${tagName}\\s*?>)`)
                    const props = component[tagName].props
                    const template = component[tagName].template.trim()
                    while (match = labelText.match(pattern)) {
                        let oldStr = match[0]
                        let newStr = template
                        let attrs = [...props]
                        let attr, attrStr = ''
                        while (attr = match[2].match(regexp.matchAttr)) {
                            let index = attrs.indexOf(attr[1])
                            if (index + 1) {
                                const val = attr[2] || attr[3] || attr[4] || attr[5] || attr[6] || null
                                newStr = newStr.replace(new RegExp(`\\{\\s*?${attr[1]}\\s*?\\}`, 'g'), `{${val}}`)
                                attrs.splice(index, 1)
                            } else { attrStr = attrStr + attr[0] }
                            match[2] = match[2].substring(attr[0].length)
                        }
                        for (let attr of attrs) {
                            newStr = newStr.replace(new RegExp(`\\{\\s*?${attr}\\s*?\\}`, 'g'), "{''}")
                        }
                        labelText = labelText.replace(oldStr, match[1] + attrStr + '>' + newStr + match[3])
                    }
                }
            }
        }

        function handleStartTag(match) {
            let attrMatch, rawAttrs = [], attrs = null
            while (attrMatch = labelText.match(regexp.matchAttr)) {
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
            if (child.attrs && child.attrs.show) {
                if (!eval(child.attrs.show)) { return }
            }
            switch (child.tagName) {
                case 'stack':
                    const stack = parent.addStack()
                    applyAttrs(stack, child.attrs)
                    child.children.forEach(child => { handleChild(child, stack) })
                    break
                case 'image':
                    applyAttrs(parent.addImage(eval(child.attrs.image)), child.attrs)
                    break
                case 'text':
                    let match, array = [], str = child.children[0]
                    while (match = str.match(/\{\{([^\{^\}]*)\}\}/)) {
                        array.push(str.substring(0, match.index))
                        array.push(eval(match[1]))
                        str = str.substring(match.index + match[0].length)
                    }
                    array.push(str)
                    applyAttrs(parent.addText(array.join('')), child.attrs)
                    break
                case 'date':
                    applyAttrs(parent.addDate(eval(child.attrs.date)), child.attrs)
                    break
                case 'spacer':
                    parent.addSpacer(Number(child.children[0]) || null)
                    break
                default:
                    if (that.component[child.tagName]) {
                        child.children.forEach(child => { handleChild(child, parent) })
                    } else { log('wrong tag type.') }
            }
        }
        function applyAttrs(obj, attrs) {
            if (!attrs) { return }
            for (let key in attrs) {
                const func = that.getAttrFunc(key)
                if (func) { func.apply(null, [obj].concat(eval(attrs[key]))) }
            }
        }
    }

    getAttrFunc(key) {
        return {
            // property:
            // widget、stack
            bgColor(obj, color) { obj.backgroundColor = color },
            bgGrad(obj, gradient) { obj.backgroundGradient = gradient },
            bgImg(obj, image) { obj.backgroundImage = image },
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
            minScale(obj, number) { obj.minimumScaleFactor = number },
            shadowColor(obj, color) { obj.shadowColor = color },
            shadowOffset(obj, offset) { obj.shadowOffset = offset },
            shadowRadius(obj, radius) { obj.shadowRadius = radius },
            textColor(obj, color) { obj.textColor = color },
            textOpacity(obj, opacity) { obj.textOpacity = opacity },
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
            horizontal(obj) { obj.layoutHorizontally() },
            vertical(obj) { obj.layoutVertically() },
            // text、date
            centerAlignText(obj) { obj.centerAlignText() },
            leftAlignText(obj) { obj.leftAlignText() },
            rightAlignText(obj) { obj.rightAlignText() },
            // Image
            filling(obj) { obj.applyFillingContentMode() },
            fitting(obj) { obj.applyFittingContentMode() },
            // Image
            centerAlignImage(obj) { obj.centerAlignImage() },
            leftAlignImage(obj) { obj.leftAlignImage() },
            rightAlignImage(obj) { obj.rightAlignImage() },
            // date
            dateStyle(obj) { obj.applyDateStyle() },
            offsetStyle(obj) { obj.applyOffsetStyle() },
            relativeStyle(obj) { obj.applyRelativeStyle() },
            timerStyle(obj) { obj.applyTimerStyle() },
            timeStyle(obj) { obj.applyTimeStyle() },
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