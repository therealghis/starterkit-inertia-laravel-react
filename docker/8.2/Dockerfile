FROM ubuntu:22.04
#Migrato verso ubuntu da debian 12 perchè il pacchetto php8.2-intl è disponibile ma non riesce a scaricare la dipendenza libicu70.
#php8.2-intl è richiesto da filament
#https://packages.debian.org/bookworm/php8.2-intl
#Anche provando a scaricare dipendenze come "libc6" e "libicu72" il problema non si risolve
#Provato anche a scaricare il pacchetto dal repository sury, ma senza successo
#RUN apt-get update
#RUN apt install -y apt-transport-https lsb-release ca-certificates wget
#RUN wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
#RUN sh -c 'echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list'

LABEL maintainer="Taylor Otwell"

ARG WWWGROUP
ARG NODE_VERSION=20
ARG POSTGRES_VERSION=15

WORKDIR /var/www/html

ENV DEBIAN_FRONTEND noninteractive
ENV TZ=UTC
ENV SUPERVISOR_PHP_COMMAND="/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan serve --host=0.0.0.0 --port=80"

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update
RUN apt-get install -y wget
# Per avere a disposizione il comando "lsb_release" (displays LSB (Linux Standard Base) information about your specific Linux distribution, including version number, release codename, and distributor ID.)
RUN apt-get install -y lsb-core

RUN apt-get update \
    && mkdir -p /etc/apt/keyrings \
    && apt-get install -y gnupg gosu curl ca-certificates zip unzip git supervisor sqlite3 libcap2-bin libpng-dev dh-python dnsutils librsvg2-bin fswatch ffmpeg \
    && curl -sS 'https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x14aa40ec0831756756d7f66c4f4ea0aae5267a6c' | gpg --dearmor | tee /etc/apt/keyrings/ppa_ondrej_php.gpg > /dev/null \
    && echo "deb [signed-by=/etc/apt/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu jammy main" > /etc/apt/sources.list.d/ppa_ondrej_php.list \
    && apt-get update \
    && apt-get install -y php8.2-cli php8.2-dev \
       php8.2-pgsql php8.2-sqlite3 php8.2-gd php8.2-imagick \
       php8.2-curl \
       php8.2-imap php8.2-mysql php8.2-mbstring \
       php8.2-xml php8.2-zip php8.2-bcmath php8.2-soap \
       php8.2-readline \
       php8.2-intl \
       php8.2-ldap \
       php8.2-msgpack php8.2-igbinary php8.2-redis php8.2-swoole \
       php8.2-memcached php8.2-pcov php8.2-xdebug \
       php-pear \
    && curl -sLS https://getcomposer.org/installer | php -- --install-dir=/usr/bin/ --filename=composer \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_VERSION.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && npm install -g npm \
    && npm install -g pnpm \
    && npm install -g bun \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /etc/apt/keyrings/yarn.gpg >/dev/null \
    && echo "deb [signed-by=/etc/apt/keyrings/yarn.gpg] https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list \
    && curl -sS https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /etc/apt/keyrings/pgdg.gpg >/dev/null \
    && echo "deb [signed-by=/etc/apt/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt jammy-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y yarn \
    && apt-get install -y mariadb-client \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN setcap "cap_net_bind_service=+ep" /usr/bin/php8.2

RUN groupadd --force -g $WWWGROUP sail
RUN useradd -ms /bin/bash --no-user-group -g $WWWGROUP -u 1337 sail

COPY start-container /usr/local/bin/start-container
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY php.ini /etc/php/8.2/cli/conf.d/99-sail.ini

# Scarica la lista dei repository di microsoft, salva su un file e si disfa dell'output in /dev/null. Nella lista sono presenti gli url da cui pescare i pacchetti
RUN curl https://packages.microsoft.com/keys/microsoft.asc | tee /etc/apt/trusted.gpg.d/microsoft.asc > /dev/null
RUN curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list | tee /etc/apt/sources.list.d/mssql-release.list > /dev/null

# ODBC driver https://packages.microsoft.com/ubuntu/22.04/prod/pool/main/m/msodbcsql18/
RUN apt-get update
RUN ACCEPT_EULA=Y apt-get install -y msodbcsql18
# Download manuale del pacchetto msodbcsql18, ma ha altre dipendenze come "msodbcsql18", "unixodbc (>= 2.3.1)" e "odbcinst"
# RUN wget https://packages.microsoft.com/ubuntu/22.04/prod/pool/main/m/msodbcsql18/msodbcsql18_18.3.3.1-1_amd64.deb
# RUN ACCEPT_EULA=Y dpkg -i msodbcsql18_18.3.3.1-1_amd64.deb
RUN apt-get install -y unixodbc-dev

# Imposta su quale file php_ini lavorare. Se non eseguito potrebbe dare errore "configuration option "php_ini" is not set to php.ini location"
# RUN pecl config-set php_ini /etc/php/8.2/cli/php.ini

RUN pecl install sqlsrv
RUN pecl install pdo_sqlsrv

# Per versioni specifiche:
# RUN pecl -d php_suffix=8.2 install sqlsrv
# RUN pecl -d php_suffix=8.2 install pdo_sqlsrv
# RUN pecl install sqlsrv-5.12.0
# RUN pecl install pdo_sqlsrv-5.12.0

# Consigliato da microsoft ma non utilizzato
# RUN apt-get install -y --allow-downgrades odbcinst=2.3.7 odbcinst1debian2=2.3.7 unixodbc=2.3.7 unixodbc-dev=2.3.7

# Crea il file di configurazione per i pacchetti indicati, che contiene l'indicazione di dove trovare i file .so (un oggetto condiviso salvato in formato Executable and Linkable, che contiene una libreria)
# Extensions are usually loaded using individual .ini files,
RUN printf "; priority=20\nextension=sqlsrv.so\n" > /etc/php/8.2/mods-available/sqlsrv.ini
RUN printf "; priority=30\nextension=pdo_sqlsrv.so\n" > /etc/php/8.2/mods-available/pdo_sqlsrv.ini
RUN exit

# Abilita le estensioni per PHP. Per abilitarli crea un link dentro a /etc/php/8.2/cli/conf.d a partire dai file php.ini appena creati, aggiungendo la priorità ad inizio file
RUN phpenmod -v 8.2 sqlsrv
RUN phpenmod -v 8.2 pdo_sqlsrv

RUN chmod +x /usr/local/bin/start-container

EXPOSE 8000

ENTRYPOINT ["start-container"]
