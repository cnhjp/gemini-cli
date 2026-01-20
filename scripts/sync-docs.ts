/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import simpleGit from 'simple-git';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// import { GoogleGenerativeAI } from '@google/generative-ai'; // Removed

// --- Configuration ---
const UPSTREAM_REPO = 'https://github.com/google-gemini/gemini-cli.git';
const DOCS_SRC_DIR = 'docs'; // Upstream docs location
const DOCS_TARGET_DIR = 'docs-site/docs'; // Local docs location
const SYNC_STATE_FILE = '.last-sync-rev'; // File to store the last synced commit hash
const TARGET_LANG = 'Chinese (Simplified)';

// SiliconFlow Configuration
const SF_API_KEY = process.env.SILICONFLOW_API_KEY;
const SF_BASE_URL = process.env.SF_BASE_URL || 'https://api.siliconflow.cn/v1';
const SF_MODEL = process.env.SF_MODEL || 'deepseek-ai/DeepSeek-V2.5'; // Default to DeepSeek V2.5

const REQUEST_DELAY_MS = 2000; // 2 seconds delay
const MAX_RETRIES = 5;

// --- Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const git = simpleGit(ROOT_DIR);

if (!SF_API_KEY) {
  console.warn(
    'WARNING: SILICONFLOW_API_KEY is not set. Translation will be skipped or mock mode used.',
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

/**
 * Translates content using SiliconFlow (OpenAI Compatible) API.
 */
async function translateContent(
  content: string,
  filePath: string,
): Promise<string> {
  if (!SF_API_KEY) {
    console.warn(`Skipping translation for ${filePath} (No API Key).`);
    return content;
  }

  console.log(`Translating ${filePath} using ${SF_MODEL}...`);

  const systemPrompt = `
You are a professional technical translator specializing in software documentation.
Translate the following Markdown content from English to ${TARGET_LANG}.

IMPORTANT RULES:
1. Keep the frontmatter (the YAML block at the top between ---) exactly as is. DO NOT translate keys. Only translate values if they are titles or descriptions.
2. Do NOT translate code blocks (content inside 

3. Maintain all original Markdown formatting (headers, lists, bold, links, etc.).
4. Translate technical terms accurately. Keep specific command names (e.g., 'gemini', 'npm run'), flags, and code symbols in English.
5. If the content is already in ${TARGET_LANG}, return it exactly as is.
6. Return ONLY the translated Markdown content. No preamble or postscript.
`;

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch(`${SF_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SF_API_KEY}`,
        },
        body: JSON.stringify({
          model: SF_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: content },
          ],
          temperature: 0.1, // Low temperature for consistent translation
          stream: false,
        }),
      });

      if (!response.ok) {
        // Handle Rate Limits (429) and Server Errors (5xx)
        if (response.status === 429 || response.status >= 500) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        // Other errors (400, 401, etc.) are likely fatal
        const errorText = await response.text();
        console.error(
          `API Error for ${filePath}: ${response.status} - ${errorText}`,
        );
        return content;
      }

      const data = (await response.json()) as OpenAIResponse;
      if (
        data.choices &&
        data.choices.length > 0 &&
        data.choices[0].message?.content
      ) {
        return data.choices[0].message.content.trim();
      } else {
        console.warn(
          `Unexpected API response structure for ${filePath}:`,
          JSON.stringify(data),
        );
        return content;
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      const isRateLimit =
        err.message?.includes('429') || err.message?.includes('50'); // Retry on 429 or 5xx

      if (isRateLimit) {
        attempt++;
        const waitTime = Math.pow(2, attempt) * 2000;
        console.warn(
          `API Request failed for ${filePath} (${err.message}). Retrying in ${waitTime / 1000}s (Attempt ${attempt}/${MAX_RETRIES})...`,
        );
        await sleep(waitTime);
      } else {
        console.error(`Failed to translate ${filePath}:`, error);
        return content;
      }
    }
  }

  console.error(
    `Max retries exceeded for ${filePath}. Returning original content.`,
  );
  return content;
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

        // Add delay to respect rate limits
        await sleep(REQUEST_DELAY_MS);
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
