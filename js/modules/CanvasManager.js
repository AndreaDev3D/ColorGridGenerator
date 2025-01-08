export class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 256;
        this.canvas.height = 256;
        this.rows = 4;
        this.cols = 4;

        // Get grid control elements
        this.rowsInput = document.getElementById('gridRows');
        this.colsInput = document.getElementById('gridCols');

        // Initialize event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.rowsInput.addEventListener('change', () => {
            this.rows = Math.max(1, Math.min(16, parseInt(this.rowsInput.value) || 4));
            this.rowsInput.value = this.rows;
            this.dispatchGridChangeEvent();
        });

        this.colsInput.addEventListener('change', () => {
            this.cols = Math.max(1, Math.min(16, parseInt(this.colsInput.value) || 4));
            this.colsInput.value = this.cols;
            this.dispatchGridChangeEvent();
        });
    }

    dispatchGridChangeEvent() {
        this.canvas.dispatchEvent(new CustomEvent('gridchange', {
            bubbles: true,
            detail: { rows: this.rows, cols: this.cols }
        }));
    }

    generateImage(colorRows) {
        // Calculate cell dimensions based on user-defined grid
        const cellWidth = this.canvas.width / this.cols;
        const cellHeight = this.canvas.height / this.rows;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw each color in the grid
        colorRows.forEach((colorRow, index) => {
            if (index >= this.rows * this.cols) return; // Skip if beyond grid capacity

            const col = index % this.cols;
            const rowIndex = Math.floor(index / this.cols);
            const x = col * cellWidth;
            const y = rowIndex * cellHeight;

            const colorData = colorRow.getColorData();
            this.drawCell(x, y, cellWidth, cellHeight, colorData);
        });
    }

    drawCell(x, y, width, height, colorData) {
        switch (colorData.type) {
            case 'bi-chromatic':
                this.drawBiChromatic(x, y, width, height, colorData);
                break;
            case 'linear':
                this.drawLinearGradient(x, y, width, height, colorData);
                break;
            case 'radial':
                this.drawRadialGradient(x, y, width, height, colorData);
                break;
            case 'shade':
                this.drawShadeGradient(x, y, width, height, colorData);
                break;
            default:
                this.drawSolid(x, y, width, height, colorData);
        }
    }

    drawBiChromatic(x, y, width, height, colorData) {
        const isHorizontal = colorData.orientation === 'horizontal';

        this.ctx.fillStyle = colorData.mainColor;
        if (isHorizontal) {
            this.ctx.fillRect(x, y, width / 2, height);
            this.ctx.fillStyle = colorData.biChromaticEnd;
            this.ctx.fillRect(x + width / 2, y, width / 2, height);
        } else {
            this.ctx.fillRect(x, y, width, height / 2);
            this.ctx.fillStyle = colorData.biChromaticEnd;
            this.ctx.fillRect(x, y + height / 2, width, height / 2);
        }
    }

    drawLinearGradient(x, y, width, height, colorData) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radians = (colorData.angle * Math.PI) / 180;
        const gradient = this.ctx.createLinearGradient(
            centerX - Math.cos(radians) * width / 2,
            centerY - Math.sin(radians) * height / 2,
            centerX + Math.cos(radians) * width / 2,
            centerY + Math.sin(radians) * height / 2
        );
        gradient.addColorStop(0, colorData.mainColor);
        gradient.addColorStop(1, colorData.gradientEnd);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);
    }

    drawRadialGradient(x, y, width, height, colorData) {
        const gradient = this.ctx.createRadialGradient(
            x + width / 2, y + height / 2, 0,
            x + width / 2, y + height / 2, Math.min(width, height) / 2
        );
        gradient.addColorStop(0, colorData.mainColor);
        gradient.addColorStop(1, colorData.gradientEnd);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);
    }

    drawSolid(x, y, width, height, colorData) {
        this.ctx.fillStyle = colorData.mainColor;
        this.ctx.fillRect(x, y, width, height);
    }

    drawShadeGradient(x, y, width, height, colorData) {
        const { lighter, darker } = this.getLighterDarkerColors(colorData.mainColor);
        const gradient = this.ctx.createLinearGradient(x, y, x, y + height);

        // Create a three-color gradient: lighter -> original -> darker
        gradient.addColorStop(0, lighter);    // Top: lighter version
        gradient.addColorStop(0.5, colorData.mainColor);  // Middle: original color
        gradient.addColorStop(1, darker);     // Bottom: darker version

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);
    }

    // Add getters for grid dimensions
    getRows() {
        return this.rows;
    }

    getCols() {
        return this.cols;
    }

    // Add method to set grid dimensions programmatically
    setGridDimensions(rows, cols) {
        this.rows = Math.max(1, Math.min(16, rows));
        this.cols = Math.max(1, Math.min(16, cols));
        this.rowsInput.value = this.rows;
        this.colsInput.value = this.cols;
    }

    saveImage() {
        const link = document.createElement('a');
        link.download = 'color_grid.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    // Add this helper method to create lighter/darker colors
    getLighterDarkerColors(color) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Create lighter color (increase brightness by 40%)
        const lighterR = Math.min(255, r + (255 - r) * 0.4);
        const lighterG = Math.min(255, g + (255 - g) * 0.4);
        const lighterB = Math.min(255, b + (255 - b) * 0.4);

        // Create darker color (decrease brightness by 40%)
        const darkerR = r * 0.6;
        const darkerG = g * 0.6;
        const darkerB = b * 0.6;

        // Convert back to hex
        const lighter = '#' +
            Math.round(lighterR).toString(16).padStart(2, '0') +
            Math.round(lighterG).toString(16).padStart(2, '0') +
            Math.round(lighterB).toString(16).padStart(2, '0');

        const darker = '#' +
            Math.round(darkerR).toString(16).padStart(2, '0') +
            Math.round(darkerG).toString(16).padStart(2, '0') +
            Math.round(darkerB).toString(16).padStart(2, '0');

        return { lighter, darker };
    }
} 