FROM node:16
WORKDIR /usr/src/bert
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build
COPY package*.json ./
RUN npm ci
COPY . .
CMD [ "node", "index.js"]