module.exports = {
    plugins: {
        // Tailwind v4 通过 PostCSS 处理，必须放在前面
        "@tailwindcss/postcss": {},
        "postcss-pxtorem": {
            rootValue: 16, // 构建阶段使用的换算基准，决定 px ÷ rootValue = rem 写入到最终 CSS。这里表示以 16px 为 1rem 去计算其他的 px 值最终会转换的 rem 值。
            unitPrecision: 5, // rem 小数点位数
            propList: [
                'font',
                'font-size',
                'line-height',
                'margin*',
                'padding*',
                'width',
                'height',
                'min-width',
                'max-width',
                'min-height',
                'max-height',
                'top',
                'right',
                'bottom',
                'left',
                'gap',
                'row-gap',
                'column-gap',
                'border-radius',
            ], // 需要转换的 CSS 属性
            selectorBlackList: [], // 黑名单，不转换这些选择器
            replace: true, // 替换而不是添加
            mediaQuery: false, // 是否转换媒体查询中的 px
            minPixelValue: 0, // 小于此值的 px 不转换
            exclude: /node_modules/i, // 排除文件
        },
    },
};