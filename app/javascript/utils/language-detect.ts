import { LanguageSupport, StreamLanguage } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { ruby } from "@codemirror/legacy-modes/mode/ruby";

const EXT_MAP: Record<string, () => LanguageSupport> = {
  js:   () => javascript(),
  mjs:  () => javascript(),
  jsx:  () => javascript({ jsx: true }),
  ts:   () => javascript({ typescript: true }),
  tsx:  () => javascript({ jsx: true, typescript: true }),
  py:   () => python(),
  rb:   () => new LanguageSupport(StreamLanguage.define(ruby)),
  rs:   () => rust(),
  css:  () => css(),
  scss: () => css(),
  html: () => html(),
  htm:  () => html(),
  json: () => json(),
  md:   () => markdown(),
  sql:  () => sql(),
};

export function detectLanguage(filename: string): LanguageSupport | null {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MAP[ext]?.() ?? null;
}