interface SEOIssues {
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  line?: number;
}
export const createSeoAnalyzer = () => {
  const issues: SEOIssues[] = [];
  let currentLine = 0;
  
  // 分析规则库
  const rules = {
    checkTitle: (text: string) => {
      if (!text) issues.push({ type: 'title', message: 'Missing title tag', severity: 'high' });
      if (text.length > 60) issues.push({ 
        type: 'title', 
        message: `Title too long (${text.length}/60)`, 
        severity: 'high',
        line: currentLine
      });
    },
    
    checkMetaDescription: (text: string) => {
      if (!text) {
        issues.push({ type: 'meta', message: 'Missing meta description', severity: 'high' });
      } else if (text.length > 160) {
        issues.push({
          type: 'meta',
          message: `Description too long (${text.length}/160)`,
          severity: 'medium',
          line: currentLine
        });
      }
    }
  };

  return {
    analyzeChunk: (chunk: string) => {
      currentLine += chunk.split('\n').length;
      // 此处添加更多规则执行逻辑
      if (chunk.includes('<title>')) {
        const titleMatch = chunk.match(/<title>(.*?)<\/title>/i);
        titleMatch && rules.checkTitle(titleMatch[1]);
      }
      if (chunk.includes('meta name="description"')) {
        const descMatch = chunk.match(/<meta\s+name="description"\s+content="(.*?)"/i);
        descMatch && rules.checkMetaDescription(descMatch[1]);
      }
    },
    getResults: () => issues
  };
};
