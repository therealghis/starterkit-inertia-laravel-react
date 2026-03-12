#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"
TRIVY_IMAGE="${TRIVY_IMAGE:-docker.io/aquasec/trivy:latest}"
TRIVY_CACHE_VOLUME="${TRIVY_CACHE_VOLUME:-${PROJECT_NAME}_trivy_cache}"
PROJECT_DOCKERFILE_SKIP_LIST="/workdir/docker/8.2/Dockerfile,/workdir/docker/8.3/Dockerfile,/workdir/docker/8.3/project-installer/Dockerfile,/workdir/docker/8.4/Dockerfile,/workdir/docker/8.4/project-installer/Dockerfile,/workdir/docker/mysql/Dockerfile"
VENDOR_SKIP_DIRS="/workdir/vendor/laravel/sail"
TRIVY_REPORT_DIR="${PROJECT_ROOT}/storage/app/trivy-reports"
GENERATE_JSON_REPORT=false

usage() {
    cat <<EOF
Uso: ./docker/trivy/scan.sh [--report-json] [fs|config|all|all-with-dockerfiles|all-without-dockerfiles] [argomenti extra]

Comandi:
  fs                       Scansione filesystem del progetto
  config                   Scansione misconfiguration/config
  all                      Alias di all-with-dockerfiles
  all-with-dockerfiles     Esegue fs + config su tutto il progetto, inclusi i Dockerfile
  all-without-dockerfiles  Esegue fs + config escludendo i Dockerfile del repository e Sail vendor

Esempi:
  ./docker/trivy/scan.sh fs
  ./docker/trivy/scan.sh config
  ./docker/trivy/scan.sh all
  ./docker/trivy/scan.sh --report-json fs
  ./docker/trivy/scan.sh all-with-dockerfiles
  ./docker/trivy/scan.sh all-without-dockerfiles
  ./docker/trivy/scan.sh fs --severity HIGH,CRITICAL
EOF
}

build_report_args() {
    local report_key="$1"

    if [[ "${GENERATE_JSON_REPORT}" != "true" ]]; then
        return 0
    fi

    mkdir -p "${TRIVY_REPORT_DIR}"

    local timestamp
    timestamp="$(date +'%Y-%m-%d_%H-%M-%S')"

    printf '%s\n' --format json --output "/workdir/storage/app/trivy-reports/${timestamp}-${report_key}.json"
}

run_trivy() {
    local report_key="$1"
    shift

    local report_args=()

    if [[ "${GENERATE_JSON_REPORT}" == "true" ]]; then
        mapfile -t report_args < <(build_report_args "${report_key}")
    fi

    docker run --rm \
        --user "$(id -u):$(id -g)" \
        -v "${PROJECT_ROOT}:/workdir" \
        -v "${TRIVY_CACHE_VOLUME}:/root/.cache/trivy" \
        -w /workdir \
        "${TRIVY_IMAGE}" \
        "${report_args[@]}" \
        "$@"
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --report-json)
            GENERATE_JSON_REPORT=true
            shift
            ;;
        *)
            break
            ;;
    esac
done

mode="${1:-all}"

if [[ $# -gt 0 ]]; then
    shift
fi

case "${mode}" in
    fs)
        run_trivy fs fs --scanners vuln,secret,misconfig /workdir "$@"
        ;;
    config)
        run_trivy config config /workdir "$@"
        ;;
    all)
        run_trivy all-fs fs --scanners vuln,secret,misconfig /workdir "$@"
        run_trivy all-config config /workdir "$@"
        ;;
    all-with-dockerfiles)
        run_trivy all-with-dockerfiles-fs fs --scanners vuln,secret,misconfig /workdir "$@"
        run_trivy all-with-dockerfiles-config config /workdir "$@"
        ;;
    all-without-dockerfiles)
        run_trivy all-without-dockerfiles-fs fs --scanners vuln,misconfig --skip-files "${PROJECT_DOCKERFILE_SKIP_LIST}" --skip-dirs "${VENDOR_SKIP_DIRS}" /workdir "$@"
        run_trivy all-without-dockerfiles-config config --skip-files "${PROJECT_DOCKERFILE_SKIP_LIST}" --skip-dirs "${VENDOR_SKIP_DIRS}" /workdir "$@"
        ;;
    -h|--help|help)
        usage
        ;;
    *)
        usage
        exit 1
        ;;
esac
