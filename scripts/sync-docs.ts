/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import simpleGit from 'simple-git';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Configuration ---
const UPSTREAM_REPO = 'https://github.com/google/gemini-cli.git';
const DOCS_SRC_DIR = 'docs'; // Upstream docs location
const DOCS_TARGET_DIR = 'docs-site/docs'; // Local docs location
const TARGET_LANG = 'Chinese (Simplified)';
const GEMINI_MODEL = 'gemini-2.0-flash'; // Use a fast and capable model

// --- Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const git = simpleGit(ROOT_DIR);

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
// Note: We don't exit hard here if key is missing, as users might just want to sync without translation
// or set it up later. But for this script's purpose, we'll warn.
if (!apiKey) {
  console.warn(
    'WARNING: GEMINI_API_KEY is not set. Translation will be skipped or mock mode used.',
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: GEMINI_MODEL }) : null;

/**
 * Translates content using Gemini API.
 */
async function translateContent(
  content: string,
  filePath: string,
): Promise<string> {
  if (!model) {
    console.warn(`Skipping translation for ${filePath} (No API Key).`);
    return content;
  }

  console.log(`Translating ${filePath}...`);

  const prompt = `
You are a professional technical translator specializing in software documentation.
Translate the following Markdown content from English to ${TARGET_LANG}.

IMPORTANT RULES:
1. Keep the frontmatter (the YAML block at the top between ---) exactly as is. DO NOT translate keys. Only translate values if they are titles or descriptions.
2. Do NOT translate code blocks (content inside 

3. Maintain all original Markdown formatting (headers, lists, bold, links, etc.).
4. Translate technical terms accurately. Keep specific command names (e.g., 'gemini', 'npm run'), flags, and code symbols in English.
5. If the content is already in ${TARGET_LANG}, return it exactly as is.
6. Return ONLY the translated Markdown content. No preamble or postscript.

Content to translate:
${content}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`Failed to translate ${filePath}:`, error);
    // Return original content as fallback
    return content;
  }
}

/**
 * Main synchronization logic.
 */
async function syncDocs() {
  console.log('Starting documentation synchronization...');

  try {
    // 1. Configure Upstream
    const remotes = await git.getRemotes(true);
    const upstreamExists = remotes.some((r) => r.name === 'upstream');
    if (!upstreamExists) {
      console.log('Adding upstream remote...');
      await git.addRemote('upstream', UPSTREAM_REPO);
    }

    // 2. Fetch Upstream
    console.log('Fetching upstream...');
    await git.fetch('upstream');

    // 3. Identify Changed Files
    // List all markdown files in the upstream 'docs' directory
    const rawFileList = await git.raw([
      'ls-tree',
      '-r',
      '--name-only',
      'upstream/main',
      DOCS_SRC_DIR,
    ]);

    const upstreamFiles = rawFileList
      .split('\n')
      .map((s) => s.trim())
      .filter((f) => f && f.startsWith(DOCS_SRC_DIR) && f.endsWith('.md'));

    console.log(
      `Found ${upstreamFiles.length} documentation files in upstream.`,
    );

    let processedCount = 0;

    for (const upstreamFilePath of upstreamFiles) {
      // Map upstream path (docs/foo.md) to local target path (docs-site/docs/foo.md)
      const relativePath = path.relative(DOCS_SRC_DIR, upstreamFilePath);
      const localPath = path.join(DOCS_TARGET_DIR, relativePath);

      // Check if local file exists to decide whether to skip or update
      // For this MVP, we only create NEW files to avoid overwriting manual edits.
      let exists = false;
      try {
        await fs.access(localPath);
        exists = true;
      } catch {
        exists = false;
      }

      if (!exists) {
        console.log(`New file detected: ${upstreamFilePath} -> ${localPath}`);

        // Get upstream content
        const upstreamContent = await git.show([
          `upstream/main:${upstreamFilePath}`,
        ]);

        // Ensure directory exists
        await fs.mkdir(path.dirname(localPath), { recursive: true });

        // Translate
        const translatedContent = await translateContent(
          upstreamContent,
          upstreamFilePath,
        );

        // Write to file
        await fs.writeFile(localPath, translatedContent, 'utf-8');
        processedCount++;
      }
    }

    if (processedCount === 0) {
      console.log(
        'No new files to sync (all upstreams already exist locally).',
      );
    } else {
      console.log(`Successfully synchronized ${processedCount} files.`);
    }
  } catch (error) {
    console.error('Synchronization failed:', error);
    process.exit(1);
  }
}

syncDocs();
