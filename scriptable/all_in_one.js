class Get {
    static async vocabulary() {
        const uid = 11380
        const appkey = 'd712934cd05ccd44ba80106ae4f67631'
        const class_id = 65700
        const course = Math.round(Math.random() * 274)
        const url = `http://rw.ylapi.cn/reciteword/wordlist.u?uid=${uid}&appkey=${appkey}&class_id=${class_id}&course=${course}`
        const data = await request(url, 'json', null, (response) => {
            const items = response.datas
            const item = items[Math.round(Math.random() * (items.length - 1))]
            return {
                word: item.name,
                explain: item.desc
            }
        })
        return data
    }
    static async poem() {
        const url = 'https://v2.jinrishici.com/sentence'
        const data = await request(url, 'json', {
            'X-User-Token': 'dIUSa91HA/8jYO8/j8XR4FPmvaAaZE+w' // 打开网址https://v2.jinrishici.com/info获取key
        }, (response) => {
            return {
                'content': response.data.content,
                'title': response.data.origin.title,
                'author': response.data.origin.author,
                'dynasty': response.data.origin.dynasty,
            }
        })
        return data
    }
    static async idiom() {
        const url = 'https://apiv3.shanbay.com/weapps/dailyquote/quote/'
        const data = await request(url, 'json')
        return data.content
    }
    static async weather() {
        const CaiYunKey = 'fk6tlJJDjVCqMD61'
        const url = `https://api.caiyunapp.com/v2.5/${CaiYunKey}/${location.data.longitude},${location.data.latitude}/weather.json`
        const data = await request(url, 'json', null, (response) => {
            const dailyTemp = response.result.daily.temperature
            const dailyIcon = response.result.daily.skycon
            let dailyArray = [{}, {}, {}, {}]
            for (const i in dailyArray) {
                dailyArray[i] = {
                    'time': weekTitle[(now.week + Number(i)) % 7],
                    'temp': Math.round(dailyTemp[i].avg),
                    'icon': dailyIcon[i].value
                }
            }
            return {
                'daily': dailyArray,
                'description': response.result.forecast_keypoint
            }
        })
        return data
    }
    static async bgImg() {
        let message = "选择背景模式"
        let response = await generateAlert(message, ["照片背景", "透明背景"])
        if (!response) {
            let img = await Photos.fromLibrary()
            message = '完成!'
            await generateAlert(message, ['好的'])
            return getBlurImage(img, 0.5)
        } else {
            const img = await Photos.fromLibrary()
            const height = img.size.height
            const phoneSize = getPhoneSizes()[height]
            if (!phoneSize) {
                message = '非iPhone屏幕截图或不支持您的iPhone!'
                await generateAlert(message, ['好的'])
                return new Image()
            }
            message = '您的组件在什么位置？'
            const position = await generateAlert(message, ['顶部', '底部'])
            let crop = { w: '', h: '', x: '', y: '' }
            crop.w = phoneSize.中号
            crop.h = phoneSize.大号
            crop.x = phoneSize.左边
            crop.y = position ? phoneSize.中间 : phoneSize.顶部
            const imgCrop = cropImage(img, new Rect(crop.x, crop.y, crop.w, crop.h))

            message = '完成!'
            await generateAlert(message, ['好的'])
            return imgCrop
        }
    }
}

class Cache {
    constructor(cacheList) {
        /* 各参数按顺序含义如下：
        ** ① dataType：数据类型（string、json、image）
        ** ② cacheType：缓存类型
        **    null：不启用缓存
        **    intNum：启用缓存，每隔intNum分钟更新一次
        **    bool：启用缓存，值为true时进行更新，值为false时仅从缓存读取数据
        ** ③ updateFunc：异步更新函数
        */
        this.cacheList = cacheList
    }
    async get(key) {
        const cacheObj = this.cacheList[key]
        if (!cacheObj) { log(key + ` isn't cached.`); return }
        const [dataType, cacheType, update] = cacheObj

        if (cacheType === null) return await update() // null
        let data = Storage.get(key, dataType)
        if (!data) { // get data the first time
            data = await update()
            Storage.set(key, data, dataType)
            if (typeof cacheType === 'number') this.setUpdateTime(key)
            return data
        }
        if (typeof cacheType === 'number') { // update after the fixed time
            const lastTime = this.getLastUpdate(key)
            const nowTime = Math.floor(new Date().getTime() / 60000)
            if ((nowTime - lastTime) >= cacheType) {
                data = await update()
                Storage.set(key, data, dataType)
                this.setUpdateTime(key)
            }
            return data
        }
        if (typeof cacheType === 'boolean') { // update when the condition is true
            if (cacheType) {
                data = await update()
                Storage.set(key, data, dataType)
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
}

class Storage {
    static set(key, data, type) {
        const file = FileManager.local()
        const path = file.joinPath(file.documentsDirectory(), key)
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
    static get(key, type) {
        const file = FileManager.local()
        const path = file.joinPath(file.documentsDirectory(), key)
        if (!file.fileExists(path)) {
            log('get ' + key + ' failed：file not exist.')
            return false
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
    static remove(key) {
        const file = FileManager.local()
        const path = file.joinPath(file.documentsDirectory(), key)
        if (file.fileExists(path)) {
            file.remove(path)
        }
    }
}

// config:
let location = {
    lock: true,
    data: {
        'longitude': 116.061,
        'latitude': 24.277,
        'city': '梅州市',
        'county': '梅县区',
    }
}

const textConfig = {
    color: '#EFEFFB',
    font: 'systemFont',
}

const weekTitle = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const date = new Date()
const now = {
    'year': date.getFullYear(),
    'month': date.getMonth() + 1,
    'day': date.getDate(),
    'week': date.getDay(),
    'hours': date.getHours(),
}

const greetingText = {
    nightGreeting: "👿 Sleep.",
    morningGreeting: "🤪 Morning.",
    noonGreeting: "😐 Noon.",
    afternoonGreeting: "📖 Afternoon.",
    eveningGreeting: "📚 Evening."
}

const weatherIcons = {
    SUNRISE: "sunrise.fill",
    CLEAR_DAY: "sun.max.fill",
    CLEAR_NIGHT: "sun.max.fill",
    PARTLY_CLOUDY_DAY: "cloud.sun.fill",
    PARTLY_CLOUDY_NIGHT: "cloud.sun.fill",
    CLOUDY: "cloud.fill",
    LIGHT_HAZE: "sun.haze.fill",
    MODERATE_HAZE: "sun.haze.fill",
    HEAVY_HAZE: "sun.haze.fill",
    LIGHT_RAIN: "cloud.drizzle.fill",
    MODERATE_RAIN: "cloud.rain.fill",
    HEAVY_RAIN: "cloud.rain.fill",
    STORM_RAIN: "cloud.heavyrain.fill",
    FOG: "cloud.fog.fill",
    LIGHT_SNOW: "cloud.snow.fill",
    MODERATE_SNOW: "cloud.snow.fill",
    HEAVY_SNOW: "cloud.snow.fill",
    STORM_SNOW: "wind.snow.fill",
    DUST: "cloud.dust.fill",
    SAND: "cloud.dust.fill",
    WIND: "cloud.wind.fill",
    SUNSET: "sunset.fill",
}

await getLocation()
const cache = new Cache({
    bgImg: ['image', false, Get.bgImg],
    vocabulary: ['json', 10, Get.vocabulary],
    poem: ['json', 30, Get.poem],
    idiom: ['json', 1040, Get.idiom],
    weather: ['json', 30, Get.weather],
})

const bgImg = await cache.get('bgImg')
const vocabulary = await cache.get('vocabulary')
const poem = await cache.get('poem')
const idiom = await cache.get('idiom')
const weatherDate = await cache.get('weather')

const todos = await getReminders()
const widget = await createWidget()
widget.backgroundImage = bgImg
if (!config.runsInWidget) {
    widget.presentLarge()
}
widget.refreshAfterDate = new Date(date.getTime() + 600000) // default：null
Script.setWidget(widget)
Script.complete()


async function createWidget() {
    const widget = new ListWidget()
    widget.addSpacer()
    widget.backgroundColor = Color.black()

    // left：when、where、title、description、battery，right：todos
    const upStack = widget.addStack()
    const left = upStack.addStack()
    upStack.addSpacer()
    // left content
    left.layoutVertically()
    left.addSpacer()
    addText(left, getGreeting(), 0, 30, 1, 'heavySystemFont', '#F8E0EC')
    left.addSpacer()
    addText(left, getDateStr(), 0, 17)
    left.addSpacer()
    // battery
    const batteryLevel = Math.round(Device.batteryLevel() * 100)
    const used = '▓'.repeat(batteryLevel / 10)
    const remain = '░'.repeat(10 - used.length)
    addText(left, `⚡ ${used + remain} ${batteryLevel}%`, 0, 16, 1, 'Menlo', '#a8df65')
    left.addSpacer()
    addText(left, vocabulary.word, 0, 18)
    addText(left, vocabulary.explain, 2, 13, 3)
    left.addSpacer()

    // right content
    const right = upStack.addStack()
    right.layoutVertically()
    right.addSpacer()
    for (const i in todos) {
        addText(right, `${Number(i) + 1}.${todos[i]}`, 0, 12)
        right.addSpacer()
    }

    // poetry、idiom、vocabulary
    widget.addSpacer()
    const midStack = widget.addStack()
    midStack.layoutVertically()
    midStack.backgroundColor = new Color("#666", 0.7)
    midStack.cornerRadius = 5
    addCenterText(midStack, poem.title, 0, 14)
    addCenterText(midStack, poem.dynasty + ' ' + poem.author, 2, 12)
    addCenterText(midStack, poem.content, 2, 16)
    addCenterText(midStack, idiom, 3, 14, 2)

    // weather forecast、weather description
    widget.addSpacer()
    const downStack = widget.addStack()
    downStack.layoutVertically()
    // forecast
    const forecastStack = downStack.addStack()
    forecastStack.addSpacer()
    const daily = weatherDate.daily
    for (const i in daily) {
        const a = forecastStack.addStack()
        a.layoutVertically()
        forecastStack.addSpacer()
        addCenterImg(a, SFSymbol.named(weatherIcons[daily[i].icon]).image, 25, 25)
        addCenterText(a, daily[i].temp + '℃', 0, 16)
        addCenterText(a, daily[i].time, 0, 12)
    }
    // description
    downStack.addSpacer()
    addCenterText(downStack, weatherDate.description, 2, 15, 2)
    widget.addSpacer()

    return widget
}

async function getReminders() {
    let reminders = []
    const allReminders = await Reminder.all();
    for (const reminder of allReminders) {
        if (!reminder.isCompleted) {
            reminders.push(reminder.title)
        }
    }
    return reminders
}

async function getLocation() {
    if (!location.lock) {
        try {
            const lc = await Location.current()
            const geocode = await Location.reverseGeocode(lc.latitude, lc.longitude, 'zh_cn')
            const geo = geocode[0]
            location.data = {
                'latitude': lc.latitude,
                'longitude': lc.longitude,
                'city': geo.locality,
                'county': geo.subLocality,
            }
            log(location.data)
        } catch (e) {
            log(e.toString())
        }
    }
}

function getBlurImage(img, blurLevel) {
    const ctx = new DrawContext()
    ctx.size = img.size
    ctx.drawImageAtPoint(img, new Point(0, 0))
    ctx.setFillColor(new Color('#000000', blurLevel))
    ctx.fill(new Rect(0, 0, img.size.width, img.size.height))
    return ctx.getImage()
}

function getGreeting() {
    const hours = now.hours
    if (hours < 5) { return greetingText.nightGreeting }
    if (hours < 11) { return greetingText.morningGreeting }
    if (hours < 13) { return greetingText.noonGreeting }
    if (hours < 19) { return greetingText.afternoonGreeting }
    if (hours < 22) { return greetingText.eveningGreeting }
    return greetingText.nightGreeting
}

function getDateStr() {
    let df = new DateFormatter()
    df.locale = 'zh-cn'
    df.dateFormat = 'M月d日'
    return df.string(date) + ' ' + weekTitle[now.week]
}

async function generateAlert(message, options) {
    let alert = new Alert()
    alert.message = message
    for (const option of options) {
        alert.addAction(option)
    }
    return await alert.presentAlert()
}

async function request(url, type, headers, handleJSON) {
    // type：'json'、'image'、‘string’
    // handleJSON：a func of handling the JSON，like “(response)=>{return {name:response.path,...}}”
    const request = new Request(url)
    const func = {
        json: 'loadJSON',
        image: 'loadImage',
        string: 'loadString',
    }
    if (headers) { request.headers = headers }
    const response = await request[func[type]]()
    if (type === 'json') {
        return handleJSON ? handleJSON(response) : response
    } else {
        return response
    }
}

function cropImage(img, rect) {
    let draw = new DrawContext()
    draw.size = new Size(rect.width, rect.height)
    draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y))
    return draw.getImage()
}

function getPhoneSizes() {
    return {
        "2688": {
            "小号": 507,
            "中号": 1080,
            "大号": 1137,
            "左边": 81,
            "右边": 654,
            "顶部": 228,
            "中间": 858,
            "底部": 1488
        },

        "1792": {
            "小号": 338,
            "中号": 720,
            "大号": 758,
            "左边": 54,
            "右边": 436,
            "顶部": 160,
            "中间": 580,
            "底部": 1000
        },

        "2436": {
            "小号": 465,
            "中号": 987,
            "大号": 1035,
            "左边": 69,
            "右边": 591,
            "顶部": 213,
            "中间": 783,
            "底部": 1353
        },

        "2208": {
            "小号": 471,
            "中号": 1044,
            "大号": 1071,
            "左边": 99,
            "右边": 672,
            "顶部": 114,
            "中间": 696,
            "底部": 1278
        },

        "1334": {
            "小号": 296,
            "中号": 642,
            "大号": 648,
            "左边": 54,
            "右边": 400,
            "顶部": 60,
            "中间": 412,
            "底部": 764
        },

        "1136": {
            "小号": 282,
            "中号": 584,
            "大号": 622,
            "左边": 30,
            "右边": 332,
            "顶部": 59,
            "中间": 399,
            "底部": 399
        }
    }
}

function addText(stack, text, topMargin = 0, size = 20, lineLimit = 1, font = textConfig.font, color = textConfig.color) {
    stack.addSpacer(topMargin)
    const span = stack.addText(text + '')
    span.lineLimit = lineLimit
    span.font = new Font(font, size)
    span.textColor = new Color(color)
}
function addCenterText(stack, text, topMargin = 0, size = 20, lineLimit = 1, font = textConfig.font, color = textConfig.color) {
    stack.addSpacer(topMargin)
    const a = stack.addStack()
    a.addSpacer()
    const span = a.addText(text + '')
    span.lineLimit = lineLimit
    span.font = new Font(font, size)
    span.textColor = new Color(color)
    a.addSpacer()
}

function addImg(stack, img, width, length, topMargin = 0) {
    stack.addSpacer(topMargin)
    let imgSpan = stack.addImage(img)
    imgSpan.imageSize = new Size(width, length)
}
function addCenterImg(stack, img, width, length, topMargin = 0) {
    stack.addSpacer(topMargin)
    const a = stack.addStack()
    a.addSpacer()
    let imgSpan = a.addImage(img)
    imgSpan.imageSize = new Size(width, length)
    a.addSpacer()
}
