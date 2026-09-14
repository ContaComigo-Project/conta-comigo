// Executable proof that the ADR-001 boundary check blocks.
//
// ADR-001 requires "an import of @nestjs/common inside domain/ makes the gate
// fail, and that a test proves it fails". This is that test. It runs
// dependency-cruiser over two fixture trees — one that violates every rule,
// another that respects all — and asserts on the JSON output.
//
// Why assert the RULE NAME and the FILE, not just the exit code: a broken
// config, a missing binary or an unresolvable import also give exit != 0.
// Without the detail, this test would pass for the wrong reason — the kind of
// test the rule test-evidence-quality calls debt.

import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..');
const CONFIG = join('tooling', 'boundaries', 'fixtures.cjs');
const FIXTURES = join('tests', 'boundaries', 'fixtures');

interface Violation {
  from: string;
  to: string;
  rule: { name: string; severity: string };
}

function depcruise(args: string[]) {
  // Command in ONE string: on Windows "pnpm" is a .cmd and needs a shell, and a
  // shell with args in an array triggers Node's DEP0190 warning (unescaped args).
  // None of the arguments here has spaces or comes from outside — they are
  // literals of this test.
  const command = ['pnpm', 'exec', 'depcruise', '--config', CONFIG, ...args].join(' ');
  return spawnSync(command, { cwd: ROOT, encoding: 'utf8', shell: true });
}

function cruise(subtree: string) {
  const target = join(FIXTURES, subtree).replace(/\\/g, '/');
  // Two passes: the "err" reporter is the one the harness uses and defines the
  // exit code (number of errors); the "json" gives the detail to assert the rule
  // and the file. The exit code alone is not enough — see the header.
  const gate = depcruise(['--output-type', 'err', target]);
  const data = depcruise(['--output-type', 'json', target]);
  const jsonStart = data.stdout.indexOf('{');
  const json = jsonStart >= 0 ? JSON.parse(data.stdout.slice(jsonStart)) : null;
  const violations: Violation[] = json?.summary?.violations ?? [];
  return { status: gate.status, violations, stderr: gate.stderr };
}

function violationOf(violations: Violation[], rule: string, file: string) {
  return violations.find((v) => v.rule.name === rule && v.from.endsWith(file));
}

describe('boundaries of ADR-001 — violating tree', () => {
  const result = cruise('violation');

  it('the gate rejects (exit code different from zero)', () => {
    expect(result.status).not.toBe(0);
  });

  it('ADR-001 — @nestjs/common in domain/ is named with rule and file', () => {
    const v = violationOf(result.violations, 'domain-no-framework-or-io', 'domain/model/band-nestjs.ts');
    expect(v, JSON.stringify(result.violations, null, 2)).toBeDefined();
    expect(v?.rule.severity).toBe('error');
    expect(v?.to).toContain('@nestjs/common');
  });

  it('ADR-002 — @prisma/client in domain/ is named', () => {
    const v = violationOf(result.violations, 'domain-no-framework-or-io', 'domain/model/band-prisma.ts');
    expect(v).toBeDefined();
    expect(v?.to).toContain('@prisma/client');
  });

  it('ADR-001 — application/ importing infrastructure/ is named', () => {
    const v = violationOf(result.violations, 'application-avoids-infrastructure', 'application/bad-use-case.ts');
    expect(v).toBeDefined();
    expect(v?.to).toContain('infrastructure/persistence/repository.ts');
  });

  it('HT-017 — `import type` of the contract (workspace package) in domain/ is named', () => {
    const v = violationOf(result.violations, 'domain-avoids-workspace-transport', 'domain/model/band-contract.ts');
    expect(v, JSON.stringify(result.violations.map((x) => [x.rule.name, x.from]), null, 2)).toBeDefined();
    expect(v?.to).toContain('packages/contract');
  });

  it('ADR-002 — @prisma/client outside infrastructure/persistence/ is named', () => {
    const v = violationOf(result.violations, 'prisma-only-in-persistence', 'infrastructure/http/uses-prisma.ts');
    expect(v).toBeDefined();
  });

  it('every reported violation has severity error — no rule was loosened', () => {
    expect(result.violations.length).toBeGreaterThan(0);
    for (const v of result.violations) expect(v.rule.severity).toBe('error');
  });
});

describe('boundaries of ADR-001 — clean tree (control)', () => {
  const result = cruise('clean');

  it('the gate approves (exit code zero)', () => {
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  it('no violation is reported', () => {
    expect(result.violations).toEqual([]);
  });
});