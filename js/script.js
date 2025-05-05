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
        this.colorAttributes = new Map(); // Store global color attributes
        this.visualizeAttribute = document.getElementById('visualizeAttribute');
        this.visualizeAttributeValue = 'albedo';

        // Add grid warning initialization
        this.gridRows = document.getElementById('gridRows');
        this.gridCols = document.getElementById('gridCols');
        this.gridWarning = document.getElementById('gridWarning');

        // Initialize warning check
        this.updateGridWarning();

        this.initializeEventListeners();
        this.initializeSortable();
        this.loadSavedColors();
        this.initializeAttributeListeners();
        this.initializeVisualizeAttribute();
    }

    initializeEventListeners() {
        // Remove the old event listener
        document.getElementById('addColorRow').removeEventListener('click', () => this.addColorRow());

        // Add the new event listener with a proper reference to 'this'
        const addButton = document.getElementById('addColorRow');
        addButton.addEventListener('click', () => {
            this.addColorRow();
        });

        document.getElementById('saveImage').addEventListener('click', () => this.canvasManager.saveImage());
        document.getElementById('clearColorList').addEventListener('click', () => this.clearColorList());
        document.getElementById('saveToFile').addEventListener('click', () => this.saveToFile());
        document.getElementById('loadFromFile').addEventListener('change', (e) => this.loadFromFile(e));
        document.getElementById('randomizeColors').addEventListener('click', () => this.randomizeColors());
        document.getElementById('randomizeColorsOnly').addEventListener('click', () => this.randomizeColorsOnly());

        // Listen for color changes on the container
        this.colorRowsDiv.addEventListener('colorchange', (e) => {
            // Only save color rows and canvas state, do not touch globalAttributes here
            this.canvasManager.generateImage(this.colorRows);
            // Save only colorRows, not globalAttributes
            const data = JSON.parse(localStorage.getItem('colorsData')) || {};
            data.colors = this.colorRows.map(row => row.getColorData());
            data.rows = this.canvasManager.getRows();
            data.cols = this.canvasManager.getCols();
            // Preserve globalAttributes and visualizeAttribute
            if (window.app) {
                data.globalAttributes = Object.fromEntries(window.app.colorAttributes || []);
                data.visualizeAttribute = window.app.visualizeAttributeValue || 'albedo';
            }
            localStorage.setItem('colorsData', JSON.stringify(data));
            this.updateGridWarning();
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

        // Add grid size change listeners
        this.gridRows.addEventListener('change', () => this.updateGridWarning());
        this.gridCols.addEventListener('change', () => this.updateGridWarning());

        // Add an event listener for the image size change inside init()
        const imageSizeInput = document.getElementById('imageSize');
        if (imageSizeInput) {
            imageSizeInput.addEventListener('input', () => {
                this.resizeCanvas();
            });
        }
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

    initializeAttributeListeners() {
        const addAttributeBtn = document.getElementById('addAttribute');
        const newAttributeName = document.getElementById('newAttributeName');
        const newAttributeColor = document.getElementById('newAttributeColor');

        addAttributeBtn.addEventListener('click', () => {
            const name = newAttributeName.value.trim();
            const color = newAttributeColor.value;

            if (name && color) {
                this.addGlobalAttribute(name, color);
                newAttributeName.value = '';
            }
        });
    }

    initializeVisualizeAttribute() {
        this.visualizeAttribute.addEventListener('change', () => {
            this.visualizeAttributeValue = this.visualizeAttribute.value;
            this.updateCanvasVisualization();
        });
    }

    addGlobalAttribute(name, color) {
        this.colorAttributes.set(name, color);
        this.updateAttributeList();
        this.updateColorRowAssignableAttributes();
        // Add the attribute to every color row if not present
        this.colorRows.forEach(row => {
            if (!row.attributes.has(name)) {
                row.addAttribute(name, color);
            }
        });
        this.saveToLocalStorage();
    }

    removeGlobalAttribute(name) {
        this.colorAttributes.delete(name);
        this.updateAttributeList();
        this.updateColorRowAssignableAttributes();
        // Remove the attribute from every color row
        this.colorRows.forEach(row => {
            if (row.attributes.has(name)) {
                row.removeAttribute(name);
            }
        });
        this.saveToLocalStorage();
    }

    updateAttributeList() {
        const container = document.getElementById('colorAttributes');
        container.innerHTML = '';

        this.colorAttributes.forEach((color, name) => {
            const attributeDiv = document.createElement('div');
            attributeDiv.className = 'flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded';
            attributeDiv.innerHTML = `
                <span class="text-sm">${name}</span>
                <input type="color" value="${color}" class="global-attribute-color" data-attribute="${name}">
                <button class="remove-global-attribute" data-attribute="${name}">
                    <i class="bi bi-x"></i>
                </button>
            `;
            container.appendChild(attributeDiv);
        });

        // Add event listeners for the new elements
        container.querySelectorAll('.remove-global-attribute').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.closest('button').dataset.attribute;
                this.removeGlobalAttribute(name);
                this.saveToLocalStorage();
            });
        });

        container.querySelectorAll('.global-attribute-color').forEach(input => {
            input.addEventListener('change', (e) => {
                const name = e.target.dataset.attribute;
                const color = e.target.value;
                this.colorAttributes.set(name, color);
                this.updateAttributeList();
                this.updateColorRowAssignableAttributes();
                this.saveToLocalStorage();
            });
        });

        // Update visualize attribute dropdown
        this.updateVisualizeAttributeDropdown();
    }

    updateVisualizeAttributeDropdown() {
        // Save current selection
        const prev = this.visualizeAttribute.value;
        // Remove all except albedo
        this.visualizeAttribute.innerHTML = '<option value="albedo">albedo (default)</option>';
        this.colorAttributes.forEach((color, name) => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            this.visualizeAttribute.appendChild(opt);
        });
        // Restore previous selection if possible
        if ([...this.visualizeAttribute.options].some(o => o.value === prev)) {
            this.visualizeAttribute.value = prev;
        } else {
            this.visualizeAttribute.value = 'albedo';
        }
        this.visualizeAttributeValue = this.visualizeAttribute.value;
        this.updateCanvasVisualization();
    }

    updateCanvasVisualization() {
        // Pass the selected attribute to the canvas manager
        if (typeof this.canvasManager.setVisualizeAttribute === 'function') {
            this.canvasManager.setVisualizeAttribute(this.visualizeAttributeValue);
        }
        this.canvasManager.generateImage(this.colorRows);
    }

    // Update all color rows with the current global attributes
    updateColorRowAssignableAttributes() {
        this.colorRows.forEach(row => {
            if (typeof row.setAvailableAttributes === 'function') {
                row.setAvailableAttributes(this.colorAttributes);
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

        // Set available attributes for this row
        if (typeof colorRow.setAvailableAttributes === 'function') {
            colorRow.setAvailableAttributes(this.colorAttributes);
        }

        this.canvasManager.generateImage(this.colorRows);
        StorageManager.saveColors(this.colorRows, this.canvasManager);

        // Update warning after adding a row
        this.updateGridWarning();
        // Update assignable attributes
        this.updateColorRowAssignableAttributes();
    }

    deleteColorRow(colorRow) {
        const index = this.colorRows.indexOf(colorRow);
        if (index > -1) {
            this.colorRows.splice(index, 1);
            colorRow.element.remove();
            this.canvasManager.generateImage(this.colorRows);
            StorageManager.saveColors(this.colorRows, this.canvasManager);

            // Update warning after deleting a row
            this.updateGridWarning();
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

        // Update warning after clearing the list
        this.updateGridWarning();
    }

    getRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    getRandomType() {
        const types = ['solid', 'linear', 'radial', 'bi-chromatic', 'shade'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomAngle() {
        return Math.floor(Math.random() * 360);
    }

    getRandomOrientation() {
        return Math.random() > 0.5 ? 'horizontal' : 'vertical';
    }

    loadSavedColors() {
        const data = StorageManager.loadColors() || JSON.parse(localStorage.getItem('colorsData'));
        if (data) {
            // Set grid dimensions if they exist
            if (data.rows && data.cols) {
                this.canvasManager.setGridDimensions(data.rows, data.cols);
            }

            // Restore global attributes
            this.colorAttributes = new Map(Object.entries(data.globalAttributes || {}));
            this.updateAttributeList();
            this.updateColorRowAssignableAttributes();
            // Restore visualize attribute
            if (data.visualizeAttribute) {
                this.visualizeAttribute.value = data.visualizeAttribute;
                this.visualizeAttributeValue = data.visualizeAttribute;
            } else {
                this.visualizeAttribute.value = 'albedo';
                this.visualizeAttributeValue = 'albedo';
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
                if (typeof colorRow.setAvailableAttributes === 'function') {
                    colorRow.setAvailableAttributes(this.colorAttributes);
                }
            });
            this.canvasManager.generateImage(this.colorRows);
            this.updateCanvasVisualization();
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
            colors: this.colorRows.map(row => row.getColorData()),
            globalAttributes: Object.fromEntries(this.colorAttributes),
            visualizeAttribute: this.visualizeAttributeValue
        };
        StorageManager.saveToFile(data);
        // Also save to localStorage for persistence
        localStorage.setItem('colorsData', JSON.stringify(data));
    }

    // Save to localStorage on every change (for auto-persistence)
    saveToLocalStorage() {
        const data = {
            rows: this.canvasManager.getRows(),
            cols: this.canvasManager.getCols(),
            colors: this.colorRows.map(row => row.getColorData()),
            globalAttributes: Object.fromEntries(this.colorAttributes),
            visualizeAttribute: this.visualizeAttributeValue
        };
        localStorage.setItem('colorsData', JSON.stringify(data));
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
                    // Restore global attributes
                    this.colorAttributes = new Map(Object.entries(data.globalAttributes || {}));
                    this.updateAttributeList();
                    this.updateColorRowAssignableAttributes();
                    // Restore visualize attribute
                    if (data.visualizeAttribute) {
                        this.visualizeAttribute.value = data.visualizeAttribute;
                        this.visualizeAttributeValue = data.visualizeAttribute;
                    } else {
                        this.visualizeAttribute.value = 'albedo';
                        this.visualizeAttributeValue = 'albedo';
                    }

                    // Add color rows
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
                        if (typeof colorRow.setAvailableAttributes === 'function') {
                            colorRow.setAvailableAttributes(this.colorAttributes);
                        }
                    });
                    this.canvasManager.generateImage(this.colorRows);
                    this.updateCanvasVisualization();
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
            // Skip if the row is locked
            if (colorRow.isLocked()) return;

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

    randomizeColorsOnly() {
        this.colorRows.forEach(colorRow => {
            // Skip if the row is locked
            if (colorRow.isLocked()) return;

            const currentData = colorRow.getColorData();
            const newData = {
                type: currentData.type,
                orientation: currentData.orientation,
                angle: currentData.angle,
                mainColor: this.getRandomColor(),
                gradientEnd: this.getRandomColor(),
                biChromaticEnd: this.getRandomColor()
            };
            colorRow.setColorData(newData);
        });

        this.canvasManager.generateImage(this.colorRows);
        StorageManager.saveColors(this.colorRows, this.canvasManager);
    }

    updateGridWarning() {
        const totalCells = parseInt(this.gridRows.value) * parseInt(this.gridCols.value);
        const totalColors = this.colorRows.length;

        if (totalColors > totalCells) {
            this.gridWarning.classList.remove('hidden');
        } else {
            this.gridWarning.classList.add('hidden');
        }
    }

    resizeCanvas() {
        const imageSize = parseInt(document.getElementById('imageSize').value);

        if (imageSize > 0) {
            this.canvasManager.setCanvasDimensions(imageSize, imageSize);

            // If you have any grid drawing logic, redraw it here
            // this.canvasManager.drawGrid();
            this.updateCanvasVisualization();
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
});


// Assuming this.resizeCanvas() doesn't exist yet
// So we'll add the resizeCanvas function inside the App class


