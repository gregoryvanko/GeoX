FROM node:22

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

# USER node

EXPOSE 9999

CMD [ "node", "exemple.js" ]