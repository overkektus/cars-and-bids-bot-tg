# Stage 1: Build
FROM node:lts-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# Stage 2: Production
FROM node:lts-alpine

WORKDIR /app

COPY --from=build /app/dist /app/dist

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npm uninstall puppeteer

RUN npm i puppeteer

CMD ["npm", "run", "start"]