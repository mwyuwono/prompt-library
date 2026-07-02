import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'corpus', 'quick-text.json');
const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : path.join(root, 'corpus', 'quick-text.public.json');
const corpus = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const publicPhrases = (corpus.phrases || []).filter((phrase) => phrase.visibility === 'public');
const publicCategoryIds = new Set(publicPhrases.map((phrase) => phrase.categoryId));

const exported = {
  ...corpus,
  updatedAt: new Date().toISOString(),
  categories: (corpus.categories || []).filter((category) => publicCategoryIds.has(category.id)),
  phrases: publicPhrases
};

fs.writeFileSync(outputPath, `${JSON.stringify(exported, null, 2)}\n`);
console.log(`Exported ${publicPhrases.length} public phrases to ${path.relative(process.cwd(), outputPath)}.`);
