#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo 'Busan Lanka v3.2 Mobile Responsive - http://localhost:8080/'
echo 'Admin CMS       - http://localhost:8080/admin.html'
echo 'QR Tour demo    - http://localhost:8080/?tour=1'
python3 -m http.server 8080
