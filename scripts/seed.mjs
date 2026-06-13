/**
 * Database seed script.
 *
 * Creates an admin user (idempotent — re-running won't duplicate it) and a set
 * of sample tasks owned by that user.
 *
 * Usage:
 *   node scripts/seed.mjs
 *
 * Reads MONGODB_URI from the environment, falling back to .env.local.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Minimal .env.local loader (no dotenv dependency) ---------------------
function loadEnvLocal() {
  try {
    const file = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
    for (const line of file.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env.local is optional; rely on the ambient environment instead.
  }
}

loadEnvLocal();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI. Set it in .env.local or the environment.');
  process.exit(1);
}

// --- Schemas (mirror src/lib/models) --------------------------------------
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

const TaskSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

// --- Seed data ------------------------------------------------------------
const ADMIN = {
  name: 'Admin',
  email: 'admin@taskflow.com',
  password: 'Admin@123',
};

/** Build a Date `days` from now (negative = in the past). */
function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function sampleTasks(userId) {
  return [
    {
      userId,
      title: 'Finalize Q3 product roadmap',
      description: 'Align engineering and design on priorities for the next quarter.',
      status: 'pending',
      dueDate: daysFromNow(5),
    },
    {
      userId,
      title: 'Review pull requests',
      description: 'Clear the open PR queue and unblock the team.',
      status: 'pending',
      dueDate: daysFromNow(1),
    },
    {
      userId,
      title: 'Set up MongoDB Atlas backups',
      description: 'Enable scheduled snapshots for the production cluster.',
      status: 'completed',
      dueDate: daysFromNow(-2),
    },
    {
      userId,
      title: 'Write onboarding docs',
      description: 'Document the local setup and deployment flow for new hires.',
      status: 'pending',
      dueDate: daysFromNow(10),
    },
    {
      userId,
      title: 'Renew SSL certificate',
      description: 'Certificate expires soon — renew and redeploy.',
      status: 'completed',
      dueDate: daysFromNow(-7),
    },
  ];
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Upsert the admin user.
  let admin = await User.findOne({ email: ADMIN.email });
  if (admin) {
    console.log(`Admin already exists: ${ADMIN.email}`);
  } else {
    const hashed = await bcrypt.hash(ADMIN.password, 10);
    admin = await User.create({ name: ADMIN.name, email: ADMIN.email, password: hashed });
    console.log(`Created admin user: ${ADMIN.email}`);
  }

  // Reset and reseed this admin's tasks for a clean, predictable dataset.
  const removed = await Task.deleteMany({ userId: admin._id.toString() });
  if (removed.deletedCount) {
    console.log(`Removed ${removed.deletedCount} existing task(s) for admin.`);
  }

  const tasks = await Task.insertMany(sampleTasks(admin._id.toString()));
  console.log(`Inserted ${tasks.length} sample task(s).`);

  console.log('\n--- Seed complete ---');
  console.log(`Login email:    ${ADMIN.email}`);
  console.log(`Login password: ${ADMIN.password}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
