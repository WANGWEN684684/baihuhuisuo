# AI心动探测器 (AI Heartbeat Detector)

## 项目简介
本项目是一个基于 H5 的AI心动探测器，旨在帮助用户通过分析目标对象的微信头像、朋友圈截图等素材，获取个性化的交友建议。项目后端集成豆包大模型（Doubao-Seed-1.8）进行深度分析。

## 技术栈
- **前端**: React, Vite, Tailwind CSS, Framer Motion
- **后端**: Node.js, Express, Multer
- **AI**: 豆包大模型 (Doubao) API

## 目录结构
- `client/`: 前端项目代码
- `server/`: 后端 API 服务代码

## 快速开始

### 1. 环境准备
确保已安装 Node.js (v16+)。如果没有安装，请访问 [Node.js 官网](https://nodejs.org/) 下载并安装。

### 2. 启动服务 (推荐)
直接运行根目录下的 `start.bat` 脚本即可同时启动前后端服务：
```bash
.\start.bat
```
启动成功后，会自动弹出两个窗口运行服务。

或者手动分别启动：

#### 后端设置
进入 `server` 目录并安装依赖：
```bash
cd server
npm install
```

配置环境变量：
打开 `server/.env` 文件，填入你的豆包 API Key：
```
ARK_API_KEY=your_api_key_here
```

启动后端服务：
```bash
npm run dev
# 或
node index.js
```
服务默认运行在 `http://localhost:3000`。

### 3. 前端设置
进入 `client` 目录并安装依赖：
```bash
cd client
npm install
```

启动前端开发服务器：
```bash
npm run dev
```
前端默认运行在 `http://localhost:5173`。

## 使用说明
1. 打开浏览器访问前端地址 (通常是 http://localhost:5173)。
2. 点击“开始分析”。
3. 上传目标对象的微信头像（必填）、朋友圈截图（5-9张，必填）和聊天截图（可选）。
4. 填写生肖、星座、MBTI 等可选信息。
5. 点击提交，等待 AI 分析结果。
6. 查看详细的性格分析、交友建议和避雷指南。

## 注意事项
- 请确保后端服务正常运行且 API Key 有效。
- 图片上传大小限制为 10MB。
- 这是一个 Demo 项目，数据存储在内存中，重启服务后丢失。

## 部署状态
- 2026-03-07: Vercel 部署已配置。
- 2026-03-07: 修复了 413 Payload Too Large 问题，增加了图片自动压缩。
- 2026-03-07: 强制触发部署更新。

