#!/usr/bin/env tsx

/**
 * Archive Completed Chapters Script
 *
 * Finds chapters marked as "✅ Complete" and "✓ Approved" in TASKS.md,
 * extracts them using HTML comment separators, appends to archive file,
 * and removes from main task file.
 *
 * Usage: tsx scripts/archive-completed-chapters.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'TASKS.md');
const ARCHIVE_DIR = path.join(process.cwd(), 'docs', 'archive');
const ARCHIVE_FILE = path.join(ARCHIVE_DIR, 'TASKS-COMPLETED.md');

interface Chapter {
    number: number;
    title: string;
    status: string;
    approved: boolean;
    content: string;
    startLine: number;
    endLine: number;
}

function extractChapters(tasksContent: string): { chapters: Chapter[], remainingContent: string } {
    const lines = tasksContent.split('\n');
    const chapters: Chapter[] = [];
    let currentChapter: Partial<Chapter> | null = null;
    let chapterLines: string[] = [];
    let lineIndex = 0;

    for (const line of lines) {
        // Check for chapter start marker
        const startMatch = line.match(/<!-- CHAPTER_START: (\d+) -->/);
        if (startMatch) {
            currentChapter = {
                number: parseInt(startMatch[1], 10),
                startLine: lineIndex,
            };
            chapterLines = [line];
            lineIndex++;
            continue;
        }

        // Check for chapter end marker
        const endMatch = line.match(/<!-- CHAPTER_END: (\d+) -->/);
        if (endMatch && currentChapter) {
            chapterLines.push(line);
            currentChapter.endLine = lineIndex;
            currentChapter.content = chapterLines.join('\n');

            // Extract chapter metadata from content
            const titleMatch = currentChapter.content.match(/## Chapter \d+: (.+)/);
            const statusMatch = currentChapter.content.match(/\*\*Status:\*\* (.+)/);

            if (titleMatch) currentChapter.title = titleMatch[1];
            if (statusMatch) currentChapter.status = statusMatch[1];

            chapters.push(currentChapter as Chapter);
            currentChapter = null;
            chapterLines = [];
        } else if (currentChapter) {
            chapterLines.push(line);
        }

        lineIndex++;
    }

    return { chapters, remainingContent: tasksContent };
}

function isChapterApproved(chapterNumber: number, tasksContent: string): boolean {
    // Look for the chapter in the Progress Tracking table
    const progressMatch = tasksContent.match(/\| \d+\..+\| ✅ Completed \| ✓ \|/g);
    if (!progressMatch) return false;

    // Find entry for this chapter number
    const chapterEntry = tasksContent.match(new RegExp(`\\| ${chapterNumber}\\..*\\| ✅ Completed \\| ✓ \\|`));
    return !!chapterEntry;
}

function removeChapterFromContent(content: string, chapter: Chapter): string {
    const lines = content.split('\n');
    const beforeChapter = lines.slice(0, chapter.startLine);
    const afterChapter = lines.slice(chapter.endLine + 1);

    // Join with proper spacing
    const result = [...beforeChapter, ...afterChapter].join('\n');

    // Clean up excessive blank lines (max 2 consecutive)
    return result.replace(/\n{4,}/g, '\n\n\n');
}

function updateProgressTracking(content: string, archivedChapters: number[]): string {
    let updatedContent = content;

    for (const chapterNum of archivedChapters) {
        // Remove the archived chapter from Progress Tracking table
        const regex = new RegExp(`\\| ${chapterNum}\\..*\\| ✅ Completed \\| ✓ \\|.*\\n`, 'g');
        updatedContent = updatedContent.replace(regex, '');
    }

    return updatedContent;
}

function ensureArchiveFile() {
    if (!fs.existsSync(ARCHIVE_DIR)) {
        fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }

    if (!fs.existsSync(ARCHIVE_FILE)) {
        const header = `# Archived Completed Chapters

This file contains chapters that have been completed and approved, archived from TASKS.md.

---

`;
        fs.writeFileSync(ARCHIVE_FILE, header, 'utf-8');
    }
}

function appendToArchive(chapters: Chapter[]) {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const archiveContent = fs.readFileSync(ARCHIVE_FILE, 'utf-8');

    const newContent = chapters.map(chapter => {
        return `## Archived: ${timestamp} - Chapter ${chapter.number}: ${chapter.title}\n\n${chapter.content}\n\n---\n`;
    }).join('\n');

    fs.writeFileSync(ARCHIVE_FILE, archiveContent + newContent, 'utf-8');
}

function main() {
    console.log('🔍 Scanning TASKS.md for completed chapters...\n');

    // Read TASKS.md
    const tasksContent = fs.readFileSync(TASKS_FILE, 'utf-8');

    // Extract all chapters
    const { chapters } = extractChapters(tasksContent);

    if (chapters.length === 0) {
        console.log('⚠️  No chapters with separators found. Please add chapter separators first.');
        console.log('   Format: <!-- CHAPTER_START: N --> and <!-- CHAPTER_END: N -->');
        return;
    }

    console.log(`Found ${chapters.length} chapters with separators\n`);

    // Filter for completed and approved chapters
    const completedChapters = chapters.filter(ch => {
        const isComplete = ch.status?.includes('✅ Complete');
        const isApproved = isChapterApproved(ch.number, tasksContent);
        return isComplete && isApproved;
    });

    if (completedChapters.length === 0) {
        console.log('✅ No completed and approved chapters to archive.');
        return;
    }

    console.log(`📦 Found ${completedChapters.length} chapters ready to archive:\n`);
    completedChapters.forEach(ch => {
        console.log(`   - Chapter ${ch.number}: ${ch.title}`);
    });
    console.log('');

    // Ensure archive directory and file exist
    ensureArchiveFile();

    // Append to archive
    appendToArchive(completedChapters);
    console.log(`✅ Appended ${completedChapters.length} chapters to ${ARCHIVE_FILE}\n`);

    // Remove from TASKS.md (process in reverse order to maintain line indices)
    let updatedContent = tasksContent;
    const sortedChapters = [...completedChapters].sort((a, b) => b.startLine - a.startLine);
    for (const chapter of sortedChapters) {
        updatedContent = removeChapterFromContent(updatedContent, chapter);
    }

    // Update Progress Tracking table
    const archivedChapterNumbers = completedChapters.map(ch => ch.number);
    updatedContent = updateProgressTracking(updatedContent, archivedChapterNumbers);

    // Write updated TASKS.md
    fs.writeFileSync(TASKS_FILE, updatedContent, 'utf-8');
    console.log(`✅ Updated TASKS.md (removed ${completedChapters.length} chapters)\n`);

    console.log('🎉 Archive complete!');
}

main();