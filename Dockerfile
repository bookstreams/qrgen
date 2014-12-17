FROM node
RUN mkdir /qrgen
ADD ./ /qrgen/
WORKDIR /qrgen/
RUN npm i
EXPOSE 3000
ENTRYPOINT ["npm", "start"]
