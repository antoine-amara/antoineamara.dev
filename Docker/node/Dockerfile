FROM node:14.16.0-alpine3.11

LABEL Author="Antoine AMARA <amara.antoine@gmail.com>"

# Global install yarn package manager and Git (git can be usefull for jest tests framework)
RUN apk update && apk add yarn git

# generate-license: just a little package to easily add a free licence to a project
# svgo:  tool for optimizing SVG files
RUN npm install --global generate generate-license svgo

# Hack to avoid executing comand as root user
RUN adduser --disabled-password --uid 1000 statickpack
USER statickpack

EXPOSE 9000
EXPOSE 9042

WORKDIR /workspace
