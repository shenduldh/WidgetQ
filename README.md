 # WidgetQ：标签化开发小组件

WidgetQ根据HTML和Vue的一些特性对Scriptable构建小组件进行了封装，旨在帮助开发者快速开发属于自己的小组件。

## 环境介绍

```javascript
// 导入Widget，务必在同目录下有 core.js 文件
const WidgetQ = importModule('core')
// 创建 WidgetQ
const wq = new WidgetQ({
    // 放置需要用到的数据
    data: {
        example:'hello'
    },
    // 填写小组件的标签模板
    template: {
        small: ``,
        medium: ``,
        large: ``
    },
    // 填写自定义组件标签
    component: {
        tagName:``
    }
})
// 根据template自动创建小组件
await wq.show()
// 完成脚本
Script.complete()
```

## 简要文档

### 标签说明

> 注意：括号内为原属性名称。

#### `<widget>` 

- 作为根标签，不能缺少。
- 属性：`bgColor（backgroundColor）、bgGrad（backgroundGradient）、bgImg（backgroundImage）、refreshAfterDate、spacing、url`
- 方法：`padding（setPadding）`


#### `<date>` 

- 属性：`date、font、lineLimit、minScale（minimumScaleFactor）、shadowColor、shadowOffset、shadowRadius、textColor、textOpacity、url`

- 方法：`timeStyle（applyTimeStyle）、timerStyle（applyTimerStyle）、relativeStyle（applyRelativeStyle）、offsetStyle（applyOffsetStyle）、dateStyle（applyDateStyle）、rightAlignText、leftAlignText、centerAlignText`


#### `<image>` 

- 属性：`img（image）、borderColor、borderWidth、containerRelativeShape、imageOpacity、imageSize、resizable、tintColor、url、cornerRadius`

- 方法：`filling（applyFillingContentMode）、fitting（applyFittingContentMode）、centerAlignImage、leftAlignImage、rightAlignImage`

#### `<spacer>` 

- 在标签内部添加参数，无参数则是null。

#### `<stack>` 

- 属性：`bgColor（backgroundColor）、bgGrad（backgroundGradient）、bgImg（backgroundImage）、borderColor、borderWidth、cornerRadius、size、spacing、url`
- 方法：`vertical（layoutVertically）、horizontal（layoutHorizontally）、bottomAlignContent、topAlignContent、centerAlignContent、padding（setPadding）`

#### `<text>` 

- 在标签内部添加文本。
- 属性：`font、lineLimit、minScale（minimumScaleFactor）、shadowColor、shadowOffset、shadowRadius、textColor、textOpacity、url`
- 方法：`rightAlignText、leftAlignText、centerAlignText`

### 属性、文本、表达式

1. 属性可取的值：① 字符串；② 数字；③ 布尔值；④ 插值表达式`{{any}}` 。
2. 文本可取的值：插值表达式`{{any}}`与字符串的混合。
3. 插值表达式的取值：调用全局函数、取值路径、一般表达式。
   - 获取配置中的数据时，直接写example；
   - 给方法传递多参数时，须使用数组[1,2,3,4]。
4. 增强型属性：
   - for属性：`<text for={{array}}>{{index}}{{key}}{{value}}</text>`
   - show属性：`<text show=true></text>`

### 自定义组件标签

可以在配置中增添自定义的组件标签，并在模板文本中使用。

- 使用`{{#name}}`作为占位符，从而获取父组件传来的值。
- 使用`:name={{data}}`给自定义组件传递值。