'use client';

import { useRef } from 'react';
import { X, Printer, QrCode, MapPin } from 'lucide-react';

const CODE39_MAP = {
    '0': 'nnnwwnwnn',
    '1': 'wnnwnnnnw',
    '2': 'nnwwnnnnw',
    '3': 'wnwwnnnnn',
    '4': 'nnnwwnnnw',
    '5': 'wnnwwnnnn',
    '6': 'nnwwwnnnn',
    '7': 'nnnwnnwnw',
    '8': 'wnnwnnwnn',
    '9': 'nnwwnnwnn',
    A: 'wnnnnwnnw',
    B: 'nnwnnwnnw',
    C: 'wnwnnwnnn',
    D: 'nnnnwwnnw',
    E: 'wnnnwwnnn',
    F: 'nnwnwwnnn',
    G: 'nnnnnwwnw',
    H: 'wnnnnwwnn',
    I: 'nnwnnwwnn',
    J: 'nnnnwwwnn',
    K: 'wnnnnnnww',
    L: 'nnwnnnnww',
    M: 'wnwnnnnwn',
    N: 'nnnnwnnww',
    O: 'wnnnwnnwn',
    P: 'nnwnwnnwn',
    Q: 'nnnnnnwww',
    R: 'wnnnnnwwn',
    S: 'nnwnnnwwn',
    T: 'nnnnwnwwn',
    U: 'wwnnnnnnw',
    V: 'nwwnnnnnw',
    W: 'wwwnnnnnn',
    X: 'nwnnwnnnw',
    Y: 'wwnnwnnnn',
    Z: 'nwwnwnnnn',
    '-': 'nwnnnnwnw',
    '.': 'wwnnnnwnn',
    ' ': 'nwwnnnwnn',
    $: 'nwnwnwnnn',
    '/': 'nwnwnnnwn',
    '+': 'nwnnnwnwn',
    '%': 'nnnwnwnwn',
    '*': 'nwnnwnwnn',
};

function buildCode39Bars(rawText) {
    const sanitized = `*${String(rawText || '')
        .toUpperCase()
        .replace(/[^0-9A-Z\-. $/+%]/g, '-')}*`;

    const bars = [];
    let cursorX = 8;

    for (let c = 0; c < sanitized.length; c += 1) {
        const pattern = CODE39_MAP[sanitized[c]] || CODE39_MAP['-'];
        for (let i = 0; i < pattern.length; i += 1) {
        const width = pattern[i] === 'w' ? 4 : 2;
        if (i % 2 === 0) {
            bars.push({ x: cursorX, width });
        }
        cursorX += width;
        }
        cursorX += 2;
    }

    return { bars, totalWidth: cursorX + 8 };
}

function buildQrMatrix(text) {
    const size = 21;
    const grid = Array.from({ length: size }, () => Array(size).fill(false));

    function drawFinder(startR, startC) {
        for (let r = 0; r < 7; r += 1) {
        for (let c = 0; c < 7; c += 1) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            grid[startR + r][startC + c] = isBorder || isCenter;
        }
        }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    for (let r = 0; r < size; r += 1) {
        for (let c = 0; c < size; c += 1) {
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= size - 8;
        const inBottomLeft = r >= size - 8 && c < 8;
        if (inTopLeft || inTopRight || inBottomLeft) continue;

        const seed = (hash ^ (r * 31 + c * 17 + text.charCodeAt((r + c) % text.length))) >>> 0;
        grid[r][c] = seed % 2 === 0;
        }
    }

    return grid;
}

export default function BarcodeModal({ product, onClose }) {
    const printAreaRef = useRef(null);

    if (!product) return null;

    const { bars, totalWidth } = buildCode39Bars(product.sku);
    const qrMatrix = buildQrMatrix(product.sku);

    function handlePrintLabel() {
        if (!printAreaRef.current) return;
        const printContents = printAreaRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=480,height=600');
        if (!printWindow) return;

        printWindow.document.write(`
        <html>
            <head>
            <title>Label Barcode - ${product.sku}</title>
            <style>
                body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 24px;
                margin: 0;
                }
                .label-box {
                border: 2px solid #0f172a;
                border-radius: 12px;
                padding: 18px;
                width: 340px;
                text-align: center;
                }
                .brand {
                font-size: 11px;
                font-weight: bold;
                letter-spacing: 2px;
                color: #475569;
                margin-bottom: 6px;
                }
                .title {
                font-size: 14px;
                font-weight: bold;
                color: #0f172a;
                margin-bottom: 4px;
                }
                .meta {
                font-size: 11px;
                color: #334155;
                margin-bottom: 12px;
                }
                .codes {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                }
                .sku-text {
                font-family: monospace;
                font-size: 14px;
                font-weight: bold;
                letter-spacing: 2px;
                margin-top: 4px;
                }
            </style>
            </head>
            <body>
            ${printContents}
            <script>
                window.onload = function() {
                window.print();
                window.close();
                };
            </script>
            </body>
        </html>
        `);
        printWindow.document.close();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">Label Barcode & QR SKU</h3>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white cursor-pointer"
            >
                <X className="w-5 h-5" />
            </button>
            </div>

            <div ref={printAreaRef} className="flex justify-center">
            <div className="label-box w-full bg-white text-slate-900 rounded-xl p-5 text-center border-2 border-slate-300">
                <p className="brand text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                INVENTORA WAREHOUSE LABEL
                </p>
                <p className="title text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                {product.name}
                </p>
                <p className="meta text-xs text-slate-600 mt-0.5 inline-flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>Rak: {product.rack_location}</span>
                </p>

                <div className="codes mt-4 flex flex-col items-center gap-3">
                <svg
                    viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                    className="w-24 h-24 border border-slate-200 p-1.5 bg-white"
                >
                    {qrMatrix.map((row, rIdx) =>
                    row.map((filled, cIdx) =>
                        filled ? (
                        <rect
                            key={`${rIdx}-${cIdx}`}
                            x={cIdx}
                            y={rIdx}
                            width={1}
                            height={1}
                            fill="#0f172a"
                        />
                        ) : null
                    )
                    )}
                </svg>

                <div className="w-full overflow-x-auto flex flex-col items-center">
                    <svg
                    viewBox={`0 0 ${totalWidth} 56`}
                    className="h-14 max-w-full"
                    >
                    {bars.map((bar, idx) => (
                        <rect
                        key={idx}
                        x={bar.x}
                        y={4}
                        width={bar.width}
                        height={48}
                        fill="#0f172a"
                        />
                    ))}
                    </svg>
                    <span className="sku-text font-mono text-xs font-bold tracking-widest text-slate-900 mt-1">
                    {product.sku}
                    </span>
                </div>
                </div>
            </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
                Tutup
            </button>
            <button
                type="button"
                onClick={handlePrintLabel}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
                <Printer className="w-4 h-4" />
                <span>Print Label Barcode</span>
            </button>
            </div>
        </div>
        </div>
    );
}