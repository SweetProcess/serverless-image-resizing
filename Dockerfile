FROM amazonlinux:latest

ADD etc/nodesource.gpg.key /etc

WORKDIR /tmp

COPY lambda/* ./

RUN curl --silent --location https://rpm.nodesource.com/setup_10.x | bash && \
    yum -y install nodejs gcc-c++ make git sed tar which && \
    npm i -g n && \
    n 10.16.3 && \
    npm install && \
    npm cache clean --force && \
    yum clean all

WORKDIR /build
