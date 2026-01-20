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
const UPSTREAM_REPO = 'https://github.com/google-gemini/gemini-cli.git';
const DOCS_SRC_DIR = 'docs'; // Upstream docs location
const DOCS_TARGET_DIR = 'docs-site/docs'; // Local docs location
const SYNC_STATE_FILE = '.last-sync-rev'; // File to store the last synced commit hash
const TARGET_LANG = 'Chinese (Simplified)';
const GEMINI_MODEL = 'gemini-2.0-flash';

// --- Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const git = simpleGit(ROOT_DIR);

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
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
    // Explicitly fetch the main branch to ensure upstream/main is available
    await git.fetch('upstream', '+refs/heads/main:refs/remotes/upstream/main');

    // 3. Determine Sync Range
    let lastSyncRev = '';
    try {
      lastSyncRev = (await fs.readFile(SYNC_STATE_FILE, 'utf-8')).trim();
    } catch {
      console.log('No previous sync state found.');
    }

    const upstreamHead = (await git.revparse(['upstream/main'])).trim();

    if (lastSyncRev === upstreamHead) {
      console.log('Already up to date with upstream.');
      return;
    }

    let filesChanged: string[] = [];

    // If we have a last sync revision, get the diff
    if (lastSyncRev) {
      console.log(
        `Checking for changes between ${lastSyncRev} and ${upstreamHead}...`,
      );
      // Get list of changed files with status (A, M, D, R)
      // Format: status + \t + filename
      const diffOutput = await git.diff([
        '--name-status',
        lastSyncRev,
        upstreamHead,
        '--',
        DOCS_SRC_DIR,
      ]);

      filesChanged = diffOutput.split('\n').filter(Boolean);
    } else {
      console.log(
        'First run or lost state. Performing full scan of upstream docs...',
      );
      // Treat everything as Added
      const lsTree = await git.raw([
        'ls-tree',
        '-r',
        '--name-only',
        'upstream/main',
        DOCS_SRC_DIR,
      ]);
      filesChanged = lsTree
        .split('\n')
        .filter((f) => f && f.endsWith('.md'))
        .map((f) => `A\t${f}`);
    }

    console.log(`Found ${filesChanged.length} file changes to process.`);

    let processedCount = 0;

    for (const line of filesChanged) {
      const parts = line.split('\t');
      const status = parts[0];

      let upstreamFilePath = '';
      let oldUpstreamFilePath = '';

      if (status.startsWith('R')) {
        // Rename: R100 \t oldPath \t newPath
        oldUpstreamFilePath = parts[1];
        upstreamFilePath = parts[2];
      } else {
        upstreamFilePath = parts[1];
      }

      if (!upstreamFilePath) continue;

      // Filter: only process .md files in docs directory
      if (
        !upstreamFilePath.startsWith(DOCS_SRC_DIR) ||
        !upstreamFilePath.endsWith('.md')
      ) {
        continue;
      }

      const relativePath = path.relative(DOCS_SRC_DIR, upstreamFilePath);
      const localPath = path.join(DOCS_TARGET_DIR, relativePath);

      // Handle deletion or old file removal in case of rename
      if (status.startsWith('D') || status.startsWith('R')) {
        const pathToRemove = status.startsWith('R')
          ? path.join(
              DOCS_TARGET_DIR,
              path.relative(DOCS_SRC_DIR, oldUpstreamFilePath),
            )
          : localPath;

        try {
          await fs.unlink(pathToRemove);
          console.log(`Deleted: ${pathToRemove}`);
          if (status.startsWith('D')) processedCount++;
        } catch {
          // Ignore if file doesn't exist
        }
      }

      // Handle addition or modification
      if (
        status.startsWith('A') ||
        status.startsWith('M') ||
        status.startsWith('R')
      ) {
        console.log(
          `Processing [${status}] ${upstreamFilePath} -> ${localPath}`,
        );

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

    // 4. Update State
    await fs.writeFile(SYNC_STATE_FILE, upstreamHead, 'utf-8');
    console.log(`Sync complete. Updated state to ${upstreamHead}`);
    console.log(`Processed ${processedCount} files.`);
  } catch (error) {
    console.error('Synchronization failed:', error);
    process.exit(1);
  }
}

syncDocs();
