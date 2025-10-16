#!/usr/bin/env node

/**
 * BMAD Agents Script
 * Lists all available agents in the project
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(PROJECT_ROOT, 'agents');

function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║              BMAD-Method Available Agents               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(AGENTS_DIR)) {
    console.log('❌ Agents directory not found');
    process.exit(1);
  }

  const agents = fs
    .readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith('.txt'))
    .map((f) => f.replace('.txt', ''));

  if (agents.length === 0) {
    console.log('No agents found.\n');
    process.exit(0);
  }

  console.log('Available agents:\n');
  agents.forEach((agent, index) => {
    console.log(`   ${index + 1}. *${agent}`);
  });

  console.log('\n💡 To activate an agent, use: *agent-name');
  console.log('   Example: *analyst, *dev, *po\n');
}

main();
