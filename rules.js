// Rule System for Mondrian Completion
// Define rules here. Each rule must have an 'apply' method taking the mondrianData object.

// Mondrian's Victory Boogie Woogie color palette for stripes
const STRIPE_COLORS = [
    '#F0CF00', '#F0CF00', '#F0CF00',  // Yellow (most common)
    '#C53018', '#C53018',              // Red
    '#1A56A4', '#1A56A4',              // Blue
    '#131533'                           // Black (sparse)
];

// Diamond boundary helper
class DiamondBoundary {
    constructor(canvasWidth, canvasHeight) {
        this.centerX = canvasWidth / 2;
        this.centerY = canvasHeight / 2;
        this.radius = Math.min(canvasWidth, canvasHeight) / 2;
    }

    isPointInside(x, y) {
        return Math.abs(x - this.centerX) + Math.abs(y - this.centerY) <= this.radius;
    }

    isRectInside(x, y, w, h) {
        return this.isPointInside(x, y) &&
               this.isPointInside(x + w, y) &&
               this.isPointInside(x, y + h) &&
               this.isPointInside(x + w, y + h);
    }
}

// Rule to create specific controlled stripes
class ControlledStripeRule {
    constructor() {
        this.name = "Controlled Stripe Rule";
        this.description = "Creates specific horizontal and vertical stripes between defined shapes";
        this.GRID = 10;
    }

    apply(data) {
        if (!data || !data.shapes) return;

        this.diamond = new DiamondBoundary(data.width, data.height);
        let addedCount = 0;

        // Define specific stripes with exact coordinates
        const stripes = [
            // Horizontal stripe from gray path (1515, 558) to yellow path (2303, 542)
            {
                type: 'horizontal',
                startX: 1515,
                endX: 2303,
                y: 542,
                height: 50
            },
            
            // Vertical stripe from yellow rect (1940, 2158+55=2213) to yellow rect (1942, 2567)
            {
                type: 'vertical',
                startY: 2213,     // Bottom of top yellow rect (y=2158, height=55)
                endY: 2567,       // Top of bottom yellow rect
                // x: 1940,
                // x: 1810,

                // width: 45,
                x: floor(random(1810, 2050)),      
                width: floor(random(45, 55))       
            },
            // {
            //     type: 'vertical',
            //     startY: 1111,     // Bottom of top yellow rect (y=2158, height=55)
            //     endY: 1578,       // Top of bottom yellow rect
            //     x: 1895,
            //     width: 61
            // },
            
            {
                type: 'vertical',
                startY: 1111,
                endY: 1578,
                x: floor(random(1776, 2023)),      // Random x between 1776-2000
                width: floor(random(61, 73))       // Random width between 61-73
            },




            {
                type: 'vertical',
                startY: 2158,     // Bottom of top yellow rect (y=2158, height=55)
                endY: 1578,       // Top of bottom yellow rect
                x: 1776,
                width: 61
            },

            
            // <rect xmlns="http://www.w3.org/2000/svg" x="2053" y="1027" width="77" height="84" fill="#F0CF00"/>
            // {
            //     type: 'vertical',
            //     startY: 1111,     // Bottom of top yellow rect (y=2158, height=55)
            //     endY: 1578,       // Top of bottom yellow rect
            //     x: 2053,
            //     width: 77
            // },
            // <rect xmlns="http://www.w3.org/2000/svg" x="1817" y="789" width="52" height="72" fill="#131533"/>
            
            {
                type: 'vertical',
                startY: 861,     // Bottom of top yellow rect (y=2158, height=55)
                endY: 1027,       // Top of bottom yellow rect
                // x: 1817,
                // width: 52
                x: floor(random(1776, 2023)),      // Random x between 1776-2000
                width: floor(random(61, 73))       // Random width between 61-73
            },

            // <rect xmlns="http://www.w3.org/2000/svg" x="2519" y="2421" width="63" height="42" fill="#C53018"/>
            
            // {
            //     type: 'vertical',
            //     startY: 2466,     // Bottom of top yellow rect (y=2158, height=55)
            //     endY: 2567,       // Top of bottom yellow rect
            //     x: 2516,
            //     width: 69
            // },


            // Vertical stripe from blue rect to yellow rect
            // {
            //     type: 'vertical',
            //     startY: 2468,
            //     endY: 2567,
            //     x: 2394,
            //     width: 50
            // },


            
            // Vertical stripe from blue rect to yellow rect
            {
                type: 'vertical',
                startY: 2468,
                endY: 2567,
                // x: 2394,
                // width: 50
                x: floor(random(2344, 2567)),      // Random x between 1776-2000
                width: floor(random(50, 69))   
            },

            //<rect xmlns="http://www.w3.org/2000/svg" x="2481" y="2567" width="78" height="55" fill="#F0CF00"/>
            {
                type: 'vertical',
                startY: 2622,     // Bottom of top yellow rect (y=2158, height=55)
                endY: 2829,       // Top of bottom yellow rect
                x: 2516,
                width: 69
            }
        ];

        // Randomly filter stripes - each stripe has a 60% chance to appear
        const STRIPE_PROBABILITY = 0.3;
        const activeStripes = stripes.filter(() => random() < STRIPE_PROBABILITY);
        // const activeStripes = stripes;
        
        console.log(`[ControlledStripeRule] ${activeStripes.length}/${stripes.length} stripes active this run`);

        // Dynamically find ALL adjacent block colors AFTER colorChangeRule has run
        for (let stripe of activeStripes) {
            if (stripe.type === 'horizontal') {
                // Find ALL blocks to the LEFT of stripe start
                stripe.startColors = this.findAdjacentBlockColors(data.shapes, stripe.startX, stripe.y, stripe.height, 'left');
                // Find ALL blocks to the RIGHT of stripe end
                stripe.endColors = this.findAdjacentBlockColors(data.shapes, stripe.endX, stripe.y, stripe.height, 'right');
            } else if (stripe.type === 'vertical') {
                // Find ALL blocks ABOVE stripe start
                stripe.startColors = this.findAdjacentBlockColors(data.shapes, stripe.x, stripe.startY, stripe.width, 'above');
                // Find ALL blocks BELOW stripe end
                stripe.endColors = this.findAdjacentBlockColors(data.shapes, stripe.x, stripe.endY, stripe.width, 'below');
            }
            console.log(`Stripe ${stripe.type}: startColors=[${stripe.startColors}], endColors=[${stripe.endColors}]`);
        }

        for (let stripe of activeStripes) {
            if (stripe.type === 'horizontal') {
                addedCount += this.createHorizontalStripe(data, stripe);
            } else if (stripe.type === 'vertical') {
                addedCount += this.createVerticalStripe(data, stripe);
            }
        }

        console.log(`[Rule: ${this.name}] added ${addedCount} stripe segments.`);
    }

    createHorizontalStripe(data, stripe) {
        const { startX, endX, y, height, startColors, endColors } = stripe;
        let count = 0;
        let segments = [];

        let x = startX;
        let iterations = 0;

        // First pass: calculate all segment positions
        while (x < endX && iterations < 100) {
            iterations++;
            const remaining = endX - x;
            
            // If remaining is small, just fill it completely
            if (remaining <= this.GRID * 4) {
                if (remaining >= 5) {
                    segments.push({ x, y, width: remaining, height });
                }
                break;
            }
            
            const segmentWidth = this.GRID * (2 + floor(random(4)));
            const actualWidth = Math.min(segmentWidth, remaining);

            if (actualWidth >= 5) {
                segments.push({ x, y, width: actualWidth, height });
            }
            x += actualWidth;
        }
        
        console.log(`Horizontal stripe: ${segments.length} segments from X=${startX} to X=${endX}`);

        // Second pass: assign colors avoiding start/end block colors
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            let avoidColors = null;
            
            // First segment: avoid ALL start block colors
            if (i === 0 && startColors && startColors.length > 0) {
                avoidColors = startColors;
            }
            // Last segment: avoid ALL end block colors
            if (i === segments.length - 1 && endColors && endColors.length > 0) {
                avoidColors = endColors;
            }

            let fillColor = this.pickContrastingColor(avoidColors);

            data.shapes.push({
                type: 'rect',
                fill: fillColor,
                stroke: null,
                x: seg.x,
                y: seg.y,
                width: seg.width,
                height: seg.height,
                isControlledStripe: true  // Mark so colorChangeRule skips it
            });
            count++;
        }

        console.log(`Created horizontal stripe at Y=${y}: ${count} segments`);
        return count;
    }

    // Find ALL colors of adjacent blocks in a specific direction (returns array)
    // Now handles both 'rect' and 'path' shapes
    findAdjacentBlockColors(shapes, x, y, size, direction) {
        const TOLERANCE = 30; // pixels tolerance for "touching"
        const adjacentColors = [];

        for (let shape of shapes) {
            if (!shape.fill || shape.fill === 'none') continue;
            
            // Skip background colors
            const col = shape.fill.toUpperCase();
            if (col.includes('EAEC') || col.includes('CBD5') || col === '#FFFFFF') continue;

            let isAdjacent = false;
            let shapeX, shapeY, shapeWidth, shapeHeight;

            // Get bounds based on shape type
            if (shape.type === 'rect') {
                shapeX = shape.x;
                shapeY = shape.y;
                shapeWidth = shape.width;
                shapeHeight = shape.height;
            } else if (shape.type === 'path' && shape.d) {
                // Extract bounding box from path data
                const bounds = this.getPathBounds(shape.d);
                if (!bounds) continue;
                shapeX = bounds.minX;
                shapeY = bounds.minY;
                shapeWidth = bounds.maxX - bounds.minX;
                shapeHeight = bounds.maxY - bounds.minY;
            } else {
                continue;
            }

            if (direction === 'left') {
                const rightEdge = shapeX + shapeWidth;
                if (Math.abs(rightEdge - x) < TOLERANCE) {
                    if (shapeY < y + size && shapeY + shapeHeight > y) {
                        isAdjacent = true;
                    }
                }
            } else if (direction === 'right') {
                if (Math.abs(shapeX - x) < TOLERANCE) {
                    if (shapeY < y + size && shapeY + shapeHeight > y) {
                        isAdjacent = true;
                    }
                }
            } else if (direction === 'above') {
                const bottomEdge = shapeY + shapeHeight;
                if (Math.abs(bottomEdge - y) < TOLERANCE) {
                    if (shapeX < x + size && shapeX + shapeWidth > x) {
                        isAdjacent = true;
                    }
                }
            } else if (direction === 'below') {
                if (Math.abs(shapeY - y) < TOLERANCE) {
                    if (shapeX < x + size && shapeX + shapeWidth > x) {
                        isAdjacent = true;
                    }
                }
            }

            if (isAdjacent && !adjacentColors.includes(shape.fill)) {
                adjacentColors.push(shape.fill);
                console.log(`Found adjacent ${direction} ${shape.type}: ${shape.fill} at (${shapeX}, ${shapeY})`);
            }
        }

        if (adjacentColors.length === 0) {
            console.log(`No adjacent block found ${direction} of (${x}, ${y})`);
        }
        return adjacentColors;
    }

    // Extract bounding box from SVG path data
    getPathBounds(d) {
        const numbers = d.match(/[\d.]+/g);
        if (!numbers || numbers.length < 4) return null;
        
        const coords = numbers.map(n => parseFloat(n));
        const xs = [];
        const ys = [];
        for (let i = 0; i < coords.length; i++) {
            if (i % 2 === 0) xs.push(coords[i]);
            else ys.push(coords[i]);
        }
        
        if (xs.length === 0 || ys.length === 0) return null;
        
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    }

    // Find the color of a shape at a given position
    findColorAtPosition(shapes, x, y) {
        for (let shape of shapes) {
            if (shape.type === 'rect') {
                if (x >= shape.x && x <= shape.x + shape.width &&
                    y >= shape.y && y <= shape.y + shape.height) {
                    return shape.fill;
                }
            } else if (shape.type === 'path' && shape.d) {
                // For paths, do a rough bounding box check using the d string
                // Extract numbers from path data to estimate bounds
                const numbers = shape.d.match(/[\d.]+/g);
                if (numbers && numbers.length >= 4) {
                    const coords = numbers.map(n => parseFloat(n));
                    const xs = coords.filter((_, i) => i % 2 === 0);
                    const ys = coords.filter((_, i) => i % 2 === 1);
                    const minX = Math.min(...xs);
                    const maxX = Math.max(...xs);
                    const minY = Math.min(...ys);
                    const maxY = Math.max(...ys);
                    
                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                        return shape.fill;
                    }
                }
            }
        }
        return null;
    }

    // Pick a color that contrasts with ALL colors in avoidColors array
    pickContrastingColor(avoidColors) {
        // Handle both single color and array of colors
        if (!avoidColors || (Array.isArray(avoidColors) && avoidColors.length === 0)) {
            return random(STRIPE_COLORS);
        }
        
        // Convert to array if single color
        const colorsToAvoid = Array.isArray(avoidColors) ? avoidColors : [avoidColors];
        
        // Determine which color families to avoid
        let avoidYellow = false;
        let avoidBlue = false;
        let avoidRed = false;
        let avoidBlack = false;
        
        for (let avoidColor of colorsToAvoid) {
            if (!avoidColor) continue;
            const avoid = avoidColor.toUpperCase();
            
            if (avoid.includes('F0CF') || avoid.includes('E8BF') || avoid.includes('FCF') || avoid.includes('FFCC')) {
                avoidYellow = true;
            }
            if (avoid.includes('1A56') || avoid.includes('56A4') || avoid.includes('0000FF')) {
                avoidBlue = true;
            }
            if (avoid.includes('C530') || avoid.includes('3018') || avoid.includes('FF0000')) {
                avoidRed = true;
            }
            if (avoid.includes('1315') || avoid.includes('3153') || avoid.includes('000000')) {
                avoidBlack = true;
            }
        }

        // Build a list of allowed colors (excluding ALL families to avoid)
        const allowedColors = [];
        
        if (!avoidYellow) {
            allowedColors.push('#F0CF00');
        }
        if (!avoidRed) {
            allowedColors.push('#C53018');
        }
        if (!avoidBlue) {
            allowedColors.push('#1A56A4');
        }
        if (!avoidBlack) {
            allowedColors.push('#131533');
        }

        // If all colors are somehow excluded, pick the least common one from avoidColors
        if (allowedColors.length === 0) {
            // Fall back to black as it's sparse in the artwork
            allowedColors.push('#131533');
        }

        const chosen = random(allowedColors);
        console.log(`pickContrastingColor: avoiding [${colorsToAvoid.join(', ')}] → chose ${chosen} from [${allowedColors.join(', ')}]`);
        return chosen;
    }

    // Check if two colors are similar (same hue family)
    isSimilarColor(color1, color2) {
        const c1 = color1.toUpperCase();
        const c2 = color2.toUpperCase();
        
        // Direct match
        if (c1 === c2) return true;
        
        // Yellow family
        if ((c1.includes('F0CF') || c1.includes('E8BF')) && 
            (c2.includes('F0CF') || c2.includes('E8BF'))) return true;
        
        // Blue family
        if ((c1.includes('1A56') || c1.includes('56A4')) && 
            (c2.includes('1A56') || c2.includes('56A4'))) return true;
        
        // Red family
        if ((c1.includes('C530') || c1.includes('3018')) && 
            (c2.includes('C530') || c2.includes('3018'))) return true;
        
        // Gray family
        if ((c1.includes('CBD5') || c1.includes('EAEC')) && 
            (c2.includes('CBD5') || c2.includes('EAEC'))) return true;
        
        return false;
    }

    createVerticalStripe(data, stripe) {
        const { startY, endY, x, width, startColors, endColors } = stripe;
        let count = 0;
        let segments = [];

        let y = startY;
        let iterations = 0;
        const totalHeight = endY - startY;

        // First pass: calculate all segment positions
        while (y < endY && iterations < 100) {
            iterations++;
            const remaining = endY - y;
            
            // If remaining is small, just fill it completely
            if (remaining <= this.GRID * 4) {
                if (remaining >= 5) {  // Allow very small segments to fill gap
                    segments.push({ x, y, width, height: remaining });
                }
                break;
            }
            
            const segmentHeight = this.GRID * (3 + floor(random(4)));
            const actualHeight = Math.min(segmentHeight, remaining);

            if (actualHeight >= 5) {  // Reduced minimum to allow smaller final segments
                segments.push({ x, y, width, height: actualHeight });
            }
            y += actualHeight;
        }
        
        console.log(`Vertical stripe: ${segments.length} segments from Y=${startY} to Y=${endY}`);

        // Second pass: assign colors avoiding start/end block colors
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            let avoidColors = null;
            
            // First segment: avoid ALL start block colors
            if (i === 0 && startColors && startColors.length > 0) {
                avoidColors = startColors;
            }
            // Last segment: avoid ALL end block colors
            if (i === segments.length - 1 && endColors && endColors.length > 0) {
                avoidColors = endColors;
            }

            let fillColor = this.pickContrastingColor(avoidColors);

            data.shapes.push({
                type: 'rect',
                fill: fillColor,
                stroke: null,
                x: seg.x,
                y: seg.y,
                width: seg.width,
                height: seg.height,
                isControlledStripe: true
            });
            count++;
        }

        console.log(`Created vertical stripe at X=${x}: ${count} segments`);
        return count;
    }
}

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

class colorChangeRule {
    constructor() {
        this.name = "Color Change Rule ";
        this.description = "Changing color of some blocks to different color";
    }

    apply(data) {
        if (!data || !data.shapes) return;

        // const mundrianColors = ['#C53018', '#1A56A4', '#F0CF00', '#131533'];
        const mundrianColors = ['#C53018', '#1A56A4', '#F0CF00', '#D2CDA3'];

        const excludedColors = ['#EAECEC', '#CBD5DD', '#FFFFFF', '#ffffff', '#eaecec', '#cbd5dd'];

        let count = 0;
        // data.shapes.length
        for (let i = 0; i < data.shapes.length; i++) {
            let shape = data.shapes[i];

            // 1. Target Selection: Large Blocks
            // if (shape.type !== 'rect') continue;
            // if (shape.width < MIN_SIZE || shape.height < MIN_SIZE) continue;

            // 2. Color Exclusion
            let fillCol = shape.fill ? shape.fill.toUpperCase() : 'NONE';

            if (!shape.fill || excludedColors.includes(fillCol) || shape.fill === 'none') continue;

            // Repaint shape with new color  
            if (random() > 0.15) continue;

            // Find Neighbors and their colors
            let neighborColors = new Set();
            neighborColors.add(fillCol); // Don't pick same as self

            // Small epsilon for "touching" calculation
            const EPSILON = 3;

            for (let j = 0; j < data.shapes.length; j++) {
                if (i === j) continue;
                let other = data.shapes[j];
                if (other.type !== 'rect') continue;

                // Check if 'other' is strictly adjacent (touching edges)

                // Vertical overlap check
                let vOverlap = max(shape.y, other.y) < min(shape.y + shape.height, other.y + other.height) - EPSILON;
                // Horizontal overlap check
                let hOverlap = max(shape.x, other.x) < min(shape.x + shape.width, other.x + other.width) - EPSILON;

                let touchingLeft = abs(shape.x - (other.x + other.width)) < EPSILON;
                let touchingRight = abs((shape.x + shape.width) - other.x) < EPSILON;
                let touchingTop = abs(shape.y - (other.y + other.height)) < EPSILON;
                let touchingBottom = abs((shape.y + shape.height) - other.y) < EPSILON;

                let isNeighbor = false;
                if (vOverlap && (touchingLeft || touchingRight)) isNeighbor = true;
                if (hOverlap && (touchingTop || touchingBottom)) isNeighbor = true;

                if (isNeighbor && other.fill && other.fill !== 'none') {
                    // console.log(`Found neighbor for block ${i}: color ${other.fill}`);
                    neighborColors.add(other.fill.toUpperCase());
                }
            }

            let newColor = random(mundrianColors);

            // Constraint: New color MUST be different from old color AND neighbors
            let attempts = 0;
            // Check if chosen color is in the excluded set
            while (neighborColors.has(newColor.toUpperCase()) && attempts < 20) {
                newColor = random(mundrianColors);
                attempts++;
            }

            // If we failed to find a unique color (unlikely but possible if surrounded by all colors),
            // just keep the original or take the last random choice.
            // If strictly enforcing change, we might skip update if attempts maxed out.
            if (neighborColors.has(newColor.toUpperCase())) {
                // Could not find valid color, skip
                continue;
            }

            shape.fill = newColor;
            count++;
        }
        console.log(`[Rule: ${this.name}] applied to ${count} blocks.`);
    }
}

const ACTIVE_RULES = [
    new colorChangeRule(),       // Run color changes FIRST
    new ControlledStripeRule(),  // Add controlled stripes AFTER color changes
    new DotRule()                // Then add dots
];
