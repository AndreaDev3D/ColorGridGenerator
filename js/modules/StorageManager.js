export class StorageManager {
    static saveColors(colorRows, canvasManager) {
        const data = {
            rows: canvasManager.getRows(),
            cols: canvasManager.getCols(),
            colors: colorRows.map(row => {
                const colorData = row.getColorData();
                return {
                    type: colorData.type,
                    mainColor: colorData.mainColor,
                    gradientEnd: colorData.gradientEnd,
                    biChromaticEnd: colorData.biChromaticEnd,
                    angle: colorData.angle,
                    orientation: colorData.orientation,
                    locked: row.isLocked()
                };
            })
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