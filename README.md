 # WidgetQ：标签化开发小组件

WidgetQ根据HTML和Vue的一些特性对Scriptable制作小组件进行了封装，旨在帮助开发者快速开发属于自己的小组件，整段代码比较短小，渲染延迟小，只要稍微懂一点基础就可以进行复杂组件的构建。

1. 基于Vue的标签表达式：可以直接在标签上直接添加元素的属性和方法；
2. 基于HTML：只需利用 \<widget>、\<date>、 \<image>、\<spacer> 、\<stack> 、\<text>七个标签即可完成所有元素的构建；
3. Scriptable小组件的元素的所有属性和方法均可使用。
4. 注意：该版本可能有不稳定现象（如发现请告知），但你可以尽情开发，因为即使后续更新了，基本框架是不会变的。
5. 如果你一点基础没有，可以稍微学习一下HTML，很简单的，然后懂得如何获取数据以及放置数据，你也就可以自己开发小组件了。

---

## 简单教程

1. 我已经搭建好了开发环境，如下所示。大家只需要按照指引即可快速掌握开发流程。第一次开发请把项目中的两个js文件下在到Scriptable中，然后再app.js文件下开发即可。

   ```javascript
   // 导入Widget，务必在同目录下有 core.js 文件
   let WQ = importModule('core.js').WQ
   // 创建 Widget
   const wq = new WQ({
       // 在模板中需要用到的数据都需要放在此处
       data: {
           example:''
       },
       // 在此处填写小组件的标签模板
       template: {
           small: ``,
           medium: ``,
           large: ``
       }
   })
   // 自动创建小组件
   await wq.show()
   // 完成脚本
   Script.complete()
   ```

2. 所有开发环境都是上面这样的，是不是看起来很简单。接下来就只需要创建模板就可以了：

   - 我们在上面可以看到如下代码，该代码用于创建组件模板：

     ```javascript
     template: {
     	small: ``,
     	medium: ``,
     	large: ``
     }
     ```

   - 该模板包括三个属性：small、medium、large。如果你需要创建小型组件，那么就在 small 中填写模板即可，如果是中型组件，那么就在 medium 中填写模板即可，大型组件也是如此。比如我们创建一个大型组件，则可像下面这样填写模板：

     ```javascript
     template: {
     	small: ``,
     	medium: ``,
     	large: `
             <widget>
               <stack layoutHorizontally>
                  <spacer></spacer>
                  <text>hello world!</text>
                  <spacer></spacer>
               </stack>
             </widget>
     `
     }
     ```

   - 该模板创建了一个垂直居中的文本元素，内容是"hello world!"。注意\<widget>是根标签，也就是说该标签必须放在最外面。这三个属性都可以填写模板，而且会根据你的选择自动进行展示。

3. 我们再看看开发环境中的data属性：

   - data属性可以接受你需要在小组件中展示的数据，比如：

     ```javascript
     data: {
        text:'hello world!'
     }
     ```

   - 然后我们可以像下面这样使用它们，这个效果和上面那个模板是一样的。

     ```javascript
     template: {
     	small: ``,
     	medium: ``,
     	large: `
             <widget>
               <stack layoutHorizontally>
                  <spacer></spacer>
                  <text>{text}</text>
                  <spacer></spacer>
               </stack>
             </widget>
     `
     }
     ```

4. 除了这两个属性，即data属性和template属性外，你其他什么事情都不用做，是不是很简便！那么我们利用它们来创建属于我们自己的一个小组件吧。

## 进阶教程

在这里，我们将学习开发的流程。

1. 我们打开我们的开发环境（简洁吧...），如下：

   ```javascript
   let WQ = importModule('core.js').WQ
   const wq = new WQ({
       data: {},
       template: {
           small: ``,
           medium: ``,
           large: ``
       }
   })
   
   await wq.show()
   Script.complete()
   ```

2. 我们先来获取我们需要的数据，一句英文谚语和来自百度的图片。然后我们将它们放进data属性中，除此之外我还准备了一些颜色、字体、介绍（经典）等：

   ```javascript
   const idiom = await new Request('https://apiv3.shanbay.com/weapps/dailyquote/quote/').loadJSON()
   const img = await new Request('https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1604588498924&di=502b9baaed0fe31688c9553c16c23076&imgtype=0&src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2F2018-11-05%2F5bdfd64baf0fd.jpg').loadImage()
   ...... // 为了简便，略去其它内容
   data: {
       idiom:idiom,
       img:img,
       text:'Hello World~',
       color:Color.yellow(),
       font:new Font('systemFont', 15),
   },
   ......
   ```

3. 接着我们写模板，为了简短，只写大型组件（小型组件和中型组件都是一样的）。

   （技巧：可以先在html编辑器中编写，方便排版，然后将其粘贴到相应属性中）

   ```javascript
   template: {
      small: ``,
      medium: ``,
      large: `
   <widget>
       <spacer></spacer>
       <stack layoutVertically padding={[5,5,5,5]} borderWidth=1 borderColor={new Color("#666")}>
           <stack layoutHorizontally>
               <spacer></spacer>
               <text textColor={color} font={font}>{text}</text>
               <spacer></spacer>
           </stack>
           <stack layoutHorizontally>
               <spacer></spacer>
               <text textColor={color} font={font}>{idiom}</text>
               <spacer></spacer>
           </stack>
           <spacer>20</spacer>
           <stack layoutHorizontally>
               <spacer></spacer>
               <image resizable=true>{img}</image>
               <spacer></spacer>
           </stack>
       </stack>
       <spacer></spacer>
   </widget>
   `
   }
   ```

4. 该模板创建了三个垂直居中的元素：文本（显示text）、文本（显示idiom）、图片。然后...没有然后了，你打开你的小组件选择该文件就可以进行显示了，当然你也可以直接在软件内预览。

## 简略文档

### 标签类型

按照Scriptable文档仅有6个，如下所示：

- \<widget>\</widget>标签：放置在根标签处，不能缺少，它可以应用的属性如下所示（与Scriptable文档所示一样）

  - backgroundColor、backgroundGradient、backgroundImage、refreshAfterDate、spacing、url

    具体用法：

    ① 赋值：\<widget 属性名=值>\</widget>，值可以是字符串`"string"`、数字`1`、布尔值`true`。

    ② 表达式：\<widget 属性名={表达式}>\</widget>，表达式可以是`new Color()`、`text.content`。

  - padding：

    该属性在Scriptable是一个方法，你只需如此使用`padding={[1,2,3,4]}`。

- \<date>{new Date()}\</date>标签：

  - 在标签之间给该标签添加date参数。
  - font、lineLimit、minimumScaleFactor、shadowColor、shadowOffset、shadowRadius、textColor、textOpacity、url

  - applyTimeStyle、applyTimerStyle、applyRelativeStyle、applyOffsetStyle、applyDateStyle、rightAlignText、leftAlignText、centerAlignText

    这几个属性在Scriptable是一个方法，但没有具体参数，所以如此使用`applyTimeStyle`。

- \<image>{new Image()}\</image> ：

  - 和date一样在内部添加参数。

  - borderColor、borderWidth、containerRelativeShape、imageOpacity、imageSize、resizable、tintColor、url

  - applyFillingContentMode、applyFittingContentMode、centerAlignImage、leftAlignImage、rightAlignImage

- \<spacer>length\</spacer>：该标签没有属性，在内部填写具体的值即可，如果不填写则相当于addSpacer()。

- \<stack>\</stack>：

  - backgroundColor、backgroundGradient、backgroundImage、borderColor、borderWidth、cornerRadius、size、spacing、url
  - layoutVertically、layoutHorizontally、bottomAlignContent、topAlignContent、centerAlignContent、padding

- \<text>text\</text>

  - 和date一样在内部添加参数，但可和表达式混合，比如`hello{text1}world!{text2}`
  - font、lineLimit、minimumScaleFactor、shadowColor、shadowOffset、shadowRadius、textColor、textOpacity、url
  - rightAlignText、leftAlignText、centerAlignText

### 属性的取值

1. 一般而言，在任何地方都可以使用表达式，但表达式的值需要符合属性的取值类型，比如要填Color的地方可以写`{new Color()}`或`{color}`（存储在data属性中的color）。

2. 属性的值除了表达式还可以是"string"、'string'、true/false、数字。
3. 仅在文本标签内部可以文本混合表达式使用。

## In the future

1. 还有很多需要改进和增强的地方，现在也是匆匆制作，时间比较短
2. 还有很多功能没有开发，但不会马上去做（么得空闲）
3. 有问题可以联系我，但你也可以自己修改
4. Contact to me at WeChat：liudahungSD

## 致谢

就谢谢使用该框架的所有小伙伴吧...