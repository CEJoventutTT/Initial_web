{
  "name": "cejoventut-monorepo",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "clean": "rm -rf **/.next **/dist node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.6.0"
  }
}
