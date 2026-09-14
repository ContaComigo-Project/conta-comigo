import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// ADR-001, additional rule 1: "domain entity has no decorator" — neither ORM,
// nor transport validation, nor serialization. A decorator is syntax, not an
// import, so dependency-cruiser cannot see it; this test closes the gap
// recorded as debt in HT-006.

const ROOT = join(__dirname, '..', '..');
const BACKEND = join(ROOT, 'backend', 'src');

function tsFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) tsFiles(path, acc);
    else if (name.endsWith('.ts')) acc.push(path);
  }
  return acc;
}

function domainFiles(): string[] {
  return tsFiles(BACKEND).filter((c) => /[\\/]domain[\\/]/.test(c));
}

// Decorator: "@" at the start of a line (ignoring spaces) followed by an
// identifier. Does not match "@" in JSDoc comments like "@param" because those
// come after "*" or "//".
const DECORATOR = /^\s*@[A-Za-z_$][\w$]*/m;

describe('ADR-001 — domain without decorator', () => {
  it('there is at least one domain file to verify', () => {
    expect(domainFiles().length).toBeGreaterThan(0);
  });

  it('no file in backend/src/**/domain/ uses a decorator', () => {
    const offenders = domainFiles()
      .filter((c) => DECORATOR.test(readFileSync(c, 'utf8')))
      .map((c) => relative(ROOT, c));
    expect(offenders).toEqual([]);
  });

  it('control: the illegal HT-006 fixture would be caught by this same rule', () => {
    const fixture = join(ROOT, 'tests', 'boundaries', 'fixtures', 'violation', 'budget', 'domain', 'model', 'band-nestjs.ts');
    expect(DECORATOR.test(readFileSync(fixture, 'utf8'))).toBe(true);
  });
});