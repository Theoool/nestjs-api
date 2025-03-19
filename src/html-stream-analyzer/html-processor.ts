import { Transform } from 'stream';
import { Parser } from 'htmlparser2';

interface TagStackItem {
  name: string;
  attrs: Record<string, string>;
  startLine: number;
}

export const createHtmlStreamParser = (handlers: {
  onOpenTag: (tag: string, attrs: Record<string, string>, line: number) => void;
  onText: (text: string, line: number) => void;
  onCloseTag: (tag: string, line: number) => void;
}) => {
  let lineCount = 1;
  let buffer = '';
  const tagStack: TagStackItem[] = [];

  return new Transform({
    decodeStrings: false,
    transform(chunk, _, callback) {
      buffer += chunk.toString();
      
      // 行号计算
      const lineBreaks = chunk.toString().match(/\n/g);
      lineCount += lineBreaks ? lineBreaks.length : 0;

      const parser = new Parser({
        onopentag(name, attrs) {
          tagStack.push({ name, attrs, startLine: lineCount });
          handlers.onOpenTag(name, attrs, lineCount);
        },
        ontext(text) {
          handlers.onText(text.trim(), lineCount);
        },
        onclosetag(name) {
          const tag = tagStack.pop();
          if (tag?.name === name) {
            handlers.onCloseTag(name, tag.startLine);
          }
        }
      }, { decodeEntities: true });

      try {
        parser.write(buffer);
        buffer = '';
        parser.end();
      } catch (e) {
        buffer = buffer.substring(buffer.indexOf('<'));
      }
      callback();
    }
  });
};
