import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This app has no data-fetching library (SWR/react-query) on purpose —
      // "fetch on mount, setState in the resolved callback" is the standard,
      // idiomatic pattern used throughout every list/detail page. The rule
      // flags that pattern even though the actual setState call is async,
      // not synchronous within the effect body, which is what the rule is
      // meant to catch.
      "react-hooks/set-state-in-effect": "off",
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
