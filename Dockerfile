# Dùng NodeJS LTS
FROM node:18

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json từ server
COPY server/package*.json ./server/

# Cài dependencies trong thư mục server
RUN cd server && npm install --production

# Copy toàn bộ project vào container
COPY . .

# Railway sẽ set PORT, default là 4000
EXPOSE 4000

# Start server
CMD ["npm", "start", "--prefix", "server"]
