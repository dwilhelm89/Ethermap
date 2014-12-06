FROM dockerfile/nodejs-bower-grunt-runtime

ADD .bowerrc /app/

ENV PORT 8080
ENV NODE_ENV production

