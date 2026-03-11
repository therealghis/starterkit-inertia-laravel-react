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
- creare il progetto su GitLab il prima possibile
    - in questa configurazione il run locale standard dipende dal container registry GitLab
    - quindi il progetto deve essere pushato su GitLab per poter pubblicare le immagini usate poi da `sail up -d`
- configurare i placeholder del container registry nei compose oppure nel file `.env`
    - `REGISTRY_HOST=gitlab.example.com:5050` per GitLab self-hosted, oppure `REGISTRY_HOST=registry.gitlab.com` per GitLab.com
    - `REGISTRY_PROJECT_PATH=group-or-user/project-slug`
    - `APP_IMAGE_TAG=latest`
    - `DB_IMAGE_TAG=latest`
- creare il file `.env` copiando il `.env.example` e modificandolo opportunamente
- avviare docker desktop (se WSL), oppure avviare il servizio docker a sistema (se VM, ma di solito non e` necessario)
- `docker compose -f docker-compose.build.yml build --no-cache`
    - costruisce le immagini in locale
- push sul repository GitLab
- `./docker/8.4/project-installer/install-laravel-project.sh`
    - installa i vendor la prima volta
    - e` necessario per poi usare `vendor/bin/sail`
    - genera una nuova chiave app con artisan
    - genera il symlink con `storage:link`
- aggiungere al file `.bashrc` (o equivalente) un alias per sail: `alias sail='[ -f sail ] && sh sail || sh vendor/bin/sail'`
- `docker login -u {username_gitlab} -p {gitlab_token} {REGISTRY_HOST}`
    - il token deve essere un token di accesso personale con permessi di lettura e scrittura sul container registry
    - per fare anche il push servono i permessi `read_registry` e `write_registry`
    - creare il token su GitLab, se non esiste gia`. `https://{gitlab-host}/-/user_settings/personal_access_tokens`
    - NON serve farlo se si e` gia` fatto in passato verso quel server
- `docker compose -f docker-compose.build.yml push`
    - fa il push sul container registry delle immagini costruite in locale
- `sail up -d`
    - sail usa `docker compose` sul `docker-compose.yml`
    - con questo file prova a scaricare le immagini dal container registry
    - se le immagini non esistono, non costruisce nulla in automatico
    - quindi prima del primo avvio devono esistere nel registry
- verificare che sia tutto ok e che l'applicativo sia raggiungibile all'url
- modificare file hosts (solo per VM, no WSL)
    - `{ip-VM} {app-complete-domain}`

# Inizializzazione progetto gia` creato
- git clone
- creare il file `.env` copiando il `.env.example` e modificandolo opportunamente
    - porta web e database, `APP_URL` compreso
- configurare i placeholder del container registry nel file `.env` se diversi dai default dei compose
    - `REGISTRY_HOST=gitlab.example.com:5050` oppure `registry.gitlab.com`
    - `REGISTRY_PROJECT_PATH=group-or-user/project-slug`
    - `APP_IMAGE_TAG=latest`
    - `DB_IMAGE_TAG=latest`
- `./docker/8.4/project-installer/install-laravel-project.sh`
    - installa i vendor la prima volta
    - e` necessario per poi usare `vendor/bin/sail`
    - genera una nuova chiave app con artisan
    - genera il symlink con `storage:link`
- `docker login -u {username_gitlab} -p {gitlab_token} {REGISTRY_HOST}`
    - per scaricare basta `read_registry`
    - per build + push servono anche `write_registry`
    - creare il token su GitLab, se non esiste gia`. `https://{gitlab-host}/-/user_settings/personal_access_tokens`
    - NON serve farlo se si e` gia` fatto in passato verso quel server
- `sail up -d`
    - sail usa `docker compose` sul `docker-compose.yml`
    - con questo file prova a scaricare le immagini dal container registry
    - se le immagini non esistono, non costruisce nulla in automatico
    - per costruirle usare `docker compose -f docker-compose.build.yml build`
- modificare file hosts (solo per VM, no WSL)
    - `{ip-VM} {app-complete-domain}`

# Primo avvio
- `sail artisan migrate`
- `sail artisan db:seed`
    - il seeder base crea o aggiorna un utente iniziale leggendo:
        - `STARTER_USER_NAME`
        - `STARTER_USER_EMAIL`
        - `STARTER_USER_PASSWORD`
    - valori di default:
        - email: `admin@local.test`
        - password: `password`
- installazione nvm (se non c'e` gia`) https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/
  - `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`
  - `nano ~/.bashrc`
  - `source ~/.bashrc`
- `nvm install 24`
    - installazione nvm a sistema se necessario
- `nvm use 24`
- `yarn`
    - installazione yarn a sistema se necessario
- `yarn build`
- `sail artisan optimize:clear`

# Avvii successivi
- `sail up -d`
- `sail artisan migrate`
- `sail artisan optimize:clear`
- `nvm use 24`
- `yarn`
- `yarn build`
- `yarn dev`
    - necessario solo durante l'implementazione se vengono aggiunti CSS o JS direttamente negli asset (`app.css` && `app.js`), oppure se si lavora con viste blade custom in cui e` presente tailwind, react, ...

# Accesso
- `APP_URL` in env

# Localizzazione
- la gestione lingua usa il meccanismo classico Laravel
- locale di default: `en`
- locale persistita in sessione tramite middleware
- traduzioni frontend/backend nei file:
    - `lang/en.json`
    - `lang/it.json`
- lato frontend le traduzioni arrivano via Inertia shared props
- helper React: `resources/js/hooks/use-translations.ts`
- pattern d'uso frontend:
    - `const { t } = useTranslations()`
    - `t('Dashboard')`
- per aggiungere una nuova stringa:
    - aggiungere la chiave in `lang/en.json`
    - aggiungere la traduzione in `lang/it.json`
    - usare `t('Your key')` nel frontend oppure `__('Your key')` nel backend

# Gestione errori
- il progetto usa Kraken come exception handler Laravel globale
- il binding e` in `app/Providers/AppServiceProvider.php`
    - `Illuminate\Contracts\Debug\ExceptionHandler`
    - `Shellrent\KrakenClient\Laravel\KrakenExceptionHandler`
- questo significa che:
    - il reporting delle eccezioni passa da Kraken
    - la presentazione UI degli errori HTTP e` gestita in `bootstrap/app.php`
    - per gli status principali viene renderizzata la pagina Inertia `resources/js/pages/error-page.tsx`
- status gestiti con pagina dedicata:
    - `403`
    - `404`
    - `429`
    - `500`
    - `503`

# Utils
- Monitoring e bug tracking (solo local): `http://APP_URL/telescope`
- Analisi statica - Larastan: `sail php ./vendor/bin/phpstan analyse >> storage/logs/larastan_$(date +'%Y-%m-%d_%H-%M-%S').txt`
- Code style - Pint: `sail php ./vendor/bin/pint --dirty --format agent`
- Generazione route frontend - Wayfinder: `php artisan wayfinder:generate --with-form --no-interaction`
- Type check frontend: `npm run types:check`
- Test - PHPUnit: `sail artisan test`

# Implementazione

## Stato vuoto riusabile
- componente disponibile: `resources/js/components/empty-state.tsx`
- usarlo come pattern comune per liste vuote, dashboard vuote e assenza dati

## Creazione Model + Factory + Policy + IDE Helper
- `sail artisan make:model ModelName --factory --policy`
- inserire i commenti per eventuali relationships
- `sail artisan ide-helper:models -M "App\Models\ModelName"` per generare i commenti nel model
    - con il `-M` si indica di creare gli helper in un file separato mantenendo pulito il model
    - se non viene indicato alcun model, genera i commenti per tutti i model presenti
    - il file ide helper va a repository, quindi va committato
    - l'ide helper va rigenerato ogni volta che si modifica un model
    - l'ide helper riduce gli errori di static analysis in quanto fornisce i tipi corretti per le proprieta` dinamiche dei model
- inserire nell'ide helper anche il commento `@mixin \Illuminate\Database\Eloquent\Builder` per l'autocomplete dei builder

# Note operative
- se una modifica frontend non appare, eseguire `npm run build` oppure `npm run dev`
- Wayfinder genera file route/action TypeScript; dopo cambi route Laravel conviene rigenerare
- i test PHP locali richiedono `pdo_sqlite` se usi la configurazione test standard con SQLite in-memory
