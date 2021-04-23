# 计划

1. 优化代码性能和结构

3. 测试新版本

   连续中括号无法正确识别表达式界限：比如{{{}}}

   解决方法：用栈进行中括号匹配
   
5. 高斯模糊、半透明纯色蒙版

6. 实时自动调试

5. 优化缓存：使其可以按需缓存并删除缓存

9. 提供预设背景

# 注意

1. scriptable不能处理循环引用
2. eval不能处理字符串：要把字符串和bool、number、exp分开，但可以处理'"string"'

# 取经

1. new Function方法、eval
2. 函数柯里化
3. 把切面放在git上，采用代码加载的方式增加新功能
4. 保留配置更新组件：存储配置->更新代码->加载恢复配置->删除存储
5. 用github存储字体
6. html开发小组件
7. 预览和桌面的图片尺寸不一致

# 解析表达式

整体->分两半->递归

- 二元表达式（BEXP）：left、right
- 成员表达式（MEXP）：object、property
- 调用表达式（CEXP）：callee、args
- 创建表达式（NEXP）：callee、args
- 对象表达式（OEXP）：properties->property->key、value
- 数组表达式（AEXP）：elements->element->value
- 自更表达式（UEXP）：operator、arg、prefix
- 字面量（Literal）

关系符：点、括号()[]、运算符、new

直接符：字符串、字面量、标识符、对象、数组、数字