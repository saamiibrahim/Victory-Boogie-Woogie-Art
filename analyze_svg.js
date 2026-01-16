const fs = require('fs');
const path = require('path');

const svgFilePath = path.join(__dirname, 'Piet_Mondriaan_Victory_Boogie_Woogie_SVG.svg');

try {
    const svgContent = fs.readFileSync(svgFilePath, 'utf8');

    // 1. Check for comments
    const comments = svgContent.match(/<!--[\s\S]*?-->/g);
    if (comments) {
        console.log(`Found ${comments.length} comments.`);
        comments.forEach(c => console.log('Comment:', c.substring(0, 50) + '...'));
    } else {
        console.log('No comments found.');
    }

    // 2. List all tags
    const allTags = svgContent.match(/<([a-zA-Z0-9:-]+)/g);
    const tagCounts = {};
    if (allTags) {
        allTags.forEach(t => {
            const tagName = t.substring(1);
            tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
        });
        console.log('Tag Counts:', tagCounts);
    }

    // 3. Check for NaN in Rects
    const rectRegex = /<rect([^>]+)>/g;
    let match;
    let nanCount = 0;
    while ((match = rectRegex.exec(svgContent)) !== null) {
        const attrs = match[1];
        const getVal = (name) => {
            const m = attrs.match(new RegExp(`${name}=["']([^"']+)["']`));
            return m ? parseFloat(m[1]) : null;
        };
        const x = getVal('x');
        const y = getVal('y');
        const w = getVal('width');
        const h = getVal('height');

        if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
            console.log('Found NaN rect:', match[0]);
            nanCount++;
        }
    }
    console.log(`Found ${nanCount} rects with NaN values.`);

    // 4. Check for unhandled transforms
    const transformRegex = /transform=["']([^"']+)["']/g;
    while ((match = transformRegex.exec(svgContent)) !== null) {
        const t = match[1];
        if (!t.match(/rotate|translate|scale|matrix/)) {
            console.log('Found unusual transform:', t);
        }
    }

    // 5. Check for missing fills
    const noFillRects = [];
    let rectMatch;
    // reset regex
    const rRegex = /<rect([^>]+)>/g;
    while ((rectMatch = rRegex.exec(svgContent)) !== null) {
        if (!rectMatch[1].match(/fill=/)) {
            noFillRects.push(rectMatch[0]);
        }
    }
    console.log(`Found ${noFillRects.length} rects without fill attribute.`);
    if (noFillRects.length > 0) console.log('Sample:', noFillRects[0]);


} catch (err) {
    console.error(err);
}
