import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve'; // true for `npm run dev`

  return {
    server: isDev
      ? {
          https: {
            key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost.pem')),
          },
          port: 5173,
        }
      : undefined,

    plugins: [tailwindcss(), react()],
  };
});
