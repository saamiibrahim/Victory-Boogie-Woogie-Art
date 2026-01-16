# Mondrian Victory Boogie Woogie Recreation

This project is a digital recreation and procedural extension of Piet Mondrian's "Victory Boogie Woogie". It parses an SVG source of the artwork and renders it using p5.js, with additional procedural rules to "complete" or enhance the artwork dynamically.

## Features

*   **SVG Parsing**: Custom Node.js script (`convert.js`) to extract shape data from the original SVG into a JSON format optimized for p5.js.
*   **Precise Rendering**: Renders the artwork with correct layering and transforms.
*   **Procedural Generation**: A modular rule system (`rules.js`) that adds new distinct blocks to the artwork based on specific logic (e.g., "Dot Rule").
*   **Grid Alignment**: All generated elements snap to the inferred 10px grid of the original masterpiece.

## How to Run

1.  **Generate Data** (Optional, `mondrian_data.json` is already provided):
    ```bash
    node convert.js
    ```

2.  **Start a Local Server**:
    Because modern browsers block loading local JSON files via `file://`, you must use a local web server.
    ```bash
    python -m http.server
    ```
    OR with Node.js:
    ```bash
    npx http-server
    ```

3.  **View the Art**:
    Open your browser to `http://localhost:8000` (or whatever port your server uses).

## Project Structure

*   `index.html`: The web entry point.
*   `sketch.js`: The main p5.js sketch that handles setup and rendering.
*   `rules.js`: Contains the procedural logic classes (e.g., `DotRule`).
*   `convert.js`: Node.js utility to parse `Piet_Mondriaan_Victory_Boogie_Woogie_SVG.svg` into `mondrian_data.json`.
*   `infer_grid.js`: Utility script used to calculate the 10px base grid unit.
*   `mondrian_data.json`: The extracted geometric data of the artwork.

## Customization

You can modify the procedural generation in `rules.js`:
*   **`ACTIVE_RULES`**: Add or remove rule instances at the bottom of the file.
*   **`DotRule` class**: Adjust margins, sizes, probabilities, or target colors within the `apply` method.
