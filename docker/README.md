# Docker Notes

Per la documentazione operativa del progetto usa il README principale:

- [README.md](/home/devel/laravel-inertia-react/README.md)

In sintesi:
- [docker-compose.yml](/home/devel/laravel-inertia-react/docker-compose.yml) usa immagini dal registry
- [docker-compose.build.yml](/home/devel/laravel-inertia-react/docker-compose.build.yml) serve per build e push
- `sail up -d` non builda automaticamente le immagini se non esistono nel registry
