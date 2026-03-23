const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, 'global/wiki/doc');
const OUTPUT = path.join(__dirname, 'global/resources/data/doc_manifest.json');

const TYPES = ['main', 'sub'];
const LANGS = ['en', 'ko', 'ja'];

function getMarkdownFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));
}

function clampLocalizationLevel(value) {
    const num = Number(value);

    if (!Number.isFinite(num)) return 0;
    if (num < 0) return 0;
    if (num > 1) return 1;

    return num;
}

function generateManifest() {
    const manifest = {};

    for (const type of TYPES) {
        const dirPath = path.join(ROOT, type);
        const files = getMarkdownFiles(dirPath);

        const docIds = new Set();
        const langSums = Object.fromEntries(LANGS.map(lang => [lang, 0]));

        for (const file of files) {
            const match = file.match(/^(.+?)_(en|ko|ja)\.md$/i);
            if (!match) continue;

            const [, docId, lang] = match;
            const filePath = path.join(dirPath, file);

            docIds.add(docId);

            let localizationLevel = 0;

            try {
                const raw = fs.readFileSync(filePath, 'utf8');
                const parsed = matter(raw);
                localizationLevel = clampLocalizationLevel(parsed.data.localizationLevel);
            } catch (error) {
                console.warn(`Failed to read metadata from: ${filePath}`);
                localizationLevel = 0;
            }

            langSums[lang] += localizationLevel;
        }

        manifest[type] = {
            totalDocs: docIds.size,
            sums: {
                en: Number(langSums.en.toFixed(4)),
                ko: Number(langSums.ko.toFixed(4)),
                ja: Number(langSums.ja.toFixed(4))
            }
        };
    }

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2), 'utf8');

    console.log(`Generated: ${OUTPUT}`);
}

generateManifest();
