#!/bin/bash
set -e

echo "🔧 Building Anchor program..."
anchor build

echo "🚀 Deploying to network..."
anchor deploy

echo "🛠️ Initializing global state..."
ts-node scripts/deploy.ts $1   # pass --devnet or --mainnet

echo "🎉 Finished!"

# chmod +x scripts/init.sh
# ./scripts/init.sh --devnet
