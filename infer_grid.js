const fs = require('fs');
const data = JSON.parse(fs.readFileSync('mondrian_data.json', 'utf8'));

// Collect all values that align to the grid
const values = [];
data.shapes.forEach(s => {
    if (s.type === 'rect') {
        values.push(s.x, s.y, s.width, s.height);
    }
});

// Calculate differences between sorted unique values to find step size
const unique = [...new Set(values)].sort((a, b) => a - b);
const diffs = {};

for (let i = 1; i < unique.length; i++) {
    const d = parseFloat((unique[i] - unique[i - 1]).toFixed(2));
    if (d > 0.1) { // Ignore float noise
        diffs[d] = (diffs[d] || 0) + 1;
    }
}

// Find most common small difference -> likely the grid unit
const sortedDiffs = Object.entries(diffs).sort((a, b) => b[1] - a[1]); // Sort by frequency
console.log('Top 10 common differences:', sortedDiffs.slice(0, 10));

// Also GCD approach?
// Since SVG might have offsets, looking at W/H is safer for "unit block size".
const dims = [];
data.shapes.forEach(s => {
    if (s.type === 'rect') {
        dims.push(s.width);
        dims.push(s.height);
    }
});
const dimCounts = {};
dims.forEach(d => {
    const val = parseFloat(d.toFixed(2));
    if (val > 1) dimCounts[val] = (dimCounts[val] || 0) + 1;
});
console.log('Top 10 common dimensions:', Object.entries(dimCounts).sort((a, b) => b[1] - a[1]).slice(0, 10));
