#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${IMAGE_TAG:-}" ]]; then
  echo "IMAGE_TAG is required"
  exit 1
fi

ACTIVE_FILE=".active_color"
CURRENT="blue"
if [[ -f "$ACTIVE_FILE" ]]; then
  CURRENT="$(cat "$ACTIVE_FILE")"
fi

if [[ "$CURRENT" == "blue" ]]; then
  NEXT="green"
  NEXT_PORT=8088
else
  NEXT="blue"
  NEXT_PORT=8087
fi

echo "Current color: $CURRENT, deploying: $NEXT with tag $IMAGE_TAG"

# Start the next stack with the new image tag.
docker compose -f docker-compose.yml -f "docker-compose.${NEXT}.yml" up -d

# Health check loop.
for i in {1..20}; do
  if curl -fsS "http://localhost:${NEXT_PORT}/actuator/health" >/dev/null; then
    echo "New stack is healthy"
    break
  fi
  if [[ "$i" -eq 20 ]]; then
    echo "New stack did not become healthy"
    exit 1
  fi
  sleep 5
done

# Switch traffic at the reverse proxy layer (implementation-specific).
# Example:
# docker exec edge-proxy sh -c "ln -sf /etc/nginx/conf.d/${NEXT}.conf /etc/nginx/conf.d/active.conf && nginx -s reload"

echo "$NEXT" > "$ACTIVE_FILE"

# Stop old stack after cutover.
docker compose -f docker-compose.yml -f "docker-compose.${CURRENT}.yml" down

echo "Blue-green deployment complete: active=$NEXT"
