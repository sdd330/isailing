#!/bin/bash

# 北京浮生记 - Web版本 部署脚本
# 特色：ChatGPT风格对话界面

echo "🚀 开始构建北京浮生记 Web版本..."
echo "💬 新特性：ChatGPT风格对话界面，让游戏体验更加现代化！"

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 运行代码检查
echo "🔍 运行代码检查..."
pnpm lint

# 构建生产版本
echo "🏗️ 构建生产版本..."
pnpm build

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "📁 构建文件位于: dist/"
    echo "🌐 可以使用 'pnpm preview' 预览构建结果"
    echo ""
echo "🎮 游戏特色："
echo "  💬 ChatGPT风格对话界面"
echo "  🤖 智能AI助手引导"
echo "  🎨 Element Plus UI组件库"
echo "  📱 响应式设计"
echo "  ⚡ 现代化UI动画"
    echo ""
    echo "🎯 操作方式："
    echo "  • 输入指令或点击快捷按钮"
    echo "  • 例如：'黑市'、'购买'、'出售'、'建筑'等"
else
    echo "❌ 构建失败！"
    exit 1
fi

echo "🎉 部署准备完成！"
