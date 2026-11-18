import { createApp } from './app';
import { EnvSchema } from './validators';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate environment variables strictly
const parsedEnv = EnvSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.warn('⚠️ Environment variable validation warnings:', parsedEnv.error.format());
}

const app = createApp();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Banking Data Analyst Backend listening on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default server;
