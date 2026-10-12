import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": { entryPoint: "src/styles/globals.css" },
    },
    rules: {
      // tokens.css で既定の色・文字などを消しているので、トークンにない色や文字の大きさは「知らないクラス」になる
      "better-tailwindcss/no-unknown-classes": "error",
      // `p-[13px]` のような書いた値は Tailwind では正しいクラスなので、no-unknown-classes では止まらない。`[` を含むクラスをまとめて止める
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            {
              pattern: "\\[",
              message:
                "トークンにない値は使わない（docs/ui.md の「トークン」）",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
