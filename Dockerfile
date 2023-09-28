# renovate: datasource=docker depName=ghcr.io/containerbase/base
ARG CONTAINERBASE_VERSION=7.8.0@sha256:7335c4cae877c06e1e653a3d35e7a201c7fc7b39af478dbf07e71edb7722fa4e

FROM ghcr.io/containerbase/base:${CONTAINERBASE_VERSION}

LABEL org.opencontainers.image.source="https://github.com/containerbase/runinstall"

RUN prepare-tool all

USER 1000

COPY dist/runinstall /home/ubuntu/bin/runinstall
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/mvn
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/pipenv
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/poetry

USER 0