import next from "eslint-config-next";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  ...next,
  // Add Next core web vitals rules (flat config).
  nextPlugin.configs["core-web-vitals"],
];
