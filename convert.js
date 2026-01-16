const fs = require('fs');
const path = require('path');

const svgFilePath = path.join(__dirname, 'Piet_Mondriaan_Victory_Boogie_Woogie_SVG.svg');
const outputFilePath = path.join(__dirname, 'mondrian_data.json');

try {
    const svgContent = fs.readFileSync(svgFilePath, 'utf8');
    const shapes = [];

    // Simple regex to match tags. Note: This is tailored to the specific format of the provided SVG.
    // It assumes attributes are double-quoted.

    // We'll use a simple tokenizer to walk through the XML structure
    const tagRegex = /<(\/?)(rect|path|g|use|circle|ellipse|line|polyline|polygon)([^>]*)>/gi;
    // Capture ALL tags to see what we miss
    const allTagRegex = /<(\/?)([a-zA-Z0-9:\-_]+)([^>]*)>/gi;

    // We stick to the main regex for extraction but maybe we should use a comprehensive one?
    // Let's stick to the list but add a check.

    let match;
    const transformStack = [];

    // Helper to get all transforms from current stack
    function getCombinedTransform() {
        if (transformStack.length === 0) return null;
        return JSON.parse(JSON.stringify(transformStack));
    }

    while ((match = tagRegex.exec(svgContent)) !== null) {
        const isClosing = match[1] === '/';
        const type = match[2].toLowerCase();
        const attrsStr = match[3];

        if (type === 'g') {
            if (isClosing) {
                transformStack.pop();
            } else {
                const transform = getAttr(attrsStr, 'transform');
                if (transform) {
                    transformStack.push(parseTransform(transform));
                } else {
                    transformStack.push(null); // Push null to keep stack balanced
                }
            }
            continue;
        }

        if (isClosing) continue; // Ignore closing tags for shapes

        // Shape processing
        const shape = { type: type };
        shape.fill = getAttr(attrsStr, 'fill');
        shape.stroke = getAttr(attrsStr, 'stroke');

        // Inherit parent transforms
        const parentTransforms = getCombinedTransform();
        if (parentTransforms) {
            shape.parentTransforms = parentTransforms.filter(t => t !== null);
        }

        // Own transform
        const ownTransformStr = getAttr(attrsStr, 'transform');
        if (ownTransformStr) {
            shape.transform = parseTransform(ownTransformStr);
        }

        if (type === 'rect') {
            shape.x = parseFloat(getAttr(attrsStr, 'x') || 0);
            shape.y = parseFloat(getAttr(attrsStr, 'y') || 0);
            shape.width = parseFloat(getAttr(attrsStr, 'width') || 0);
            shape.height = parseFloat(getAttr(attrsStr, 'height') || 0);
        } else if (type === 'path') {
            shape.d = getAttr(attrsStr, 'd');
        } else if (type === 'circle') {
            shape.cx = parseFloat(getAttr(attrsStr, 'cx') || 0);
            shape.cy = parseFloat(getAttr(attrsStr, 'cy') || 0);
            shape.r = parseFloat(getAttr(attrsStr, 'r') || 0);
        }

        // Add to shapes
        shapes.push(shape);
    }

    // Extract viewBox for overall dimensions
    const svgTagMatch = svgContent.match(/<svg[^>]*viewBox="([^"]*)"/i);
    let viewBox = [0, 0, 0, 0];
    if (svgTagMatch && svgTagMatch[1]) {
        viewBox = svgTagMatch[1].split(' ').map(Number);
    }
    const width = viewBox[2];
    const height = viewBox[3];

    // SVG follows painter's algorithm (last derived is on top).
    // The user has confirmed that grey blocks are checking the colored ones.
    // We will explicitly Move grey blocks to the start of the list.

    const bgColors = ['#EAECEC', '#CBD5DD'];

    shapes.sort((a, b) => {
        const isBgA = bgColors.includes(a.fill);
        const isBgB = bgColors.includes(b.fill);

        // 1. Primary Sort: Backgrounds First
        if (isBgA && !isBgB) return -1; // a is bg, b is not -> a first
        if (!isBgA && isBgB) return 1;  // b is bg, a is not -> b first

        // 2. Secondary Sort: Area Descending (Larger first)
        const getArea = (s) => {
            if (s.type === 'rect') return s.width * s.height;
            if (s.type === 'circle') return Math.PI * s.r * s.r;
            return 0;
        };

        return getArea(b) - getArea(a);
    });

    const data = {
        width: width,
        height: height,
        shapes: shapes
    };

    fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
    console.log(`Successfully extracted ${shapes.length} shapes to ${outputFilePath} (Sorted by area)`);

} catch (err) {
    console.error('Error processing SVG:', err);
}

function getAttr(str, name) {
    // Handle both double and single quotes
    const regex = new RegExp(`${name}=["']([^"']+)["']`);
    const match = str.match(regex);
    return match ? match[1] : null;
}

function parseTransform(transformStr) {
    // This is still basic. It grabs the string mostly.
    // Ideally we pass the raw string to client or parse all types.
    // Fore now, let's just pass the raw string and type for client to parse?
    // Or parse basic 'rotate' and 'translate' here.

    // Let's change to return the Raw string and let sketch.js handle complex regular expressions
    // But we need to support multiple transforms: transform="translate(..) rotate(..)"
    // For now, let's just stick to the single rotate or return an object for sketch.js

    // If it's complex, we might just pass it as "raw".
    return { raw: transformStr };
}
