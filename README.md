# proof cloud main 页面

## 代码结构以及目录定义

```json
.
├── README.md
├── index.html
├── public
│   └── vite.svg
├── src
│   ├── App.tsx // 页面主入口，其他子页面引入pages
│   ├── assets // 存静态资源（图片、字体），按类型存放，图片按模块建子文件夹
│   ├── components
│   │		├── base // 存基础组件
│   │		├── icons // 存一些自定义的icon组件
│		│		└── biz/(*business) // 业务UI组件按模块建子文件夹
│   ├── layout // layout里面用到的组件，比如Nav建议也放这个目录下
|   |   ├── index.tsx // 页面布局，主要定义头、尾结构，main通过children传递。
│   ├── global.css // 全局样式
│   ├── main.tsx // 全局主入口
│   ├── pages // 存放页面, 一个路由对应一个页面
│   ├── types // 存@types定义
│   ├── utils // 存工具类
│   └── vite-env.d.ts
├── tsconfig.json
├── tsconfig.node.json
├── package.json
└── vite.config.ts
```



## Button复用

### Default样式

![image-20240425下午15247225](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2024/04-25/image-20240425%E4%B8%8B%E5%8D%8815247225.png)



### Primary样式

`<Button type="primary">` // 暂不支持

`<GradientButton>` 用这个

![image-20240425下午15346262](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2024/04-25/image-20240425%E4%B8%8B%E5%8D%8815346262.png)

### Ghost样式

`<Button ghost>`

![image-20240425下午15409740](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2024/04-25/image-20240425%E4%B8%8B%E5%8D%8815409740.png)



### Link Button样式

`<Button type="link">` hover不带颜色

![image-20240425下午15504886](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2024/04-25/image-20240425%E4%B8%8B%E5%8D%8815504886.png)
