const { WidgetQ, Cache } = importModule('wq_env')

/* ******组件配置****** */
const $ = {}

/* *******缓存配置****** */
const cache = new Cache({
    one_battery: ['image', true, drawBatteryCD],
    one_time: ['json', true, drawCircularCD]
})

/* *******UI配置****** */
const smallUI = `
<widget bgImg={{batteryImage}}>
    <stack size={{new Size(120,120)}} bgImg={{timeImage}}></stack>
</widget>`

/* *******获取数据****** */
const battery = await cache.get('one_battery')
const time = await cache.get('one_time', {
    radius: 200,
    now: new Date().getMinutes() * 100,
    max: 60 * 100,
    bgImg: await drawCircularCD({
        now: new Date().getHours() * 100,
        max: 24 * 100
    })
})

/* *******构造小组件****** */
const wq = new WidgetQ({
    data: { // 传入数据
        batteryImage: battery,
        timeImage: time,
    },
    template: {
        small: smallUI
    }
})

await wq.show()

// 完成脚本
Script.complete()

/* ******异步更新函数集合****** */
async function drawCircularCD(config) {
    const radius = config.radius || 150
    const pathWidth = config.pathWidth || 30
    const now = config.now || 0
    const max = config.max || 100
    const bgImg = config.bgImg

    const dctx = new DrawContext()
    const widthAndHeight = 2 * radius + pathWidth
    dctx.size = new Size(widthAndHeight, widthAndHeight)
    dctx.respectScreenScale = true
    dctx.opaque = false
    if (bgImg) dctx.drawImageAtPoint(bgImg,
        new Point((widthAndHeight - bgImg.size.width) / 2, (widthAndHeight - bgImg.size.height) / 2))

    dctx.setStrokeColor(new Color('#323741'))
    dctx.setLineWidth(pathWidth)
    dctx.strokeEllipse(new Rect(pathWidth / 2, pathWidth / 2, 2 * radius, 2 * radius))

    const startPoint = new Point(widthAndHeight / 2, pathWidth / 2)
    const pointArray = []
    for (let l = 0; l <= now; l++) {
        const degree = 2 * Math.PI * (l / max)
        const x = Math.sin(degree) * radius
        const y = (1 - Math.cos(degree)) * radius
        const point = new Point(startPoint.x + x, startPoint.y + y)
        pointArray.push(point)
    }
    const path = new Path()
    path.addLines(pointArray)
    dctx.addPath(path)
    dctx.setStrokeColor(new Color('#f47942'))
    dctx.strokePath(path)

    return dctx.getImage()
}

async function drawBatteryCD() {
    const width = 338 // 组件宽度:720
    const height = 338 // 组件高度:338
    const pathWidth = 20 // 路径宽度
    const cornerRadius = 23 // 拐角度数

    const battery = Device.batteryLevel()
    const dctx = new DrawContext()
    dctx.size = new Size(width, height)
    dctx.respectScreenScale = true
    dctx.opaque = false
    dctx.setLineWidth(pathWidth)

    const path1 = new Path()
    path1.addRoundedRect(new Rect(pathWidth / 2, pathWidth / 2,
        width - pathWidth, height - pathWidth), cornerRadius + 12, cornerRadius + 12)
    dctx.addPath(path1)
    dctx.setStrokeColor(new Color('#323741'))
    dctx.strokePath()

    const radius = cornerRadius + (pathWidth / 2) // 实际路径所在1/4圆的半径
    const circumference = Math.PI * radius / 2 // 实际路径所在1/4圆的周长
    const centerOffset = cornerRadius + pathWidth // 圆心距离边缘的距离
    const stepOne = width / 2 - centerOffset
    const stepTwo = stepOne + circumference
    const stepThree = stepTwo + (height - centerOffset * 2)
    const stepFour = stepThree + circumference
    const stepFive = stepFour + (width - centerOffset * 2)
    const stepSix = stepFive + circumference
    const stepSeven = stepSix + (height - centerOffset * 2)
    const stepEight = stepSeven + circumference
    const max = stepEight + width / 2 - centerOffset
    const batteryLevel = battery * max
    let pointArray = []
    for (let l = 0; l <= batteryLevel; l++)
        pointArray.push(computePoint(l))
    const path2 = new Path()
    path2.addLines(pointArray)
    dctx.addPath(path2)
    dctx.setStrokeColor(new Color('#45c48b'))
    dctx.strokePath()

    return dctx.getImage()

    function computePoint(length) {
        let x, y, degree
        if (length < stepOne) {
            x = width / 2 + length
            y = pathWidth / 2
        } else if (length < stepTwo) {
            degree = ((length - stepOne) * Math.PI) / (2 * circumference)
            x = width - centerOffset + (Math.sin(degree) * radius)
            y = pathWidth / 2 + ((1 - Math.cos(degree)) * radius)
        } else if (length < stepThree) {
            x = width - pathWidth / 2
            y = centerOffset + (length - stepTwo)
        } else if (length < stepFour) {
            degree = ((length - stepThree) * Math.PI) / (2 * circumference)
            x = width - pathWidth / 2 - ((1 - Math.cos(degree)) * radius)
            y = height - centerOffset + (Math.sin(degree) * radius)
        } else if (length < stepFive) {
            x = width - centerOffset - (length - stepFour)
            y = height - pathWidth / 2
        } else if (length < stepSix) {
            degree = ((length - stepFive) * Math.PI) / (2 * circumference)
            x = centerOffset - (Math.sin(degree) * radius)
            y = height - pathWidth / 2 - ((1 - Math.cos(degree)) * radius)
        } else if (length < stepSeven) {
            x = pathWidth / 2
            y = height - centerOffset - (length - stepSix)
        } else if (length < stepEight) {
            degree = ((length - stepSeven) * Math.PI) / (2 * circumference)
            x = pathWidth / 2 + ((1 - Math.cos(degree)) * radius)
            y = centerOffset - (Math.sin(degree) * radius)
        } else {
            x = centerOffset + (length - stepEight)
            y = pathWidth / 2
        }
        return new Point(x, y)
    }
}
