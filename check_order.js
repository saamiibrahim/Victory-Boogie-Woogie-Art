const fs = require('fs');
const path = require('path');

const svgFilePath = path.join(__dirname, 'Piet_Mondriaan_Victory_Boogie_Woogie_SVG.svg');
const svgContent = fs.readFileSync(svgFilePath, 'utf8');

// Regex to capture tag type and fill color
const tagRegex = /<(\w+)[^>]*fill=["']([^"']+)["'][^>]*>/gi;

let match;
const sequence = [];
while ((match = tagRegex.exec(svgContent)) !== null) {
    sequence.push({
        type: match[1],
        fill: match[2],
        index: match.index,
        content: match[0]
    });
}

// Check for the "missing" pattern: Small dark/blue blocks followed by Large Grey blocks.
// We'll define "Large Grey" by parsing width/height from content roughly.

function getDim(str, attr) {
    const m = str.match(new RegExp(`${attr}=["']([^"']+)["']`));
    return m ? parseFloat(m[1]) : 0;
}

console.log(`Total shapes found: ${sequence.length}`);

// We want to see if grey shapes appear late in the file.
// Let's print the last 20 shapes.
const tail = sequence.slice(-20);
console.log('--- LAST 20 SHAPES ---');
tail.forEach(s => {
    const w = getDim(s.content, 'width');
    const h = getDim(s.content, 'height');
    console.log(`${s.type} fill=${s.fill} w=${w} h=${h}`);
});

// Also look for specific missing blocks (Blue #1A56A4, Dark #131533)
// and check their position relative to subsequent Greys.
// We'll search for a blue block with small x (left side).
console.log('--- POTENTIAL MISSING BLOCKS (Left Side) ---');
sequence.forEach((s, idx) => {
    if (s.fill === '#1A56A4' || s.fill === '#131533') {
        const x = getDim(s.content, 'x');
        const y = getDim(s.content, 'y');
        // Check for "left side" - say x < 500
        if (x < 500) {
            console.log(`Frame ${idx}: ${s.fill} at x=${x}, y=${y}`);
            // Check if any SUBSEQUENT shape covers this?
            // This is hard to do perfectly without geometry, 
            // but let's check if the NEXT few shapes are large greys.
            for (let i = idx + 1; i < Math.min(sequence.length, idx + 10); i++) {
                const next = sequence[i];
                if (next.fill === '#EAECEC' || next.fill === '#CBD5DD') {
                    const nw = getDim(next.content, 'width');
                    const nh = getDim(next.content, 'height');
                    if (nw > 100 && nh > 100) {
                        console.log(`   -> FOLLOWED BY ${next.fill} w=${nw} h=${nh} at +${i - idx}`);
                    }
                }
            }
        }
    }
});
