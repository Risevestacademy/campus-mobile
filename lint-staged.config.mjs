export default {
  "{src,tests}/**/*.{js,jsx,ts,tsx}": [
    "eslint --fix --max-warnings=0 --no-warn-ignored",
    "prettier --write",
  ],
  "*.{mjs,cjs,css,json,md,yaml,yml}": "prettier --write",
  "*.config.js": "prettier --write",
};
