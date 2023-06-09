FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
#RUN npm ci --only=production
COPY . .

EXPOSE 3000
CMD ["npm","run", "dev", "--", "--host", "outsataff.jazzpixels.com"]

