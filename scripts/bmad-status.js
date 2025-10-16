#!/usr/bin/env node

/**
 * BMAD Status Script
 * Shows current project status based on BMAD-Method configuration
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.parse(content);
  } catch (error) {
    return null;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function countFiles(dirPath, pattern = null) {
  if (!fs.existsSync(dirPath)) return 0;

  try {
    const files = fs.readdirSync(dirPath);
    if (pattern) {
      return files.filter((f) => f.match(pattern)).length;
    }
    return files.filter((f) => {
      const fullPath = path.join(dirPath, f);
      return fs.statSync(fullPath).isFile();
    }).length;
  } catch (error) {
    return 0;
  }
}

function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║              BMAD-Method Project Status                 ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Read core config
  const configPath = path.join(PROJECT_ROOT, '.bmad-core', 'core-config.yaml');
  const config = readYaml(configPath);

  if (!config) {
    console.log('❌ Could not read BMAD core configuration');
    process.exit(1);
  }

  console.log('📋 Configuration:');
  console.log(`   Slash Prefix: /${config.slashPrefix || 'BMad'}`);
  console.log(`   PRD Version: ${config.prd?.prdVersion || 'unknown'}`);
  console.log(
    `   Architecture Version: ${config.architecture?.architectureVersion || 'unknown'}\n`
  );

  // Check PRD
  console.log('📄 Product Requirements:');
  if (config.prd?.prdSharded) {
    const prdDir = path.join(PROJECT_ROOT, config.prd.prdShardedLocation);
    const prdCount = countFiles(prdDir);
    console.log(
      `   ✓ PRD (Sharded): ${prdCount} files in ${config.prd.prdShardedLocation}`
    );
  } else if (config.prd?.prdFile) {
    const prdPath = path.join(PROJECT_ROOT, config.prd.prdFile);
    const exists = checkFileExists(prdPath);
    console.log(`   ${exists ? '✓' : '✗'} PRD: ${config.prd.prdFile}`);
  }

  // Check Architecture
  console.log('\n🏗️  Architecture:');
  if (config.architecture?.architectureSharded) {
    const archDir = path.join(
      PROJECT_ROOT,
      config.architecture.architectureShardedLocation
    );
    const archCount = countFiles(archDir);
    console.log(
      `   ✓ Architecture (Sharded): ${archCount} files in ${config.architecture.architectureShardedLocation}`
    );
  } else if (config.architecture?.architectureFile) {
    const archPath = path.join(PROJECT_ROOT, config.architecture.architectureFile);
    const exists = checkFileExists(archPath);
    console.log(
      `   ${exists ? '✓' : '✗'} Architecture: ${config.architecture.architectureFile}`
    );
  }

  // Check Stories
  console.log('\n📖 Stories:');
  const storiesDir = path.join(PROJECT_ROOT, config.devStoryLocation || 'stories');
  const storyCount = countFiles(storiesDir, /\.md$/);
  console.log(
    `   ✓ Stories: ${storyCount} files in ${config.devStoryLocation || 'stories'}`
  );

  // Check Agents
  console.log('\n🤖 Agents:');
  const agentsDir = path.join(PROJECT_ROOT, 'agents');
  const agentCount = countFiles(agentsDir, /\.txt$/);
  console.log(`   ✓ Agents: ${agentCount} files in agents/`);

  // Check Teams
  console.log('\n👥 Teams:');
  const teamsDir = path.join(PROJECT_ROOT, 'teams');
  const teamCount = countFiles(teamsDir, /\.txt$/);
  console.log(`   ✓ Teams: ${teamCount} files in teams/`);

  // Check QA
  console.log('\n✅ QA:');
  const qaDir = path.join(PROJECT_ROOT, config.qa?.qaLocation || 'docs/qa');
  const qaCount = countFiles(qaDir);
  console.log(
    `   ${qaCount > 0 ? '✓' : '○'} QA Files: ${qaCount} files in ${
      config.qa?.qaLocation || 'docs/qa'
    }`
  );

  // Check Docs
  console.log('\n📚 Documentation:');
  const docsDir = path.join(PROJECT_ROOT, 'docs');
  if (fs.existsSync(docsDir)) {
    const files = fs.readdirSync(docsDir).filter((f) => {
      const fullPath = path.join(docsDir, f);
      return fs.statSync(fullPath).isFile() && f.endsWith('.md');
    });
    files.forEach((file) => {
      console.log(`   ✓ ${file}`);
    });
  }

  // Check Application
  console.log('\n💻 Application:');
  const apiPackage = path.join(PROJECT_ROOT, 'app', 'api', 'package.json');
  const webPackage = path.join(PROJECT_ROOT, 'app', 'web', 'package.json');
  console.log(`   ${checkFileExists(apiPackage) ? '✓' : '✗'} API: app/api/`);
  console.log(`   ${checkFileExists(webPackage) ? '✓' : '✗'} Web: app/web/`);

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  Use: npm run bmad:agents - List available agents      ║');
  console.log('║  Use: npm run bmad:stories - List all stories          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

main();
