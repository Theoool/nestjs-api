import fetch from "node-fetch";  
async function query(data) {
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
            {
                headers: {
                    Authorization: `Bearer ${process.env.Facebooxtoken}`,
                    "Content-Type": "application/json",
                },
                
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        
        if (!response.ok) {
          // 添加更详细的错误日志
          const errorText = await response.text();
          console.error('响应状态:', response.status);
          console.error('错误详情:', errorText);
          console.error('请求数据:', JSON.stringify(data));
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API 请求失败:', error);
        throw error;
    }
}
// ... existing code ...


export default query
