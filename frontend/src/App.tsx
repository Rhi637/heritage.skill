/**
 * 非遗传承人数字智能体 — React 聊天组件
 * ==========================================
 * 单文件完整实现，包含消息气泡、输入框、加载状态、知识点标注。
 * 
 * Trae 中运行：
 *   npx create-vite@latest frontend --template react-ts
 *   cd frontend
 *   npm install
 *   将 src/App.tsx 替换为本文件内容
 *   npm run dev
 */

import { useState, useRef, useEffect } from "react";

// ========== 类型定义 ==========

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  knowledgePointIds?: string[];
  timestamp: number;
}

interface ChatResponse {
  reply: string;
  knowledge_point_ids: string[];
  timestamp: number;
}

// ========== 常量 ==========

const API_URL = "http://localhost:8000/api/chat";
const INHERITOR_ID = "inheritor_wang";

// 知识点标题映射（mock，后续从 API 获取）
const KP_TITLES: Record<string, string> = {
  kp_001: "选材与制皮",
  kp_002: "雕刻刀法",
  kp_003: "结构与关节",
  kp_004: "色彩搭配",
  kp_005: "操纵手法",
  kp_006: "唱腔念白",
  kp_007: "皮影vs剪纸",
  kp_008: "戏台搭建",
};

// ========== 主组件 ==========

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 发送消息
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // 添加用户消息
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          inheritor_id: INHERITOR_ID,
        }),
      });

      const data: ChatResponse = await res.json();

      // 添加智能体回复
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        knowledgePointIds: data.knowledge_point_ids,
        timestamp: data.timestamp * 1000,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("请求失败:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "哎呀，出了点小问题，你稍等一下再试试？",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      {/* 标题栏 */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>🎭</div>
          <div>
            <div style={styles.headerName}>王景民 · 皮影戏传承人</div>
            <div style={styles.headerSub}>陕西华县 · 50年从艺经验</div>
          </div>
        </div>
        <div style={styles.headerBadge}>在线</div>
      </header>

      {/* 消息列表 */}
      <div style={styles.messageList}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              欢迎来到皮影戏课堂
            </div>
            <div style={{ color: "#888" }}>
              试试问我："皮影是用什么做的？" 或 "皮影和剪纸有什么区别？"
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div style={styles.inputArea}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你想问的关于皮影戏的问题..."
          style={styles.textarea}
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            ...styles.sendButton,
            opacity: isLoading || !input.trim() ? 0.5 : 1,
          }}
        >
          {isLoading ? "思考中..." : "发送"}
        </button>
      </div>
    </div>
  );
}

// ========== 消息气泡组件 ==========

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
        padding: "0 16px",
      }}
    >
      {!isUser && (
        <div style={styles.bubbleAvatar}>🎭</div>
      )}

      <div style={{ maxWidth: "75%", marginLeft: isUser ? 0 : 8 }}>
        {/* 消息气泡 */}
        <div
          style={{
            ...styles.bubble,
            backgroundColor: isUser ? "#2563EB" : "#fff",
            color: isUser ? "#fff" : "#333",
            borderBottomRightRadius: isUser ? 4 : 16,
            borderBottomLeftRadius: isUser ? 16 : 4,
          }}
        >
          {message.content.split("\n").map((line, i) => (
            <div key={i} style={{ minHeight: line ? 24 : 8 }}>
              {line}
            </div>
          ))}
        </div>

        {/* 知识点标注 */}
        {message.knowledgePointIds && message.knowledgePointIds.length > 0 && (
          <div style={styles.kpTags}>
            {message.knowledgePointIds.map((kpId) => (
              <span key={kpId} style={styles.kpTag}>
                📖 {KP_TITLES[kpId] || kpId}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ========== 加载指示器 ==========

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "0 16px", marginBottom: 16 }}>
      <div style={styles.bubbleAvatar}>🎭</div>
      <div style={{ ...styles.bubble, backgroundColor: "#fff", padding: "12px 20px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          <span style={{ ...styles.dot, animationDelay: "0ms" }} />
          <span style={{ ...styles.dot, animationDelay: "150ms" }} />
          <span style={{ ...styles.dot, animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// ========== 样式 ==========

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 640,
    margin: "0 auto",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#F9FAFB",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft YaHei", sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #E5E7EB",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    backgroundColor: "#FEF3C7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 600,
    color: "#111",
  },
  headerSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  headerBadge: {
    fontSize: 12,
    color: "#16A34A",
    backgroundColor: "#F0FDF4",
    padding: "4px 10px",
    borderRadius: 12,
    fontWeight: 500,
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 0",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#666",
  },
  bubble: {
    padding: "12px 16px",
    borderRadius: 16,
    fontSize: 15,
    lineHeight: 1.6,
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },
  bubbleAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: "#FEF3C7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  kpTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
    marginLeft: 40,
  },
  kpTag: {
    fontSize: 12,
    color: "#92400E",
    backgroundColor: "#FFFBEB",
    padding: "2px 8px",
    borderRadius: 10,
    border: "1px solid #FDE68A",
  },
  inputArea: {
    display: "flex",
    gap: 8,
    padding: "12px 16px",
    backgroundColor: "#fff",
    borderTop: "1px solid #E5E7EB",
  },
  textarea: {
    flex: 1,
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 15,
    outline: "none",
    resize: "none",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },
  sendButton: {
    padding: "10px 20px",
    backgroundColor: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#9CA3AF",
    animation: "blink 1s infinite",
  },
};
