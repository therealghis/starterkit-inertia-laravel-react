#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROJECT_PATH="${TRIVY_PROJECT_PATH:-${PROJECT_ROOT}}"
PROJECT_DOCKERFILE_SKIP_LIST="${PROJECT_PATH}/docker/8.2/Dockerfile,${PROJECT_PATH}/docker/8.3/Dockerfile,${PROJECT_PATH}/docker/8.3/project-installer/Dockerfile,${PROJECT_PATH}/docker/8.4/Dockerfile,${PROJECT_PATH}/docker/8.4/project-installer/Dockerfile,${PROJECT_PATH}/docker/mysql/Dockerfile"
PROJECT_RUNTIME_SKIP_DIRS="${PROJECT_PATH}/data"
VENDOR_SKIP_DIRS="${PROJECT_PATH}/vendor/laravel/sail"
TRIVY_REPORT_DIR="${PROJECT_ROOT}/storage/app/trivy-reports"
LARAVEL_TEST_SERVICE="${LARAVEL_TEST_SERVICE:-laravel.test}"
GENERATE_JSON_REPORT=false
RUNNING_INSIDE_CONTAINER="${TRIVY_RUNNING_INSIDE_CONTAINER:-false}"

if [[ "${LARAVEL_SAIL:-}" == "1" || -f "/.dockerenv" ]]; then
    RUNNING_INSIDE_CONTAINER=true
    PROJECT_PATH="${TRIVY_PROJECT_PATH:-/var/www/html}"
    PROJECT_DOCKERFILE_SKIP_LIST="${PROJECT_PATH}/docker/8.2/Dockerfile,${PROJECT_PATH}/docker/8.3/Dockerfile,${PROJECT_PATH}/docker/8.3/project-installer/Dockerfile,${PROJECT_PATH}/docker/8.4/Dockerfile,${PROJECT_PATH}/docker/8.4/project-installer/Dockerfile,${PROJECT_PATH}/docker/mysql/Dockerfile"
    PROJECT_RUNTIME_SKIP_DIRS="${PROJECT_PATH}/data"
    VENDOR_SKIP_DIRS="${PROJECT_PATH}/vendor/laravel/sail"
fi

ORIGINAL_ARGS=("$@")

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

    printf '%s\n' --format json --output "${PROJECT_PATH}/storage/app/trivy-reports/${timestamp}-${report_key}.json"
}

run_trivy() {
    local report_key="$1"
    shift

    local report_args=()

    if [[ "${GENERATE_JSON_REPORT}" == "true" ]]; then
        mapfile -t report_args < <(build_report_args "${report_key}")
    fi

    if [[ "${RUNNING_INSIDE_CONTAINER}" == "true" ]]; then
        trivy \
            "${report_args[@]}" \
            "$@"
        return 0
    fi

    docker compose -f "${PROJECT_ROOT}/docker-compose.yml" exec -T \
        -e TRIVY_PROJECT_PATH=/var/www/html \
        -e TRIVY_RUNNING_INSIDE_CONTAINER=true \
        -w /var/www/html \
        "${LARAVEL_TEST_SERVICE}" \
        bash ./docker/trivy/scan.sh "${ORIGINAL_ARGS[@]}"
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
        run_trivy fs fs --scanners vuln,secret,misconfig --skip-dirs "${PROJECT_RUNTIME_SKIP_DIRS}" "${PROJECT_PATH}" "$@"
        ;;
    config)
        run_trivy config config "${PROJECT_PATH}" "$@"
        ;;
    all)
        run_trivy all-fs fs --scanners vuln,secret,misconfig --skip-dirs "${PROJECT_RUNTIME_SKIP_DIRS}" "${PROJECT_PATH}" "$@"
        run_trivy all-config config "${PROJECT_PATH}" "$@"
        ;;
    all-with-dockerfiles)
        run_trivy all-with-dockerfiles-fs fs --scanners vuln,secret,misconfig --skip-dirs "${PROJECT_RUNTIME_SKIP_DIRS}" "${PROJECT_PATH}" "$@"
        run_trivy all-with-dockerfiles-config config "${PROJECT_PATH}" "$@"
        ;;
    all-without-dockerfiles)
        run_trivy all-without-dockerfiles-fs fs --scanners vuln,misconfig --skip-files "${PROJECT_DOCKERFILE_SKIP_LIST}" --skip-dirs "${PROJECT_RUNTIME_SKIP_DIRS},${VENDOR_SKIP_DIRS}" "${PROJECT_PATH}" "$@"
        run_trivy all-without-dockerfiles-config config --skip-files "${PROJECT_DOCKERFILE_SKIP_LIST}" --skip-dirs "${PROJECT_RUNTIME_SKIP_DIRS},${VENDOR_SKIP_DIRS}" "${PROJECT_PATH}" "$@"
        ;;
    -h|--help|help)
        usage
        ;;
    *)
        usage
        exit 1
        ;;
esac
