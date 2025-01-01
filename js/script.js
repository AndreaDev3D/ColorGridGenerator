import { ColorRow } from './modules/ColorRow.js';
import { CanvasManager } from './modules/CanvasManager.js';
import { StorageManager } from './modules/StorageManager.js';
import { ThemeManager } from './modules/ThemeManager.js';

class App {
    constructor() {
        this.colorRowCount = 0;
        this.colorRows = []; // Store ColorRow instances
        this.colorRowsDiv = document.getElementById('colorRows');
        this.canvasManager = new CanvasManager('canvas');
        this.themeManager = new ThemeManager();

        this.initializeEventListeners();
        this.initializeSortable();
        this.loadSavedColors();
    }

    initializeEventListeners() {
        document.getElementById('addColorRow').addEventListener('click', () => this.addColorRow());
        document.getElementById('saveImage').addEventListener('click', () => this.canvasManager.saveImage());
        document.getElementById('clearColorList').addEventListener('click', () => this.clearColorList());
        document.getElementById('saveToFile').addEventListener('click', () => this.saveToFile());
        document.getElementById('loadFromFile').addEventListener('change', (e) => this.loadFromFile(e));
        document.getElementById('randomizeColors').addEventListener('click', () => this.randomizeColors());

        // Listen for color changes on the container
        this.colorRowsDiv.addEventListener('colorchange', () => {
            this.canvasManager.generateImage(this.colorRows);
            StorageManager.saveColors(this.colorRows, this.canvasManager);
        });

        // Listen for grid changes
        document.addEventListener('gridchange', () => {
            this.canvasManager.generateImage(this.colorRows);
            StorageManager.saveColors(this.colorRows, this.canvasManager);
        });

        // Update the file loading event listeners
        const loadFileInput = document.getElementById('loadFromFile');
        const loadFileButton = document.getElementById('loadFileButton');

        loadFileButton.addEventListener('click', () => {
            loadFileInput.click();
        });

        loadFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.loadFromFile(e);
                // Reset the input so the same file can be loaded again
                e.target.value = '';
            }
        });
    }

    initializeSortable() {
        Sortable.create(this.colorRowsDiv, {
            animation: 150,
            handle: '.drag-handle',
            onEnd: () => {
                this.colorRows = Array.from(this.colorRowsDiv.children).map(element => {
                    return this.colorRows.find(row => row.element === element);
                });
                this.canvasManager.generateImage(this.colorRows);
                StorageManager.saveColors(this.colorRows, this.canvasManager);
            }
        });
    }

    addColorRow() {
        this.colorRowCount++;
        const colorRow = new ColorRow(this.colorRowCount);
        this.colorRows.push(colorRow);
        this.colorRowsDiv.appendChild(colorRow.element);

        // Add delete handler
        colorRow.element.querySelector('.deleteColorRow').addEventListener('click', () => {
            this.deleteColorRow(colorRow);
        });

        // Add duplicate handler
        colorRow.element.querySelector('.duplicateColorRow').addEventListener('click', () => {
            this.duplicateColorRow(colorRow);
        });

        this.canvasManager.generateImage(this.colorRows);
        StorageManager.saveColors(this.colorRows, this.canvasManager);
    }

    deleteColorRow(colorRow) {
        const index = this.colorRows.indexOf(colorRow);
        if (index > -1) {
            this.colorRows.splice(index, 1);
            colorRow.element.remove();
            this.canvasManager.generateImage(this.colorRows);
            StorageManager.saveColors(this.colorRows, this.canvasManager);
        }
    }

    duplicateColorRow(colorRow) {
        this.colorRowCount++;
        const newColorRow = new ColorRow(this.colorRowCount);
        // Copy the values from the original row
        const data = colorRow.getColorData();
        newColorRow.setColorData(data);

        this.colorRows.push(newColorRow);
        colorRow.element.after(newColorRow.element);

        // Add handlers
        newColorRow.element.querySelector('.deleteColorRow').addEventListener('click', () => {
            this.deleteColorRow(newColorRow);
        });
        newColorRow.element.querySelector('.duplicateColorRow').addEventListener('click', () => {
            this.duplicateColorRow(newColorRow);
        });

        this.canvasManager.generateImage(this.colorRows);
        StorageManager.saveColors(this.colorRows, this.canvasManager);
    }

    clearColorList() {
        this.colorRows = [];
        this.colorRowsDiv.innerHTML = '';
        this.colorRowCount = 0;
        localStorage.removeItem('colorsData');
        this.canvasManager.generateImage([]);
    }

    getRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    getRandomType() {
        const types = ['solid', 'linear', 'radial', 'bi-chromatic'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomAngle() {
        return Math.floor(Math.random() * 360);
    }

    getRandomOrientation() {
        return Math.random() > 0.5 ? 'horizontal' : 'vertical';
    }

    loadSavedColors() {
        const data = StorageManager.loadColors();
        if (data) {
            // Set grid dimensions if they exist
            if (data.rows && data.cols) {
                this.canvasManager.setGridDimensions(data.rows, data.cols);
            }

            // Load colors
            data.colors.forEach(colorData => {
                this.colorRowCount++;
                const colorRow = new ColorRow(this.colorRowCount);
                colorRow.setColorData(colorData);
                this.colorRows.push(colorRow);
                this.colorRowsDiv.appendChild(colorRow.element);

                // Add handlers
                colorRow.element.querySelector('.deleteColorRow').addEventListener('click', () => {
                    this.deleteColorRow(colorRow);
                });
                colorRow.element.querySelector('.duplicateColorRow').addEventListener('click', () => {
                    this.duplicateColorRow(colorRow);
                });
            });
            this.canvasManager.generateImage(this.colorRows);
        } else {
            // Generate 4 random color configurations
            const defaultColors = Array(4).fill(null).map(() => {
                const type = this.getRandomType();
                return {
                    type: type,
                    mainColor: this.getRandomColor(),
                    gradientEnd: this.getRandomColor(),
                    biChromaticEnd: this.getRandomColor(),
                    angle: this.getRandomAngle(),
                    orientation: this.getRandomOrientation()
                };
            });

            defaultColors.forEach(colorData => {
                this.colorRowCount++;
                const colorRow = new ColorRow(this.colorRowCount);
                colorRow.setColorData(colorData);
                this.colorRows.push(colorRow);
                this.colorRowsDiv.appendChild(colorRow.element);

                // Add handlers
                colorRow.element.querySelector('.deleteColorRow').addEventListener('click', () => {
                    this.deleteColorRow(colorRow);
                });
                colorRow.element.querySelector('.duplicateColorRow').addEventListener('click', () => {
                    this.duplicateColorRow(colorRow);
                });
            });

            this.canvasManager.generateImage(this.colorRows);
            // Save the default colors to storage
            StorageManager.saveColors(this.colorRows, this.canvasManager);
        }
    }

    saveToFile() {
        const data = {
            rows: this.canvasManager.getRows(),
            cols: this.canvasManager.getCols(),
            colors: this.colorRows.map(row => row.getColorData())
        };
        StorageManager.saveToFile(data);
    }

    loadFromFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    // Validate the data structure
                    if (!data.colors || !Array.isArray(data.colors)) {
                        throw new Error('Invalid file format: missing colors array');
                    }

                    this.clearColorList();
                    localStorage.setItem('colorsData', JSON.stringify(data));
                    this.loadSavedColors();
                } catch (error) {
                    alert('Invalid file format. Please select a valid .cgg file.');
                    console.error('File loading error:', error);
                }
            };
            reader.onerror = (error) => {
                alert('Error reading file.');
                console.error('FileReader error:', error);
            };
            reader.readAsText(file);
        }
    }

    randomizeColors() {
        this.colorRows.forEach(colorRow => {
            const type = this.getRandomType();
            const newData = {
                type: type,
                mainColor: this.getRandomColor(),
                gradientEnd: this.getRandomColor(),
                biChromaticEnd: this.getRandomColor(),
                angle: this.getRandomAngle(),
                orientation: this.getRandomOrientation()
            };
            colorRow.setColorData(newData);
        });

        this.canvasManager.generateImage(this.colorRows);
        StorageManager.saveColors(this.colorRows, this.canvasManager);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
});