FROM dockerfile/nodejs-bower-grunt

WORKDIR /app

# Set instructions on build.
ADD package.json /app/
RUN npm install
ADD .bowerrc /app/
ADD bower.json /app/
RUN bower install --allow-root
ADD . /app
RUN grunt build

ENV PORT 8080
ENV NODE_ENV production

# Define default command.
CMD ["npm", "start"]

# Expose ports.
EXPOSE 8080
