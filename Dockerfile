# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Environment variables
ARG MY_SPACE
ARG API_KEY
ARG EXCLUSION_PROJECTS
ARG PORT=3000
ARG NOT_LOGGED_IN_DAYS=0

ENV MY_SPACE=${MY_SPACE}
ENV API_KEY=${API_KEY}
ENV EXCLUSION_PROJECTS=${EXCLUSION_PROJECTS}
ENV PORT=${PORT}
ENV NOT_LOGGED_IN_DAYS=${NOT_LOGGED_IN_DAYS}

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .
RUN mkdir -p /usr/src/app/output

# Make port available to the world outside this container
EXPOSE ${PORT}

# Define the command to run the app
CMD ["node", "server.js"]
