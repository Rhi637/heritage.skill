# 🎭 非遗传承人蒸馏数字智能体

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-GPL%20v3-blue.svg?style=flat-square" alt="License: GPL v3">
  </a>
  <img src="https://img.shields.io/badge/Status-Beta-yellow.svg?style=flat-square" alt="Status: Beta">
  <img src="https://img.shields.io/github/last-commit/Rhi637/heritage.skill?style=flat-square" alt="Last Commit">
  <img src="https://img.shields.io/github/languages/top/Rhi637/heritage.skill?style=flat-square" alt="Top Language">
  <img src="https://img.shields.io/badge/Hosted%20on-Vercel%20%7C%20GitHub%20Pages-000000?style=flat-square&logo=vercel" alt="Hosted on Vercel / GitHub Pages">
</p>

> 穿越时空，与千年技艺的传承人"面对面"学习。

一个沉浸式非遗学习平台：在 **3D 像素风博物馆** 中探索皮影戏、剪纸、苏绣、泥塑四大非遗项目，每个项目对应多位传承人的 **数字智能体**（涵盖现代传承人与古代匠人，共 7 位）。用户通过与智能体对话来学习非遗技艺，既可以选择现代传承人，也可以**穿越时空**拜访古代匠人，就像在和真正的传承人聊天一样。

---

## 💡 什么是"蒸馏数字智能体"？

**"蒸馏"** 是指从传承人的原始素材中提取并结构化知识，构建一个轻量但专家级的对话模型。

```
原始素材                          蒸馏输出
┌──────────────┐               ┌──────────────┐
│ 采访文本      │               │ 知识点库     │
│ 视频字幕      │  ──蒸馏──▶    │ 问答对       │
│ 教学对话      │               │ 误区/禁忌语料 │
│ FAQ 列表      │               │ 系统提示词   │
└──────────────┘               └──────┬───────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │ 传承人数字智能体│
                              │ （可对话的 AI   │
                              └──────────────┘
```

智能体不是通用聊天机器人——它的知识严格限定在蒸馏后的知识库范围内，说话风格模仿真实传承人，每次回答还会引导用户进行微练习。

---

## ✨ 主要功能

| 功能 | 说明 |
|------|------|
| 🏛️ 3D 像素博物馆 | Three.js 打造的虚拟博物馆，像素风体素非遗形象（皮影戏人物、剪纸公鸡、苏绣绣绷、泥人娃娃），带 Bloom 辉光后期特效 |
| ⏳ 时空穿梭 | 可选择古代或现代传承人，穿越到不同朝代向匠人拜师学艺 |
| 🗣️ AI 对话式学习 | 接入智谱 GLM-4-Flash 大模型，与传承人智能体自然对话，学习非遗技艺 |
| 📚 知识点追踪 | 自动识别对话中涉及的知识点，追踪掌握进度（未学 → 已了解 → 可复述） |
| 📝 蒸馏笔记 | 查看本次对话中智能体透露的所有核心知识卡片 |
| 🎨 多非遗支持 | 皮影戏、剪纸、苏绣、泥塑，每个技艺对应独立智能体 |
| 💬 打字机效果 | AI 回复逐字显示，模拟真人对话体验 |
| 📱 移动端适配 | 完整的移动端响应式布局，手机也能畅快学习 |

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite |
| 3D 渲染 | Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing |
| 后端 | FastAPI (Python) — 蒸馏知识库 Mock 服务 |
| AI 对话 | 智谱 GLM-4-Flash API + 定制 System Prompt（动态构建传承人角色） |
| 数据存储 | 蒸馏知识库 JSON + 浏览器 localStorage（学习进度 / API Key / 配额管理） |
| 部署 | Vercel（前端）+ 计划 GitHub Pages |

---

## 📖 使用说明

1. 进入欢迎页，创建你的数字人形象
2. 在 **3D 像素博物馆** 中点击展台，选择想学的非遗技艺
3. 选择一位**现代传承人**或**古代匠人**（古代匠人会触发时空穿梭动画）
4. 在设置页配置你的**智谱 GLM API Key**（[免费获取](https://open.bigmodel.cn/)）
5. 开始与传承人对话学习，每日免费 **10 次**问答
6. 在"学习进度"页查看已掌握的知识点

---

## 🚀 安装与运行

```bash
# 克隆项目
git clone https://github.com/Rhi637/heritage.skill.git
cd heritage.skill

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
pip install -r requirements.txt

# 启动后端（端口 8000）
uvicorn main:app --reload

# 启动前端（端口 5173）
cd ../frontend
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可体验。

---

## 📁 项目结构

```
heritage.skill/
├── frontend/                            # React 18 前端
│   ├── src/
│   │   ├── components/
│   │   │   └── MuseumScene.tsx          # 3D 博物馆场景（Three.js 像素风体素渲染）
│   │   ├── pages/
│   │   │   ├── MuseumPage.tsx           # 博物馆主页（3D 展台交互）
│   │   │   ├── CraftPage.tsx            # 非遗技艺学习页（传承人选择 + AI 对话 + 时空穿梭动画）
│   │   │   ├── LearningPage.tsx         # 学习进度追踪页
│   │   │   ├── AvatarSelectPage.tsx     # 用户数字人形象选择页
│   │   │   ├── WelcomePage.tsx          # 欢迎页
│   │   │   ├── SettingsPage.tsx         # 设置页（API Key 配置）
│   │   │   ├── data.ts                  # 页面级数据
│   │   │   └── types.ts                 # 页面级类型定义
│   │   ├── utils/
│   │   │   ├── api.ts                   # 智谱 GLM API 调用 + System Prompt 构建
│   │   │   ├── audio.ts                 # Web Audio 音效/背景音乐管理
│   │   │   └── storage.ts              # localStorage 持久化（进度/配额/设置）
│   │   ├── data.ts                      # 非遗项目数据与知识点定义
│   │   ├── types.ts                     # 全局 TypeScript 类型定义
│   │   ├── App.tsx                      # 路由与主组件（HashRouter）
│   │   ├── main.tsx                     # 入口
│   │   └── index.css                    # 全局样式
│   ├── public/avatars/                  # 传承人头像
│   ├── index.html                       # HTML 入口
│   ├── package.json
│   └── vite.config.ts
├── backend/                             # FastAPI Mock 后端
│   ├── main.py                          # 知识库关键词匹配 + Mock 对话
│   └── requirements.txt
├── .github/
│   ├── workflows/deploy.yml             # GitHub Actions 部署工作流
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── knowledge_base_shadow_puppet.json     # 皮影戏蒸馏知识库（含知识点/问答对/常见误区）
├── system_prompt_template.txt           # 系统提示词模板（剪纸示例，可替换）
├── CONTRIBUTING.md                      # 贡献指南
└── .gitignore
```

---

## 🤝 贡献指南

1. **Fork** 本仓库
2. 创建特性分支：`git checkout -b feature/你的功能`
3. 提交更改：`git commit -m "feat: 添加某功能"`
4. 推送分支：`git push origin feature/你的功能`
5. 提交 **Pull Request**

通过 [Issue](https://github.com/Rhi637/heritage.skill/issues) 提交 Bug 或功能建议。

---

## 🔮 未来计划

- [x] 3D 像素风虚拟博物馆（Three.js + 像素着色器 + Bloom 后期）✅
- [x] 时空穿梭动画（古代/现代传承人选择 + 穿越特效）✅
- [x] 接入真实大模型（智谱 GLM-4-Flash，动态 System Prompt 构建）✅
- [x] 打字机效果 + 知识点标签自动识别 ✅
- [x] 移动端响应式适配 ✅
- [ ] 搭建 RAG 检索管道（从关键词匹配升级为语义检索）
- [ ] 新增更多非遗项目智能体（变脸、京剧、刺绣扩展……）
- [ ] 知识点掌握度可视化面板
- [ ] 语音对话支持（ASR + TTS）
- [ ] 用户学习进度云端持久化（Supabase）
- [ ] 在线部署（Vercel 生产环境上线）
- [ ] 多语言支持（英文界面）

---

## 📄 许可证

本项目基于 [GNU General Public License v3.0](LICENSE) 开源。

---

## 👤 作者

**Rhi637**

- GitHub：[@Rhi637](https://github.com/Rhi637)

---

<p align="center">
  用技术守护传承，让非遗触手可及 🌟
</p>
