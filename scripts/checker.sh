#!/bin/bash

# Exporta la ruta de Node.js y añádela al PATH
export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Carga nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # Carga nvm bash_completion

# Ahora pnpm debe ser accesible
cd /var/www/osom-gpt
/home/ubuntu/.nvm/versions/node/v20.10.0/bin/npm run --silent refresh-materialized-views >> /var/log/osom-gpt/materialized-views.log 2>&1