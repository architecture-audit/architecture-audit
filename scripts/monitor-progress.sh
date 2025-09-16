#!/bin/bash

echo "📊 Cache Generation Progress Monitor"
echo "===================================="

while true; do
    if [ -f "public/data/databricks-llm-cache.json" ]; then
        COUNT=$(cat public/data/databricks-llm-cache.json | jq '.recommendations | length' 2>/dev/null || echo 0)
        SIZE=$(ls -lh public/data/databricks-llm-cache.json | awk '{print $5}')
        echo "$(date '+%H:%M:%S') - Cached: $COUNT/960 - Size: $SIZE"
    else
        echo "$(date '+%H:%M:%S') - Waiting for cache file..."
    fi
    sleep 10
done