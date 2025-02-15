FROM node:18-alpine

WORKDIR /app

# 安装 Python3 和构建工具
RUN apk add --no-cache python3 make g++ gcc

# 全局安装 pnpm
RUN npm install -g pnpm

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma/

# 设置 pnpm 配置
RUN pnpm config set registry https://registry.npmmirror.com

# 安装依赖
RUN pnpm install

# 生成 Prisma 客户端
RUN pnpm prisma generate

# 复制源代码
COPY . .

# 添加调试信息
RUN ls -la
RUN cat package.json
RUN echo "Node version: $(node -v)"
RUN echo "PNPM version: $(pnpm -v)"

# 构建应用（添加详细输出）
# RUN pnpm build --verbose

# 启动应用
CMD ["pnpm", "start:prod"]
