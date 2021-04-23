const $ = {
    main: 'one_app',
    dependencies: ['wq_env'],
    ip: '192.168.0.117:5000'
}

const file = FileManager.iCloud()
const directory = file.documentsDirectory()
const mainPath = file.joinPath(directory, $.main + '.js')
let supPath, supContent, mainContent, result
while (1) {
    result = await generateAlert()
    if (result == 0 || result == 2) {
        mainContent = await get($.main)
        file.writeString(mainPath, mainContent)
        for (let name of $.dependencies) {
            supContent = await get(name)
            supPath = file.joinPath(directory, name + '.js')
            file.writeString(supPath, supContent)
        }
    }
    if (result == 1 || result == 2) {
        try {
            mainContent = file.readString(mainPath)
            eval(`$.run=async function(){${mainContent}}`)
            await $.run()
        } catch (err) { console.error(err) }
    }
    if (result == 3) break
}

async function get(scriptName) {
    return await new Request(`http://${$.ip}/${scriptName}.js`).loadString()
}

async function generateAlert() {
    const alert = new Alert()
    alert.message = '调试模式'
    const opts = ['同步脚本', '运行脚本', '同步并运行脚本', '结束调试']
    for (let opt of opts) { alert.addAction(opt) }
    return await alert.presentAlert()
}