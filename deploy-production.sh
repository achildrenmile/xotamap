#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DEPLOY_HOST="achildrenmile@host-node-01"
REMOTE_DIR="/home/achildrenmile/xotamap"
CONTAINER_NAME="xotamap"
IMAGE_NAME="xotamap:latest"
CONTAINER_PORT="127.0.0.1:3082:80"
DOCKER_CMD="docker"

# Determine APP_VERSION from git or package.json
APP_VERSION=$(git describe --tags --always 2>/dev/null || node -p "require('./package.json').version" 2>/dev/null || echo "unknown")

# Check for --rebuild flag
REBUILD_FLAG=""
if [ "$1" == "--rebuild" ]; then
    REBUILD_FLAG="--no-cache"
    echo -e "${YELLOW}Rebuild flag set - will build without cache${NC}"
fi

echo -e "${GREEN}=== Deploying xOTA Map to host-node-01 ===${NC}"
echo "Host: $DEPLOY_HOST"
echo "Remote dir: $REMOTE_DIR"
echo "Container: $CONTAINER_NAME"
echo "Port: $CONTAINER_PORT"
echo "Version: $APP_VERSION"
echo ""

# Step 1: Sync code to host-node-01
echo -e "${GREEN}Step 1: Syncing code to host-node-01...${NC}"
ssh "$DEPLOY_HOST" "
    if [ -d '$REMOTE_DIR' ]; then
        cd '$REMOTE_DIR' && git pull
    else
        git clone $(git remote get-url origin) '$REMOTE_DIR'
    fi
"

# Step 2: Build Docker image on host-node-01
echo -e "${GREEN}Step 2: Building Docker image on host-node-01...${NC}"
ssh "$DEPLOY_HOST" "
    cd '$REMOTE_DIR'
    $DOCKER_CMD build $REBUILD_FLAG -t '$IMAGE_NAME' .
"

# Step 3: Restart container
echo -e "${GREEN}Step 3: Restarting container...${NC}"
ssh "$DEPLOY_HOST" "
    # Stop and remove existing container if it exists
    $DOCKER_CMD stop '$CONTAINER_NAME' 2>/dev/null || true
    $DOCKER_CMD rm '$CONTAINER_NAME' 2>/dev/null || true

    # Start new container with health check
    $DOCKER_CMD run -d \
        --name '$CONTAINER_NAME' \
        --restart unless-stopped \
        --network cloudflared-tunnel \
        -p '$CONTAINER_PORT' \
        -e SITE_NAME='xOTA Map (Beta)' \
        -e SITE_DESCRIPTION='Alle Outdoor-Amateurfunk-Programme auf einer Karte' \
        -e PARENT_SITE_NAME='OE Radio' \
        -e PARENT_SITE_URL='https://oeradio.at' \
        -e PARENT_SITE_LOGO='https://oeradio.at/wp-content/uploads/2026/01/oeradiokl.png' \
        -e APP_VERSION='$APP_VERSION' \
        --health-cmd='wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1' \
        --health-interval=30s \
        --health-timeout=10s \
        --health-retries=3 \
        --health-start-period=10s \
        '$IMAGE_NAME'
"

# Step 4: Verify deployment
echo -e "${GREEN}Step 4: Verifying deployment...${NC}"
sleep 3

# Check container status
CONTAINER_STATUS=$(ssh "$DEPLOY_HOST" "$DOCKER_CMD ps --filter 'name=$CONTAINER_NAME' --format '{{.Status}}'")
echo "Container status: $CONTAINER_STATUS"

# Check if site is accessible
echo "Checking site accessibility..."
LOCAL_PORT=$(echo $CONTAINER_PORT | cut -d: -f2)
if ssh "$DEPLOY_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:$LOCAL_PORT" | grep -q "200"; then
    echo -e "${GREEN}Container is running on port $LOCAL_PORT${NC}"
else
    echo -e "${RED}Container may not be accessible on port $LOCAL_PORT${NC}"
fi

echo ""
echo -e "${GREEN}=== Deployment complete ===${NC}"
