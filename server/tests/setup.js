import { beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// A few env vars the app reads via process.env must exist before any
// feature module is imported (they're read at call-time in this project,
// not at import-time, so this is mostly a safety net for JWT_SECRET etc.)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-do-not-use-in-prod';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '4'; // low rounds = faster tests
process.env.NODE_ENV = 'test';

let mongoServer;

beforeAll(async () => {
  // In-memory MongoDB — no real database needed to run the suite, and
  // every test run starts from a clean, empty database.
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  // Wipe all collections between tests so tests don't leak state into
  // each other (e.g. a candidate created in one test showing up in another).
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});