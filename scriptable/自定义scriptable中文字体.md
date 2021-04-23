# 自定义scriptable中文字体

## 原理解释

在 scriptable 中，唯一可以加载字体的环境只有 WebView 了，我们可以利用 WebView 加载任何我们需要的字体，然后利用 canvas 绘制出我们所需要的文字（这个过程就相当于利用 scriptable 的 DrawContext 来绘制文字），然后将绘制完成后的文字作为图片发回给 scriptable ，接着我们就可以将该文字图片加载到小组件上。如此一来，自定义 scriptable 中文字体就完成了。

## 提前预览

这是我分别用两种字体分别绘制的中文字体，是不是很漂亮。

<img src="https://img.tool22.com/image/5fc094dad4d46.jpg" alt="1606452349110" style="zoom:50%;" />

<img src="https://img.tool22.com/image/5fc094db2dad5.jpg" alt="6e0583f2bb7d9f8a15de9e94e15e040e" style="zoom:50%;" />

## 开始教程

scriptable 的 WebView 可以加载并运行任何JS，然后将最后一行的表达式作为返回值，就像下面这样：

```javascript
const webView=new WebView();
const returnValue = await webView.evaluateJavaScript(`1+2+3+4`);
// 等JS脚本运行完后，returnValue的值就是10
```

但在 WebView 中加载字体需要一段时间，并且不是同步进行的，因此像上面这样返回数据是不行的。此时，我们注意到 evaluateJavaScript 函数的第二个参数，其描述为"如果该值为 true ，则只有等待 JS 脚本中的 completion 函数被调用后才会返回结果，并且该结果为传入 completion 函数的参数"，这不正是我们需要的吗？

有了这个基础我们就可以在 WebView 中编写加载字体并绘制文字的代码了。首先，我们可以利用 WebAPI 中的 FontFace 来加载字体，如下代码所示：

```javascript
const myFont = new FontFace("myFont","url(fontUrl)"); // 第一个参数为自定义的字体名称，fontUrl为字体文件的地址
myFont.load().then(font => { // 字体加载需要一段时间
    document.fonts.add(font); // 将加载好的字体加入到全局对象document中，这样我们就可以使用该字体了
})
```

有了字体了，接下来我们就可以绘制我们想要的文字了，如下代码所示：

```javascript
const canvas = document.createElement("canvas"); // 创建画布
const ctx = canvas.getContext("2d"); // 取出画笔
canvas.width=200; // 设置画布的宽度
canvas.heigth=60; // 设置画布的高度
ctx.font = "50px myFont"; // 第二个参数为上述自定义的字体名称
ctx.fillStyle = "black"; // 设置画笔颜色
ctx.fillText("测试文字", 0, 60); // 绘制文字。第2、3个参数分别为字体绘制的坐标
```

现在我们已经加载完字体并绘制好文字了，然后我们就可以将这些脚本传入 evaluateJavaScript 函数进行执行，最后利用 canvas.toDataURL() 来返回我们需要的文字图片，如下代码所示：

```javascript
const fontUrl = "https://code.z01.com/font/Zoomlabaoren-A102.ttf"; // 一个免费的字体文件URL
const js = `
const myFont = new FontFace("myFont","url(${fontUrl})");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width=200;
canvas.heigth=60;
myFont.load().then(font => {
    document.fonts.add(font);
    ctx.font = "50px myFont";
    ctx.fillStyle = "black";
    ctx.fillText("测试文字", 0, 60);
    completion(canvas.toDataURL());
})
null // 注意，evaluateJavaScript 默认最后一句必须是一个表达式
`
const webView=new WebView();
const returnValue = await webView.evaluateJavaScript(js, true);
```

因为 canvas.toDataURL() 返回的是 Base64 编码的数据，所以为了得到能够加载进小组件的图片，还需要进行一些处理，如下代码所示：

```javascript
const imageDataString = returnValue.slice(22); // 截去头部无用的部分
const imageData = Data.fromBase64String(imageDataString); // 解码数据
const imageFromData = Image.fromData(imageData); // 转换为图片
```

最后我们就可以利用我们所得到的 imageFromData 图片数据加载到小组件上了，如下图片所示。

<img src="https://img.tool22.com/image/5fc094db0d727.jpg" alt="1606455451309" style="zoom:50%;" />

## 完整代码

完整代码如下所示，将其复制进 scriptable 即可运行，然后得到你自己的自定义字体的中文文字。

```javascript
const fontUrl = "https://code.z01.com/font/Zoomlabaoren-A102.ttf";
const js = `
const myFont = new FontFace("myFont","url(${fontUrl})");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width=200
canvas.heigth=60
myFont.load().then(font => {
    document.fonts.add(font);
    ctx.font = "50px myFont";
    ctx.fillStyle = "black";
    ctx.fillText("测试文字", 0, 60);
    completion(canvas.toDataURL());
})
null
`
const webView=new WebView();
const returnValue = await webView.evaluateJavaScript(js, true);
const imageDataString = returnValue.slice(22);
const imageData = Data.fromBase64String(imageDataString);
const imageFromData = Image.fromData(imageData);

const wd = new ListWidget();
wd.backgroundColor = Color.blue();
const img = wd.addImage(imageFromData);
img.imageSize = new Size(200, 120);
wd.presentMedium();
Script.complete();
```

## 课后总结

看完这个教程，大家就应该会自己创造自己喜欢的字体并应用到小组件上了，那么通过这个我们可以做什么呢？最直接的应用当然是制作一个漂亮的名言小组件了，但如果你还有什么想法，不如自己动手试试吧！