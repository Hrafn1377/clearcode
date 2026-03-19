import * as prettier from "prettier";
import parserBabel from "prettier/plugins/babel";
import parserEstree from "prettier/plugins/estree";
import parserTypescript from "prettier/plugins/typescript";
import parserHtml from "prettier/plugins/html";
import parserCss from "prettier/plugins/postcss";
import parserMarkdown from "prettier/plugins/markdown";

const PARSER_MAP: Record<string, { parser: string; plugins: any[] }> = {
    javascript: { parser: "babel",          plugins: [parserBabel, parserEstree] },
    typescript: { parser: "typescript",     plugins: [parserTypescript, parserEstree] },
    html:       { parser: "html",           plugins: [parserHtml] },
    css:        { parser: "css",            plugins: [parserCss] },
    scss:       { parser: "scss",           plugins: [parserCss] },
    markdown:   { parser: "markdown",       plugins: [parserMarkdown] },
    json:       { parser: "json",           plugins: [parserBabel, parserEstree] },
};

export async function formatCode(code: string, language: string): Promise<string> {
    const config = PARSER_MAP[language];
    if (!config) return code; // unsupported language, return as-is

    try {
        return await prettier.format(code, {
            parser: config.parser,
            plugins: config.plugins,
            semi: true,
            singleQuote: true,
            tabWidth: 2,
            trailingComma: "es5",
            printWidth: 100,
        });
    } catch {
        return code; // if formatting fails, return original
    }
}