FROM node:16.13-alpine3.14

LABEL Author="Antoine AMARA <amara.antoine@gmail.com>"

# Global install yarn package manager and Git (git can be usefull for jest tests framework)
RUN apk update && apk add yarn git

# generate-license: just a little package to easily add a free licence to a project
# svgo:  tool for optimizing SVG files
RUN npm install --global generate generate-license svgo

# Hack to avoid executing comand as root user
USER node

EXPOSE 9000
EXPOSE 9042

WORKDIR /workspace
