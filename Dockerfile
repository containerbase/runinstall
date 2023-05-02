# renovate: datasource=docker depName=ghcr.io/containerbase/base
ARG CONTAINERBASE_VERSION=7.8.0

FROM ghcr.io/containerbase/base:${CONTAINERBASE_VERSION}

LABEL org.opencontainers.image.source="https://github.com/containerbase/runinstall"

RUN prepare-tool all

USER 1000

COPY dist/runinstall /home/ubuntu/bin/runinstall
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/mvn
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/pipenv
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/poetry

USER 0