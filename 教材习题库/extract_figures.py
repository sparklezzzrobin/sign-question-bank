# -*- coding: utf-8 -*-
"""
extract_figures.py —— 从郑君里教辅 PDF 中按"图N-M"标签裁剪插图到 images/tb/

用法：
    python extract_figures.py <章号> <页码列表>
    页码列表如 "4-19,24"（PDF 物理页码，1 起）

原理：
    圣才教辅中插图是嵌入位图，正下方有"图 N-M"或"图 N-M（a）"文字标签（在文字层）。
    对每个标签，取其正上方、水平重叠、距离最近的图块，并把与其相邻（间距 < 16px）
    的其他图块合并（处理并排双子图），从页面渲染图裁剪。
    同一图号（如 图1-12（a）（b）跨页多块）的多张裁片按页序纵向拼接成
    images/tb/fig{章}-{N}-{M}.png。
    公式图片没有"图N-M"标签，不会被裁剪。
"""
import io
import os
import re
import sys

import pymupdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, 'pdf', '郑君里《信号与系统》（第3版）笔记和课后习题（含考研真题）详解.pdf')
OUT = os.path.join(ROOT, 'images', 'tb')
DPI = 130
CAP_RE = re.compile(r'图\s*(\d+)\s*[-–—]\s*(\d+)(?:\s*[（(][^）)]*[）)])?')


def pages_arg(s):
    out = []
    for part in s.split(','):
        part = part.strip()
        if '-' in part:
            a, b = part.split('-')
            out += list(range(int(a), int(b) + 1))
        elif part:
            out.append(int(part))
    return out


def merge_near(rects, seed):
    """把与 seed 相交/间距小于 16px 的图块不断并入，返回并集（处理双子图）。"""
    cur = pymupdf.Rect(seed)
    changed = True
    while changed:
        changed = False
        for r in rects:
            if r.is_empty or cur.contains(r):
                continue
            grown = pymupdf.Rect(cur) + (-16, -16, 16, 16)
            if grown.intersects(r):
                nxt = pymupdf.Rect(cur)
                nxt |= r
                if nxt != cur:
                    cur = nxt
                    changed = True
    return cur


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    ch = sys.argv[1]
    pages = pages_arg(sys.argv[2])
    os.makedirs(OUT, exist_ok=True)
    doc = pymupdf.open(PDF)
    crops = {}       # (n, m) -> [(page, y, PIL.Image)]
    notes = []
    try:
        from PIL import Image
    except ImportError:
        Image = None

    for pno in pages:
        page = doc[pno - 1]
        caps = []
        for b in page.get_text('dict')['blocks']:
            if b['type'] != 0:
                continue
            for ln in b['lines']:
                txt = ''.join(s['text'] for s in ln['spans']).strip()
                m = CAP_RE.fullmatch(txt)
                if m:
                    caps.append((int(m.group(1)), int(m.group(2)), pymupdf.Rect(ln['bbox'])))
        if not caps:
            continue
        imgs = [pymupdf.Rect(i['bbox']) for i in page.get_image_info()]
        for (cn, cm, cr) in caps:
            cands = [r for r in imgs
                     if not r.is_empty and r.y1 <= cr.y0 + 10
                     and r.width > 24 and r.height > 16
                     and min(r.x1, cr.x1) - max(r.x0, cr.x0) > -30]
            if not cands:
                notes.append(f'p{pno} 图{cn}-{cm}: 未找到上方图块')
                continue
            seed = max(cands, key=lambda r: r.y1)
            union = merge_near([r for r in imgs if r.y1 <= cr.y0 + 10], seed)
            pad = 4
            clip = pymupdf.Rect(
                max(0, union.x0 - pad), max(0, union.y0 - pad),
                min(page.rect.x1, union.x1 + pad), min(cr.y0, union.y1 + pad))
            if clip.is_empty or clip.width < 20 or clip.height < 14:
                notes.append(f'p{pno} 图{cn}-{cm}: 裁剪区域异常 {clip}')
                continue
            if Image is None:
                out = os.path.join(OUT, f'fig{ch}-{cn}-{cm}.png')
                page.get_pixmap(dpi=DPI, clip=clip).save(out)
                crops[(cn, cm)] = crops.get((cn, cm), [])
                continue
            pix = page.get_pixmap(dpi=DPI, clip=clip)
            img = Image.open(io.BytesIO(pix.tobytes('png')))
            crops.setdefault((cn, cm), []).append((pno, clip.y0, img))

    saved = 0
    for (cn, cm), items in sorted(crops.items()):
        items.sort(key=lambda t: (t[0], t[1]))
        imgs_ = [t[2] for t in items]
        out = os.path.join(OUT, f'fig{ch}-{cn}-{cm}.png')
        if len(imgs_) == 1 or Image is None:
            if Image is not None:
                imgs_[0].save(out)
            saved += 1
            print(f'  fig{ch}-{cn}-{cm}.png  x{len(imgs_)}块')
        else:
            W = max(im.width for im in imgs_)
            gap = 26
            H = sum(im.height for im in imgs_) + gap * (len(imgs_) - 1)
            canvas = Image.new('RGB', (W, H), 'white')
            y = 0
            for im in imgs_:
                canvas.paste(im, (0, y))
                y += im.height + gap
            canvas.save(out)
            saved += 1
            print(f'  fig{ch}-{cn}-{cm}.png  {len(imgs_)}块拼接 {W}x{H}')
    print(f'共保存 {saved} 张插图 → images/tb/')
    if notes:
        print('未定位/异常：')
        for n in notes:
            print('  ' + n)


if __name__ == '__main__':
    main()
