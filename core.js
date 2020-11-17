class Context {
    constructor(data, parentContext) {
        this.data = data
        this.parent = parentContext
    }
    push(data) {
        return new Context(data, this)
    }
    lookup(path) {
        let value, index
        let context = this
        while (context) {
            value = context.data
            index = 0
            while (value && index < path.length) {
                value = value[path[index++]]
            }
            if (value) break
            context = context.parent
        }
        return value
    }
}

class WidgetQ {
    constructor(config) {
        this.template = config.template // small、medium、large
        this.context = new Context(config.data, null) // ① attrs：{{example}}；② text：{{example}}
        this.component = config.component // { tagName: `` , ... }
    }

    async show() {
        const widgetAST = {
            small: this.parse(this.template.small || ''),
            medium: this.parse(this.template.medium || ''),
            large: this.parse(this.template.large || ''),
        }
        const type = config.widgetFamily
        if (!type) {
            let result = await generateAlert('预览大小', ['small', 'medium', 'large'])
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
        const regexp = {
            matchEndTag: /^<\/\s*([a-zA-Z]+)\s*>/,
            matchStartTag: /^<([a-zA-Z0-9]+)/,
            matchAttr: /^\s*([^\s"'<>\/=]+)(?:\s*=\s*(?:(true|false|null|undefined|NaN)|([0-9\.]+)|("[^"]*")|('[^']*')|(\{\{[^\{\}]*\}\})))?/
        }
        let currentParent, last, index, match
        let stack = [], rootArray = []

        labelText = labelText.trim()
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

        return rootArray[0] ? rootArray : [createTag('widget', null)]

        function go(len) { labelText = labelText.substring(len) }

        function handleStartTag(match) {
            let attrMatch, forEach, show, bind = {}
            let rawAttrs = [], attrs = null
            while (attrMatch = labelText.match(regexp.matchAttr)) {
                rawAttrs.push(attrMatch)
                go(attrMatch[0].length)
            }
            go(labelText.match(/^\s*>/)[0].length)

            if (rawAttrs.length !== 0) {
                attrs = {}
                rawAttrs.forEach(e => {
                    const val = e[2] || e[3] || e[4] || e[5] || e[6] || null
                    if (e[1] === 'for') { forEach = val; return }
                    if (e[1] === 'show') { show = val; return }
                    if (/^\:/.test(e[1])) { bind[e[1].substring(1)] = val; return }
                    attrs[e[1]] = val
                })
            }

            const tag = createTag(match[1], attrs)
            if (forEach) tag.for = forEach
            if (show) tag.show = show
            if (Object.keys(bind).length > 0) tag.bind = bind

            if (currentParent) {
                currentParent.children.push(tag)
            } else {
                rootArray.push(tag)
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

    render(rootArray) {
        const handleFuncSet = {
            stack(me, parent, ctx) {
                const stack = parent.addStack()
                applyAttrs(stack, me.attrs, ctx)
                me.children.forEach(child => { pretreat(child, stack, ctx) })
            },
            image(me, parent, ctx) {
                applyAttrs(parent.addImage(echo(me.attrs.img, ctx)), me.attrs, ctx)
            },
            text(me, parent, ctx) {
                let match, array = [], str = me.children[0]
                while (match = str.match(/\{\{[^\{\}]*\}\}/)) {
                    array.push(str.substring(0, match.index))
                    array.push(echo(match[0], ctx))
                    str = str.substring(match.index + match[0].length)
                }
                array.push(str)
                applyAttrs(parent.addText(array.join('')), me.attrs, ctx)
            },
            date(me, parent, ctx) {
                applyAttrs(parent.addDate(echo(me.attrs.date, ctx)), me.attrs, ctx)
            },
            spacer(me, parent, ctx) {
                parent.addSpacer(echo(me.children[0] || null, ctx))
            }
        }
        const that = this
        const ctx = that.context
        const root = rootArray[0]
        if (root.tagName !== 'widget') throw new Error('the rootTag must be <widget>.')
        const widget = new ListWidget()
        applyAttrs(widget, root.attrs, ctx)
        root.children.forEach(child => { pretreat(child, widget, ctx) })
        return widget

        function pretreat(me, parent, ctx) { // for
            const forData = me.for ? echo(me.for, ctx) : false
            if (forData) {
                let num = 1
                for (let i in forData) {
                    process(me, parent, ctx.push({
                        index: num,
                        key: i,
                        value: forData[i]
                    }))
                    num++
                }
            } else process(me, parent, ctx)
        }

        function process(me, parent, ctx) {
            if (me.show && !echo(me.show, ctx)) return // show

            const handleFunc = handleFuncSet[me.tagName]
            if (handleFunc) { handleFunc(me, parent, ctx); return }

            const cpt = that.component[me.tagName] // component
            if (cpt) {
                that.parse(cpt.replace(/\{\{\s*?#(.+)\s*?\}\}/g, (a, b) => {
                    return me.bind ? (me.bind[b] || null) : null
                })).forEach(ele => { pretreat(ele, parent, ctx) })
            } else log('<' + me.tagName + '> is a wrong tag type.')
        }

        function echo(exp, ctx) {
            if (typeof exp !== 'string') return exp // not string
            const match = exp.match(/\{\{\s*([^\{\}]*)\s*\}\}/)
            if (!match) return eval(exp) // not exp
            exp = match[1]
            if (/^(?:true|false|NaN|undefined|null)$/.test(exp)) return eval(exp) // not path
            const path = getPath(exp)
            if (!path) return eval(exp) // not path
            return ctx.lookup(path)
        }

        function getPath(exp) {
            if (typeof exp !== 'string') { return false }
            let match, array = []
            if (match = exp.match(/^[a-zA-Z][a-zA-Z0-9]*/)) {
                exp = exp.substring(match[0].length)
                array.push(match[0])
            }
            while (match = exp.match(/^\[([a-zA-Z0-9'"]+)\]|^\.{1}([a-zA-Z0-9]+)/)) {
                array.push(match[1] || match[2])
                exp = exp.substring(match[0].length)
            }
            return exp ? false : array
        }

        function applyAttrs(obj, attrs, ctx) {
            if (!attrs) { return }
            for (let key in attrs)
                that.getAttrFunc(key)?.apply(null, [obj].concat(echo(attrs[key], ctx)))
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
}

async function generateAlert(message, options) {
    let alert = new Alert()
    alert.message = message
    for (const option of options) {
        alert.addAction(option)
    }
    return await alert.presentAlert()
}

module.exports = WidgetQ