import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    ".env*",
    "*.log",
    ".git/**",
    "next-env.d.ts",
  ]),
  {
    extends: compat.extends("next/core-web-vitals", "next/typescript"),

    rules: {
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/no-explicit-any": ["warn"],
      "react-hooks/exhaustive-deps": ["warn"],
      "import/order": [
        1,
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "sibling",
            "parent",
            "index",
          ],
          pathGroups: [
            {
              pattern: "{react,react/**,next,next/**}",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/components/**",
              group: "internal",
            },
            {
              pattern: "@/lib/**",
              group: "internal",
            },
            {
              pattern: "@/hooks/**",
              group: "internal",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);
