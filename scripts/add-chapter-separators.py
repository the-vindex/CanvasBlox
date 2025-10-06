#!/usr/bin/env python3

"""Add chapter separators to TASKS.md"""

import re

# Read TASKS.md
with open('TASKS.md', 'r') as f:
    content = f.read()

# Define chapter markers - (chapter_number, start_pattern, end_pattern)
chapters = [
    (11, r'^---\n\n## Chapter 11:', r'\n\n---\n\n## Chapter 13:'),
    (13, r'^## Chapter 13:', r'\n\n---\n\n## Chapter 16:'),
    (16, r'^## Chapter 16:', r'\n\n---\n\n## Chapter 15:'),
    (15, r'^## Chapter 15:', r'\n\n---\n\n## Chapter 12:'),
    (12, r'^## Chapter 12:', r'\n\n---\n\n## Chapter 14:'),
    (14, r'^## Chapter 14:', r'\n\n---\n\n## Chapter 17:'),
    (17, r'^## Chapter 17:', r'\n\n---\n\n## Chapter 18:'),
    (18, r'^## Chapter 18:', r'\n\n---\n\n## Chapter 19:'),
    (19, r'^## Chapter 19:', r'\n\n---\n\n## Chapter 20:'),
    (20, r'^## Chapter 20:', r'\n\n---\n\n## Chapter 21:'),
    (21, r'^## Chapter 21:', r'\n\n---\n\n## Technical Context'),
]

# Add separators
for num, start_pattern, end_pattern in chapters:
    # Add start marker
    start_replacement = f'<!-- CHAPTER_START: {num} -->\n## Chapter {num}:'
    content = re.sub(start_pattern, start_replacement, content, flags=re.MULTILINE)

    # Add end marker
    end_replacement = f'\n<!-- CHAPTER_END: {num} -->\n\n---\n\n'
    if num == 11:
        end_replacement = f'\n<!-- CHAPTER_END: {num} -->\n\n---\n\n'
        end_pattern = r'\n\n---\n\n(?=## Chapter 13:)'
    elif num == 21:
        end_replacement = f'\n<!-- CHAPTER_END: {num} -->\n\n---\n\n'
        end_pattern = r'\n\n---\n\n(?=## Technical Context)'
    else:
        end_pattern = re.sub(r'\\n\\n---\\n\\n## Chapter \d+:', '', end_pattern)
        end_pattern = r'\n\n---\n\n(?=##' + end_pattern.split('##')[1] if '##' in end_pattern else ''

    # Simpler approach - add end marker before next chapter or Technical Context
    # We'll do this in a second pass

# Second pass - add end markers by finding where each chapter ends
lines = content.split('\n')
result = []
current_chapter = None

for i, line in enumerate(lines):
    # Check if this is a chapter start
    chapter_start_match = re.match(r'<!-- CHAPTER_START: (\d+) -->', line)
    if chapter_start_match:
        # Close previous chapter if exists
        if current_chapter is not None:
            # Insert end marker before the '---' that precedes this chapter
            if i >= 2 and result[-1] == '' and result[-2] == '---':
                result.insert(-2, f'<!-- CHAPTER_END: {current_chapter} -->')
        current_chapter = int(chapter_start_match.group(1))

    # Check for Technical Context (end of last chapter)
    if line.startswith('## Technical Context') and current_chapter is not None:
        if result[-1] == '' and result[-2] == '---':
            result.insert(-2, f'<!-- CHAPTER_END: {current_chapter} -->')
        current_chapter = None

    result.append(line)

# Write back
with open('TASKS.md', 'w') as f:
    f.write('\n'.join(result))

print("✅ Added chapter separators to TASKS.md")
