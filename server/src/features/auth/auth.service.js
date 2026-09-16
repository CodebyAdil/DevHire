import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from './user.model.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Why a separate service file instead of putting this logic in the
 * controller? Same reasoning CLAUDE.md applies to the AI matching module:
 * keep business logic (hashing, token signing, DB queries) out of the
 * controller so it's easy to unit-test without spinning up Express, and
 * easy to swap later (e.g. bcrypt -> argon2) without touching routes.
 */

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

//console.log('SALT_ROUNDS:', typeof SALT_ROUNDS);

export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function generateToken(user) {
  // Keep the payload minimal — id + role is all downstream middleware needs.
  // Never put the password hash or anything sensitive in the JWT payload:
  // JWTs are signed, not encrypted, so anyone can base64-decode and read them.
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

export function verifyToken(token) {
  // Throws if invalid/expired — caller (middleware) catches it.
  return jwt.verify(token, process.env.JWT_SECRET);
}

/** Strips passwordHash before sending a user object back to the client. */
export function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function registerUser({ name, email, password }) {
  const existing = await userModel.findOne({ email });
  if (existing) {
    throw new AppError('An account with that email already exists', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await userModel.create({ name, email, passwordHash });

  const token = generateToken(user);
  return { user: toPublicUser(user), token };
}

export async function loginUser({ email, password }) {
  // passwordHash has `select: false` on the schema, so we must opt back in.
  const user = await userModel.findOne({ email }).select('+passwordHash');

  // Deliberately vague error message for both "no such user" and "wrong
  // password" cases — telling an attacker which one it was makes it easier
  // to enumerate valid emails in your system.
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user);
  return { user: toPublicUser(user), token };
}

export async function getUserById(id) {
  const user = await userModel.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
}