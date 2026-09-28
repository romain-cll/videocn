import { plugin as shadcn } from "@shadcn/lint";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // @shadcn/lint — https://github.com/shadcn-ui/lint#rules
  // `no-restyle` n'est volontairement pas activée.
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { shadcn },
    rules: {
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": ["error", { allow: ["layout"] }],
      "shadcn/no-inline-styles": "error",
      "shadcn/no-unknown-classes": "error",
      "shadcn/require-static-classes": "error",
    },
  },
  // Les composants possèdent leur apparence et ont besoin de valeurs
  // structurelles (`ring-[3px]`, pistes de quelques pixels…). `no-raw-colors`
  // et `no-inline-styles` restent actives ici.
  {
    files: ["src/components/ui/**", "registry/**"],
    rules: {
      "shadcn/no-arbitrary-values": "off",
      "shadcn/require-static-classes": "off",
    },
  },
  // La vitrine du site — la landing — a besoin de liberté de mise en page :
  // proportions, grilles. Les couleurs restent des tokens (`no-raw-colors`
  // active), pour que le mode sombre suive.
  {
    files: ["src/app/page.tsx", "src/components/landing/**"],
    rules: {
      "shadcn/no-arbitrary-values": "off",
      "shadcn/require-static-classes": "off",
    },
  },
  // Les images Open Graph sont rendues par `ImageResponse` (Satori), qui ne
  // connaît que des styles inline, et une image partagée n'a pas de thème à
  // suivre : ses couleurs sont fixes.
  {
    files: ["src/app/**/opengraph-image.tsx", "src/app/_og/**"],
    rules: {
      "shadcn/no-inline-styles": "off",
      "shadcn/no-raw-colors": "off",
      "shadcn/no-arbitrary-values": "off",
      "shadcn/no-unknown-classes": "off",
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
