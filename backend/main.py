"""
非遗传承人数字智能体 — FastAPI Mock 后端
==========================================
模拟蒸馏后的智能体回复，基于知识库进行条件匹配。
后续可替换为真实的 RAG + LLM 调用。

Trae 中运行：
  pip install fastapi uvicorn
  uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import time
import asyncio

app = FastAPI(title="非遗传承人数字智能体 API")

# 允许跨域（前端开发需要）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 数据模型 ==========

class ChatRequest(BaseModel):
    message: str
    inheritor_id: str = "inheritor_wang"
    session_id: str | None = None

class ChatResponse(BaseModel):
    reply: str
    knowledge_point_ids: list[str]
    timestamp: float

# ========== 加载知识库 ==========

import os
_KB_PATH = os.path.join(os.path.dirname(__file__), "..", "knowledge_base_shadow_puppet.json")
with open(_KB_PATH, "r", encoding="utf-8") as f:
    KB = json.load(f)

INHERITOR = KB["inheritor"]
KNOWLEDGE_POINTS = {kp["id"]: kp for kp in KB["knowledge_points"]}
QA_PAIRS = KB["qa_pairs"]
ERROR_PATTERNS = KB["error_patterns"]

# ========== Mock 回复生成逻辑 ==========

def find_matching_kp(message: str) -> list[dict]:
    """简单的关键词匹配，找到相关的知识点"""
    matched = []
    msg_lower = message.lower()

    # 关键词映射
    keyword_map = {
        "kp_001": ["材料", "牛皮", "制皮", "选材", "泡制", "刮"],
        "kp_002": ["刀法", "推刀", "拉刀", "顿刀", "转刀", "雕刻", "刻"],
        "kp_003": ["结构", "关节", "部件", "头茬", "身段", "连接"],
        "kp_004": ["颜色", "色彩", "红", "绿", "黑", "上色", "颜料"],
        "kp_005": ["操纵", "手法", "走步", "平举", "弯腰", "甩袖", "动"],
        "kp_006": ["唱腔", "念白", "碗碗腔", "欢音", "苦音", "唱"],
        "kp_007": ["区别", "剪纸", "不同", "剪", "刻"],
        "kp_008": ["戏台", "搭建", "亮子", "幕布", "灯", "台"],
    }

    for kp_id, keywords in keyword_map.items():
        if any(kw in msg_lower for kw in keywords):
            matched.append(KNOWLEDGE_POINTS[kp_id])

    return matched


def find_matching_qa(message: str) -> dict | None:
    """匹配问答对"""
    msg_lower = message.lower()
    for qa in QA_PAIRS:
        # 检查问题中的关键词是否出现在用户消息中
        question_words = [w for w in qa["question"] if len(w) > 1]
        match_count = sum(1 for w in question_words if w in msg_lower)
        if match_count >= 2:
            return qa
    return None


def generate_mock_reply(message: str) -> tuple[str, list[str]]:
    """
    生成 mock 回复。
    优先级：精确问答匹配 > 关键词匹配 > 默认回复
    """
    matched_kps = find_matching_kp(message)
    matched_qa = find_matching_qa(message)
    kp_ids = list(set(
        [kp["id"] for kp in matched_kps] +
        (matched_qa["knowledge_point_ids"] if matched_qa else [])
    ))

    # 1. 精确问答匹配
    if matched_qa:
        reply = matched_qa["answer"]
        # 加上引导练习
        reply += "\n\n你想不想试试" + matched_kps[0]["title"] + "？我可以给你讲讲具体怎么上手。"
        return reply, kp_ids

    # 2. 关键词匹配，基于知识点生成回复
    if matched_kps:
        kp = matched_kps[0]
        reply = f"说到{kp['title']}，这可是皮影戏的看家本领！\n\n"
        reply += kp["content"]
        reply += "\n\n你想深入了解哪个方面？我可以给你讲得更细。"
        return reply, kp_ids

    # 3. 默认回复
    default_replies = [
        "哎呀，这个问题奶奶得想想。不过你要是对皮影戏感兴趣，要不咱先从认识皮影的材料开始？知道皮影是用什么做的吗？",
        "这个嘛……要不咱们先聊聊皮影戏最基本的东西？你知道皮影和剪纸有什么区别吗？很多人搞混了。",
        "你问得好！不过咱们一步一步来，先说说你之前了解过皮影戏吗？有没有看过现场表演？",
    ]
    import random
    reply = random.choice(default_replies)
    return reply, []


# ========== API 端点 ==========

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "非遗传承人数字智能体"}


@app.get("/api/inheritor/{inheritor_id}")
async def get_inheritor(inheritor_id: str):
    """获取传承人信息"""
    if inheritor_id == INHERITOR["id"]:
        return INHERITOR
    return {"error": "传承人不存在"}


@app.get("/api/knowledge/{inheritor_id}")
async def get_knowledge(inheritor_id: str):
    """获取知识库"""
    return {
        "knowledge_points": KB["knowledge_points"],
        "qa_pairs": KB["qa_pairs"],
        "error_patterns": KB["error_patterns"],
    }


@app.post("/api/chat")
async def chat(req: ChatRequest) -> ChatResponse:
    """
    核心对话端点。
    接收用户消息，返回智能体回复和涉及的知识点 ID。

    后续替换方案：
    1. 将 generate_mock_reply 替换为 RAG 检索 + LLM 调用
    2. 添加对话历史管理
    3. 添加知识点掌握度追踪
    """
    # 模拟思考延迟（让前端展示加载状态）
    await asyncio.sleep(0.8)

    reply, kp_ids = generate_mock_reply(req.message)

    return ChatResponse(
        reply=reply,
        knowledge_point_ids=kp_ids,
        timestamp=time.time(),
    )


# ========== 启动说明 ==========
# 终端运行：
#   pip install fastapi uvicorn
#   uvicorn main:app --reload --port 8000
#
# 访问文档：
#   http://localhost:8000/docs
#
# 测试接口：
#   curl -X POST http://localhost:8000/api/chat \
#     -H "Content-Type: application/json" \
#     -d '{"message": "皮影是用什么做的？", "inheritor_id": "inheritor_wang"}'
