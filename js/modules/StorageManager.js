export class StorageManager {
    static saveColors(colorRows, canvasManager) {
        // Try to get globalAttributes and visualizeAttribute from window.app if available
        let globalAttributes = {};
        let visualizeAttribute = 'albedo';
        if (window.app) {
            globalAttributes = Object.fromEntries(window.app.colorAttributes || []);
            visualizeAttribute = window.app.visualizeAttributeValue || 'albedo';
        }
        const data = {
            rows: canvasManager.getRows(),
            cols: canvasManager.getCols(),
            colors: colorRows.map(row => row.getColorData()),
            globalAttributes,
            visualizeAttribute
        };
        localStorage.setItem('colorsData', JSON.stringify(data));
    }

    static loadColors() {
        const data = localStorage.getItem('colorsData');
        return data ? JSON.parse(data) : null;
    }

    static saveToFile(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grid.cgg';
        a.click();
        URL.revokeObjectURL(url);
    }
} 