# Preparazione
- installare docker (seguire il readme) oppure installare i servizi manualmente
- Docker
    - installazione https://docs.docker.com/engine/install/debian/#install-using-the-repository
    - https://docs.docker.com/engine/install/linux-postinstall/
        - creare l'utente e il gruppo "docker" a sistema
    - test: `docker run hello-world`

# Quick Start
- sequenza rapida per un progetto gia` creato:
    - `cp .env.example .env`
    - modificare almeno:
        - `APP_NAME`
        - `APP_URL`
        - `REGISTRY_HOST`
        - `REGISTRY_PROJECT_PATH`
        - opzionalmente `TRIVY_SOURCE_KEY` se vuoi forzarlo invece di usare lo slug di `APP_NAME`
    - `./docker/8.4/project-installer/install-laravel-project.sh`
    - `docker login -u {username_gitlab} -p {gitlab_token} {REGISTRY_HOST}`
    - `sail up -d`
    - `sail artisan migrate`
    - `sail artisan db:seed`
    - `nvm install 24`
    - `nvm use 24`
    - `yarn`
    - `yarn build`
    - `sail artisan optimize:clear`

- sequenza rapida per il primo bootstrap di un nuovo progetto da pubblicare anche sul registry:
    - `cp .env.example .env`
    - modificare almeno:
        - `APP_NAME`
        - `APP_URL`
        - `REGISTRY_HOST`
        - `REGISTRY_PROJECT_PATH`
        - opzionalmente `TRIVY_SOURCE_KEY` se vuoi forzarlo invece di usare lo slug di `APP_NAME`
    - `docker compose -f docker-compose.build.yml build --no-cache`
    - push del repository su GitLab
    - `./docker/8.4/project-installer/install-laravel-project.sh`
    - `docker login -u {username_gitlab} -p {gitlab_token} {REGISTRY_HOST}`
    - `docker compose -f docker-compose.build.yml push`
    - `sail up -d`
    - `sail artisan migrate`
    - `sail artisan db:seed`
    - `nvm install 24`
    - `nvm use 24`
    - `yarn`
    - `yarn build`
    - `sail artisan optimize:clear`

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
- il `.env.example` e` gia` predisposto per Sail locale con:
    - `APP_URL=http://localhost:8000`
    - `APP_PORT=8000`
    - `FORWARD_DB_PORT=3306`
    - `DB_CONNECTION=mysql`
    - `DB_HOST=mysql`
    - `DB_PORT=3306`
    - `DB_DATABASE=laravel`
    - `DB_USERNAME=sail`
    - `DB_PASSWORD=password`
    - `WWWUSER=1000`
    - `WWWGROUP=1000`
- avviare docker desktop (se WSL), oppure avviare il servizio docker a sistema (se VM, ma di solito non e` necessario)
- `docker compose -f docker-compose.build.yml build --no-cache`
    - costruisce le immagini in locale
- push sul repository GitLab
- `./docker/8.4/project-installer/install-laravel-project.sh`
    - installa i vendor la prima volta
    - e` necessario per poi usare `vendor/bin/sail`
    - genera una nuova chiave app con artisan
    - genera il symlink con `storage:link --force`
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
    - il file esempio e` gia` allineato al run locale con Sail
    - modificare solo cio` che serve davvero: dominio/app url, credenziali registry, eventuale `TRIVY_SOURCE_KEY`, porte se occupate
- configurare i placeholder del container registry nel file `.env` se diversi dai default dei compose
    - `REGISTRY_HOST=gitlab.example.com:5050` oppure `registry.gitlab.com`
    - `REGISTRY_PROJECT_PATH=group-or-user/project-slug`
    - `APP_IMAGE_TAG=latest`
    - `DB_IMAGE_TAG=latest`
- `./docker/8.4/project-installer/install-laravel-project.sh`
    - installa i vendor la prima volta
    - e` necessario per poi usare `vendor/bin/sail`
    - genera una nuova chiave app con artisan
    - genera il symlink con `storage:link --force`
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

# Utils
- Monitoring e bug tracking (solo local): `http://APP_URL/telescope`
- Analisi statica - Larastan: `sail php ./vendor/bin/phpstan analyse >> storage/logs/larastan_$(date +'%Y-%m-%d_%H-%M-%S').txt`
- Code style - Pint: `sail php ./vendor/bin/pint --dirty --format agent`
- Generazione route frontend - Wayfinder: `php artisan wayfinder:generate --with-form --no-interaction`
- Type check frontend: `npm run types:check`
- Test - PHPUnit: `sail artisan test`

## Scheduler Laravel
- lo scheduler Laravel esegue `security:daily-scan` ogni giorno alle `02:00`
- il job usa `withoutOverlapping()` per evitare esecuzioni concorrenti
- cron Laravel standard:
    - `* * * * * cd /percorso/progetto && php artisan schedule:run >> /dev/null 2>&1`

## Trivy source agent
- questo progetto non fa piu` parsing, delta, findings, reporting o dashboard di sicurezza
- questo progetto fa solo:
    - eseguire Trivy
    - generare i report raw JSON
    - creare il manifest del pacchetto di scansione
    - pubblicare report + manifest su filesystem condiviso
    - tracciare l'esito tecnico minimo locale nella tabella `security_scans`
- la logica centrale da spostare nel nuovo progetto dedicato e` stata raccolta in `centrale/`

## Trivy in locale
- Trivy gira dentro il container `laravel.test`
- il wrapper del progetto e` `docker/trivy/scan.sh`
- da host puoi lanciarlo normalmente; il wrapper entra da solo nel container corretto
- non usa `docker.sock` dentro `laravel.test`
- per ambienti production/staging host-based esiste anche `docker/trivy/scan-production.sh`
- `scan-production.sh` usa il binario `trivy` installato sull'host e non prova a entrare nel container Docker
- i report JSON vengono salvati in `storage/app/trivy-reports`
- i pacchetti pubblicati vengono salvati nel disk configurato da:
    - `TRIVY_PUBLISH_DISK`
    - `TRIVY_PUBLISH_DIRECTORY`
    - `TRIVY_SOURCE_KEY`
    - il path pubblicato espone subito progetto e giorno scansione senza leggere il manifest

- comandi principali:
    - scansione filesystem: `./docker/trivy/scan.sh fs`
    - scansione config/misconfiguration: `./docker/trivy/scan.sh config`
    - scansione completa che include i Dockerfile: `./docker/trivy/scan.sh all`
    - scansione completa con report JSON: `./docker/trivy/scan.sh --report-json all`
    - scansione completa di default del progetto: `./docker/trivy/scan.sh all-without-dockerfiles`
    - scansione production host-based del solo progetto: `./docker/trivy/scan-production.sh all`
    - comando applicativo Laravel: `sail artisan security:daily-scan`

- comportamento:
    - il comando Laravel usa di default `all-without-dockerfiles`
    - `all` e` un alias di `all-with-dockerfiles`
    - `all` include anche i Dockerfile del repository
    - `all-without-dockerfiles` esclude i Dockerfile del repository e `vendor/laravel/sail`
    - la directory `data/` usata dal MySQL locale viene esclusa dalle scansioni filesystem
    - `fs` usa gli scanner `vuln`, `secret` e `misconfig`
    - `all-without-dockerfiles` nel passaggio filesystem usa `vuln` e `misconfig`
    - il comando Laravel passa a Trivy anche `--severity` usando `TRIVY_ALERT_SEVERITIES`
    - dopo la generazione dei report raw il comando Laravel crea `manifest.json` e pubblica tutto nel filesystem condiviso
    - `TRIVY_SOURCE_KEY` e` l'identificativo progetto che il centrale usera` per collegare la scansione
    - se `TRIVY_SOURCE_KEY` non e` impostato, il default e` lo slug di `APP_NAME`
    - lo stesso giorno riutilizza la stessa cartella e sostituisce il contenuto invece di crearne una nuova
    - `scan-production.sh` e` il wrapper host-side per produzione/staging: esclude Dockerfile, `data/` e `node_modules/`, mantiene i lockfile del progetto e usa lo scanner filesystem `vuln` per un risultato piu` vicino a `composer audit`
- la tabella `security_scans` conserva solo tracking tecnico minimo nel database principale dell'applicazione:
        - `scan_key`
        - `status`
        - `scan_mode`
        - `started_at`
        - `finished_at`
        - `raw_report_paths`
        - `error_message`

- output atteso:
    - se usi `--report-json`, trovi i file in `storage/app/trivy-reports`
    - `sail artisan security:daily-scan` crea una scan locale, collega i report raw generati e pubblica un pacchetto composto da:
        - `manifest.json`
        - `reports/*.json`
    - il pacchetto viene pubblicato in:
        - `{TRIVY_PUBLISH_DIRECTORY}/{TRIVY_SOURCE_KEY}/{YYYY-MM-DD}/manifest.json`
        - `{TRIVY_PUBLISH_DIRECTORY}/{TRIVY_SOURCE_KEY}/{YYYY-MM-DD}/reports/*.json`

- opzioni extra:
    - puoi passare opzioni Trivy in coda
    - esempio: `./docker/trivy/scan.sh fs --severity HIGH,CRITICAL`
    - esempio con nome file deterministico: `./docker/trivy/scan.sh --report-json --report-prefix manual-test fs`

## Configurazione env Trivy
- `TRIVY_ENABLED`
    - abilita o disabilita il job applicativo
- `TRIVY_COMMAND`
    - wrapper eseguito dal comando Laravel
- `TRIVY_DEFAULT_SCAN_MODE`
    - modalita` di scan usata dal comando applicativo
- `TRIVY_ALERT_SEVERITIES`
    - severita` passate a Trivy con `--severity`
- `TRIVY_REPORTS_DISK`
    - disk dove Trivy scrive i report raw
- `TRIVY_REPORTS_DIRECTORY`
    - directory dei report raw nel disk configurato
- `TRIVY_PUBLISH_DISK`
    - disk di destinazione del pacchetto pubblicato
- `TRIVY_PUBLISH_DIRECTORY`
    - directory base del filesystem condiviso
- `TRIVY_SOURCE_KEY`
    - identificativo sorgente usato nel path del pacchetto
    - e` il valore che il centrale usera` per collegare la scansione al progetto
    - se lasciato non impostato, viene usato automaticamente lo slug di `APP_NAME`

## Trivy su object storage condiviso
- obiettivo consigliato:
    - mantenere i report raw locali su disco applicativo
    - pubblicare il pacchetto finale `manifest.json` + `reports/*.json` su object storage condiviso tra tutti i progetti
- il progetto e` gia` compatibile con questo flusso tramite il filesystem Laravel `s3`
- configurazione tipica consigliata:
    - `TRIVY_REPORTS_DISK=trivy_reports`
    - `TRIVY_REPORTS_DIRECTORY=trivy-reports`
    - `TRIVY_PUBLISH_DISK=s3`
    - `TRIVY_PUBLISH_DIRECTORY=trivy-packages`
    - lasciare `TRIVY_SOURCE_KEY` non impostato per usare lo slug di `APP_NAME`, oppure valorizzarlo esplicitamente se vuoi un identificativo fisso

- variabili object storage da configurare in `.env`:
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`
    - `AWS_DEFAULT_REGION`
    - `AWS_BUCKET`
    - `AWS_ENDPOINT`
    - `AWS_URL` se vuoi forzare una URL pubblica/base custom
    - `AWS_USE_PATH_STYLE_ENDPOINT=true` se il provider S3-compatibile lo richiede

- esempio completo con bucket condiviso:
    - `APP_NAME="Project Alpha"`
    - `TRIVY_REPORTS_DISK=trivy_reports`
    - `TRIVY_REPORTS_DIRECTORY=trivy-reports`
    - `TRIVY_PUBLISH_DISK=s3`
    - `TRIVY_PUBLISH_DIRECTORY=trivy-packages`
    - `AWS_ACCESS_KEY_ID=your-access-key`
    - `AWS_SECRET_ACCESS_KEY=your-secret-key`
    - `AWS_DEFAULT_REGION=eu-central-1`
    - `AWS_BUCKET=shared-security-reports`
    - `AWS_ENDPOINT=https://s3.example.com`
    - `AWS_USE_PATH_STYLE_ENDPOINT=true`

- risultato atteso con questa configurazione:
    - i raw report restano disponibili localmente in `storage/app/trivy-reports`
    - il pacchetto pubblicato finisce nel bucket object storage in:
        - `trivy-packages/{TRIVY_SOURCE_KEY oppure slug(APP_NAME)}/{YYYY-MM-DD}/manifest.json`
        - `trivy-packages/{TRIVY_SOURCE_KEY oppure slug(APP_NAME)}/{YYYY-MM-DD}/reports/*.json`
    - esempio pratico se `APP_NAME="Project Alpha"` e `TRIVY_SOURCE_KEY` non e` impostato:
        - `trivy-packages/project-alpha/2026-03-18/manifest.json`
        - `trivy-packages/project-alpha/2026-03-18/reports/*.json`

- note operative:
    - `TRIVY_REPORTS_DISK` e `TRIVY_PUBLISH_DISK` possono essere diversi: e` l'approccio consigliato
    - se imposti anche `TRIVY_REPORTS_DISK=s3`, allora pure i raw report verranno scritti su object storage invece che nel filesystem locale
    - il disk `s3` usato dal progetto e` quello standard Laravel definito in `config/filesystems.php`
    - per provider S3-compatibili come MinIO, Ceph, Wasabi o simili, in genere servono `AWS_ENDPOINT` e spesso `AWS_USE_PATH_STYLE_ENDPOINT=true`
    - il comando applicativo che pubblica su object storage resta invariato: `sail artisan security:daily-scan`
    - se il job gira sull'host server invece che nel container, impostare `TRIVY_COMMAND=./docker/trivy/scan-production.sh`

- test manuale consigliato:
    - verificare che le credenziali object storage siano corrette
    - eseguire `sail artisan security:daily-scan`
    - verificare la presenza nel bucket di:
        - `trivy-packages/{source}/{YYYY-MM-DD}/manifest.json`
        - `trivy-packages/{source}/{YYYY-MM-DD}/reports/*.json`
    - verificare che in `security_scans.raw_report_paths` siano presenti i report collegati alla scan locale
## Test manuale del flusso
- preparazione:
    - verificare che il filesystem configurato per `TRIVY_PUBLISH_DISK` sia raggiungibile
    - verificare che `TRIVY_SOURCE_KEY` abbia un valore esplicito per il progetto
    - verificare che la tabella `security_scans` esista
- esecuzione:
    - `sail artisan security:daily-scan`
- risultato atteso in caso di successo:
    - output console finale: `Security daily scan completed.`
    - almeno un report raw JSON presente in `storage/app/trivy-reports`
    - una nuova riga in `security_scans` con:
        - `status = completed`
        - `scan_key` valorizzato
        - `finished_at` valorizzato
        - `error_message = null`
    - `raw_report_paths` valorizzato con i report pubblicati
    - presenza di `manifest.json` nel filesystem condiviso nel path:
        - `{TRIVY_PUBLISH_DIRECTORY}/{TRIVY_SOURCE_KEY}/{YYYY-MM-DD}/manifest.json`
    - presenza dei report pubblicati nel path:
        - `{TRIVY_PUBLISH_DIRECTORY}/{TRIVY_SOURCE_KEY}/{YYYY-MM-DD}/reports/`
- risultato atteso in caso di errore tecnico:
    - output console finale: `Security daily scan failed.`
    - nuova riga in `security_scans` con:
        - `status = failed`
        - `error_message` valorizzato
    - nessun requisito di pubblicazione del pacchetto

## Test automatici del flusso
- test mirato del comando:
    - `sail artisan test --compact tests/Feature/SecurityDailyScanCommandTest.php`
    - risultato atteso: `2 passed`
- test base routing/home:
    - `sail artisan test --compact tests/Feature/ExampleTest.php`
    - risultato atteso: `2 passed`
- se vuoi verificare tutto il progetto:
    - `sail artisan test --compact`

# Implementazione

## Server Data Table example
- pagina esempio disponibile in `resources/js/pages/server-data-table-demo.tsx`
- rotta Laravel: `server-data-table-demo`
- path: `/components/server-data-table-demo`
- accesso consentito solo a utenti autenticati e verificati, perche` la rotta e` dentro il gruppo `auth` + `verified`
- la pagina mostra un esempio completo di utilizzo di `resources/js/components/server-data-table.tsx`
    - colonne
    - filtri
    - sorting
    - paginazione
    - row selection
    - bulk action
    - gestione query lato parent per simulare flusso server-driven
- se vuoi vederla nel browser:
    - avvia l'applicazione
    - effettua login
    - apri `APP_URL/components/server-data-table-demo`
- se una modifica frontend non appare su questa pagina, eseguire `npm run build` oppure `npm run dev`
- se non serve piu` e vuoi eliminarla:
    - rimuovere la pagina `resources/js/pages/server-data-table-demo.tsx`
    - rimuovere la rotta `server-data-table-demo` da `routes/web.php`

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
