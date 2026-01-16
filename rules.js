// Rule System for Mondrian Completion
// Define rules here. Each rule must have an 'apply' method taking the mondrianData object.

class DotRule {
    constructor() {
        this.name = "Dot Rule (3x3)";
        this.description = "In blocks >= 3x3 grid units, add a random colored dot.";
    }

    apply(data) {
        if (!data || !data.shapes) return;

        const mundrianColors = ['#C53018', '#1A56A4', '#F0CF00', '#131533', '#EAECEC'];
        const excludedColors = ['#EAECEC', '#CBD5DD', '#FFFFFF', '#ffffff', '#eaecec', '#cbd5dd'];

        // Inferred Grid Size
        const GRID = 10;

        // Rule: "In BIGGER blocks"
        // Let's check for blocks >= 50px (5 grid units)
        const MIN_SIZE = GRID * 4;

        let count = 0;

        for (let i = 0; i < data.shapes.length; i++) {
            let shape = data.shapes[i];

            // 1. Target Selection: Large Blocks
            if (shape.type !== 'rect') continue;
            if (shape.width < MIN_SIZE || shape.height < MIN_SIZE) continue;

            // 2. Color Exclusion
            let fillCol = shape.fill ? shape.fill.toUpperCase() : 'NONE';
            if (!shape.fill || excludedColors.includes(fillCol) || shape.fill === 'none') continue;

            // 3. Probability
            if (random() > 0.23) continue;

            // 4. Occupancy Check
            let isOccupied = false;
            for (let j = 0; j < data.shapes.length; j++) {
                if (i === j) continue;
                let other = data.shapes[j];
                if (other.type !== 'rect') continue;
                if (other.width > 100 && other.height > 100) continue;

                let startX = max(shape.x, other.x);
                let endX = min(shape.x + shape.width, other.x + other.width);
                let startY = max(shape.y, other.y);
                let endY = min(shape.y + shape.height, other.y + other.height);

                if (startX < endX && startY < endY) {
                    isOccupied = true;
                    break;
                }
            }
            if (isOccupied) continue;

            // 5. Generate Large Sub-Block
            shape.decorations = shape.decorations || [];

            // Padding: Ensure block doesn't touch edges.
            // Use 1 grid unit (10px) as minimum padding.
            const PADDING = GRID * 3.3;

            // Available space for the sub-block
            let safeW = shape.width - (2 * PADDING);
            let safeH = shape.height - (2 * PADDING);

            if (safeW < GRID || safeH < GRID) continue; // Too small for padding

            // Size: Target 40% to 60% of the PARENT dimensions (not safe zone, to keep proportion logic similar)
            // But CAP it at safe dimensions.
            let targetW = shape.width * random(0.3, 0.9);
            let targetH = shape.height * random(0.3, 0.9);

            // Snap to grid
            let finalW = round(targetW / GRID) * GRID;
            let finalH = round(targetH / GRID) * GRID;

            // Enforce constraints
            finalW = max(GRID * 2, min(finalW, floor(safeW / GRID) * GRID));
            finalH = max(GRID * 2, min(finalH, floor(safeH / GRID) * GRID));

            // Re-check validity
            if (finalW > safeW || finalH > safeH) continue;

            // Placement: Randomly within the padded safe zone
            // Range for x: [PADDING, shape.width - PADDING - finalW]
            // We calculate in grid steps relative to PADDING.

            // max offset from PADDING
            let maxOffsetX = safeW - finalW;
            let maxOffsetY = safeH - finalH;

            let gridStepsX = floor(maxOffsetX / GRID);
            let gridStepsY = floor(maxOffsetY / GRID);

            let xOffset = floor(random(0, gridStepsX + 1)) * GRID;
            let yOffset = floor(random(0, gridStepsY + 1)) * GRID;

            let x = PADDING + xOffset;
            let y = PADDING + yOffset;

            // Contrast Color
            let col = random(mundrianColors);
            let attempts = 0;
            while (col.toUpperCase() === fillCol && attempts < 10) {
                col = random(mundrianColors);
                attempts++;
            }

            shape.decorations.push({ x, y, w: finalW, h: finalH, fill: col });
            count++;
        }
        console.log(`[Rule: ${this.name}] applied to ${count} blocks.`);
    }
}

const ACTIVE_RULES = [
    new DotRule()
];
