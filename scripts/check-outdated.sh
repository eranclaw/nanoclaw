#!/bin/bash
# Quick script to check for outdated dependencies
set -euo pipefail

echo "Checking for outdated packages..."
npm outdated --long 2>/dev/null || true

echo ""
echo "Security audit:"
npm audit --production 2>/dev/null || true
