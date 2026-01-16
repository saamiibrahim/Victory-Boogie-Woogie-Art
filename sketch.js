let mondrianData;

function preload() {
    mondrianData = loadJSON('mondrian_data.json');
}

// Global Seed
const SEED = Math.floor(Math.random() * 100) + 1;
console.log(SEED);
function setup() {
    if (!mondrianData) {
        console.error("Data not loaded");
        return;
    }

    createCanvas(windowWidth, windowHeight);
    noLoop();

    // Apply Rules
    if (typeof ACTIVE_RULES !== 'undefined') {
        randomSeed(SEED);
        for (let rule of ACTIVE_RULES) {
            console.log(`Applying rule: ${rule.name}`);
            rule.apply(mondrianData);
        }
    } else {
        console.warn("No Active Rules found.");
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    redraw();
}

function draw() {
    background(30);
    noStroke();

    if (!mondrianData || !mondrianData.shapes) return;

    const originalSize = max(mondrianData.width, mondrianData.height);
    const size = originalSize;

    let scaleFactor = min(width / size, height / size) * 0.95;

    push();
    translate(width / 2, height / 2);
    scale(scaleFactor);
    translate(-mondrianData.width / 2, -mondrianData.height / 2);

    // Draw white base canvas
    fill(255);
    rect(0, 0, mondrianData.width, mondrianData.height);

    for (let shape of mondrianData.shapes) {
        push();

        let alphaVal = 255;
        if (shape.opacity !== undefined) alphaVal *= shape.opacity;
        if (shape.fillOpacity !== undefined) alphaVal *= shape.fillOpacity;

        if (shape.fill) {
            if (shape.fill === 'none') noFill();
            else {
                if (shape.fill.startsWith('url')) {
                    fill(200);
                } else {
                    let c = color(shape.fill);
                    c.setAlpha(alphaVal);
                    fill(c);
                }
            }
        } else {
            noFill();
        }

        if (shape.stroke) {
            stroke(shape.stroke);
        }

        if (shape.parentTransforms) {
            for (let t of shape.parentTransforms) {
                applyRawTransform(t.raw);
            }
        }

        if (shape.transform) {
            applyRawTransform(shape.transform.raw);
        }

        if (shape.type === 'rect') {
            rect(shape.x, shape.y, shape.width, shape.height);

            // RENDER DECORATIONS (Generic)
            if (shape.decorations) {
                for (let dec of shape.decorations) {
                    fill(dec.fill);
                    noStroke();
                    rect(shape.x + dec.x, shape.y + dec.y, dec.w, dec.h);
                }
            }

        } else if (shape.type === 'path') {
            drawPath(shape.d);
        } else if (shape.type === 'circle') {
            ellipse(shape.cx, shape.cy, shape.r * 2);
        }

        pop();
    }
    pop();
}

function applyRawTransform(tStr) {
    if (!tStr) return;

    const transformCommandRegex = /(\w+)\s*\(([^)]+)\)/g;
    let match;
    while ((match = transformCommandRegex.exec(tStr)) !== null) {
        const type = match[1];
        const args = match[2].split(/[\s,]+/).filter(s => s.trim() !== '').map(parseFloat);

        if (type === 'rotate') {
            if (args.length === 1) {
                rotate(radians(args[0]));
            } else if (args.length === 3) {
                translate(args[1], args[2]);
                rotate(radians(args[0]));
                translate(-args[1], -args[2]);
            }
        } else if (type === 'translate') {
            translate(args[0], args[1] || 0);
        } else if (type === 'scale') {
            scale(args[0], args[1] || args[0]);
        } else if (type === 'matrix') {
            applyMatrix(args[0], args[1], args[2], args[3], args[4], args[5]);
        }
    }
}

function drawPath(d) {
    if (!d) return;

    beginShape();

    const commands = d.match(/([a-df-z])([^a-df-z]*)/ig);
    if (!commands) return;

    let currentX = 0;
    let currentY = 0;

    for (let cmdStr of commands) {
        const type = cmdStr.charAt(0);
        const argsStr = cmdStr.substring(1);
        const args = (argsStr.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || []).map(parseFloat);

        let i = 0;

        if (type.toUpperCase() === 'Z') {
            endShape(CLOSE);
            continue;
        }

        while (i < args.length) {
            switch (type) {
                case 'M': // Move absolute
                    vertex(args[i], args[i + 1]);
                    currentX = args[i];
                    currentY = args[i + 1];
                    i += 2;
                    break;
                case 'm': // Move relative
                    vertex(currentX + args[i], currentY + args[i + 1]);
                    currentX += args[i];
                    currentY += args[i + 1];
                    i += 2;
                    break;
                case 'L': // Line absolute
                    vertex(args[i], args[i + 1]);
                    currentX = args[i];
                    currentY = args[i + 1];
                    i += 2;
                    break;
                case 'l': // Line relative
                    vertex(currentX + args[i], currentY + args[i + 1]);
                    currentX += args[i];
                    currentY += args[i + 1];
                    i += 2;
                    break;
                case 'H': // Horizontal absolute
                    vertex(args[i], currentY);
                    currentX = args[i];
                    i += 1;
                    break;
                case 'h': // Horizontal relative
                    vertex(currentX + args[i], currentY);
                    currentX += args[i];
                    i += 1;
                    break;
                case 'V': // Vertical absolute
                    vertex(currentX, args[i]);
                    currentY = args[i];
                    i += 1;
                    break;
                case 'v': // Vertical relative
                    vertex(currentX, currentY + args[i]);
                    currentY += args[i];
                    i += 1;
                    break;
                default:
                    i = args.length;
            }
        }
    }

    if (!d.match(/z/i)) {
        endShape();
    }
}
