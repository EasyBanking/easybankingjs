FROM node:16.6.0

WORKDIR / /app

COPY package.json /app/

RUN npm install

COPY / /app

EXPOSE 3000:5000

CMD npm start
