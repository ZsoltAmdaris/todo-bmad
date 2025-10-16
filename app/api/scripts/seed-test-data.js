/**
 * Seed script to create test todo items and optionally clear existing ones
 * Usage: node scripts/seed-test-data.js
 */

const API_URL = process.env.API_URL || 'http://localhost:1337';

const testTodos = [
  { title: 'Complete project documentation', done: false },
  { title: 'Review pull requests', done: false },
  { title: 'Fix authentication bug', done: true },
  { title: 'Update dependencies', done: false },
  { title: 'Write unit tests', done: false },
  { title: 'Deploy to staging', done: true },
  { title: 'Design new feature mockups', done: false },
  { title: 'Refactor API endpoints', done: false },
  { title: 'Setup CI/CD pipeline', done: true },
  { title: 'Database migration', done: false },
  { title: 'User feedback analysis', done: false },
  { title: 'Performance optimization', done: false },
  { title: 'Security audit', done: false },
  { title: 'Team meeting notes', done: true },
  { title: 'Update README file', done: false },
  { title: 'Configure monitoring', done: false },
  { title: 'Code review guidelines', done: true },
  { title: 'Implement dark mode', done: false },
  { title: 'API documentation', done: false },
  { title: 'Bug triage session', done: true },
  { title: 'Setup development environment', done: false },
  { title: 'Create test scenarios', done: false },
  { title: 'Mobile responsiveness testing', done: false },
  { title: 'Accessibility improvements', done: false },
  { title: 'Backup database', done: true },
];

async function getAllTodos() {
  let allTodos = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${API_URL}/api/todos?pagination[page]=${page}&pagination[pageSize]=100`
    );
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      allTodos = allTodos.concat(data.data);
      hasMore = data.meta?.pagination?.page < data.meta?.pagination?.pageCount;
      page++;
    } else {
      hasMore = false;
    }
  }

  return allTodos;
}

async function deleteTodo(item) {
  // Try documentId first (Strapi v5), fallback to id
  const identifier = item.documentId || item.id;
  const response = await fetch(`${API_URL}/api/todos/${identifier}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete todo ${identifier}: ${response.status}`);
  }

  return identifier;
}

async function createTodo(title, done = false) {
  const response = await fetch(`${API_URL}/api/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: { title, done },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create todo: ${response.status} - ${text}`);
  }

  return response.json();
}

async function main() {
  console.log('🚀 Starting test data seed...\n');

  try {
    // Step 1: Get all existing todos
    console.log('📋 Fetching existing todos...');
    const existingTodos = await getAllTodos();
    console.log(`   Found ${existingTodos.length} existing todos\n`);

    // Step 2: Delete all existing todos
    if (existingTodos.length > 0) {
      console.log('🗑️  Deleting existing todos...');
      for (const todo of existingTodos) {
        const id = await deleteTodo(todo);
        console.log(`   ✓ Deleted todo: ${id}`);
      }
      console.log(`   Deleted ${existingTodos.length} todos\n`);
    }

    // Step 3: Create test todos
    console.log('✨ Creating test todos...');
    for (let i = 0; i < testTodos.length; i++) {
      const { title, done } = testTodos[i];
      await createTodo(title, done);
      console.log(
        `   ${i + 1}/${testTodos.length} - Created: "${title}" ${done ? '✓' : '○'}`
      );

      // Small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Successfully created ${testTodos.length} test todos!`);
    console.log('\n📊 Summary:');
    console.log(`   - Deleted: ${existingTodos.length} todos`);
    console.log(`   - Created: ${testTodos.length} todos`);
    console.log(`   - Completed: ${testTodos.filter((t) => t.done).length} todos`);
    console.log(`   - Active: ${testTodos.filter((t) => !t.done).length} todos`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
