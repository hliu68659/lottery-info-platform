import { generateImage } from "./_core/imageGeneration";

/**
 * 根据文字内容生成配图
 * @param text 文字内容
 * @param style 图片风格(可选)
 * @returns 生成的图片URL
 */
export async function generateImageFromText(
  text: string,
  style: string = "elegant"
): Promise<{ url: string; success: boolean }> {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("文字内容不能为空");
    }

    // 构建优化的提示词
    const prompt = buildPrompt(text, style);

    console.log("[AI Image Generation] 开始生成图片...");
    console.log("[AI Image Generation] 提示词:", prompt);

    // 调用AI生成图片
    const result = await generateImage({
      prompt,
    });

    if (!result.url) {
      throw new Error("AI生成图片失败");
    }

    console.log("[AI Image Generation] 图片生成成功:", result.url);

    return {
      url: result.url || "",
      success: !!result.url,
    };
  } catch (error) {
    console.error("[AI Image Generation] 生成失败:", error);
    throw error;
  }
}

/**
 * 构建优化的AI提示词
 */
function buildPrompt(text: string, style: string): string {
  // 提取关键词
  const keywords = extractKeywords(text);

  // 基础风格描述
  const styleDescriptions: Record<string, string> = {
    elegant: "优雅精致的设计风格,金色和白色配色,高级感十足",
    mystical: "神秘玄学的风格,包含中国传统元素,紫色和金色配色",
    fortune: "财运和好运的主题,包含传统吉祥元素,红色和金色配色",
    wisdom: "智慧和学问的主题,书籍和知识元素,蓝色和金色配色",
    nature: "自然和谐的风格,包含自然元素,绿色和金色配色",
  };

  const styleDesc = styleDescriptions[style] || styleDescriptions.elegant;

  // 构建完整提示词
  const prompt = `
创建一张高质量的资料配图,满足以下要求:

【内容主题】
${text}

【关键词】
${keywords.join(", ")}

【设计风格】
${styleDesc}

【技术要求】
- 分辨率: 1200x800像素
- 比例: 3:2
- 格式: 现代化设计
- 文字清晰可读
- 色彩搭配和谐

【设计建议】
- 使用高质量的背景
- 包含相关的视觉元素
- 排版美观专业
- 符合彩票资讯平台的整体风格

请生成一张符合上述要求的精美配图。
  `.trim();

  return prompt;
}

/**
 * 从文本中提取关键词
 */
function extractKeywords(text: string): string[] {
  // 简单的关键词提取逻辑
  const words = text
    .split(/[\s,，。！!？?;；:：\n]+/)
    .filter((word) => word.length > 2)
    .slice(0, 5);

  return words;
}

/**
 * 根据内容类型生成配图
 */
export async function generateImageByType(
  title: string,
  content: string,
  type: "text" | "formula" | "wisdom" = "text"
): Promise<{ url: string; success: boolean }> {
  const styleMap: Record<string, string> = {
    text: "elegant",
    formula: "mystical",
    wisdom: "wisdom",
  };

  const style = styleMap[type];
  const combinedText = `${title}\n${content}`;

  return generateImageFromText(combinedText, style);
}
