#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo 'Busan Lanka V4.9 Mobile Packages + Country Search (V4.8 reviews backend retained) - http://localhost:8080/'
echo 'Admin CMS       - http://localhost:8080/admin.html'
echo 'QR Tour demo    - http://localhost:8080/?tour=1'
python3 -m http.server 8080
