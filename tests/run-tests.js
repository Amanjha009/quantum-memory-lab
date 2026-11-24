import { execSync } from 'node:child_process';

console.log('--- Running Node.js Test Suite ---');
try {
  execSync('node --test tests/*.test.js', { stdio: 'inherit' });
} catch (error) {
  process.exit(error.status || 1);
}

// Optionally run Python tests if python and numpy are available
try {
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  execSync(`${pythonCmd} -c "import numpy"`, { stdio: 'ignore' });
  console.log('\n--- Running Python Physics Tests ---');
  const env = { ...process.env, PYTHONPATH: 'physics-engine' };
  execSync(`${pythonCmd} -m unittest discover -s physics-engine/tests -v`, { stdio: 'inherit', env });
} catch {
  console.log('\n[Note] Optional Python/NumPy tests skipped: local Python runtime or NumPy not detected.');
}
