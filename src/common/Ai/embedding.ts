import OpenAI from "openai";
const baseURLMap:BaseURLMap = {
  aliyuncs: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  siliconflow: 'https://api.siliconflow.cn/v1',
};

async function getEmbedding(text) {
  console.log(text);
  
  const openai = new OpenAI({
    apiKey: process.env.ARK_API_KEY, 
    baseURL: baseURLMap['aliyuncs'], 
  });
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-v3",
      input: text,
      dimensions:1024,
      encoding_format: "float" // 确保返回浮点数数组
    }); 
    console.log(response);
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("获取嵌入时出错:", error); // 添加错误处理
    throw new Error("无法获取嵌入，请稍后重试。"); // 抛出新的错误信息
  }
}

export { getEmbedding }
