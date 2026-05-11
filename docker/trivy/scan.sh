#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROJECT_PATH="${TRIVY_PROJECT_PATH:-${PROJECT_ROOT}}"
PROJECT_DOCKERFILE_SKIP_LIST="${PROJECT_PATH}/docker/8.2/Dockerfile,${PROJECT_PATH}/docker/8.3/Dockerfile,${PROJECT_PATH}/docker/8.3/project-installer/Dockerfile,${PROJECT_PATH}/docker/8.4/Dockerfile,${PROJECT_PATH}/docker/8.4/project-installer/Dockerfile,${PROJECT_PATH}/docker/mysql/Dockerfile"
PROJECT_RUNTIME_SKIP_DIRS="${PROJECT_PATH}/data"
VENDOR_SKIP_DIRS="${PROJECT_PATH}/vendor/laravel/sail"
TRIVY_REPORT_DIR="${PROJECT_ROOT}/storage/app/trivy-reports"
TRIVY_CACHE_DIR="/tmp/trivy-cache"
LARAVEL_TEST_SERVICE="laravel.test"
GENERATE_JSON_REPORT=false
REPORT_PREFIX=""
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
Uso: ./docker/trivy/scan.sh [--report-json] [--report-prefix prefix] [fs|config|all|all-with-dockerfiles|all-without-dockerfiles] [argomenti extra]

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
  ./docker/trivy/scan.sh --report-json --report-prefix manual-test fs
  ./docker/trivy/scan.sh all-with-dockerfiles
  ./docker/trivy/scan.sh all-without-dockerfiles
  ./docker/trivy/scan.sh fs --severity HIGH,CRITICAL
EOF
}

log_info() {
    printf '[INFO] %s\n' "$1" >&2
}

log_check() {
    printf '[CHECK] %s\n' "$1" >&2
}

log_command() {
    local -a command_parts=("$@")
    local formatted_command=""

    printf -v formatted_command '%q ' "${command_parts[@]}"
    printf '[INFO] Command: %s\n' "${formatted_command% }" >&2
}

fail() {
    printf '[ERROR] %s\n' "$1" >&2
    exit 1
}

ensure_command_available() {
    local command_name="$1"

    if ! command -v "${command_name}" >/dev/null 2>&1; then
        fail "Required command not found: ${command_name}"
    fi

    log_check "Command available: ${command_name}"
}

ensure_directory_writable() {
    local directory="$1"
    local label="$2"

    if ! mkdir -p "${directory}"; then
        fail "Cannot create ${label}: ${directory}"
    fi

    if [[ ! -d "${directory}" ]]; then
        fail "${label} is not a directory: ${directory}"
    fi

    if [[ ! -w "${directory}" ]]; then
        fail "${label} is not writable by user $(id -un): ${directory}"
    fi

    log_check "${label} writable: ${directory}"
}

ensure_project_path_readable() {
    if [[ ! -d "${PROJECT_PATH}" ]]; then
        fail "Project path not found: ${PROJECT_PATH}"
    fi

    if [[ ! -r "${PROJECT_PATH}" ]]; then
        fail "Project path is not readable by user $(id -un): ${PROJECT_PATH}"
    fi

    log_check "Project path readable: ${PROJECT_PATH}"
}

ensure_docker_service_running() {
    local container_id

    container_id="$(docker compose -f "${PROJECT_ROOT}/docker-compose.yml" ps -q "${LARAVEL_TEST_SERVICE}")"

    if [[ -z "${container_id}" ]]; then
        fail "Docker service is not running: ${LARAVEL_TEST_SERVICE}"
    fi

    log_check "Docker service running: ${LARAVEL_TEST_SERVICE}"
}

prepare_trivy_cache() {
    ensure_directory_writable "${TRIVY_CACHE_DIR}" 'Trivy cache directory'
    chmod 700 "${TRIVY_CACHE_DIR}"
    rm -rf "${TRIVY_CACHE_DIR}/db" "${TRIVY_CACHE_DIR}/log"
}

cleanup_trivy_cache() {
    rm -rf "${TRIVY_CACHE_DIR}/db" "${TRIVY_CACHE_DIR}/log"
}

build_report_args() {
    local report_key="$1"

    if [[ "${GENERATE_JSON_REPORT}" != "true" ]]; then
        return 0
    fi

    ensure_directory_writable "${TRIVY_REPORT_DIR}" 'Trivy report directory'

    local report_filename

    if [[ "${REPORT_PREFIX}" != "" ]]; then
        report_filename="${REPORT_PREFIX}-${report_key}.json"
    else
        local timestamp
        timestamp="$(date +'%Y-%m-%d_%H-%M-%S')"
        report_filename="${timestamp}-${report_key}.json"
    fi

    printf '%s\n' --format json --output "${PROJECT_PATH}/storage/app/trivy-reports/${report_filename}"
}

run_trivy() {
    local report_key="$1"
    shift

    local report_args=()
    local trivy_command="$1"
    shift

    if [[ "${GENERATE_JSON_REPORT}" == "true" ]]; then
        mapfile -t report_args < <(build_report_args "${report_key}")
    fi

    if [[ "${RUNNING_INSIDE_CONTAINER}" == "true" ]]; then
        ensure_command_available trivy
        ensure_project_path_readable

        (
            trap cleanup_trivy_cache EXIT
            prepare_trivy_cache
            umask 077

            log_info "Running Trivy inside container"
            log_info "Mode: ${mode}"
            log_info "Project path: ${PROJECT_PATH}"
            log_info "Cache directory: ${TRIVY_CACHE_DIR}"
            log_command trivy "${trivy_command}" "${report_args[@]}" "$@"

            trivy \
                "${trivy_command}" \
                "${report_args[@]}" \
                "$@"
        )

        return 0
    fi

    ensure_command_available docker
    ensure_project_path_readable
    ensure_docker_service_running

    log_info "Running Trivy from host via Docker container"
    log_info "Target service: ${LARAVEL_TEST_SERVICE}"
    log_info "Mode: ${mode}"

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
        --report-prefix)
            REPORT_PREFIX="${2:-}"

            if [[ "${REPORT_PREFIX}" == "" ]]; then
                usage
                exit 1
            fi

            shift 2
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
        run_trivy fs fs --scanners vuln,secret,misconfig --skip-dirs "${PROJECT_RUNTIME_SKIP_DIRS}" "$@" "${PROJECT_PATH}"
        ;;
    config)
        run_trivy config config "$@" "${PROJECT_PATH}"
        ;;
    all)
        run_trivy all-fs fs --scanners vuln,secret,misconfig --skip-dirs "${PROJECT_RUNTIME_SKIP_DIRS}" "$@" "${PROJECT_PATH}"
        run_trivy all-config config "$@" "${PROJECT_PATH}"
        ;;
    all-with-dockerfiles)
        run_trivy all-with-dockerfiles-fs fs --scanners vuln,secret,misconfig --skip-dirs "${PROJECT_RUNTIME_SKIP_DIRS}" "$@" "${PROJECT_PATH}"
        run_trivy all-with-dockerfiles-config config "$@" "${PROJECT_PATH}"
        ;;
    all-without-dockerfiles)
        run_trivy all-without-dockerfiles-fs fs --scanners vuln,misconfig --skip-files "${PROJECT_DOCKERFILE_SKIP_LIST}" --skip-dirs "${PROJECT_RUNTIME_SKIP_DIRS},${VENDOR_SKIP_DIRS}" "$@" "${PROJECT_PATH}"
        run_trivy all-without-dockerfiles-config config --skip-files "${PROJECT_DOCKERFILE_SKIP_LIST}" --skip-dirs "${PROJECT_RUNTIME_SKIP_DIRS},${VENDOR_SKIP_DIRS}" "$@" "${PROJECT_PATH}"
        ;;
    -h|--help|help)
        usage
        ;;
    *)
        usage
        exit 1
        ;;
esac
