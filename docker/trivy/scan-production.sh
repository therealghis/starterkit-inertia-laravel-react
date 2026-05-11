#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROJECT_PATH="${TRIVY_PROJECT_PATH:-${PROJECT_ROOT}}"
TRIVY_REPORT_DIR="${PROJECT_ROOT}/storage/app/trivy-reports"
TRIVY_CACHE_DIR="/tmp/trivy-cache-$(id -u)"
GENERATE_JSON_REPORT=false
REPORT_PREFIX=""

usage() {
    cat <<EOF
Uso: ./docker/trivy/scan-production.sh [--report-json] [--report-prefix prefix] [fs|config|all] [argomenti extra]

Comandi:
  fs      Scansione filesystem del progetto in produzione
  config  Scansione config/misconfiguration del progetto in produzione
  all     Esegue fs + config sul progetto con esclusioni production-safe

Comportamento:
  - usa il binario Trivy installato sull'host
  - esclude i Dockerfile del repository
  - esclude data/ e node_modules/
  - mantiene i lockfile del progetto per analizzare le dipendenze runtime
  - non include le dipendenze di sviluppo, salvo uso esplicito di --include-dev-deps
  - e' pensato per ambienti server dove il comando Laravel gira sull'host

Esempi:
  ./docker/trivy/scan-production.sh all
  ./docker/trivy/scan-production.sh --report-json all
  ./docker/trivy/scan-production.sh fs --severity HIGH,CRITICAL
  ./docker/trivy/scan-production.sh --report-json --report-prefix nightly all
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

prepare_trivy_cache() {
    ensure_directory_writable "${TRIVY_CACHE_DIR}" 'Trivy cache directory'
    chmod 700 "${TRIVY_CACHE_DIR}"
    rm -rf "${TRIVY_CACHE_DIR}/db" "${TRIVY_CACHE_DIR}/log"
}

cleanup_trivy_cache() {
    rm -rf "${TRIVY_CACHE_DIR}/db" "${TRIVY_CACHE_DIR}/log"
}

ensure_trivy_installed() {
    if ! command -v trivy >/dev/null 2>&1; then
        fail "Trivy is not installed on the host or is not available in PATH"
    fi

    log_check 'Command available: trivy'
}

dockerfile_skip_list() {
    if [[ ! -d "${PROJECT_PATH}/docker" ]]; then
        return 0
    fi

    find "${PROJECT_PATH}/docker" -type f -name 'Dockerfile' -print | paste -sd, -
}

skip_dirs() {
    local skip_entries=()

    for directory in data node_modules; do
        if [[ -d "${PROJECT_PATH}/${directory}" ]]; then
            skip_entries+=("${PROJECT_PATH}/${directory}")
        fi
    done

    if [[ ${#skip_entries[@]} -eq 0 ]]; then
        return 0
    fi

    local joined_skip_dirs=""

    for entry in "${skip_entries[@]}"; do
        if [[ -n "${joined_skip_dirs}" ]]; then
            joined_skip_dirs+=","
        fi

        joined_skip_dirs+="${entry}"
    done

    printf '%s' "${joined_skip_dirs}"
}

build_report_args() {
    local report_key="$1"

    if [[ "${GENERATE_JSON_REPORT}" != "true" ]]; then
        return 0
    fi

    ensure_directory_writable "${TRIVY_REPORT_DIR}" 'Trivy report directory'

    local report_filename

    if [[ -n "${REPORT_PREFIX}" ]]; then
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
    local skip_dirs_value
    local dockerfile_skip_value

    skip_dirs_value="$(skip_dirs)"
    dockerfile_skip_value="$(dockerfile_skip_list)"

    if [[ "${GENERATE_JSON_REPORT}" == "true" ]]; then
        mapfile -t report_args < <(build_report_args "${report_key}")
    fi

    local trivy_args=("${report_args[@]}")

    if [[ -n "${dockerfile_skip_value}" ]]; then
        trivy_args+=(--skip-files "${dockerfile_skip_value}")
    fi

    if [[ -n "${skip_dirs_value}" ]]; then
        trivy_args+=(--skip-dirs "${skip_dirs_value}")
    fi

    (
        trap cleanup_trivy_cache EXIT
        ensure_project_path_readable
        prepare_trivy_cache
        umask 077

        log_info "Running Trivy on host"
        log_info "Mode: ${mode}"
        log_info "Project path: ${PROJECT_PATH}"
        log_info "Cache directory: ${TRIVY_CACHE_DIR}"
        log_command trivy "${trivy_command}" "${trivy_args[@]}" "$@"

        TRIVY_CACHE_DIR="${TRIVY_CACHE_DIR}" trivy "${trivy_command}" "${trivy_args[@]}" "$@"
    )
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --report-json)
            GENERATE_JSON_REPORT=true
            shift
            ;;
        --report-prefix)
            REPORT_PREFIX="${2:-}"

            if [[ -z "${REPORT_PREFIX}" ]]; then
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
    -h|--help|help)
        usage
        exit 0
        ;;
    fs)
        ensure_trivy_installed
        run_trivy fs fs --scanners vuln "$@" "${PROJECT_PATH}"
        ;;
    config)
        ensure_trivy_installed
        run_trivy config config "$@" "${PROJECT_PATH}"
        ;;
    all)
        ensure_trivy_installed
        run_trivy all-fs fs --scanners vuln "$@" "${PROJECT_PATH}"
        run_trivy all-config config "$@" "${PROJECT_PATH}"
        ;;
    *)
        usage
        exit 1
        ;;
esac
