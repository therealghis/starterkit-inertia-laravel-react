# Preparazione
- installare docker (seguire il readme) oppure installare i servizi manualmente
- Docker
    - installazione https://docs.docker.com/engine/install/debian/#install-using-the-repository
    - https://docs.docker.com/engine/install/linux-postinstall/
        - creare l'utente e il gruppo "docker" a sistema
    - test: `docker run hello-world`

# Inizializzazione e configurazione progetto da zero
- clonare progetto deploy scripts https://dev-git.shellrent.com/shellrent-library/deploy-scripts - project installer
- creare l'applicazione tramite starter kit a partire da progetto deploy script
- portarsi nel progetto creato
- verificare che la cartella "docker" contenga le corrette configurazione e cancellare le eventuali versioni non utilizzate
- modificare i file docker-compose.build.yml e docker-compose.yml con i corretti endpoint del container registry
- creare il file .env copiando il .env.example e modificandolo opportunamente
- avviare docker deskop (se WSL), oppure avviare il servizio docker a sistema (se VM, ma di solito non è necessario)
- `docker compose -f docker-compose.build.yml build --no-cache` -> costruisce un'immagine in locale
- creazione progetto su gitlab
- push sul repository (vedi indicazioni direttamente sul progetto vuoto di gitlab con gli endpoint corretti)
- `./docker/8.4/project-installer/install-laravel-project.sh`
    - installa i vendor la prima volta - necessario per poi usare vendor/bin/sail
    - genera una nuova chiave app con artisan
    - genera il symlink con storage:link
- aggiungere al file .bashrc (o equivalente) un alias per sail: `alias sail='[ -f sail ] && sh sail || sh vendor/bin/sail'`
- `sail up -d` -> avvia i container in locale
- verificare che sia tutto ok e che l'applicativo sia raggiungibile all'url
- `docker login -u {username_gitlab} -p {gitlab_token} endpoint:5050`
    - il token deve essere un token di accesso personale con permessi di lettura e scrittura sui container registry
    - creare il token su Gitlab con permessi `read_registry`, se non esiste già. https://endpoint/-/user_settings/personal_access_tokens
    - NON serve farlo se si è già stato fatto in passato verso quel server
- `docker compose -f docker-compose.build.yml push` -> fa il push sul container registry dell'immagine costruita in locale
- modificare file hosts (solo per VM, no WSL)
    - `{ip-VM} {app-complete-domain}`

# Inizializzazione progetto già creato
- git clone
- creare il file `.env` copiando il `.env.example` e modificandolo opportunamente
    - porta web e database, APP_URL compreso
- `./docker/8.4/project-installer/install-laravel-project.sh`
    - installa i vendor la prima volta - necessario per poi usare vendor/bin/sail
    - genera una nuova chiave app con artisan
    - genera il symlink con storage:link
- `docker login -u {username_gitlab} -p {gitlab_token} endpoint:5050`
    - il token deve essere un token di accesso personale con permessi di lettura e scrittura sui container registry
    - creare il token su Gitlab con permessi `read_registry`, se non esiste già. https://endpoint/-/user_settings/personal_access_tokens
    - NON serve farlo se si è già stato fatto in passato verso quel server
- `sail up -d`
    - sail scarica l'immagine dal container registry (se presente), altrimenti la costruisce
- modificare file hosts (solo per VM, no WSL)
    - `{ip-VM} {app-complete-domain}`

# Primo avvio
- `sail artisan migrate`
- `sail artisan db:seed`
- installazione nvm (se non c'è già) https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/
  - `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`
  - `nano ~/.bashrc`
  - `source ~/.bashrc`
- `nvm install 24`
    - installazione nvm a sistema se necessario
- `nvm use 24`
- `yarn`
    - installazione yarn a sistema se necessario
- `yarn build`
- `sail artisan make:filament-user`
    - crea un utente filament da utilizzare poi all'interno dell'admin panel
- `sail artisan optimize`
- `sail artisan cache:clear`
- `sail artisan config:clear`
- `sail artisan filament:optimize`

# Avvii successivi
- `sail up -d`
- `sail artisan migrate`
- `sail artisan filament:optimize`
    - refresh delle risorse filament
- `nvm use 24`
- `yarn`
- `yarn build`
- `yarn dev`
    - necessario solo durante l'implementazione se vengono aggiunti CSS o JS direttamente negli asset ( app.css && app.js ), oppure se si lavora con viste blade custom in cui è presente tailwind, react, ...

# Accesso
- APP_URL in env

# Utils
- Monitoring e bug tracking (solo local): http://APP_URL/telescope
- Analisi statica - Larastan: `sail php ./vendor/bin/phpstan analyse >> logs/larastan_$(date +'%Y-%m-%d_%H-%M-%S').txt`
- Code style - Pint: `sail php ./vendor/bin/pint --dirty >> /logs/pint_$(date +'%Y-%m-%d_%H-%M-%S').txt`
- Test - PhpUnit: `sail artisan test`

# Implementazione

## Creazione Model + Factory + Policy + IDE Helper
- `sail artisan make:model ModelName --factory --policy`
- inserire i commenti per eventuali relationships
- `sail artisan ide-helper:models -M "App\Models\ModelName"` per generare i commenti nel model
    - con il "-M" si indica di creare gli helper in un file separato mantenendo pulito il model
    - se non viene indicato alcun model, genera i commenti per tutti i model presenti
    - il file ide helper va a repository, quindi va committato
    - l'ide helper va rigenerato ogni volta che si modifica un model
    - l'ide helper riduce gli errori di static analysis in quanto fornisce i tipi corretti per le proprietà dinamiche dei model
- inserire nell'ide helper anche il commento `@mixin \Illuminate\Database\Eloquent\Builder` per l'autocomplete dei commenti dei builder