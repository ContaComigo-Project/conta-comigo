// Minimal environment for the suite. Not a replacement for execution config:
// these are values that only exist so the test runs deterministically.
//
// The secret below is for tests and lives in the repository on purpose — it
// opens nothing. The real secret comes from `.env` and is never versioned
// (RNF-012); the proof that the API refuses to run without it lives in
// `jwt-issuer`, which throws `SegredoDeTokenAusente` instead of signing with a
// default value.
process.env.JWT_SECRET ??= 'segredo-de-teste-sem-valor-fora-da-suite';

// bcrypt at real cost would turn the suite into minutes; the production cost is
// declared in `BcryptHasher`.
process.env.NODE_ENV ??= 'test';