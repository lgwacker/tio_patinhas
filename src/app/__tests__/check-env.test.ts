/**
 * @jest-environment node
 */
import { execSync } from 'child_process';
import path from 'path';

describe('check-env script', () => {
  const scriptPath = path.resolve(__dirname, '../../../scripts/check-env.js');

  it('exits 0 and prints OK when better-sqlite3 loads successfully', () => {
    const output = execSync(`node "${scriptPath}"`, { encoding: 'utf-8' });
    expect(output).toContain('✅ better-sqlite3 OK');
    expect(output).toContain(process.version);
  });

  it('exports checkEnv function for programmatic use', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { checkEnv } = require('../../../scripts/check-env');
    expect(checkEnv()).toBe(true);
  });
});
