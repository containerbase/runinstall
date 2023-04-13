# renovate: datasource=docker depName=ghcr.io/containerbase/base
ARG CONTAINERBASE_VERSION=7.8.0

FROM ghcr.io/containerbase/base:${CONTAINERBASE_VERSION}

ARG CONTAINERBASE_VERSION

LABEL org.opencontainers.image.source="https://github.com/containerbase/sidecar" \
    org.opencontainers.image.version="${CONTAINERBASE_VERSION}"

# Compatibillity
LABEL org.label-schema.vcs-url="https://github.com/containerbase/sidecar" \
    org.label-schema.version="${CONTAINERBASE_VERSION}"

RUN prepare-tool all

USER 1000

COPY dist/runinstall /home/ubuntu/bin/runinstall
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/pipenv
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/poetry

ENV LOG_LEVEL=warn
ENV SKIP_VERSION=1
ENV RENOVATE_X_IGNORE_RE2=1