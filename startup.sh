#!/bin/bash
set -e
cd /home/site/wwwroot

if [ ! -f "node_modules/express/package.json" ]; then
    if [ -f "node_modules.tar.gz" ]; then
        echo "Extracting node_modules from Oryx build..."
        tar -xzf node_modules.tar.gz -C node_modules/
    else
        echo "Installing production dependencies..."
        npm install --omit=dev --prefer-offline
    fi
fi

exec node server/index.js
