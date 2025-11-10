module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:astro/recommended",
    "plugin:astro/jsx-a11y-recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      files: ["**/*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"]
      }
    },
    {
      files: ["src/**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser"
    }
  ],
  settings: {
    "import/resolver": {
      typescript: true
    }
  }
};

