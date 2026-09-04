import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = [
    "index.html",
    "politica-de-privacidade.html",
    "sistemas-para-microempresas.html",
    "sobre.html"
];
const lucideVersion = "0.468.0";
const iconAliases = {
    "check-circle-2": "circle-check-big",
    "globe-2": "earth"
};
const iconNames = new Set();
const documents = new Map();

for (const relativePath of htmlFiles) {
    const absolutePath = path.join(root, relativePath);
    const html = await readFile(absolutePath, "utf8");

    for (const match of html.matchAll(/data-lucide="([^"]+)"/g)) {
        iconNames.add(match[1]);
    }
    for (const match of html.matchAll(/lucide-icons\.svg#([a-z0-9-]+)/g)) {
        iconNames.add(match[1]);
    }

    documents.set(absolutePath, html);
}

const symbols = [];
for (const iconName of [...iconNames].sort()) {
    const sourceName = iconAliases[iconName] || iconName;
    const response = await fetch(`https://unpkg.com/lucide-static@${lucideVersion}/icons/${sourceName}.svg`);
    if (!response.ok) {
        throw new Error(`Falha ao baixar o ícone ${iconName}: HTTP ${response.status}`);
    }

    const svg = await response.text();
    const body = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1]?.trim();
    if (!body) {
        throw new Error(`SVG inválido para o ícone ${iconName}`);
    }

    symbols.push(`  <symbol id="${iconName}" viewBox="0 0 24 24">${body}</symbol>`);
}

const sprite = [
    `<!-- Lucide ${lucideVersion} icon subset. License: ISC. https://lucide.dev -->`,
    '<svg xmlns="http://www.w3.org/2000/svg">',
    ...symbols,
    "</svg>",
    ""
].join("\n");

await writeFile(path.join(root, "assets", "lucide-icons.svg"), sprite, "utf8");

for (const [absolutePath, originalHtml] of documents) {
    const updatedHtml = originalHtml
        .replace(/\s*<link rel="preconnect" href="https:\/\/unpkg\.com" crossorigin>\r?\n/g, "\n")
        .replace(/\s*<script src="https:\/\/unpkg\.com\/lucide@[^\"]+" defer><\/script>\r?\n/g, "\n")
        .replace(/<i data-lucide="([^"]+)"(?: aria-hidden="true")?><\/i>/g, (_, iconName) => (
            `<svg class="lucide lucide-${iconName}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="/assets/lucide-icons.svg#${iconName}"></use></svg>`
        ));

    await writeFile(absolutePath, updatedHtml, "utf8");
}

console.log(`Sprite criado com ${iconNames.size} ícones Lucide.`);
