# 图片处理工具 - 需求文档

## 项目概述

创建一个基于 HTML + 纯 JavaScript 的图片处理网页应用，支持图片上传、编辑、格式转换等功能，无需后端服务器。**支持 PWA 离线使用，搜索引擎优化(SEO)。**

## 新增功能 - v1.2 (2025 年 6 月 30 日)

### 🔍 SEO 优化

- **完整的 meta 标签**: 包含描述、关键词、作者信息
- **Open Graph 支持**: 社交媒体分享优化
- **Twitter Card**: Twitter 分享卡片支持
- **结构化数据**: Schema.org JSON-LD 标记
- **robots.txt**: 搜索引擎爬虫指引
- **sitemap.xml**: 站点地图
- **语义化 HTML**: 改善搜索引擎理解

### 📱 PWA 功能

- **离线支持**: Service Worker 缓存关键资源
- **可安装**: 支持"添加到主屏幕"功能
- **应用图标**: 完整的 PWA 图标尺寸支持
- **启动画面**: 自定义 PWA 启动界面
- **离线指示器**: 网络状态提示
- **安装提示**: 智能 PWA 安装引导

### 🛠️ 开发工具

- **图标生成器**: `icon-generator.html` 快速生成 PWA 图标
- **性能监控**: 内存和加载性能监测
- **网络状态管理**: 在线/离线状态处理

## 最新更新

### v1.1 - 2025 年 6 月 26 日

- **简化预览功能**: 图片预览现在专注于展示图片本身，移除了缩放、拖拽、导航等复杂控制功能
- **优化用户体验**: 预览界面更加简洁，加快加载速度，减少界面复杂度
- **改进响应式设计**: 预览在各种屏幕尺寸下都有更好的显示效果
- **固定网格布局**: 图片网格现在固定一行展示 4 张图片，在移动设备上自适应为更少列数
- **优化控件布局**: checkbox 和删除按钮现在显示在图片项的头部独立行，更加明显和易于操作
- **增强选择交互**: 点击图片项的任意区域（除预览图片外）都可以切换选中状态，提升操作便利性
- **侧边操作面板**: 将格式转换和水印功能移至右侧操作面板，取代模态窗口，提供更直观的操作体验

## 技术要求

- **前端技术栈**: HTML5 + CSS3 + 纯 JavaScript（ES6+）
- **图片处理**: Canvas API
- **文件操作**: File API、Blob API
- **拖拽功能**: HTML5 Drag and Drop API
- **响应式设计**: 支持桌面端和移动端

## 页面预览

使用 browsermcp 工具 打开 `http://localhost/convert-image/` 进行网页的预览与调试

## 功能需求

### 1. 图片上传功能

**核心要求**:

- 支持点击选择文件上传
- 支持拖拽文件到页面进行上传
- 支持多文件批量上传
- 文件格式限制：JPG、JPEG、PNG、GIF、WEBP、BMP
- 文件大小不限制
- 上传后直接在客户端显示，不发送到服务器

**技术实现**:

- 使用 `<input type="file" multiple accept="image/*">` 元素
- 使用 FileReader API 读取文件
- 使用 URL.createObjectURL() 创建本地预览

### 2. 图片展示与排序

**核心要求**:

- 以缩略图网格形式展示所有上传的图片
- 固定布局：桌面端一行展示 4 张图片，平板端 3 张，手机端 2 张或 1 张
- 支持拖拽排序功能
- 显示图片基本信息（文件名、大小、格式、尺寸）
- 响应式布局，自适应不同屏幕尺寸

**技术实现**:

- 使用 CSS Grid 固定列数布局
- 实现 HTML5 Drag and Drop API
- 使用 Image 对象获取图片尺寸信息

### 3. 图片删除功能

**核心要求**:

- 每个图片缩略图显示删除按钮
- 支持批量选择删除
- 删除前显示确认对话框
- 删除后自动重新排列剩余图片

**用户体验**:

- 删除按钮悬停时高亮显示
- 支持键盘 Delete 键删除选中图片

### 4. 图片预览功能

**核心要求**:

- 点击缩略图可以查看原图
- 模态窗口形式显示图片
- 简洁的预览界面，专注于图片展示
- 显示图片基本信息（文件名、尺寸、大小）

**技术实现**:

- 创建轻量级模态窗口组件
- 响应式图片显示，自适应屏幕尺寸
- ESC 键关闭预览功能

**用户体验**:

- 专注于图片展示，无多余控制按钮
- 清晰的图片信息展示
- 快速预览和关闭体验

### 5. 图片变换功能

**核心要求**:

- **旋转功能**: 支持顺时针 90°、逆时针 90°、180° 旋转
- **翻转功能**: 支持水平翻转、垂直翻转
- **重置功能**: 一键恢复原始状态
- 实时预览变换效果

**技术实现**:

- 使用 Canvas API 进行图像变换
- 使用 context.rotate() 和 context.scale() 方法
- 保存变换历史，支持撤销操作

### 6. 图片格式转换

**核心要求**:

- **支持格式**: WEBP、JPEG、PNG、BMP
- **质量控制**: JPEG 格式支持质量调节（10-100%）
- **批量转换**: 支持选择多个图片进行批量格式转换
- **格式检测**: 自动识别并显示当前图片格式
- **侧边面板操作**: 在右侧操作面板中进行转换设置，实时预览效果

**技术实现**:

- 使用 Canvas.toBlob() 或 Canvas.toDataURL() 进行格式转换
- 实现质量滑块控件
- 显示转换前后的文件大小对比
- 侧边面板实时更新选中图片数量

### 7. 水印功能

**核心要求**:

- **文字水印**: 支持添加自定义文字水印
- **图片水印**: 支持上传图片作为水印
- **位置控制**: 支持 9 个预设位置（左上、中上、右上、左中、正中、右中、左下、中下、右下）
- **样式控制**: 文字水印支持字体、大小、颜色、透明度调节
- **实时预览**: 在侧边面板中实时预览水印效果
- **侧边面板操作**: 所有水印设置都在右侧操作面板中进行

**技术实现**:

- 使用 Canvas API 绘制水印
- 实现位置计算算法
- 提供颜色选择器和透明度滑块
- 面板中的实时预览画布

### 8. 图片保存功能

**核心要求**:

- **单张保存**: 保存编辑后的单张图片
- **批量保存**: 支持批量保存所有编辑的图片
- **ZIP 打包**: 批量保存时自动打包为 ZIP 文件
- **文件命名**: 支持自定义文件名前缀

**技术实现**:

- 使用 Canvas.toBlob() 生成文件
- 使用 URL.createObjectURL() 创建下载链接
- 集成 JSZip 库实现 ZIP 打包功能

## 用户界面设计要求

### 布局结构

```text
┌─────────────────────────────────────────────────────────┐
│                   导航栏/标题                          │
├─────────────────────────────────────────────────────────┤
│        上传区域（拖拽提示 + 选择按钮）                  │
├─────────────────────────────────────────────────────────┤
│               工具栏                                    │
│ [全选] [删除] [旋转] [翻转] [重置] [下载]                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  图片网格展示区域              │    操作面板             │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐     │  ┌─────────────────┐   │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │     │  │   格式转换      │   │
│  └───┘ └───┘ └───┘ └───┘     │  ├─────────────────┤   │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐     │  │   水印设置      │   │
│  │ 5 │ │ 6 │ │ 7 │ │ 8 │ ... │  │                 │   │
│  └───┘ └───┘ └───┘ └───┘     │  │                 │   │
│                               │  └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 样式要求

- 现代化扁平设计风格
- 主色调：蓝色系 (#007bff)
- 响应式布局，支持移动端
- 流畅的动画效果
- 清晰的视觉层次

## 性能要求

- 支持同时处理至少 50 张图片
- 图片处理操作响应时间 < 2 秒
- 内存使用优化，及时释放不需要的资源
- 大图片自动压缩显示，避免页面卡顿

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 开发优先级

1. **P0 (核心功能)**: 图片上传、显示、删除
2. **P1 (重要功能)**: 图片预览、基础变换（旋转、翻转）
3. **P2 (增强功能)**: 格式转换、水印、批量操作
4. **P3 (优化功能)**: 拖拽排序、键盘快捷键、动画效果

## 文件结构建议

```text
convert-image/
├── index.html          # 主页面
├── styles/
│   ├── main.css        # 主样式文件
│   └── responsive.css  # 响应式样式
├── scripts/
│   ├── main.js         # 主逻辑
│   ├── image-processor.js  # 图片处理模块
│   ├── file-handler.js     # 文件操作模块
│   └── ui-components.js    # UI组件模块
└── assets/
    └── icons/          # 图标资源
```

## API 接口设计

### 核心类和方法

#### ImageProcessor 类

```javascript
class ImageProcessor {
  // 构造函数
  constructor(canvas)

  // 图片加载
  loadImage(file)

  // 图片变换
  rotate(angle)           // 旋转图片
  flip(direction)         // 翻转图片 ('horizontal' | 'vertical')
  reset()                // 重置到原始状态

  // 格式转换
  convertFormat(format, quality)  // 转换格式

  // 水印处理
  addTextWatermark(text, options)     // 添加文字水印
  addImageWatermark(image, options)   // 添加图片水印

  // 导出
  toBlob(format, quality)    // 导出为 Blob
  toDataURL(format, quality) // 导出为 DataURL
}
```

#### FileHandler 类

```javascript
class FileHandler {
  // 文件上传
  static handleFileSelect(files)
  static handleFileDrop(event)

  // 文件验证
  static validateFile(file)
  static getFileInfo(file)

  // 文件下载
  static downloadFile(blob, filename)
  static downloadMultiple(files, zipName)
}
```

#### UIComponents 类

```javascript
class UIComponents {
  // 模态窗口
  static createModal(content)
  static closeModal()

  // 图片网格
  static createImageGrid(images)
  static updateImageGrid()

  // 工具栏
  static createToolbar(options)
  static updateToolbar(state)

  // 进度条
  static showProgress(progress)
  static hideProgress()
}
```

## 事件处理

### 主要事件监听

- **文件上传**: `change`、`drop`、`dragover`、`dragleave`
- **图片操作**: `click`、`dblclick`、`contextmenu`
- **键盘快捷键**: `keydown`、`keyup`
- **拖拽排序**: `dragstart`、`dragend`、`dragover`
- **窗口大小**: `resize`

### 自定义事件

- `imageLoaded`: 图片加载完成
- `imageProcessed`: 图片处理完成
- `imageDeleted`: 图片删除
- `batchProcessStart`: 批量处理开始
- `batchProcessEnd`: 批量处理结束

## 数据结构

### 图片对象结构

```javascript
{
  id: 'unique-id',           // 唯一标识
  file: File,                // 原始文件对象
  name: 'image.jpg',         // 文件名
  size: 1024000,             // 文件大小（字节）
  type: 'image/jpeg',        // MIME类型
  width: 1920,               // 原始宽度
  height: 1080,              // 原始高度
  url: 'blob:...',           // 预览URL

  // 编辑状态
  transforms: {
    rotation: 0,             // 旋转角度
    flipH: false,            // 水平翻转
    flipV: false,            // 垂直翻转
  },

  // 水印设置
  watermark: {
    type: 'text|image',      // 水印类型
    content: 'text content', // 文字内容或图片URL
    position: 'center',      // 位置
    opacity: 0.8,            // 透明度
    style: {...}             // 样式设置
  },

  // 导出设置
  export: {
    format: 'jpeg',          // 导出格式
    quality: 0.9             // 导出质量
  }
}
```

## 错误处理

### 错误类型

1. **文件类型错误**: 不支持的文件格式
2. **文件大小错误**: 文件过大
3. **图片加载错误**: 图片损坏或无法读取
4. **内存不足错误**: 处理大图片时内存溢出
5. **浏览器兼容性错误**: API 不支持

### 错误处理策略

- 显示用户友好的错误提示
- 记录错误日志用于调试
- 提供错误恢复选项
- 防止整个应用崩溃

## 测试要求

### 功能测试

- 各种格式图片的上传和显示
- 图片变换功能的正确性
- 批量操作的稳定性
- 不同浏览器的兼容性

### 性能测试

- 大量图片的处理性能
- 内存使用情况监控
- 长时间使用的稳定性

### 用户体验测试

- 界面响应速度
- 操作流程的顺畅性
- 错误处理的友好性

## 部署要求

- 纯静态文件，支持任何 Web 服务器
- 支持本地文件系统直接打开
- 无需后端服务器和数据库
- **支持 PWA 离线使用（已实现）**

## PWA 安装和使用

### 安装为 APP

1. **自动提示**: 使用应用 30 秒后，会自动显示安装提示
2. **手动安装**: 在支持 PWA 的浏览器中，地址栏会显示安装图标
3. **iOS Safari**: 点击分享按钮 → "添加到主屏幕"
4. **Android Chrome**: 点击菜单 → "安装应用"

### 离线功能

- **自动缓存**: 首次访问时自动缓存所有必要文件
- **离线处理**: 所有图片处理功能离线可用
- **网络状态**: 自动检测网络状态并显示提示
- **自动更新**: 检测到新版本时提示用户更新

### PWA 特性

- **独立窗口**: 安装后作为独立应用运行
- **快速启动**: 从主屏幕直接启动
- **无浏览器 UI**: 沉浸式体验
- **系统集成**: 支持文件关联和快捷方式

## SEO 优化特性

### 搜索引擎优化

- **语义化 HTML**: 使用正确的 HTML 标签结构
- **Meta 标签**: 完整的 title、description、keywords
- **Open Graph**: 社交媒体分享优化
- **结构化数据**: Schema.org 标记支持
- **robots.txt**: 搜索引擎爬虫指引
- **sitemap.xml**: 站点地图支持

### 性能优化

- **快速加载**: 优化资源加载顺序
- **响应式设计**: 移动设备友好
- **图片优化**: 自适应图片尺寸
- **缓存策略**: Service Worker 智能缓存

## 开发工具

### 图标生成器

使用 `icon-generator.html` 快速生成 PWA 所需的各种尺寸图标：

```bash
# 在项目根目录打开
open icon-generator.html
```

功能：

- 自定义图标文字、颜色、样式
- 实时预览图标效果
- 一键生成所有 PWA 所需尺寸
- 自动打包下载

### 性能监控

应用内置性能监控功能：

- 页面加载时间监测
- 内存使用情况跟踪
- 网络状态监控
- 错误日志记录
