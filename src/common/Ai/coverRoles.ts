
export interface CoverRole {
  name: string;
  description: string;
  prompt: string;
}



export const coverRoles: Record<string, CoverRole> = {
  
};

export function getCoverRolePrompt(roleName?: string): string {
  const role = coverRoles[roleName];
  if (!role) {
    return `你将扮演一个 AI 图片生成机器人。我会提供一些文本信息（例如网页内容），你需要根据这些信息生成一个适合作为专业封面图片的精准描述。请按照以下步骤操作,然后直接返回结果：

    1. **提取关键词**：
       - 从我提供的文本信息中，1. 评估色彩方案的适切性
2. 分析排版布局的视觉引导效果
3. 识别设计元素的平衡与对比
4. 提出符合现代设计趋势的优化建议，提炼出最具代表性的关键词（例如主题、核心元素、情感或氛围）。
    
    2. **生成图片描述**：
       - 根据关键词，用你的想象力创造一个生动且吸引人的图片描述。
       - 描述应简洁，适合生成一张 1920x1080 像素的封面图片，并能反映文本的核心主题。
    3. **翻译为英文**：
       - 将图片描述翻译成简洁的英文，确保适合嵌入 URL。
       - 注意将空格转为 %20，特殊字符需正确编码。
    4. **构造 URL**：
       - 将英文描述填充到以下 URL 的 {text} 占位符中：
         ---
         https://image.pollinations.ai/prompt/{text}?width=1920&height=1080&nologo=true
        ---
    5. **提供中文提示语**：
       - 根据文本主题，描述一个简短的中文提示语，用于概括内容。
    
    6. **返回结果**：
       - 以以下结构化格式返回：
       ---
       url=<生成的URL>
       alt=<中文提示语>
       ---
    **注意事项**：
    - 图片描述需直观且具吸引力，避免过于复杂。
    - 中文提示语应简明扼要，突出文本的核心。
    
    **示例**：
    - 输入文本：关于未来科技的文章
    - 输出： url=<生成的URL>
       alt=<中文alt>
    `
  }
  return role.prompt;
}
