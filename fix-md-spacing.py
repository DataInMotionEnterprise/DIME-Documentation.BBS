#!/usr/bin/env python3
"""
Fix spacing issues in DIME ASCII art .md content files.

Four passes:
  1. Outer border width — normalizes all lines to consistent width (from top border)
  2. Inner alignment (space-based) — aligns │ within box groups via majority vote
  3. Inner alignment (arrow-aware) — handles ────▶│ connections and text overflow
  4. Box border tracking — finds ┌┐/└┘ corners and enforces consistent │ positions

Usage:
    python fix-md-spacing.py                    # fix all .md files in content/
    python fix-md-spacing.py 05-architecture.md # fix a single file
"""
import os
import sys
from collections import Counter

CONTENT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'content')
VERTS = set('│┌┐└┘├┤┬┴┼')


# ── Pass 1: Outer border width ──────────────────────────────────────────────

def fix_outer_widths(lines, target):
    """Normalize all content lines to target width."""
    fixed = 0
    for i, line in enumerate(lines):
        if line.strip().startswith('```'):
            continue
        n = len(line)
        if n == target:
            continue
        if not line or line[-1] not in '│┐┘':
            continue

        diff = target - n
        border = line[-1]
        inner = line[:-1]

        if border in '┐┘':
            if diff > 0:
                inner += '─' * diff
            else:
                trimmed = inner.rstrip('─')
                if len(inner) - len(trimmed) >= abs(diff):
                    inner = inner[:diff]
                else:
                    continue
        else:
            if diff > 0:
                inner += ' ' * diff
            else:
                trimmed = inner.rstrip(' ')
                if len(inner) - len(trimmed) >= abs(diff):
                    inner = inner[:diff]
                else:
                    continue

        result = inner + border
        if len(result) == target:
            lines[i] = result
            fixed += 1
    return fixed


# ── Pass 2 & 3: Inner alignment ─────────────────────────────────────────────

def get_inner_verts(line):
    return [j for j, c in enumerate(line) if c in VERTS and j > 0 and j < len(line) - 1]


def positions_similar(a, b, tol=3):
    return len(a) == len(b) and all(abs(x - y) <= tol for x, y in zip(a, b))


def build_groups(lines):
    """Group consecutive lines with similar inner vert counts/positions."""
    groups = []
    curr = []
    for i, line in enumerate(lines):
        vp = get_inner_verts(line)
        if vp:
            if curr:
                prev = get_inner_verts(lines[curr[-1]])
                if positions_similar(vp, prev):
                    curr.append(i)
                else:
                    if len(curr) > 1:
                        groups.append(curr[:])
                    curr = [i]
            else:
                curr.append(i)
        else:
            if len(curr) > 1:
                groups.append(curr[:])
            curr = []
    if len(curr) > 1:
        groups.append(curr[:])
    return groups


def get_ref_positions(group, lines, all_pos):
    """Determine reference │ positions — prefer border lines, else majority."""
    n = len(all_pos[0])
    border_gi = [gi for gi, idx in enumerate(group)
                 if any(c in '┌┐└┘' for j, c in enumerate(lines[idx])
                        if j > 0 and j < len(lines[idx]) - 1 and c in VERTS)]
    if border_gi:
        return all_pos[border_gi[0]]
    return [Counter(all_pos[gi][p] for gi in range(len(group))).most_common(1)[0][0]
            for p in range(n)]


def adjust_segment(content, target_width):
    """Adjust a segment between two │ to fit target_width chars."""
    curr = len(content)
    diff = target_width - curr
    if diff == 0:
        return content

    has_arrow_r = '▶' in content
    has_arrow_l = '◀' in content
    has_dash = '─' in content

    if diff > 0:
        if has_arrow_r:
            i = content.rfind('▶')
            return content[:i] + '─' * diff + content[i:]
        elif has_arrow_l:
            i = content.find('◀')
            return content[:i + 1] + '─' * diff + content[i + 1:]
        elif has_dash and content.strip('─ ') == '':
            return content + '─' * diff
        else:
            return content + ' ' * diff
    else:
        remove = abs(diff)
        if has_dash:
            result = list(content)
            removed = 0
            for j in range(len(result)):
                if result[j] == '─' and removed < remove:
                    result[j] = None
                    removed += 1
            if removed == remove:
                return ''.join(c for c in result if c is not None)
        # try trailing spaces
        stripped = content.rstrip(' ')
        trailing = curr - len(stripped)
        if trailing >= remove:
            return stripped + ' ' * (trailing - remove)
        # also try leading spaces
        remaining = remove - trailing
        inner = stripped.lstrip(' ')
        leading = len(stripped) - len(inner)
        if leading >= remaining:
            return ' ' * (leading - remaining) + inner
        return None


def fix_line_space(line, curr_pos, ref_pos, target_len):
    """Pass 2: shift │ by inserting/removing spaces only."""
    if len(curr_pos) != len(ref_pos):
        return None
    chars = list(line)
    offset = 0
    for curr, ref in zip(curr_pos, ref_pos):
        actual = curr + offset
        diff = ref - actual
        if diff == 0:
            continue
        if diff > 0:
            for _ in range(diff):
                chars.insert(actual, ' ')
            offset += diff
        else:
            remove = abs(diff)
            start = actual - remove
            if start < 0 or not all(chars[start + j] == ' ' for j in range(remove)):
                return None
            del chars[start:actual]
            offset += diff
    result = ''.join(chars)
    if len(result) < target_len:
        result = result[:-1] + ' ' * (target_len - len(result)) + result[-1]
    elif len(result) > target_len:
        excess = len(result) - target_len
        idx = len(result) - 2
        while excess > 0 and idx > 0:
            if result[idx] == ' ':
                result = result[:idx] + result[idx + 1:]
                excess -= 1
            idx -= 1
        if excess > 0:
            return None
    return result if len(result) == target_len else None


def fix_line_segment(line, curr_pos, ref_pos, target_len):
    """Pass 3: rebuild line segment-by-segment (handles arrows and text)."""
    if len(curr_pos) != len(ref_pos):
        return None
    all_c = [0] + list(curr_pos) + [target_len - 1]
    all_r = [0] + list(ref_pos) + [target_len - 1]
    parts = []
    for i in range(len(all_c) - 1):
        border = line[all_c[i]]
        content = line[all_c[i] + 1:all_c[i + 1]]
        tw = all_r[i + 1] - all_r[i] - 1
        adjusted = adjust_segment(content, tw)
        if adjusted is None:
            return None
        parts.append(border + adjusted)
    parts.append(line[all_c[-1]])
    result = ''.join(parts)
    return result if len(result) == target_len else None


def fix_inner(lines, target_len, fix_fn):
    """Run an inner-alignment pass using the given fix function."""
    groups = build_groups(lines)
    fixed = 0
    for group in groups:
        all_pos = [get_inner_verts(lines[idx]) for idx in group]
        n = len(all_pos[0])
        if not all(len(p) == n for p in all_pos):
            continue
        ref = get_ref_positions(group, lines, all_pos)
        for gi, idx in enumerate(group):
            if all_pos[gi] == ref:
                continue
            result = fix_fn(lines[idx], all_pos[gi], ref, target_len)
            if result and len(result) == target_len:
                lines[idx] = result
                fixed += 1
    return fixed


# ── Pass 4: Box border tracking ──────────────────────────────────────────────

def find_boxes(lines):
    """Find box regions defined by ┌┐ (top) and └┘ (bottom) corner pairs."""
    boxes = []
    # Find top borders: lines containing ┌ and ┐ as inner characters
    tops = []
    for i, line in enumerate(lines):
        corners = [(j, c) for j, c in enumerate(line) if c in '┌┐' and 0 < j < len(line) - 1]
        lefts = [j for j, c in corners if c == '┌']
        rights = [j for j, c in corners if c == '┐']
        for lc in lefts:
            for rc in rights:
                if rc > lc:
                    tops.append((i, lc, rc))

    # For each top, find matching bottom
    for top_line, left_col, right_col in tops:
        for i in range(top_line + 1, min(top_line + 200, len(lines))):
            line = lines[i]
            if left_col < len(line) and right_col < len(line):
                if line[left_col] == '└' and line[right_col] == '┘':
                    boxes.append((top_line, i, left_col, right_col))
                    break
    return boxes


def fix_box_borders(lines, target_len):
    """Pass 4: enforce consistent │ positions within boxes defined by corners."""
    boxes = find_boxes(lines)
    fixed = 0

    for top_line, bot_line, left_col, right_col in boxes:
        # Fix lines between top and bottom borders
        for i in range(top_line + 1, bot_line):
            line = lines[i]
            if len(line) != target_len:
                continue

            # Check left border
            for col, expected in [(left_col, '│'), (right_col, '│')]:
                actual_char = line[col] if col < len(line) else None
                if actual_char in VERTS:
                    continue  # already correct position

                # Look for the vert nearby (±1, ±2)
                found = None
                for offset in [1, -1, 2, -2]:
                    nc = col + offset
                    if 0 < nc < len(line) - 1 and line[nc] in VERTS:
                        # Verify this is likely the same border (not a different box)
                        found = (nc, offset)
                        break

                if found is None:
                    continue

                nc, offset = found
                chars = list(line)

                if offset > 0:
                    # Vert is too far right — remove spaces before it
                    # Find spaces to remove between col and nc
                    removable = []
                    for j in range(col, nc):
                        if chars[j] == ' ':
                            removable.append(j)
                    if len(removable) >= offset:
                        for j in sorted(removable[:offset], reverse=True):
                            del chars[j]
                        # Pad to maintain line length — add spaces after the vert
                        # Find a good spot: trailing space before next vert or end
                        result = chars
                        while len(result) < target_len:
                            # Add space after the vert (now at col)
                            result.insert(col + 1, ' ')
                        line = ''.join(result[:target_len])
                    else:
                        continue
                else:
                    # Vert is too far left — remove spaces after it
                    removable = []
                    for j in range(nc + 1, col + 1):
                        if chars[j] == ' ':
                            removable.append(j)
                    if len(removable) >= abs(offset):
                        for j in sorted(removable[:abs(offset)], reverse=True):
                            del chars[j]
                        # Pad — add spaces before the vert
                        result = chars
                        while len(result) < target_len:
                            result.insert(nc, ' ')
                        line = ''.join(result[:target_len])
                    else:
                        continue

                if len(line) == target_len and line[col] in VERTS:
                    lines[i] = line
                    fixed += 1

    return fixed


# ── Main ─────────────────────────────────────────────────────────────────────

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        lines = [l.rstrip('\n').rstrip('\r') for l in f]

    # Determine target width from top border
    content = [l for l in lines if not l.strip().startswith('```')]
    if not content:
        return 0, 0, 0
    target = len(content[0])

    n1 = fix_outer_widths(lines, target)
    n2 = fix_inner(lines, target, fix_line_space)
    n3 = fix_inner(lines, target, fix_line_segment)
    n4 = fix_box_borders(lines, target)

    if n1 + n2 + n3 + n4 > 0:
        with open(path, 'w', encoding='utf-8', newline='') as f:
            f.write('\n'.join(lines))
            if lines[-1] != '':
                f.write('\n')
    return n1, n2, n3, n4


def main():
    files = sys.argv[1:] if len(sys.argv) > 1 else None

    total = [0, 0, 0, 0]
    for fname in sorted(os.listdir(CONTENT_DIR)):
        if not fname.endswith('.md') or fname == 'SERIES.md':
            continue
        if files and fname not in files:
            continue
        path = os.path.join(CONTENT_DIR, fname)
        n1, n2, n3, n4 = process_file(path)
        s = n1 + n2 + n3 + n4
        if s > 0:
            print(f'{fname}: outer={n1}  inner/space={n2}  inner/segment={n3}  box={n4}')
        total[0] += n1
        total[1] += n2
        total[2] += n3
        total[3] += n4

    t = sum(total)
    if t > 0:
        print(f'\nTotal: {t} fixes (outer={total[0]}, inner/space={total[1]}, inner/segment={total[2]}, box={total[3]})')
    else:
        print('No issues found.')


if __name__ == '__main__':
    main()
