FROM mysql:8.0

ARG MYSQL_ROOT_PASSWORD
ARG MYSQL_DATABASE
ARG MYSQL_USER
ARG MYSQL_PASSWORD

# Imposta le variabili d'ambiente per la configurazione di MySQL
ENV MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
ENV MYSQL_DATABASE=$MYSQL_DATABASE
ENV MYSQL_USER=$MYSQL_USER
ENV MYSQL_PASSWORD=$MYSQL_PASSWORD

# Copia gli script SQL nella directory di inizializzazione di MySQL
COPY ./create-testing-database.sh /docker-entrypoint-initdb.d/10-create-testing-database.sh

# Opzionale: Se vuoi personalizzare ulteriormente la configurazione di MySQL, puoi copiare un file di configurazione personalizzato
# COPY ./path/to/my.cnf /etc/mysql/conf.d/

# Opzionale: Puoi esporre manualmente le porte di MySQL se necessario
EXPOSE 3306

# Opzionale: Puoi aggiungere ulteriori comandi o configurazioni in base alle tue esigenze

# Nota: Non è necessario specificare l'istruzione CMD o ENTRYPOINT poiché l'immagine di base di MySQL li fornisce già
