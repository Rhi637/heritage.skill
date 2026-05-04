# 🎭 非遗传承人蒸馏数字智能体

> 通过对话，与千年技艺的传承人"面对面"学习。

一个知识学习平台：每个非物质文化遗产（剪纸、皮影戏、刺绣……）对应一位真实传承人的 **数字智能体**。用户通过与智能体对话来学习非遗技艺，就像在和真正的传承人聊天一样。

\---

## 💡 什么是"蒸馏数字智能体"？

**"蒸馏"** 是指从传承人的原始素材中提取并结构化知识，构建一个轻量但专家级的对话模型。

```
原始素材                          蒸馏输出
┌──────────────┐               ┌──────────────┐
│ 采访文本      │               │ 知识点库      │
│ 视频字幕      │  ──蒸馏──▶   │ 问答对        │
│ 教学对话      │               │ 误区/禁忌语料  │
│ FAQ 列表      │               │ 系统提示词     │
└──────────────┘               └──────┬───────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │ 传承人数字智能体 │
                              │ （可对话的 AI） │
                              └──────────────┘
```

智能体不是通用聊天机器人——它的知识严格限定在蒸馏后的知识库范围内，说话风格模仿真实传承人，每次回答还会引导用户进行微练习。

\---

## ✨ 主要功能

|功能|说明|
|-|-|
|🗣️ 对话式学习|与传承人智能体自然对话，学习非遗技艺|
|📚 知识点追踪|自动识别对话中涉及的知识点，追踪掌握进度（未学 → 已了解 → 可复述）|
|📝 蒸馏笔记|查看本次对话中智能体透露的所有核心知识卡片|
|🎨 多非遗支持|剪纸、皮影戏、刺绣等，每个技艺对应独立智能体|

<!-- TODO: 添加功能截图/动图
!\\\[对话界面截图](docs/screenshots/chat-demo.gif)
!\\\[知识点追踪](docs/screenshots/knowledge-tracking.png)
!\\\[蒸馏笔记](docs/screenshots/distillation-notes.png)

\\---

## 🛠️ 技术栈

|层级|技术|
|-|-|
|前端|React + TypeScript + Vite|
|后端|FastAPI (Python)|
|AI 对话|RAG + 定制 System Prompt（计划接入 DeepSeek API）|
|数据库|Supabase pgvector（计划）|
|部署|Vercel（计划）|
|开发工具|\[\*\*Trae\*\*](https://trae.ai)|

\\---

## 🚀 安装与运行

> ⚠️ 项目仍在早期开发阶段，以下为占位说明。

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

# 启动前端（端口 3000）
cd ../frontend
npm run dev
```

打开浏览器访问 `http://localhost:3000` 即可体验。


\---

## 📁 项目结构

```
heritage.skill/
├── frontend/                # React 前端
│   ├── src/
│   │   ├── App.tsx         # 聊天主组件
│   │   ├── main.tsx        # 入口
│   │   └── index.css       # 样式
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # FastAPI 后端
│   ├── main.py             # API 端点
│   └── requirements.txt
├── knowledge\\\_base\\\_shadow\\\_puppet.json  # 皮影戏蒸馏知识库
├── system\\\_prompt\\\_template.txt         # 系统提示词模板
└── .gitignore
```

\---

## 🤝 贡献指南

欢迎任何形式的贡献！

1. **Fork** 本仓库
2. 创建特性分支：`git checkout -b feature/你的功能`
3. 提交更改：`git commit -m "feat: 添加某功能"`
4. 推送分支：`git push origin feature/你的功能`
5. 提交 **Pull Request**

### 反馈与建议

* 通过 [Issue](https://github.com/Rhi637/heritage.skill/issues) 提交 Bug 或功能建议
* 讨论请在 Issue 中使用 `discussion` 标签

\---

## 🔮 未来计划

* \[ ] 接入真实 LLM（DeepSeek API）替换 Mock 后端
* \[ ] 搭建 RAG 检索管道（Supabase pgvector）
* \[ ] 新增更多非遗项目智能体（剪纸、刺绣、泥塑……）
* \[ ] 知识点掌握度可视化面板
* \[ ] 语音对话支持
* \[ ] 用户学习进度持久化
* \[ ] 部署到 Vercel（零成本在线访问）
* \[ ] 多语言支持（英文界面）

\---

## 📄 许可证

> 本项目基于 \[GNU General Public License v3.0](LICENSE)   开源。

\---

## 👤 作者

**\[你的名字]**

* GitHub：[@Rhi637](https://github.com/Rhi637)

\---

<p align="center">
  用技术守护传承，让非遗触手可及 🌟
</p>

