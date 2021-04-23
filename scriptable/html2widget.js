const webview = new WebView()
const html = `
<p style="font-size:25px;margin:0;padding:0">测试文字</p>
<img style="width:20;height:20" crossorigin="anonymous" src="https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3438293811,2605018758&fm=26&gp=0.jpg">
<ul style="font-size:15px;margin:0">
    <li>列表测试：第一个</li>
    <li>列表测试：第二个</li>
    <li>列表测试：第三个</li>
</ul>`

await webview.loadHTML(`<body style="width:300px;height:150px">${html}</body>`)
const returnValue = await webview.evaluateJavaScript(`
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

const dom = document.body;
const imgArray = Array.from(dom.querySelectorAll("img"));
for (let i in imgArray) {
  canvas.width = imgArray[i].width * dpr;
  canvas.height = imgArray[i].height * dpr;
  ctx.scale(dpr, dpr);
  ctx.drawImage(imgArray[i], 0, 0);
  imgArray[i].src = canvas.toDataURL("image/png",1);
}
const svgData =
  "data:image/svg+xml;charset=utf-8," +
  '<svg xmlns="http://www.w3.org/2000/svg" width="' +
  dom.offsetWidth +
  '" height="' +
  (dom.offsetHeight + dom.offsetTop) +
  '"><foreignObject width="100%" height="100%">' +
  new XMLSerializer().serializeToString(dom) +
  "</foreignObject></svg>";

const img = new Image();
img.src = svgData;
img.onload = () => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = img.width * dpr;
  canvas.height = img.height * dpr;
  ctx.scale(dpr, dpr);
  ctx.drawImage(img, 0, 0);
  completion(canvas.toDataURL("image/png",1));
};
null`, true)
const imageDataString = returnValue.slice(22)
const imageData = Data.fromBase64String(imageDataString)
const image = Image.fromData(imageData)
const wd = new ListWidget()
wd.setPadding(0,0,0,0)
wd.backgroundColor = Color.blue()
const img = wd.addImage(image)
img.imageSize = new Size(image.size.width/2, image.size.height/2)
wd.presentMedium()