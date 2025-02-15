const { pipeline } = require('node:stream/promises');
async function summarizeText(text): Promise<string> {
  try {
    const summarizer = await pipeline('summarization', 'facebook/bart-large-cnn');

    // 调用模型生成摘要
    const result = await summarizer(text, {
      max_length: 130,
      min_length: 30,
      do_sample: false,
    } as any);

    // 处理返回值类型
    const summary = (result as { summary_text: string }[])[0]?.summary_text;
    return summary || 'Failed to generate summary';
  } catch (error) {
    console.error('Error summarizing text:', error);
    throw error;
  }
}

// 测试函数
(async () => {
  const text = `
    这里是需要摘要的长篇文章内容。自然语言处理（NLP）是人工智能的一个重要领域，
    涵盖了文本分析、机器翻译、情感分析等多种任务。近年来，随着深度学习技术的发展，
    NLP 取得了显著进展，尤其是在预训练语言模型（如 BERT、GPT）的应用方面。
  `;

  const summary = await summarizeText(text);
  console.log('Generated Summary:', summary);
})();
