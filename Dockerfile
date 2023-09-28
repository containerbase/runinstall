# renovate: datasource=docker depName=ghcr.io/containerbase/base
ARG CONTAINERBASE_VERSION=9.20.6@sha256:02efde32631b5b7e494fc12df841f5d82b4d80de0afe978d0dfca79d1c9219a3

FROM ghcr.io/containerbase/base:${CONTAINERBASE_VERSION}

LABEL org.opencontainers.image.source="https://github.com/containerbase/runinstall"

RUN prepare-tool all

USER 1000

COPY dist/runinstall /home/ubuntu/bin/runinstall
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/mvn
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/pipenv
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/poetry

USER 0