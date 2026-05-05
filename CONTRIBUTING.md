# 🤝 贡献指南

感谢你对「非遗传承人蒸馏数字智能体」项目的关注！我们欢迎各种形式的贡献，无论是代码、文档、bug 反馈，还是新的传承人知识库数据。

---

## 📋 贡献方式

### 1. 报告 Bug

如果你发现了问题，请通过 [GitHub Issues](../../issues) 提交，并使用 **Bug Report** 模板。

提交前请确认：
- [ ] 该问题尚未被报告（先搜索现有 Issues）
- [ ] 提供了清晰的复现步骤
- [ ] 附上了错误截图或日志（如有）

### 2. 提出新功能

有新想法？请使用 **Feature Request** 模板提交 Issue，描述：
- 这个功能解决什么问题？
- 你期望的行为是怎样的？
- 是否有参考案例？

### 3. 提交代码（Pull Request）

#### 流程

1. **Fork** 本仓库到你的账号
2. **Clone** 你的 Fork 到本地：
   ```bash
   git clone https://github.com/ 你的用户名/heritage.skill.git
   cd heritage.skill
   ```
3. 创建特性分支：
   ```bash
   git checkout -b feature/你的功能名称
   # 或
   git checkout -b fix/修复的问题
   ```
4. 进行修改，提交 commit：
   ```bash
   git add .
   git commit -m "feat: 添加某某功能"
   # 或
   git commit -m "fix: 修复某某问题"
   ```
5. **Push** 到你的 Fork：
   ```bash
   git push origin feature/你的功能名称
   ```
6. 在 GitHub 上提交 **Pull Request** 到本仓库的 `main` 分支

#### Commit 规范

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加语音对话支持` |
| `fix` | 修复 bug | `fix: 修复聊天界面滚动问题` |
| `docs` | 文档更新 | `docs: 更新 README 安装说明` |
| `style` | 代码格式（不影响功能） | `style: 格式化 App.tsx` |
| `refactor` | 重构 | `refactor: 优化 API 调用逻辑` |
| `test` | 测试相关 | `test: 添加聊天组件单元测试` |
| `chore` | 构建/工具相关 | `chore: 更新依赖版本` |
| `data` | 知识库数据 | `data: 添加剪纸传承人知识库` |

---

## 🎭 贡献「蒸馏知识库」数据

这是本项目的核心资产！我们欢迎提交新的非遗传承人数据。

### 数据格式

每个传承人需要一个 JSON 文件，结构如下：

```json
{
  "craft": "剪纸",
  "inheritor": {
    "name": "传承人姓名",
    "region": "所在地区",
    "experience_years": 50,
    "catchphrases": ["常用口头禅1", "常用口头禅2"]
  },
  "knowledge_points": [
    {
      "id": "kp_001",
      "title": "知识点标题",
      "category": "基础技法",
      "difficulty": "beginner",
      "content": "详细内容..."
    }
  ],
  "qa_pairs": [
    {
      "question": "常见问题",
      "answer": "标准回答",
      "knowledge_point_ids": ["kp_001"]
    }
  ],
  "error_patterns": [
    {
      "error": "常见错误做法",
      "correction": "正确做法",
      "severity": "high"
    }
  ]
}
```

### 提交方式

1. **Fork** 本仓库
2. 在 `knowledge_bases/` 目录下创建新的 JSON 文件
3. 参考现有 `knowledge_base_shadow_puppet.json` 格式
4. 提交 PR，标题格式：`data: 添加[非遗名称]传承人[姓名]知识库`

### 数据来源要求

- ✅ 传承人公开访谈、纪录片字幕
- ✅ 已出版的非遗教材、论文
- ✅ 传承人授权的个人教学资料
- ❌ 未经授权的私人对话录音
- ❌ 版权不明的网络文章

---

## 📝 文档贡献

发现文档有 typo 或表述不清？直接提交 PR 修改即可，无需先开 Issue。

---

## 💬 沟通渠道

- **GitHub Issues**：Bug 报告、功能建议、知识库数据提交
- **GitHub Discussions**：一般性讨论、问答、展示你的使用案例

---

## ⚖️ 行为准则

- 尊重每一位贡献者
- 接受建设性的批评
- 专注于对社区最有利的事情

---

再次感谢你的贡献！让我们一起用技术守护非遗传承 🌟