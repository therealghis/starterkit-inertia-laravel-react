FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git unzip curl zip \
    libicu-dev \
    libsodium-dev \
    libzip-dev \
    unzip \
    && docker-php-ext-install \
        intl \
        opcache \
        sodium \
        zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
