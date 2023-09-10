# pull the official base image
FROM node:alpine
# set working direction
WORKDIR /app
# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH
# install application dependencies
COPY ./tool/package.json ./
COPY ./tool/package-lock.json ./
RUN npm i
# add app
COPY ./tool/ ./
# start app
CMD ["npm", "start"]
