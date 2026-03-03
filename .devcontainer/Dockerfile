FROM node:22-bullseye

# Add commonly used CLI tools for local development.
USER root
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list \
  && apt-get update -o Acquire::Retries=5 \
  && apt-get install -y --no-install-recommends jq ripgrep \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

USER root
