
    class Context {
        constructor(data) {
            this.data = data || {};
        }
        push(newData) {
            let copyData = {};
            for (let k in this.data) {
                copyData[k] = this.data[k];
            }
            for (let k in newData) {a
                copyData[k] = newData[k];
            }
            return new Context(copyData);
        }
        pop() {
            return this.data;
        }
    }
    
    class Render {
        constructor(ast) {
            this.ast = ast;
        }
    
        async show() {
            const type = config.widgetFamily;
            if (type) {
                Script.setWidget(this.render(ast));
                return;
            }
            const opts = ['small', 'medium', 'large'];
            const funcs = ['presentSmall', 'presentMedium', 'presentLarge'];
            const index = await generateAlert('预览大小', opts);
            await this.render(ast)[funcs[index]]();
        }
    
        render(ast) {
            const hdlFuncSet = {
                stack(me, parent, ctx) {
                    const stack = parent.addStack();
                    applyAttrs(stack, me.attrs, ctx);
                    me.children.forEach(child => {
                        process(child, stack, ctx);
                    });
                },
                image(me, parent, ctx) {
                    const imageData = Data.fromBase64String(me.children[0]);
                    const image = Image.fromData(imageData);
                    applyAttrs(parent.addImage(image), me.attrs, ctx);
                },
                text(me, parent, ctx) {
                    let match,
                        array = [],
                        str = me.children[0];
                    while ((match = str.match(/\{\{.*?\}\}/))) {
                        array.push(str.substring(0, match.index));
                        array.push(echo(match[0], ctx));
                        str = str.substring(match.index + match[0].length);
                    }
                    array.push(str);
                    applyAttrs(parent.addText(array.join('')), me.attrs, ctx);
                },
                date(me, parent, ctx) {
                    applyAttrs(parent.addDate(new Date(echo(me.attrs.date, ctx))), me.attrs, ctx);
                },
                spacer(me, parent, ctx) {
                    parent.addSpacer(echo(me.children[0] || null, ctx));
                },
            };
            const that = this;
            const ctx = new Context({});
            const root = ast;
            const widget = new ListWidget();
            applyAttrs(widget, root.attrs, ctx);
            root.children.forEach(child => process(child, widget, ctx));
            return widget;
    
            function process(me, parent, ctx) {
                const func = hdlFuncSet[me.tagName];
                func && func(me, parent, ctx);
            }
    
            function echo(exp, ctx) {
                if (typeof exp !== 'string') return exp; // not string
                const match = exp.match(/\{\{\s*([^\s]+)\s*\}\}/);
                if (!match) return exp; // not exp
                exp = match[1];
                const data = ctx.pop();
                let str = '{';
                if (Object.keys(data).length !== 0) {
                    for (let k in data) {
                        str += k + ',';
                    }
                    str = str.substring(0, str.length - 1) + '}';
                } else {
                    str = '{}';
                }
                return new Function(
                    'data',
                    `const ${str}={...data};return ${exp};`
                )(data);
            }
    
            function applyAttrs(ele, attrs, ctx) {
                for (let key in attrs) {
                    if (!key) return;
                    that.getAttrFunc(key)?.apply(null, [ele].concat(echo(attrs[key], ctx)));
                }
            }
        }
    
        getAttrFunc(key) {
            console.log("======" + key + "======")
            return {
                // property:
                // widget、stack
                backgroundColor(obj, color) {
                    obj.backgroundColor = new Color(color);
                },
                backgroundGradient(obj, gradVal) {
                    if (gradVal.colors === "" || gradVal.locations === "") return;
                    const lg = new LinearGradient()
                    lg.colors = gradVal.colors.split(',').map(c => new Color(c))
                    lg.locations = gradVal.locations.split(',').map(l => Number(l))
                    lg.startPoint = new Point(0, 0)
                    lg.endPoint = new Point(Math.sin(gradVal.angle), Math.cos(gradVal.angle))
                    obj.backgroundGradient = lg;
                },
                bgImageDate(obj, base64ImageDate) {
                    const imageDate = Data.fromBase64String(base64ImageDate)
                    const image = Image.fromData(imageDate)
                    obj.backgroundImage = image;
                },
                spacing(obj, number) {
                    obj.spacing = number;
                },
                // stack
                size(obj, size) {
                    obj.size = new Size(size.width, size.height);
                },
                // widget
                refreshAfterDate(obj, date) {
                    obj.refreshAfterDate = new Date(date);
                },
                // common
                url(obj, url) {
                    obj.url = url;
                },
                // text、date
                font(obj, font) {
                    obj.font = new Font(font.type, font.size);
                },
                lineLimit(obj, number) {
                    obj.lineLimit = number;
                },
                minimumScaleFactor(obj, number) {
                    obj.minimumScaleFactor = number;
                },
                shadowColor(obj, color) {
                    obj.shadowColor = new Color(color);
                },
                shadowOffset(obj, offset) {
                    obj.shadowOffset = new Point(offset.x, offset.y);
                },
                shadowRadius(obj, radius) {
                    obj.shadowRadius = radius;
                },
                textColor(obj, color) {
                    obj.textColor = new Color(color);
                },
                textOpacity(obj, opacity) {
                    obj.textOpacity = opacity;
                },
                // stack、image
                borderColor(obj, color) {
                    obj.borderColor = new Color(color);
                },
                borderWidth(obj, width) {
                    obj.borderWidth = width;
                },
                cornerRadius(obj, radius) {
                    obj.cornerRadius = radius;
                },
                // image
                containerRelativeShape(obj, bool) {
                    obj.containerRelativeShape = bool;
                },
                imageOpacity(obj, opacity) {
                    obj.imageOpacity = opacity;
                },
                imageSize(obj, size) {
                    if (size.width > 0 && size.height > 0)
                        obj.imageSize = new Size(size.width, size.height);
                },
                resizable(obj, bool) {
                    obj.resizable = bool;
                },
                tintColor(obj, color) {
                    obj.tintColor = new Color(color);
                },
                // methods:
                // stack、widget
                padding(obj, padding) {
                    obj.setPadding(padding.top, padding.left, padding.bottom, padding.right);
                },
                // stack
                alignContent(obj, type) {
                    const typeMap = {
                        'flex-start': 'topAlignContent',
                        'flex-end': 'bottomAlignContent',
                        'center': 'centerAlignContent',
                    }
                    obj[typeMap[type]]()
                },
                layout(obj, type) {
                    const typeMap = {
                        width: 'layoutHorizontally',
                        height: 'layoutVertically'
                    }
                    obj[typeMap[type]]()
                },
                // text、date
                alignText(obj, type) {
                    const typeMap = {
                        'flex-start': 'leftAlignText',
                        'flex-end': 'rightAlignText',
                        'center': 'centerAlignText',
                    }
                    obj[typeMap[type]]()
                },
                // Image
                alignImage(obj, type) {
                    const typeMap = {
                        'flex-start': 'leftAlignImage',
                        'flex-end': 'rightAlignImage',
                        'center': 'centerAlignImage',
                    }
                    obj[typeMap[type]]()
                },
                contentMode(obj, type) {
                    const typeMap = {
                        fit: 'applyFittingContentMode',
                        fill: 'applyFillingContentMode',
                    }
                    obj[typeMap[type]]()
                },
                // date
                style(obj, type) {
                    const typeMap = {
                        date: 'applyDateStyle',
                        time: 'applyTimeStyle',
                        timer: 'applyTimerStyle',
                        relative: 'applyRelativeStyle',
                        offset: 'applyOffsetStyle',
                    }
                    obj[typeMap[type]]()
                }
            }[key];
        }
    }
    
    async function generateAlert(message, options) {
        let alert = new Alert();
        alert.message = message;
        for (const option of options) {
            alert.addAction(option);
        }
        return await alert.presentAlert();
    }
    
    const ast = JSON.parse('{"tagName":"widget","attrs":{"backgroundColor":"#000","backgroundGradient":{"colors":"","locations":"","angle":90},"backgroundImage":"","spacing":0,"padding":{"top":20,"left":20,"bottom":20,"right":20},"url":"","refreshAfterDate":"","bgImageDate":""},"children":[{"tagName":"stack","attrs":{"size":{"width":0,"height":0},"backgroundColor":"","backgroundGradient":{"colors":"","locations":"","angle":90},"backgroundImage":"","borderColor":"#fff","borderWidth":0,"cornerRadius":0,"spacing":0,"padding":{"top":0,"left":0,"bottom":0,"right":0},"url":"","layout":"width","alignContent":"flex-start","bgImageDate":""},"children":[{"tagName":"spacer","attrs":{"length":0},"children":[0]},{"tagName":"text","attrs":{"text":"可视化创建组件","font":{"size":16,"type":""},"shadowColor":"#000","shadowOffset":{"x":0,"y":0},"shadowRadius":0,"textColor":"#fff","textOpacity":1,"lineLimit":0,"url":"","alignText":"flex-start","minimumScaleFactor":1},"children":["可视化创建组件"]},{"tagName":"spacer","attrs":{"length":0},"children":[0]}]},{"tagName":"image","attrs":{"image":"./test1.jpg","borderColor":"#000","borderWidth":0,"imageOpacity":1,"cornerRadius":0,"imageSize":{"width":0,"height":0},"tint":{"color":"#000","opacity":0},"contentMode":"fit","alignImage":"center","url":"","containerRelativeShape":false,"resizable":true},"children":["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"]},{"tagName":"stack","attrs":{"size":{"width":0,"height":0},"backgroundColor":"","backgroundGradient":{"colors":"","locations":"","angle":90},"backgroundImage":"","borderColor":"#fff","borderWidth":0,"cornerRadius":0,"spacing":0,"padding":{"top":0,"left":0,"bottom":0,"right":0},"url":"","layout":"width","alignContent":"flex-start","bgImageDate":""},"children":[{"tagName":"spacer","attrs":{"length":0},"children":[0]},{"tagName":"text","attrs":{"text":"快速","font":{"size":16,"type":""},"shadowColor":"#000","shadowOffset":{"x":0,"y":0},"shadowRadius":0,"textColor":"#fff","textOpacity":1,"lineLimit":0,"url":"","alignText":"flex-start","minimumScaleFactor":1},"children":["快速"]},{"tagName":"spacer","attrs":{"length":0},"children":[0]},{"tagName":"text","attrs":{"text":"便捷","font":{"size":16,"type":""},"shadowColor":"#000","shadowOffset":{"x":0,"y":0},"shadowRadius":0,"textColor":"#fff","textOpacity":1,"lineLimit":0,"url":"","alignText":"flex-start","minimumScaleFactor":1},"children":["便捷"]},{"tagName":"spacer","attrs":{"length":0},"children":[0]}]}]}')
    const render = new Render(ast)
    await render.show()
    Script.complete()    
    