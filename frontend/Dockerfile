FROM node:20.11.0

WORKDIR /app

COPY package.json package-lock.json ./ 
RUN npm install

COPY . .

EXPOSE 3000

# Use dev mode for development (with volume mounts)
CMD ["npm", "run", "dev"]
