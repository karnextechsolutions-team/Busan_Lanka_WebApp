#!/usr/bin/env bash
set -euo pipefail
URL='https://samkndtdqtmxdsuxrnnp.supabase.co/functions/v1/submit-enquiry'
ORIGIN='https://tranquil-marshmallow-7cd3a4.netlify.app'
echo "Checking OPTIONS preflight for ${URL} (safe; does not save data)"
curl -i -sS -X OPTIONS "$URL" \
 -H "Origin: $ORIGIN" \
 -H 'Access-Control-Request-Method: POST' \
 -H 'Access-Control-Request-Headers: apikey,content-type'
