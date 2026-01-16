module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-undef": "error",
  },
  globals: {
    gsap: "readonly",
  },
  ignorePatterns: ["node_modules/", "*.png", "*.mp3", "*.wav", "pseudo.js"],
};
