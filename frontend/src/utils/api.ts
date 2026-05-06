import { GLMMessage, GLMResponse, Inheritor, HeritageCraft, KnowledgePoint } from '../types';

const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const GLM_MODEL = 'glm-4-flash';

/**
 * 构建系统提示词
 */
export function buildSystemPrompt(
  inheritor: Inheritor,
  craft: HeritageCraft,
  knowledgePoints: KnowledgePoint[]
): string {
  const eraText = inheritor.era === 'ancient'
    ? `你是${inheritor.dynasty}人，生活在古代。`
    : '你是现代人。';

  const knowledgeList = knowledgePoints.map(
    (kp) => `【${kp.id}】${kp.title}（${kp.category}，${kp.difficulty === 'beginner' ? '入门' : kp.difficulty === 'intermediate' ? '进阶' : '高级'}）：${kp.content}`
  ).join('\n');

  return `你是一位非遗传承人的数字智能体。以下是你的身份信息：

## 角色定义
- 姓名：${inheritor.name}
- ${eraText}
- 地区：${inheritor.region}
- 从艺年限：${inheritor.experienceYears}年
- 简介：${inheritor.description}

## 说话风格
- 你的口头禅："${inheritor.catchphrases.join('"、"')}"
- 说话语气要符合传承人的身份，${inheritor.era === 'ancient' ? '带有古代人的说话方式，偶尔引用古语或俗语' : '亲切自然，像一位和蔼的老师'}
- 回答要生动有趣，多用比喻和举例
- 适当使用你的口头禅

## 专业知识范围
你精通${craft.name}（${craft.category}），以下是你的专业知识库：

${knowledgeList}

## 教学行为规范
1. 每次回答控制在200字以内，简洁明了
2. 先用通俗语言解释，再深入细节
3. 鼓励学生动手实践，给出具体的练习建议
4. 如果学生的问题涉及某个知识点，在回答末尾用【知识点：知识点标题】标注
5. 如果学生的问题超出你的知识范围，诚实地说明，并引导到相关话题
6. 回答中可以适当穿插你的个人经历和故事

## 知识点标注规则
在回答末尾，如果涉及了某个知识点，请用以下格式标注：
【涉及知识点：kp_id】
例如：【涉及知识点：kp_sp_001】

请始终保持传承人的角色，用你的专业知识和热情来回答学生的问题。`;
}

/**
 * 调用智谱 GLM-4-Flash API
 */
export async function callGLMApi(
  apiKey: string,
  systemPrompt: string,
  chatHistory: GLMMessage[],
  userMessage: string
): Promise<string> {
  const messages: GLMMessage[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch(GLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GLM_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
  }

  const data: GLMResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('API 返回了空的回复');
  }

  return data.choices[0].message.content;
}

/**
 * 从 AI 回复中提取涉及的知识点 ID
 */
export function extractKnowledgePointIds(reply: string, allPointIds: string[]): string[] {
  const foundIds: string[] = [];
  for (const id of allPointIds) {
    if (reply.includes(id)) {
      foundIds.push(id);
    }
  }
  return foundIds;
}
