# 🎭 非遗传承人蒸馏数字智能体

<!-- 徽章区域 -->
<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-GPL%20v3-blue.svg?style=flat-square" alt="License: GPL v3">
  </a>
  <img src="https://img.shields.io/badge/Status-Alpha-orange.svg?style=flat-square" alt="Status: Alpha">
  <img src="https://img.shields.io/github/last-commit/Rhi637/heritage.skill?style=flat-square" alt="Last Commit">
  <img src="https://img.shields.io/github/languages/top/Rhi637/heritage.skill?style=flat-square" alt="Top Language">
  <img src="https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-181717?style=flat-square&logo=github" alt="Hosted on GitHub Pages">
</p>

> 通过对话，与千年技艺的传承人"面对面"学习。

一个沉浸式非遗学习平台：在 **3D 像素风博物馆** 中探索皮影戏、剪纸、苏绣、泥塑等非遗项目，每个项目对应一位真实传承人的 **数字智能体**。用户通过与智能体对话来学习非遗技艺，就像在和真正的传承人聊天一样。

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
| 🏛️ 3D 像素博物馆 | Three.js 打造的虚拟博物馆，像素风体素非遗形象（皮影戏人物、剪纸公鸡、苏绣绣绷、泥人娃娃） |
| 🗣️ 对话式学习 | 与传承人智能体自然对话，学习非遗技艺 |
| 📚 知识点追踪 | 自动识别对话中涉及的知识点，追踪掌握进度（未学 → 已了解 → 可复述） |
| 📝 蒸馏笔记 | 查看本次对话中智能体透露的所有核心知识卡片 |
| 🎨 多非遗支持 | 皮影戏、剪纸、苏绣、泥塑，每个技艺对应独立智能体 |

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + TypeScript + Vite + Three.js (React Three Fiber) |
| 3D 渲染 | @react-three/fiber + @react-three/drei + @react-three/postprocessing |
| 后端 | FastAPI (Python) |
| AI 对话 | RAG + 定制 System Prompt（计划接入 DeepSeek API） |
| 数据库 | Supabase pgvector（计划） |
| 部署 | Vercel（计划） |

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
├── frontend/                        # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   └── MuseumScene.tsx      # 3D 博物馆场景（Three.js）
│   │   ├── pages/
│   │   │   ├── MuseumPage.tsx       # 博物馆主页
│   │   │   ├── CraftPage.tsx        # 非遗技艺学习页
│   │   │   ├── LearningPage.tsx     # 学习进度页
│   │   │   ├── AvatarSelectPage.tsx # 数字人选择页
│   │   │   ├── WelcomePage.tsx      # 欢迎页
│   │   │   └── SettingsPage.tsx     # 设置页
│   │   ├── utils/
│   │   │   ├── api.ts              # API 调用
│   │   │   ├── audio.ts            # 音频管理
│   │   │   └── storage.ts          # 本地存储
│   │   ├── data.ts                 # 非遗数据与知识点
│   │   ├── types.ts                # TypeScript 类型定义
│   │   ├── App.tsx                 # 路由与主组件
│   │   ├── main.tsx                # 入口
│   │   └── index.css               # 全局样式
│   ├── public/avatars/             # 传承人头像
│   ├── package.json
│   └── vite.config.ts
├── backend/                         # FastAPI 后端
│   ├── main.py                     # API 端点
│   └── requirements.txt
├── .github/
│   ├── workflows/deploy.yml        # 部署工作流
│   └── ISSUE_TEMPLATE/             # Issue 模板
├── knowledge_base_shadow_puppet.json  # 皮影戏蒸馏知识库
├── system_prompt_template.txt         # 系统提示词模板
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

- [x] 3D 像素风虚拟博物馆（Three.js）✅
- [ ] 接入真实 LLM（DeepSeek API）替换 Mock 后端
- [ ] 搭建 RAG 检索管道（Supabase pgvector）
- [ ] 新增更多非遗项目智能体（变脸，京剧……）
- [ ] 知识点掌握度可视化面板
- [ ] 语音对话支持
- [ ] 用户学习进度持久化
- [ ] 部署到 Vercel（零成本在线访问）
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
