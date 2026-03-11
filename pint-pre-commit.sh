#!/bin/sh

# Disable error exit to allow forced commits without formatting, or with not running sail or PHP
#set -e

# Esegui Pint solo sui file modificati (con --dirty)
if [ -f vendor/bin/sail ]; then
    echo "Using Sail"

    RUNNING_CONTAINERS=$(vendor/bin/sail ps --services --filter "status=running")

    if [ -z "$RUNNING_CONTAINERS" ]; then
        echo "Sail is installed but no containers are running."
        echo "Start Sail with: sail up -d"
        exit 1
    fi

    vendor/bin/sail php vendor/bin/pint --dirty
else
    echo "Using local PHP"
    php vendor/bin/pint --dirty
fi

# Recupera e restituisce tutti i file modificati (staged e non).
MODIFIED_FILES=$(git ls-files -m)
# Alternativa: MODIFIED_FILES=$(git diff --name-only && git diff --name-only --cached)

if [ -n "$MODIFIED_FILES" ]; then
    echo "Re-staging files modified by Pint..."
    echo "$MODIFIED_FILES" | grep -v '^$' | xargs -r git add
fi

echo "Pint completed. Proceeding with commit ..."
