import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'corpus', 'quick-text.json');
const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : path.join(root, 'corpus', 'quick-text.public.json');
const corpus = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
// textReplacement links to the local macOS/iOS Text Replacement store (see
// docs/text-replacement-sync-plan.md) — private admin metadata, not read by the
// web component, and irrelevant/leaky outside this machine.
const publicPhrases = (corpus.phrases || [])
  .filter((phrase) => phrase.visibility === 'public')
  .map(({ textReplacement, ...rest }) => rest);
const publicCategoryIds = new Set(publicPhrases.map((phrase) => phrase.categoryId));

// The same reasoning applies to the corpus-level sync bookkeeping. It is admin state,
// and managedReplacementShortcuts in particular names shortcuts belonging to private
// phrases (xhoa, xtrust, xbfwf…), so exporting it leaks private metadata even though
// no private phrase is exported.
const { managedReplacementShortcuts, textReplacementLastSyncAt, ...publicSettings } = corpus.settings || {};

const exported = {
  ...corpus,
  updatedAt: new Date().toISOString(),
  settings: publicSettings,
  categories: (corpus.categories || []).filter((category) => publicCategoryIds.has(category.id)),
  phrases: publicPhrases
};

fs.writeFileSync(outputPath, `${JSON.stringify(exported, null, 2)}\n`);
console.log(`Exported ${publicPhrases.length} public phrases to ${path.relative(process.cwd(), outputPath)}.`);
