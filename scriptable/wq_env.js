class Util {
    static blurImage(img, blurLevel, blurColor) {
        const dctx = new DrawContext()
        dctx.size = img.size
        dctx.drawImageAtPoint(img, new Point(0, 0))
        dctx.setFillColor(new Color(blurColor || '#000000', blurLevel))
        dctx.fill(new Rect(0, 0, img.size.width, img.size.height))
        return dctx.getImage()
    }
    static cropImage(img, x, y, w, h) {
        const dctx = new DrawContext()
        dctx.size = new Size(w, h)
        dctx.drawImageAtPoint(img, new Point(-x, -y))
        return dctx.getImage()
    }
    static resizeImage(img, w, h) {
        const dctx = new DrawContext()
        dctx.opaque = false
        dctx.size = new Size(w, h)
        dctx.drawImageInRect(img, new Rect(0, 0, w, h))
        return dctx.getImage()
    }
    static async request(url, config = {}) {
        const reqType = (config.reqType || 'GET').toUpperCase() // or 'POST'
        const dataType = (config.dataType || 'JSON').toUpperCase() // or 'IMAGE'、'STRING'
        const handler = config.handler || ((a, b) => a)
        const params = config.params
        const headers = config.headers

        const reqFuncs = {
            JSON: 'loadJSON',
            IMAGE: 'loadImage',
            STRING: 'loadString'
        }

        const req = new Request(url)
        req.method = reqType
        if (headers) req.headers = headers
        if (params) for (let k in params) req.addParameterToMultipart(k, params[k])

        try {
            const res = await req[reqFuncs[dataType]]()
            return handler(res, req)
        } catch (err) { log(err) }
    }
    static async generateAlert(msg, opts) {
        let alert = new Alert()
        alert.message = msg
        for (let opt of opts) { alert.addAction(opt) }
        return await alert.presentAlert()
    }
    static getPhoneSize(height) {
        return {
            // 12 and 12 Pro
            "2532": {
                small: 474,
                medium: 1014,
                large: 1062,
                left: 78,
                right: 618,
                top: 231,
                middle: 819,
                bottom: 1407
            },
            // 11 Pro Max, XS Max
            "2688": {
                small: 507,
                medium: 1080,
                large: 1137,
                left: 81,
                right: 654,
                top: 228,
                middle: 858,
                bottom: 1488
            },
            // 11, XR
            "1792": {
                small: 338,
                medium: 720,
                large: 758,
                left: 54,
                right: 436,
                top: 160,
                middle: 580,
                bottom: 1000
            },
            // 11 Pro, XS, X
            "2436": {
                small: 465,
                medium: 987,
                large: 1035,
                left: 69,
                right: 591,
                top: 213,
                middle: 783,
                bottom: 1353
            },
            // Plus phones
            "2208": {
                small: 471,
                medium: 1044,
                large: 1071,
                left: 99,
                right: 672,
                top: 114,
                middle: 696,
                bottom: 1278
            },
            // SE2 and 6/6S/7/8
            "1334": {
                small: 296,
                medium: 642,
                large: 648,
                left: 54,
                right: 400,
                top: 60,
                middle: 412,
                bottom: 764
            },
            // SE1
            "1136": {
                small: 282,
                medium: 584,
                large: 622,
                left: 30,
                right: 332,
                top: 59,
                middle: 399,
                bottom: 399
            },
            // 11 and XR in Display Zoom mode
            "1624": {
                small: 310,
                medium: 658,
                large: 690,
                left: 46,
                right: 394,
                top: 142,
                middle: 522,
                bottom: 902
            },
            // Plus in Display Zoom mode
            "2001": {
                small: 444,
                medium: 963,
                large: 972,
                left: 81,
                right: 600,
                top: 90,
                middle: 618,
                bottom: 1146
            },
        }[height]
    }
}

class CustomFont {
    constructor(webview, config) {
        this.webview = webview || new WebView()
        this.fontFamily = config.fontFamily || 'customFont'
        this.fontUrl = config.fontUrl
        this.timeout = config.timeout || 20000
    }

    async load() { // 加载字体
        await this.webview.evaluateJavaScript(`
        const customFont = new FontFace("${this.fontFamily}", "${this.fontUrl}");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let baseHeight,extendHeight
        log('loading font.');
        customFont.load().then((font) => {
            document.fonts.add(font);
            log('load font successfully.');
            completion(true);
        });
        setTimeout(()=>{
            log('load font failed：timeout.');
            completion(false);
        },${this.timeout});
        null`, true)
    }

    async drawText(text, config) {
        // 配置
        const fontSize = config.fontSize || 20
        const textWidth = config.textWidth || 300
        const align = config.align || 'left' // left、right、center
        const lineLimit = config.lineLimit || 99
        const rowSpacing = config.rowSpacing || 0
        const textColor = config.textColor || 'white'
        const textArray = await this.cutText(text, fontSize, textWidth)

        let script = ''
        for (let i in textArray) {
            let content = textArray[i].str
            let length = textArray[i].len

            if (i >= lineLimit) break
            if (i == lineLimit - 1 && i < textArray.length - 1)
                content = content.replace(/(.{1})$/, '…')

            let x = 0, y = Number(i) * fontSize
            if (rowSpacing > 0 && i > 0) y = y + rowSpacing
            if (i > 0) {
                if (align === 'right') {
                    x = textWidth - length
                } else if (align === 'center') {
                    x = (textWidth - length) / 2
                }
            }
            script = script + `ctx.fillText("${content}", ${x}, ${y});`
        }

        const realWidth = textArray.length > 1 ? textWidth : textArray[0].len
        const lineCount = lineLimit < textArray.length ? lineLimit : textArray.length
        const returnValue = await this.webview.evaluateJavaScript(`
        canvas.width=${realWidth};
        ctx.font = "${fontSize}px ${this.fontFamily}";
        ctx.textBaseline= "hanging";
        baseHeight= ${(fontSize + rowSpacing) * (lineCount - 1)};
        extendHeight= ctx.measureText('qypgj').actualBoundingBoxDescent;
        canvas.height= baseHeight + extendHeight;
    
        ctx.font = "${fontSize}px ${this.fontFamily}";
        ctx.fillStyle = "${textColor}";
        ctx.textBaseline= "hanging";
        ${script}
        canvas.toDataURL()`, false)

        const imageDataString = returnValue.slice(22)
        const imageData = Data.fromBase64String(imageDataString)
        return Image.fromData(imageData)
    }

    async cutText(text, fontSize, textWidth) { // 处理文本
        return await this.webview.evaluateJavaScript(`
        function cutText(textWidth, text){
            ctx.font = "${fontSize}px ${this.fontFamily}";
            ctx.textBaseline= "hanging";
    
            let textArray=[];
            let len=0,str='';
            for(let i=0;i<text.length;i++){
                const char=text[i]
                const width=ctx.measureText(char).width;
                if(len < textWidth){
                    str=str+char;
                    len=len+width;
                }
                if(len == textWidth){
                    textArray.push({
                    str:str,len:len,
                    });
                    str='';
                    len=0;
                }
                if(len > textWidth){
                    textArray.push({
                    str:str.substring(0,str.length-1),
                    len:len-width,
                    });
                    str=char;
                    len=width;
                }
                if(i==text.length-1 && str){
                    textArray.push({
                    str:str,len:len,
                    });
                }
            }
            return textArray
        }
        cutText(${textWidth},"${text}")
        `)
    }
}

/*
** const cache=new Cache({
**   name: ['json', null, asyncFunction, array.length],
** })
** await cache.get('name')
**缓存配置：从左向右依次为数据名称、数据类型、缓存类型、异步更新函数、数组长度
**① 数据名称：缓存路径
**② 数据类型：顾名思义
**③ 缓存类型：有三种取值，如下所示
**   - null：即数据不会被缓存，每次调用脚本都会进行更新；
**   - 数字：即每隔多久进行一次更新，单位为分钟；
**   - 布尔值：即触发式更新。该模式下数据会被缓存，但只有值为true时才会进行数据更新。
**④ 异步更新函数：在更新数据时需要调用的异步函数；
**⑤ 数组大小：用于缓存数组数据。当缓存的数据是数组时，则必须填入数组的长度。
*/
class Cache {
    constructor(cacheList) {
        this.cacheList = cacheList
    }
    async get(key, ...args) {
        const cacheObj = this.cacheList[key]
        if (!cacheObj) { log(key + ` isn't cached.`); return }
        const [dataType, cacheType, update, arrayLength] = cacheObj

        if (cacheType === null) return await update(...args) // null

        let data = Storage.get(key, dataType, arrayLength)
        if (!data) { // get data the first time
            log('cache ' + key + ' the first time.')
            data = await update(...args)
            Storage.set(key, data, dataType, arrayLength)
            if (typeof cacheType === 'number') this.setUpdateTime(key)
            return data
        }

        if (typeof cacheType === 'number') { // update after the fixed time
            const lastTime = this.getLastUpdate(key)
            const nowTime = Math.floor(new Date().getTime() / 60000)
            if ((nowTime - lastTime) >= cacheType) {
                try {
                    log('update ' + key + '.')
                    data = await update(...args)
                    log('update ' + key + ' successfully.')
                } catch {
                    log('update ' + key + ' failed，use cache.')
                    return data
                }
                Storage.set(key, data, dataType, arrayLength)
                this.setUpdateTime(key)
            }
            return data
        }

        if (typeof cacheType === 'boolean') { // update when the condition is true
            if (cacheType) {
                try {
                    log('update ' + key + '.')
                    data = await update(...args)
                    log('update ' + key + ' successfully.')
                } catch {
                    log('update ' + key + ' failed，use cache.')
                    return data
                }
                Storage.set(key, data, dataType, arrayLength)
                cacheObj.cacheType = false
            }
            return data
        }

        log('wrong cacheType.')
        return null
    }
    getLastUpdate(key) {
        return Number(Storage.get(key + '_updateTime', 'string'))
    }
    setUpdateTime(key) {
        Storage.set(key + '_updateTime', String(Math.floor(new Date().getTime() / 60000)), 'string')
    }
    trigger(key) {
        const cacheType = this.cacheList[key][1]
        if (typeof cacheType === 'boolean')
            this.cacheList[key][1] = true
    }
    clearCache() {
        const cacheList = this.cacheList
        for (let key in cacheList) {
            const arrayLength = cacheList[key][3]
            Storage.remove(key, arrayLength || null)
        }
    }
}

class Storage {
    static set(key, data, type, arrayLength) {
        if (!data) { return }
        if (arrayLength) { // 存储类型为数组
            for (let i = 0; i < arrayLength; i++)
                Storage.set(key + '_' + i, data[i], type)
            return
        }
        const file = FileManager.local()
        const path = file.joinPath(file.documentsDirectory(), key)
        log('store ' + key + '.')
        switch (type) {
            case 'string':
                file.writeString(path, data)
                break
            case 'json':
                file.writeString(path, JSON.stringify(data))
                break
            case 'image':
                file.writeImage(path, data)
                break
            default:
                log('store ' + key + 'failed：wrong type.')
        }
    }
    static get(key, type, arrayLength) {
        if (arrayLength) {
            const dataArray = []
            for (let i = 0; i < arrayLength; i++) {
                const data = Storage.get(key + '_' + i, type)
                if (!data) return null
                dataArray.push(data)
            }
            return dataArray
        }
        const file = FileManager.local()
        const path = file.joinPath(file.documentsDirectory(), key)
        log('get ' + key + '.')
        if (!file.fileExists(path)) {
            log('get ' + key + ' failed：file not exist.')
            return null
        }
        switch (type) {
            case 'string':
                return file.readString(path)
            case 'json':
                return JSON.parse(file.readString(path))
            case 'image':
                return file.readImage(path)
            default:
                log('get ' + key + ' failed：wrong type.')
        }
    }
    static remove(key, arrayLength) {
        if (arrayLength) {
            for (let i = 0; i < arrayLength; i++)
                Storage.remove(key + '_' + i)
            return
        }
        const file = FileManager.local()
        const path = file.joinPath(file.documentsDirectory(), key)
        if (file.fileExists(path)) {
            file.remove(path)
        }
    }
}

class Context {
    constructor(data) {
        this.data = data || {}
    }
    push(newData) {
        let copyData = {}
        for (let k in this.data) {
            copyData[k] = this.data[k]
        }
        for (let k in newData) {
            copyData[k] = newData[k]
        }
        return new Context(copyData)
    }
    pop() {
        return this.data
    }
}

class WidgetQ {
    constructor(config) {
        this.template = config.template || {}
        this.data = config.data || {}
        this.component = config.component || {}
    }

    async show() {
        const type = config.widgetFamily
        if (type) {
            Script.setWidget(this.createWidget(type))
            return
        }
        const opts = ['small', 'medium', 'large']
        const funcs = ['presentSmall', 'presentMedium', 'presentLarge']
        const index = await Util.generateAlert('预览大小', opts)
        await this.createWidget(opts[index])[funcs[index]]()
    }

    createWidget(type) {
        return this.render(this.parse(this.template[type] || ''))
    }

    parse(labelText) {
        const regexp = {
            matchEndTag: /^<\/\s*([a-zA-Z]+)\s*>/,
            matchStartTag: /^<([a-zA-Z0-9]+)/,
            matchAttr: /^\s*([^\s"'<>\/=]+)(?:\s*=\s*(?:(true|false|null|undefined|NaN)|([0-9\.]+)|("[^"]*")|('[^']*')|(\{\{.*?\}\})))?/
        }
        let currentParent, last, index, match
        let stack = [], rootArray = []

        labelText = labelText.trim()
        while (last = labelText) {
            if (index = labelText.indexOf('<')) {
                match = labelText.substring(0, index)
                if (match.trim()) currentParent.children.push(match)
                go(index)
            } else {
                if (match = labelText.match(regexp.matchEndTag)) {
                    go(match[0].length)
                    for (let i = stack.length - 1; i >= 0; i--) {
                        if (stack[i].tagName === match[1]) {
                            stack.splice(i)
                            currentParent = stack[stack.length - 1]
                            break
                        }
                    }
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
            let rawAttrs = [], attrs = {}
            while (attrMatch = labelText.match(regexp.matchAttr)) {
                rawAttrs.push(attrMatch)
                go(attrMatch[0].length)
            }
            go(labelText.match(/^\s*>/)[0].length)

            if (rawAttrs.length !== 0) {
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

        function createTag(tagName, attrs) {
            return {
                tagName: tagName,
                attrs: attrs,
                children: []
            }
        }
    }

    render(rootArray) {
        const hdlFuncSet = {
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
                while (match = str.match(/\{\{.*?\}\}/)) {
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
        const ctx = new Context(this.data)
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

            const func = hdlFuncSet[me.tagName]
            if (func) { func(me, parent, ctx); return }

            const cpt = that.component[me.tagName] // component
            if (cpt) {
                that.parse(cpt.replace(/\{\{\s*?#([^\s]+)\s*?\}\}/g, (a, b) => {
                    return me.bind ? (me.bind[b] || null) : null
                })).forEach(ele => { pretreat(ele, parent, ctx) })
            } else log('<' + me.tagName + '> is a wrong tag type.')
        }

        function echo(exp, ctx) {
            if (typeof exp !== 'string') return exp // not string
            const match = exp.match(/\{\{\s*([^\s]+)\s*\}\}/)
            if (!match) return eval(exp) // not exp
            exp = match[1]
            let data = ctx.pop()
            let str = '{'
            if (Object.keys(data).length !== 0) {
                for (let k in data) { str += k + ',' }
                str = str.substring(0, str.length - 1) + '}'
            } else { str = '{}' }
            return new Function('data', `
                const ${str}={...data};
                return ${exp}
            `)(data)
        }

        function applyAttrs(ele, attrs, ctx) {
            for (let key in attrs) {
                if (!key) return
                that.getAttrFunc(key)?.apply(null, [ele].concat(echo(attrs[key], ctx)))
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
            spacing(obj, number) { obj.spacing = number },
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

module.exports = { WidgetQ, Cache, Util, Storage, CustomFont }