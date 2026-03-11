FROM node:22-bullseye

USER root

RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list \
  && apt-get update -o Acquire::Retries=5 \
  && apt-get install -y --no-install-recommends jq ripgrep git \
  && apt-get install -y tmux sudo \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/node/.cursor-server \
    /home/node/.cursor \
    /home/node/.vscode-server \
    /home/node/.npm \
    /workspaces \
  && printf '[user]\n\tname = woozch\n\temail = herorise27@gmail.com\n' > /home/node/.gitconfig \
  && chown -R node:node /home/node /workspaces

ENV HOME=/home/node
WORKDIR /workspaces

USER node