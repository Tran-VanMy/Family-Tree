# Dùng NodeJS LTS
FROM node:18

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json từ server
COPY server/package*.json ./server/

# Cài dependencies trong thư mục server
RUN cd server && npm install

# Copy toàn bộ project vào container
COPY . .

# Mở port cho Railway
EXPOSE 3000

# Lệnh khởi chạy server
CMD ["npm", "start", "--prefix", "server"]
