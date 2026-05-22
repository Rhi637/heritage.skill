# 🎭 Heritage Inheritor Distilled Digital Agent

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-GPL%20v3-blue.svg?style=flat-square" alt="License: GPL v3">
  </a>
  <img src="https://img.shields.io/badge/Status-Beta-yellow.svg?style=flat-square" alt="Status: Beta">
  <img src="https://img.shields.io/github/last-commit/Rhi637/heritage.skill?style=flat-square" alt="Last Commit">
  <img src="https://img.shields.io/github/languages/top/Rhi637/heritage.skill?style=flat-square" alt="Top Language">
  <img src="https://img.shields.io/badge/Hosted%20on-Vercel%20%7C%20GitHub%20Pages-000000?style=flat-square&logo=vercel" alt="Hosted on Vercel / GitHub Pages">
</p>

> Travel through time and learn face-to-face with masters of thousand-year-old crafts.

An immersive learning platform for intangible cultural heritage (ICH): explore six major ICH crafts — **Shadow Puppetry, Paper Cutting, Suzhou Embroidery, Clay Sculpture, Blue & White Porcelain, and Woodblock New Year Prints** — in a **3D pixel-art museum**. Each craft features multiple **digital agents** modeled after real inheritors (9 total, spanning modern masters and ancient artisans). Learn traditional skills through natural conversation with these AI agents — choose a modern inheritor, **travel back in time** to study under a historical craftsman, take **knowledge quizzes**, and play **hands-on mini-games** for a truly immersive ICH experience.

---

## 💡 What is a "Distilled Digital Agent"?

**"Distillation"** is the process of extracting and structuring knowledge from an inheritor's raw materials to build a lightweight, expert-level conversational model.

```
Raw Materials                       Distilled Output
┌──────────────┐               ┌──────────────┐
│ Interview text│               │ Knowledge base│
│ Video captions│  ──distill──▶ │ Q&A pairs     │
│ Teaching logs │               │ Common errors │
│ FAQ lists     │               │ System prompt │
└──────────────┘               └──────┬───────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │ Digital Agent │
                              │ (Conversational│
                              │      AI)      │
                              └──────────────┘
```

The agent is not a general-purpose chatbot — its knowledge is strictly confined to the distilled knowledge base, its speaking style mimics the real inheritor, and every response gently guides the user toward a micro-exercise.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🏛️ 3D Pixel-Art Museum | A virtual museum built with Three.js, featuring **6** pixel/voxel-style ICH exhibits (shadow puppet, paper-cut rooster, embroidery frame, clay doll, porcelain vase, New Year print door god) in a circular layout with zoom animations and light-beam connections |
| ⏳ Time Travel | Choose between modern inheritors and ancient artisans — travel to different dynasties to learn from historical masters |
| 🧑‍🏫 NPC Guide | A pixel-art museum guide automatically welcomes and directs new visitors to explore exhibits |
| 🗣️ AI-Powered Learning | Powered by Zhipu GLM-4-Flash LLM, engage in natural conversations with inheritor agents to learn ICH skills |
| 🎮 Interactive Mini-Games | **Paper Cutting Simulator**: click and drag on folded paper to "cut" patterns, then unfold to reveal symmetrical artwork; **Scroll Treasure Hunt**: collect ICH treasures on an ancient scroll while dodging obstacles |
| 📝 Knowledge Quiz | Auto-generated multiple choice questions based on learned knowledge points — test your knowledge and get instant scores |
| 👤 User Center | Personal profile page + **Title System** (Grandmaster/Heritage Guardian/Culture Keeper tiers) + pixel-art 3D avatar + learning statistics |
| 🏆 Achievement System | Daily check-in + achievement badges (Scholar/Omniscient/Rising Star tiers) + daily fun facts about ICH |
| 📚 Knowledge Point Tracking | Auto-detect knowledge points mentioned in conversations and track mastery progress (Unlearned → Understood → Can Restate) |
| 🎨 Multi-Craft Support | Shadow Puppetry, Paper Cutting, Suzhou Embroidery, Clay Sculpture, Blue & White Porcelain, and Woodblock New Year Prints — **6 crafts**, each with its own dedicated agent |
| 🎭 Unified Pixel Art Style | Zpix pixel font + global pixel CSS + pixel-art 3D avatars (16×16 Canvas rendering) |
| 💬 Typewriter Effect | AI replies appear character by character, simulating a real conversation experience |
| 📱 Mobile Responsive | Fully responsive layout — learn comfortably on your phone |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| 3D Rendering | Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing (MeshStandardMaterial voxel models + Bloom post-processing) |
| Backend | FastAPI (Python) — distilled knowledge base mock service |
| AI Conversation | Zhipu GLM-4-Flash API + custom System Prompt (dynamically constructed inheritor personas) |
| Data Storage | Distilled knowledge base JSON + browser localStorage (learning progress / API key / quota management) |
| Deployment | Vercel (frontend) + GitHub Pages (planned) |

---

## 📖 Usage Guide

1. Enter the welcome page and create your digital avatar
2. In the **3D Pixel-Art Museum**, click on an exhibit (6 total, circular layout) to choose a craft to learn
3. Select a **modern inheritor** or an **ancient artisan** (choosing an ancient one triggers a time-travel animation)
4. Configure your **Zhipu GLM API Key** on the Settings page ([get one free](https://open.bigmodel.cn/))
5. Start learning through conversation — **10 free queries** per day
6. Take a **knowledge quiz** anytime to test your learning, or play the **Paper Cutting** / **Scroll Treasure Hunt** mini-games
7. Open the **Achievements Panel** to claim daily rewards and unlock achievement badges
8. Visit the **User Center** to view your title, learning stats, and pixel-art avatar
9. Review your mastered knowledge points on the Learning Progress page

---

## 🚀 Installation & Running

```bash
# Clone the repository
git clone https://github.com/Rhi637/heritage.skill.git
cd heritage.skill

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt

# Start the backend (port 8000)
uvicorn main:app --reload

# Start the frontend (port 5173)
cd ../frontend
npm run dev
```

Open your browser and visit `http://localhost:5173` to experience it.

---

## 📁 Project Structure

```
heritage.skill/
├── frontend/                            # React 18 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── MuseumScene.tsx          # 3D museum scene (6 voxel figures + NPC guide + Bloom post-processing)
│   │   │   ├── InheritorAvatar.tsx      # Pixel-art 3D avatar (16×16 Canvas rendering)
│   │   │   ├── PaperCuttingGame.tsx     # Hands-on mini-game: paper cutting simulator (fold + cut + unfold)
│   │   │   ├── ScrollTreasureGame.tsx   # Scroll treasure hunt game (collect ICH items + dodge obstacles)
│   │   │   ├── CraftQuiz.tsx            # Knowledge quiz (multiple choice + auto scoring)
│   │   │   └── AchievementsPanel.tsx    # Achievement system + daily challenges (check-in/badges/fun facts)
│   │   ├── pages/
│   │   │   ├── MuseumPage.tsx           # Museum main page (circular layout + light-beam interaction)
│   │   │   ├── CraftPage.tsx            # Craft learning page (inheritor selection + AI chat + time travel)
│   │   │   ├── LearningPage.tsx         # Learning progress tracking page
│   │   │   ├── AvatarSelectPage.tsx     # User avatar selection page
│   │   │   ├── WelcomePage.tsx          # Welcome page
│   │   │   ├── UserPage.tsx             # User center (title system + learning stats + pixel avatar)
│   │   │   ├── SettingsPage.tsx         # Settings page (API key configuration)
│   │   │   ├── data.ts                  # Page-level data
│   │   │   └── types.ts                 # Page-level type definitions
│   │   ├── utils/
│   │   │   ├── api.ts                   # Zhipu GLM API calls + system prompt construction
│   │   │   ├── audio.ts                 # Web Audio sound effects / background music management
│   │   │   └── storage.ts              # localStorage persistence (progress / quota / achievements / settings)
│   │   ├── data.ts                      # Six ICH craft data & knowledge point definitions
│   │   ├── types.ts                     # Global TypeScript type definitions
│   │   ├── App.tsx                      # Routing & main component (HashRouter)
│   │   ├── main.tsx                     # Entry point
│   │   └── index.css                    # Global pixel-art styles (Zpix font + CSS pixelation)
│   ├── public/avatars/                  # Inheritor avatar images
│   ├── index.html                       # HTML entry point
│   ├── package.json
│   └── vite.config.ts
├── backend/                             # FastAPI mock backend
│   ├── main.py                          # Knowledge base keyword matching + mock conversation
│   └── requirements.txt
├── .github/
│   ├── workflows/deploy.yml             # GitHub Actions deployment workflow
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── knowledge_base_shadow_puppet.json     # Shadow puppetry distilled knowledge base (knowledge points / Q&A pairs / common errors)
├── system_prompt_template.txt           # System prompt template (paper cutting example, replaceable)
├── CONTRIBUTING.md                      # Contribution guide
└── .gitignore
```

---

## 🤝 Contributing

1. **Fork** this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add some feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Submit a **Pull Request**

Submit bugs or feature suggestions via [Issues](https://github.com/Rhi637/heritage.skill/issues).

---

## 🔮 Roadmap

- [x] 3D pixel-art virtual museum (Three.js + MeshStandardMaterial voxel models + Bloom, 6 exhibits in circular layout) ✅
- [x] Time-travel animation (modern/ancient inheritor selection + transition effects) ✅
- [x] Real LLM integration (Zhipu GLM-4-Flash with dynamic System Prompt construction) ✅
- [x] Typewriter effect + auto knowledge-point tagging ✅
- [x] Mobile responsive layout ✅
- [x] Unified pixel art style (Zpix font + pixel-art 3D avatars + global CSS pixelation) ✅
- [x] New crafts: Blue & White Porcelain + Woodblock New Year Prints (6 total) ✅
- [x] Knowledge quiz + two interactive mini-games (Paper Cutting + Scroll Treasure Hunt) ✅
- [x] Achievement system + daily challenges (check-in/badges/fun facts) ✅
- [x] NPC guide (auto welcome & museum tour) ✅
- [x] User center + title system (profile page / learning stats / pixel-art avatar) ✅
- [ ] RAG retrieval pipeline (upgrade from keyword matching to semantic search)
- [ ] More interactive mini-games (clay sculpting, porcelain painting...)
- [ ] Knowledge mastery visualization dashboard
- [ ] Voice conversation support (ASR + TTS)
- [ ] Cloud-based learning progress persistence (Supabase)
- [ ] Online deployment (Vercel production launch)
- [ ] Multi-language support (English UI)

---

## 📄 License

This project is open-sourced under the [GNU General Public License v3.0](LICENSE).

---

## 👤 Author

**Rhi637**

- GitHub: [@Rhi637](https://github.com/Rhi637)

---

<p align="center">
  Preserving heritage through technology, making ICH accessible to all 🌟
</p>
