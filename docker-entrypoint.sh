#!/bin/sh
set -e

# Generate runtime config.json from environment variables
CONFIG_FILE="/usr/share/nginx/html/config.json"

cat > "$CONFIG_FILE" << EOF
{
  "siteName": "${SITE_NAME:-xOTA Map}",
  "siteDescription": "${SITE_DESCRIPTION:-Alle Outdoor-Amateurfunk-Programme auf einer Karte}",
  "parentSiteName": "${PARENT_SITE_NAME:-}",
  "parentSiteUrl": "${PARENT_SITE_URL:-}",
  "parentSiteLogo": "${PARENT_SITE_LOGO:-}",
  "version": "${APP_VERSION:-dev}"
}
EOF

echo "Generated config.json:"
cat "$CONFIG_FILE"
echo ""

# Start nginx in foreground
exec nginx -g "daemon off;"
