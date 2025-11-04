#!/usr/bin/env node

/**
 * Script to update contract addresses after deployment
 * Usage: node scripts/update-contracts.js --network sepolia --kiftables 0x123... --dissolution 0x456...
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 ? args[index + 1] : null;
};

const network = getArg('network');
const kiftablesAddress = getArg('kiftables');
const dissolutionAddress = getArg('dissolution');

if (!network || !kiftablesAddress || !dissolutionAddress) {
  console.log('Usage: node scripts/update-contracts.js --network [sepolia|mainnet] --kiftables 0x123... --dissolution 0x456...');
  process.exit(1);
}

const contractsPath = path.join(__dirname, '../lib/contracts.ts');
let content = fs.readFileSync(contractsPath, 'utf8');

if (network === 'sepolia') {
  content = content.replace(
    /const SEPOLIA_CONTRACTS = \{[\s\S]*?\};/,
    `const SEPOLIA_CONTRACTS = {
  // Deployed on Sepolia testnet
  kiftables: '${kiftablesAddress}' as const,
  dissolution: '${dissolutionAddress}' as const,
};`
  );
} else if (network === 'mainnet') {
  content = content.replace(
    /const MAINNET_CONTRACTS = \{[\s\S]*?\};/,
    `const MAINNET_CONTRACTS = {
  kiftables: '${kiftablesAddress}' as const,
  dissolution: '${dissolutionAddress}' as const,
};`
  );
} else {
  console.error('Invalid network. Use "sepolia" or "mainnet"');
  process.exit(1);
}

fs.writeFileSync(contractsPath, content);
console.log(`✅ Updated ${network} contract addresses:`);
console.log(`   Kiftables: ${kiftablesAddress}`);
console.log(`   Dissolution: ${dissolutionAddress}`);