#!/usr/bin/env node
/**
 * docs-claims-check — verify load-bearing documentation claims against the
 * platform source of truth, so factual drift (e.g. documenting a request header
 * the gateway never reads) fails CI instead of shipping.
 *
 * Each claim is precise and source-backed — no fuzzy prose scanning. Add a claim
 * here whenever the docs start depending on a new fact that lives in the code.
 *
 * Usage: node ./scripts/docs-claims-check.mjs   (npm run docs:check)
 * Exit 0 = all claims verified, 1 = at least one claim drifted.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');

// The docs submodule may not be checked out (e.g. a source-only checkout).
// Without it there are no doc claims to verify, so skip rather than fail.
if (!existsSync(join(DOCS, 'api/authentication.md'))) {
  console.warn('docs-claims-check: docs/ submodule not checked out — skipping.');
  process.exit(0);
}

function walk(dir, test, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, test, acc);
    else if (test(name)) acc.push(p);
  }
  return acc;
}

// --- Source corpus: every TypeScript file under libs/ and apps/ ---
const srcText = ['libs', 'apps']
  .flatMap((d) => walk(join(ROOT, d), (n) => n.endsWith('.ts')))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');

// A header is "read" by the platform iff it appears as a quoted string literal.
const sourceReadsHeader = (h) => new RegExp(`['"\`]${h}['"\`]`, 'i').test(srcText);

const failures = [];
const passes = [];
const fail = (id, msg) => failures.push(`[${id}] ${msg}`);
const ok = (id, msg) => passes.push(`[${id}] ${msg}`);

// --- Claim 1: every x- header listed in authentication.md's reference table is
//     actually read by the gateway. (This is the exact drift that documented the
//     non-existent `x-domain` header.) ---
const authMd = readFileSync(join(DOCS, 'api/authentication.md'), 'utf8');
const tableBody = authMd.split('## Request headers reference')[1]?.split('\n## ')[0] ?? '';
const tableHeaders = [...tableBody.matchAll(/^\|\s*`([^`]+)`\s*\|/gm)]
  .map((m) => m[1].trim().toLowerCase())
  .filter((h) => h.startsWith('x-'));

if (tableHeaders.length === 0) {
  fail('headers-table', 'no x- headers parsed from the "Request headers reference" table — parser or heading drifted');
} else {
  for (const h of tableHeaders) {
    if (sourceReadsHeader(h)) ok('headers-table', `\`${h}\` documented and read in source`);
    else fail('headers-table', `\`${h}\` documented in authentication.md but never read in libs/apps source`);
  }
}

// --- Claim 2: phantom headers must stay absent from source (regression guard) ---
for (const h of ['x-domain', 'x-client-id']) {
  if (sourceReadsHeader(h)) fail('phantom-header', `\`${h}\` now appears in source — revisit the docs that were corrected to drop it`);
  else ok('phantom-header', `\`${h}\` correctly absent from source`);
}

// --- Claim 3: the documented service count matches apps/services ---
const EXPECTED_SERVICES = 14;
const serviceCount = readdirSync(join(ROOT, 'apps/services')).filter(
  (n) => !n.startsWith('.') && statSync(join(ROOT, 'apps/services', n)).isDirectory(),
).length;
if (serviceCount === EXPECTED_SERVICES) ok('service-count', `apps/services has ${EXPECTED_SERVICES} services, as documented`);
else fail('service-count', `apps/services has ${serviceCount} services but the docs state ${EXPECTED_SERVICES} — update both`);

// --- Report ---
for (const line of passes) console.log(`  ok  ${line}`);
if (failures.length) {
  console.error('\ndocs-claims-check FAILED:');
  for (const line of failures) console.error(`  ✗  ${line}`);
  process.exit(1);
}
console.log(`\ndocs-claims-check: all ${passes.length} claims verified against source.`);
