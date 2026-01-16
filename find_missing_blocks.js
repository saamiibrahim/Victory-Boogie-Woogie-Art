const fs = require('fs');
const path = require('path');

const svgFilePath = path.join(__dirname, 'Piet_Mondriaan_Victory_Boogie_Woogie_SVG.svg');
const svgContent = fs.readFileSync(svgFilePath, 'utf8');

// Colors to look for: Blue, Dark Blue/Black
// From previous context: #1A56A4 (Blue), #131533 (Dark)
const targetColors = ['#1A56A4', '#131533'];

const regex = /<(\w+)[^>]*fill=["'](#(?:1A56A4|131533))["'][^>]*>/gi;

let match;
const found = [];
while ((match = regex.exec(svgContent)) !== null) {
    found.push(match[0]);
}

console.log(`Found ${found.length} matching blocks.`);
// Print first few to see coordinates
found.slice(0, 10).forEach(block => {
    console.log(block);
});

// Also look for the large grey shape
console.log('--- GREY SHAPES ---');
// #EAECEC or #CBD5DD
const greyRegex = /<(\w+)[^>]*fill=["'](#(?:EAECEC|CBD5DD))["'][^>]*>/gi;
let greyMatch;
let greyCount = 0;
while ((greyMatch = greyRegex.exec(svgContent)) !== null) {
    greyCount++;
    // log only large ones?
    // We can't parse attributes easily with regex, just dump a few
    if (greyCount < 5) console.log(greyMatch[0]);
}
console.log(`Found ${greyCount} grey shapes.`);
