# renovate: datasource=docker depName=ghcr.io/containerbase/base
ARG CONTAINERBASE_VERSION=10.3.3@sha256:2229a04d052999d2e46439dd735a7a64ac1b250f82148a2df9338054014dd289

FROM ghcr.io/containerbase/base:${CONTAINERBASE_VERSION}

LABEL org.opencontainers.image.source="https://github.com/containerbase/runinstall"

RUN prepare-tool all

# renovate: datasource=adoptium-java depName=java
ARG JAVA_VERSION=11.0.23+9
RUN install-tool java

# renovate: datasource=maven packageName=org.apache.maven:maven
ARG MAVEN_VERSION=3.9.1
RUN install-tool maven

# renovate: datasource=github-releases depName=python packageName=containerbase/python-prebuild
ARG PYTHON_VERSION=3.12.3
RUN install-tool python

# renovate: datasource=pypi depName=pipenv
ARG PIPENV_VERSION=2023.12.1
RUN install-tool pipenv

# renovate: datasource=github-releases depName=poetry packageName=python-poetry/poetry
ARG POETRY_VERSION=1.8.2
RUN install-tool poetry

USER 1000

COPY dist/runinstall /home/ubuntu/bin/runinstall
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/mvn
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/pipenv
RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/poetry

USER 0