#!/bin/sh
set -e

cat > /usr/share/nginx/html/config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  apiUrl: "${API_URL}",
  oidcAuthority: "${OIDC_AUTHORITY}",
  oidcClientId: "${OIDC_CLIENT_ID}"
};
EOF

exec nginx -g 'daemon off;'
