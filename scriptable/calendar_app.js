const { WidgetQ, Cache, Util, Storage, CustomFont } = importModule('wq_env')

/* *******UI配置****** */
const mediumUI = `
<widget bgColor={{Color.white()}}>
    <stack>
        <spacer>20</spacer>
        <stack vertical>
            <stack> 
                <image imageSize={{new Size(50,16)}} img={{imageL1}} filling tintColor={{new Color('#000000',0.5)}}></image>
                <spacer></spacer>
            </stack>
            <stack>
                <image imageSize={{new Size(100,58)}} img={{imageL2}} filling></image>
                <spacer></spacer>
            </stack>
            <spacer></spacer>
            <stack>
                <image imageSize={{new Size(50,16)}} img={{imageL3}} filling tintColor={{new Color('#000000',0.5)}}></image>
                <spacer></spacer>
            </stack>
            <stack>
                <image imageSize={{new Size(100,16)}} img={{imageL4}} filling tintColor={{new Color('#000000',0.5)}}></image>
                <spacer></spacer>
            </stack>
        </stack>
        <stack vertical>
            <spacer></spacer>
            <stack>
                <image imageSize={{new Size(130,40)}} img={{imageR1}} filling></image>
                <spacer></spacer>
            </stack>
            <spacer>5</spacer>
            <stack bgColor={{Color.red()}} size={{new Size(35,12)}} cornerRadius=3>
                <spacer></spacer>
                <image imageSize={{new Size(30,10)}} img={{imageR2}} filling></image>
                <spacer></spacer>
            </stack>
            <spacer></spacer>
        </stack>
    </stack>
</widget>`

/* *******缓存配置****** */
const cache = new Cache({
})

/* *******获取数据****** */
const font = new CustomFont(new WebView(), {
    fontFamily: 'customFont',
    fontUrl: 'url(https://gitee.com/lioudaking/font-library/raw/master/jf-openhuninn-1.1.ttf)',
    timeout: 20000,
})
await font.load()
const imageL1=await font.drawText('9 : 00',{
    'fontSize': 100,
    'textWidth': 600,
    'textColor': 'black',
})
const imageL2=await font.drawText('巳时',{
    'fontSize': 100,
    'textWidth': 600,
    'textColor': 'black',
})
const imageL3=await font.drawText('星期一',{
    'fontSize': 100,
    'textWidth': 600,
    'textColor': 'black',
})
const imageL4=await font.drawText('农历八月 初五',{
    'fontSize': 100,
    'textWidth': 900,
    'textColor': 'black',
})
const imageR1=await font.drawText('万物炽盛而出，霍然落之。',{
    fontSize: 100,
    textWidth: 700,
    lineLimit: 2,
    rowSpacing: 5,
    textColor: 'black',
})
const imageR2=await font.drawText('大落荒',{
    'fontSize': 100,
    'textWidth': 600,
    'textColor': 'white',
})

/* *******构造小组件****** */
const wq = new WidgetQ({
    data: { // 传入数据
        imageL1:imageL1,
        imageL2:imageL2,
        imageL3:imageL3,
        imageL4:imageL4,
        imageR1:imageR1,
        imageR2:imageR2,
    },
    template: {
        medium: mediumUI
    }
})
await wq.show()

// welcome
if (!config.runsInWidget) {
}

// 完成脚本
Script.complete()


/* ******异步更新函数集合****** */