const webview = new WebView()
webview.present()
await webview.loadURL('https://www.instagram.com')
await webview.evaluateJavaScript(`
const btn=document.createElement('button')
btn.innerText='获取cookies'
btn.style.width='100px'
btn.style.height='50px'
btn.style.position='fixed'
btn.style.zIndex=10
btn.style.left='100px'
btn.style.bottom='200px'
document.body.appendChild(btn)
btn.onclick=()=>{
    completion(true)
}
null`, true)
const req = new Request('https://www.instagram.com')
await req.load()
const sessionid = req.response.cookies.filter(cookie => {
    return cookie.name === 'sessionid'
})[0].value
log(sessionid)