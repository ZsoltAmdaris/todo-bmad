#!/usr/bin/env node

/**
 * BMAD Stories Script
 * Lists all stories with their status
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const STORIES_DIR = path.join(PROJECT_ROOT, 'stories');

function parseStory(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let title = '';
  let goal = '';

  for (const line of lines) {
    if (line.startsWith('# Story')) {
      title = line.replace(/^#\s*/, '').trim();
    } else if (line.startsWith('## Goal')) {
      const idx = lines.indexOf(line);
      if (idx !== -1 && idx + 2 < lines.length) {
        goal = lines[idx + 2].trim();
      }
    }
  }

  return { title, goal };
}

function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                  Project Stories                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(STORIES_DIR)) {
    console.log('❌ Stories directory not found');
    process.exit(1);
  }

  const stories = fs
    .readdirSync(STORIES_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();

  if (stories.length === 0) {
    console.log('No stories found.\n');
    process.exit(0);
  }

  stories.forEach((storyFile) => {
    const filePath = path.join(STORIES_DIR, storyFile);
    const { title, goal } = parseStory(filePath);

    console.log(`📖 ${storyFile}`);
    if (title) console.log(`   ${title}`);
    if (goal) console.log(`   Goal: ${goal}`);
    console.log('');
  });

  console.log(`Total: ${stories.length} stories\n`);
}

main();
