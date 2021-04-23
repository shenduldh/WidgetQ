class CustomFont {
    constructor(webview, config) {
        this.webview = webview || new WebView()
        this.fontFamily = config.fontFamily || 'customFont'
        this.fontUrl = config.fontUrl
        this.timeout = config.timeout || 20000
    }

    async load() { // 加载字体
        return await this.webview.evaluateJavaScript(`
        const customFont = new FontFace("${this.fontFamily}", "${this.fontUrl}");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let baseHeight,extendHeight;
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
        const scale = config.scale || 1

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
        canvas.width=${realWidth}*${scale};
        ctx.font = "${fontSize}px ${this.fontFamily}";
        ctx.textBaseline= "hanging";
        baseHeight= ${(fontSize + rowSpacing) * (lineCount - 1)};
        extendHeight= ctx.measureText('qypgj').actualBoundingBoxDescent;
        canvas.height= (baseHeight + extendHeight) * ${scale};
        ctx.scale(${scale}, ${scale});
    
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
                    textArray.push({str:str,len:len,});
                    str='';len=0;
                }
                if(len > textWidth){
                    textArray.push({
                    str:str.substring(0,str.length-1),
                    len:len-width,});
                    str=char;len=width;
                }
                if(i==text.length-1 && str){
                    textArray.push({str:str,len:len,});
                }
            }
            return textArray
        }
        cutText(${textWidth},"${text}")
        `)
    }
}

const font = new CustomFont(new WebView(), {
    fontFamily: 'customFont', // 字体名称
    fontUrl: 'url(https://lioudaking.coding.net/p/coding-code-guide/d/font-library/git/raw/master/GenSenRounded-B.ttc)', // 字体地址
    timeout: 60000, // 加载字体的超时时间
}) // 创建字体
await font.load() // 加载字体
const text = '这个字体好看吧!'
const image = await font.drawText(text, {
    fontSize: 30, // 字体大小
    textWidth: 300, // 文本宽度
    align: 'center', // left、right、center
    lineLimit: 1, // 文本行数限制
    rowSpacing: 5, // 文本间距
    textColor: 'white', // 文本颜色
    scale: 2, // 缩放因子
})

const wd = new ListWidget()
wd.backgroundColor = Color.blue()
const imgSpan = wd.addImage(image)
imgSpan.imageSize = new Size(image.size.width / 2, image.size.height / 2)
wd.presentMedium()
Script.complete()