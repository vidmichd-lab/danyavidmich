import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import astro from "eslint-plugin-astro";
import astroParser from "astro-eslint-parser";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        Fragment: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": typescript,
      import: importPlugin,
      "jsx-a11y": jsxA11y
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/triple-slash-reference": "off"
    }
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        ...globals.browser,
        Fragment: "readonly",
        Astro: "readonly"
      }
    },
    plugins: {
      astro: astro
    },
    rules: {
      ...astro.configs.recommended.rules,
      "astro/no-conflict-set-directives": "error",
      "astro/no-unused-define-vars-in-style": "error",
      "no-undef": "off"
    }
  },
  {
    files: ["**/*.astro"],
    rules: {
      // Отключаем проверку парсинга для Astro файлов, так как парсер может не понимать некоторые конструкции
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  },
  {
    files: ["src/env.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off"
    }
  },
  prettier,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".astro/**",
      "*.config.{js,mjs,cjs,ts}",
      "public/**"
    ]
  }
];

