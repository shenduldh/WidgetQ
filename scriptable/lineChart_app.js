const { WidgetQ, Cache, Util, Storage } = importModule('wq_env')

/* ******组件配置****** */
const $ = {
    // 彩云天气KEY
    apiKey: 'fk6tlJJDjVCqMD61',
    // 地理位置
    location: {
        lock: true, // 为true时只会使用自定义的经纬度
        data: {
            longitude: 100,
            latitude: 10,
            city: null,
            county: null,
        }
    },
    // 天气图标
    weatherIcons: {
        CLEAR_DAY: "sun.max.fill",
        CLEAR_NIGHT: "moon.stars.fill",
        PARTLY_CLOUDY_DAY: "cloud.sun.fill",
        PARTLY_CLOUDY_NIGHT: "cloud.moon.fill",
        CLOUDY: "cloud.fill",
        CLOUDY_NIGHT: "cloud.moon.fill",
        LIGHT_HAZE: "cloud.fog.fill",
        MODERATE_HAZE: "cloud.fog.fill",
        HEAVY_HAZE: "cloud.fog.fill",
        LIGHT_RAIN: "cloud.drizzle.fill",
        MODERATE_RAIN: "cloud.rain.fill",
        HEAVY_RAIN: "cloud.rain.fill",
        STORM_RAIN: "cloud.heavyrain.fill",
        FOG: "cloud.fog.fill",
        LIGHT_SNOW: "cloud.sleet.fill",
        MODERATE_SNOW: "cloud.snow.fill",
        HEAVY_SNOW: "cloud.snow.fill",
        STORM_SNOW: "snow",
        DUST: "cloud.fog.fill",
        SAND: "cloud.fog.fill",
        WIND: "wind",
    },
    // 底栏图标
    bottomIcons: [
        "https://stickershop.line-scdn.net/sticonshop/v1/sticon/5e156074040ab1eeafb83e32/iPhone/029.png",
        "https://stickershop.line-scdn.net/sticonshop/v1/sticon/5e156074040ab1eeafb83e32/iPhone/013.png",
        "https://stickershop.line-scdn.net/sticonshop/v1/sticon/5e156074040ab1eeafb83e32/iPhone/019.png",
        "https://stickershop.line-scdn.net/sticonshop/v1/sticon/5e156074040ab1eeafb83e32/iPhone/031.png",
        "https://stickershop.line-scdn.net/sticonshop/v1/sticon/5e156074040ab1eeafb83e32/iPhone/032.png",
        "https://stickershop.line-scdn.net/sticonshop/v1/sticon/5e156074040ab1eeafb83e32/iPhone/020.png",
        "https://stickershop.line-scdn.net/sticonshop/v1/sticon/5e156074040ab1eeafb83e32/iPhone/014.png",
        "https://stickershop.line-scdn.net/sticonshop/v1/sticon/5e156074040ab1eeafb83e32/iPhone/030.png"
    ],
    // 右上角大图
    rightUpImageUrls: [
        "https://stickershop.line-scdn.net/sticonshop/v1/sticon/5e156074040ab1eeafb83e32/iPhone/022.png",
        "https://stickershop.line-scdn.net/stickershop/v1/sticker/20573105/iPhone/sticker@2x.png",
        "https://stickershop.line-scdn.net/stickershop/v1/sticker/18247815/iPhone/sticker@2x.png",
        "https://stickershop.line-scdn.net/stickershop/v1/sticker/27533217/iPhone/sticker@2x.png",
        "https://stickershop.line-scdn.net/stickershop/v1/sticker/15535205/iPhone/sticker@2x.png",
        "https://stickershop.line-scdn.net/stickershop/v1/sticker/139754356/iPhone/sticker@2x.png"
    ],
    // 星期名称和月份名称
    weekName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'FeOctb', 'Nov', 'Dec'],
    // 折线图
    lineChart: {
        iconSize: null, // 图标大小
        iconCount: null, // 图标数量
        iconLeftOffset: null, // 图标向左偏移距离
        iconUpOffset: null, // 图标向上偏移距离

        textLeftOffset: null, // 文字向左偏移距离
        textUpOffset: null, // 文字向上偏移距离
        textSize: null, // 字体大小
        textColor: Color.white(),// 字体颜色
        textFont: 'AlNile-Bold',// 字体类型

        lineWidth: null,// 折线宽度
        // 折线颜色：日出前、日落前、日落后
        lineColor: [Color.yellow(), Color.black(), Color.blue()],

        margin_top: 80, // 折线图距离组件上边缘的距离
        margin_bottom: 40, // 折线图距离组件下边缘的距离
        margin_left: 20, // 折线图距离组件左边缘的距离
        margin_rigth: 30, // 折线图距离组件右边缘的距离
    },
    // 背景图
    bgImg: {
        blurColor: null, // 背景遮罩颜色，形式为#FFFFFF
        blurLevel: 0, // 值越大越背景模糊，当值为1时就是纯色背景
    },
}

/* *******缓存配置****** */
const cache = new Cache({
    location: ['json', null, getLocation],
    lineChart: ['image', null, getLineChart],
    bottomIcons: ['image', false, getBottomIcons, 8],
    rightUpImage: ['image', false, getRightUpImage],
    wether: ['json', null, getWeather],
    bgImg: ['image', false, getBgImg],
    date: ['json', null, getDate],
})

/* *******UI配置****** */
const mediumUI = `
<widget bgImg={{lineChart}}>
    <stack vertical>
        <stack>
            <stack vertical>
                <stack centerAlignContent>
                    <text font={{Font.systemFont(18)}} textColor={{Color.yellow()}}>{{temp}}℃</text>
                    <text font={{Font.systemFont(12)}} textColor={{Color.yellow()}}>|{{comfort}}</text>
                </stack>
                <text font={{Font.systemFont(14)}}>{{date.week}}.{{date.month}}.{{date.day}}</text>
                <spacer></spacer>
            </stack>
            <spacer></spacer>
            <stack vertical size={{new Size(60,60)}}>
                <image imageSize={{new Size(70,70)}} img={{rightUpImage}}></image>
                <spacer></spacer>
            </stack>
        </stack>
        <spacer></spacer>
    </stack>

    <spacer>50</spacer>

    <stack vertical>
        <spacer></spacer>
        <stack>
            <image imageSize={{new Size(40,40)}} img={{bottomIcons[0]}}></image>
            <image imageSize={{new Size(40,40)}} img={{bottomIcons[1]}}></image>
            <image imageSize={{new Size(40,40)}} img={{bottomIcons[2]}}></image>
            <image imageSize={{new Size(40,40)}} img={{bottomIcons[3]}}></image>
            <image imageSize={{new Size(40,40)}} img={{bottomIcons[4]}}></image> 
            <image imageSize={{new Size(40,40)}} img={{bottomIcons[5]}}></image>       
            <image imageSize={{new Size(40,40)}} img={{bottomIcons[6]}}></image>     
            <image imageSize={{new Size(40,40)}} img={{bottomIcons[7]}}></image>
        </stack>
    </stack>
</widget>`

// 获取数据
const location = await cache.get('location')
$.location.data = location
const bgImg = await cache.get('bgImg')
const wetherData = await cache.get('wether')
const date = await cache.get('date')
const lineChart = await cache.get('lineChart', bgImg, wetherData, date)
const rightUpImage = await cache.get('rightUpImage')
const bottomIcons = await cache.get('bottomIcons')

// 构造小组件
const wq = new WidgetQ({
    data: { // 需要传入到小组件的数据
        lineChart: lineChart,
        bottomIcons: bottomIcons,
        rightUpImage: rightUpImage,
        temp: Math.floor(wetherData.temp),
        comfort: wetherData.comfort,
        date: date
    },
    template: {
        medium: mediumUI
    }
})

// welcome
if (!config.runsInWidget) {
    await welcome(wq.show.bind(wq), cache)
} else {
    await wq.show()
}

// 完成脚本
Script.complete()

/* ******异步更新函数集合****** */
async function getLocation() {
    if ($.location.lock) return $.location.data
    const here = await Location.current()
    const geoCode = await Location.reverseGeocode(here.latitude, here.longitude, 'zh_cn')
    const geo = geoCode[0]
    return {
        longitude: here.longitude,
        latitude: here.latitude,
        city: geo.locality,
        county: geo.subLocality,
    }
}

async function getLineChart(bgImg, whetherData, date) {
    const config = $.lineChart
    const iconSize = config.iconSize || 32
    const iconCount = config.iconCount || 8
    const textSize = config.textSize || 20

    // 图标、字体偏移设置
    const iconLeftOffset = config.iconLeftOffset || iconSize / 2
    const iconUpOffset = config.iconUpOffset || iconSize / 2
    const textLeftOffset = config.textLeftOffset || textSize / 3
    const textUpOffset = config.textUpOffset || (iconSize / 2 + textSize)

    // 设置画笔
    const width = bgImg.size.width
    const height = bgImg.size.height
    const dctx = new DrawContext()
    dctx.size = new Size(width, height)
    dctx.respectScreenScale = true
    dctx.drawImageInRect(bgImg, new Rect(0, 0, width, height))
    dctx.setLineWidth(config.lineWidth || 3)
    dctx.setTextColor(config.textColor)
    dctx.setFont(new Font(config.textFont, textSize))
    // 根据日出日落更换折线颜色
    const sunrise = Number(whetherData.sunrise.split(':')[0])
    const sunset = Number(whetherData.sunset.split(':')[0])
    const currentHour = Number(date.hour)
    if (currentHour < sunrise) {
        dctx.setStrokeColor(config.lineColor[0])
    } else if (sunrise <= currentHour && currentHour < sunset) {
        dctx.setStrokeColor(config.lineColor[1])
    } else if (sunset <= currentHour) {
        dctx.setStrokeColor(config.lineColor[2])
    }

    // 获取数据
    const hourly = whetherData.hourly
    const temps = hourly.temps.slice(0, iconCount)
    const icons = hourly.icons.slice(0, iconCount)
    const maxTemp = Math.max(...temps)
    const minTemp = Math.min(...temps)

    // 调整间距
    const margin_top = config.margin_top
    const margin_bottom = config.margin_bottom
    const margin_left = config.margin_left
    const margin_rigth = config.margin_rigth
    const xSP = Math.max(iconSize, textSize) / 2 + margin_left
    const xEP = width - (Math.max(iconSize, textSize) / 2 + margin_rigth)
    const xL = (xEP - xSP) / (iconCount - 1)
    const ySP = textSize + iconSize / 2 + margin_top
    const yEP = height - (iconSize / 2 + margin_bottom)
    const yL = (yEP - ySP) / (Math.round(maxTemp - minTemp) + 1)

    // 画折线
    const points = temps.map((temp, index) => {
        return new Point(xSP + index * xL, ySP + (maxTemp - temp) * yL)
    })

    const path = new Path()
    path.addLines(points)
    dctx.addPath(path)
    dctx.strokePath()

    // // 如果我们要改变折线的颜色，就必须重新改变画笔的颜色
    // dctx.setStrokeColor(Color.purple()) // 这样就把画笔改为了蓝色
    // // 然后按照上面的方法进行绘制
    // const path1 = new Path()
    // const points4 = points.slice(0, 4) // 首先获取前四个点的坐标
    // path1.addLines(points4) // 然后将这四个点连成一条线
    // dctx.addPath(path1) // 将这条线添加到画笔的路径中
    // dctx.strokePath() // 用画笔将这条线画出来
    // // 完成

    const wic = new weatherIconCache()
    // 画天气描述
    for (let i in points) {
        const temp = Math.round(temps[i]) + '°'
        dctx.drawText(temp,
            new Point(points[i].x - textLeftOffset, points[i].y - textUpOffset))

        const iconUrl = $.weatherIcons[icons[i]]
        let iconImg, wetherIcon = SFSymbol.named(iconUrl)
        if (wetherIcon) { // 系统图标
            wetherIcon.applyFont(Font.systemFont(iconSize))
            iconImg = wetherIcon.image
        } else { // 非系统图标
            const key = iconUrl.match(/\/{1}([^\/]+)$/)[1]
            iconImg = wic.get(key)
            if (!iconImg) { // 没有被缓存
                iconImg = await Util.request(iconUrl, {
                    dataType: 'image'
                })
                wic.set(key, iconImg)
            }
            if (iconImg.size.width !== iconSize || iconImg.size.heigth !== iconSize) {
                iconImg = Util.resizeImage(iconImg, iconSize, iconSize)
            }
        }
        dctx.drawImageAtPoint(iconImg,
            new Point(points[i].x - iconLeftOffset, points[i].y - iconUpOffset))
    }
    wic.saveList()
    return dctx.getImage()
}

async function getWeather() {
    const apiKey = $.apiKey
    const longitude = $.location.data.longitude
    const latitude = $.location.data.latitude
    const url = `https://api.caiyunapp.com/v2.5/${apiKey}/${longitude},${latitude}/weather.json`
    const data = await Util.request(url, {
        handler: response => {
            return {
                temp: response.result.realtime.temperature,
                comfort: response.result.realtime.life_index.comfort.desc,
                sunrise: response.result.daily.astro[0].sunrise.time,
                sunset: response.result.daily.astro[0].sunset.time,
                hourly: {
                    temps: response.result.hourly.temperature.map(temp => {
                        return temp.value
                    }),
                    icons: response.result.hourly.skycon.map(icon => {
                        return icon.value
                    })
                }
            }
        }
    })
    return data
}

async function getBottomIcons() {
    const urls = $.bottomIcons
    const data = []
    for (let url of urls) {
        const resp = await Util.request(url, {
            dataType: 'image'
        })
        data.push(resp)
    }
    return data
}

async function getRightUpImage() {
    const len = $.rightUpImageUrls.length
    const url = $.rightUpImageUrls[Math.round(Math.random() * len)]
    const data = await Util.request(url, {
        dataType: 'image'
    })
    return data
}

async function getDate() {
    const date = new Date()
    const week = $.weekName[date.getDay()]
    const month = $.monthName[date.getMonth()]
    const hour = date.getHours()
    const min = date.getMinutes()
    const day = date.getDate()
    return { week, month, day, hour, min }
}

async function getBgImg() {
    await Util.generateAlert('选择你的背景截图', ['好的'])
    let img
    try { img = await Photos.fromLibrary() } catch { return null }

    let height = img.size.height
    let phone = Util.getPhoneSize(height)
    if (!phone) {
        await Util.generateAlert('非iPhone屏幕截图或不支持您的iPhone!', ['好的'])
        return null
    }

    let result = await Util.generateAlert('选择组件大小', ['Small', 'Medium', 'Large'])
    let crop = { x: '', y: '', w: '', h: '' }
    if (result === 0) { // Small
        crop.w = phone.small
        crop.h = phone.small
        let positions = ['Top left', 'Top right', 'Middle left', 'Middle right', 'Bottom left', 'Bottom right']
        let position = await Util.generateAlert('选择组件位置', positions)
        let keys = positions[position].toLowerCase().split(' ')
        crop.y = phone[keys[0]]
        crop.x = phone[keys[1]]

    } else if (result === 1) { // Medium
        crop.w = phone.medium
        crop.h = phone.small
        crop.x = phone.left
        let positions = ['Top', 'Middle', 'Bottom']
        let position = await Util.generateAlert('选择组件位置', positions)
        let key = positions[position].toLowerCase()
        crop.y = phone[key]

    } else if (widgetSize === 2) { // Large
        crop.w = phone.medium
        crop.h = phone.large
        crop.x = phone.left
        let positions = ['Top', 'Bottom']
        let position = await Util.generateAlert('选择组件位置', positions)
        crop.y = position ? phone.middle : phone.top
    }

    await Util.generateAlert('背景设置完成.', ['好的'])
    img = Util.cropImage(img, crop.x, crop.y, crop.w, crop.h)
    return Util.blurImage(img, $.bgImg.blurLevel, $.bgImg.blurColor)
}

/* ******天气图标缓存****** */
function weatherIconCache() {
    this.key = 'WICL'
    this.list = Storage.get(this.key, 'json') || []
    this.set = (key, data) => {
        Storage.set(key, data, 'image')
        if (this.exist(key)) return
        this.list.push(key)
    }
    this.get = (key) => {
        if (!this.exist(key)) return null
        return Storage.get(key, 'image')
    }
    this.saveList = () => {
        Storage.set(this.key, this.list, 'json')
    }
    this.exist = (key) => {
        if (this.list.indexOf(key) >= 0) return true
        return false
    }
    this.clear = () => {
        for (let key of this.list)
            Storage.remove(key)
        this.list = []
        this.saveList()
    }
}

/* ******welcome****** */
async function welcome(show, cache) {
    let result = await Util.generateAlert('Welcome!', ['预览组件', '更换背景', '清理缓存', '清理天气图标缓存', '取消'])
    if (result === 0) await show()
    if (result === 1) {
        cache.trigger('bgImg')
        cache.get('bgImg')
    }
    if (result === 2) {
        cache.clearCache()
    }
    if (result === 3) {
        new weatherIconCache().clear()
    }
}