# Docker Notes

Per la documentazione operativa del progetto usa il README principale:

- [README.md](/home/devel/laravel-inertia-react/README.md)

In sintesi:
- [docker-compose.yml](/home/devel/laravel-inertia-react/docker-compose.yml) usa immagini dal registry
- [docker-compose.build.yml](/home/devel/laravel-inertia-react/docker-compose.build.yml) serve per build e push
- `sail up -d` non builda automaticamente le immagini se non esistono nel registry

## Trivy sul server di deploy

- in locale Trivy e` gia` incluso nell'immagine `laravel.test`, quindi `docker/trivy/scan.sh` funziona tramite container
- per il locale usare `./docker/trivy/scan.sh`
- per server host-based usare `./docker/trivy/scan-production.sh`
- sul server di produzione o staging la situazione dipende da dove esegui `php artisan security:daily-scan`
- se il comando Laravel viene eseguito dentro un container applicativo che contiene gia` Trivy, non serve installarlo sull'host
- se invece il comando Laravel o lo scheduler vengono eseguiti sull'host del server, allora Trivy deve essere installato anche sull'host, altrimenti lo script configurato in `TRIVY_COMMAND` non puo` partire

- regola pratica:
    - esecuzione scan dentro container applicativo: Trivy va installato nell'immagine/container
    - esecuzione scan da host/server: Trivy va installato sul server host

- per installazione host su Debian/Ubuntu:
    - `sudo apt-get update`
    - `sudo apt-get install -y wget gnupg lsb-release`
    - `wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null`
    - `echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee /etc/apt/sources.list.d/trivy.list`
    - `sudo apt-get update`
    - `sudo apt-get install -y trivy`

- verifica installazione:
    - `trivy --version`

- comportamento di `./docker/trivy/scan-production.sh`:
    - usa solo il binario host `trivy`
    - esclude i Dockerfile del repository
    - esclude `data/`
    - esclude `node_modules/`
    - mantiene `composer.lock` e i lockfile JavaScript del progetto
    - non include le dipendenze di sviluppo salvo uso esplicito di `--include-dev-deps`
    - la scansione filesystem production usa solo lo scanner `vuln`
    - genera report JSON in `storage/app/trivy-reports` quando usi `--report-json`
    - modalita` consigliata sul server: `./docker/trivy/scan-production.sh all`

- nota importante:
    - il default del progetto e` `TRIVY_COMMAND=./docker/trivy/scan.sh`
    - questo wrapper e` pensato per l'ambiente locale con Docker/Sail
    - in produzione conviene impostare `TRIVY_COMMAND=./docker/trivy/scan-production.sh` se il job gira sull'host
    - `scan-production.sh` usa il binario `trivy` installato sul server e non prova a entrare nei container Docker
    - se il job gira dentro il container applicativo, assicurati che l'immagine finale contenga Trivy

- perche` serve questa distinzione:
    - il comando Laravel `security:daily-scan` esegue il binario configurato in `TRIVY_COMMAND`
    - quindi il binario o wrapper deve esistere davvero nel contesto runtime in cui parte il comando schedulato
