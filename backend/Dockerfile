# Sử dụng image Node.js phiên bản 24-slim
FROM node:24-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json .

# Cài đặt phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Biên dịch mã TypeScript
RUN npm run build

# Chạy ứng dụng ở chế độ development
CMD ["npm", "run", "start:dev"]