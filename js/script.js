const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorRowsDiv = document.getElementById('colorRows');
let colorRowCount = 0;

function addColorRow() {
    colorRowCount++;
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('color-row');
    rowDiv.setAttribute('id', `colorRow${colorRowCount}`);

    rowDiv.innerHTML = `
    <div class="card w-100 text-start">
        <div class="card-body hstack gap-2 ps-0 py-1 pe-1">
            <i class="bi bi-list px-3 fw-5 drag-handle"></i>

            <!-- Gradient Type Dropdown -->
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="dropdownMenu${colorRowCount}" style="min-width:135px;">
                    Solid
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenu${colorRowCount}">
                    <li><a class="dropdown-item" href="#" data-type="solid">Solid</a></li>
                    <li><a class="dropdown-item" href="#" data-type="bi-chromatic">Bi-Chromatic</a></li>
                    <li><a class="dropdown-item" href="#" data-type="linear">Linear</a></li>
                    <li><a class="dropdown-item" href="#" data-type="radial">Radial</a></li>
                </ul>
            </div>

            <input type="color" class="colorInput" value="#ffffff">
            <input type="color" class="colorInput gradientEnd" value="#00ff00" style="display:none;">
            <input type="color" class="colorInput biChromaticEnd" value="#ff0000" style="display:none;">
            
            <!-- Angle Slider and Input for Linear Gradient -->
            <label class="angleLabel" style="display:none;">
                <input type="range" class="angleSlider" min="0" max="360" value="90">
                <input type="number" class="angleInput rounded-2 border-1 p-1 border-secondary" min="0" max="360" step="5" value="90" style="width: 60px;">
            </label>
            
            <button class="btn btn-secondary duplicateColorRow ms-auto" type="button"><i class="bi bi-files"></i></button>
            <button class="btn btn-danger deleteColorRow" type="button"><i class="bi bi-trash"></i></button>
        </div>
    </div>
`;


    colorRowsDiv.appendChild(rowDiv);

    // Attach event listeners for gradient inputs and dropdown selection
    initializeRowEventListeners(rowDiv);
}

function initializeRowEventListeners(rowDiv) {
    const colorInputs = rowDiv.querySelectorAll('.colorInput');
    colorInputs.forEach(input => input.addEventListener('input', () => {
        generateImage();
        saveColorsToLocalStorage();
    }));

    const gradientEndInput = rowDiv.querySelector('.gradientEnd');
    const biChromaticEndInput = rowDiv.querySelector('.biChromaticEnd');
    const angleLabel = rowDiv.querySelector('.angleLabel');
    const dropdownButton = rowDiv.querySelector('.dropdown-toggle');
    const dropdownItems = rowDiv.querySelectorAll('.dropdown-item');

    // Handle dropdown selection for gradient type
    dropdownItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const selectedType = item.getAttribute('data-type');
            dropdownButton.textContent = item.textContent; // Update button text

            // Show/hide elements based on the selection
            if (selectedType === 'solid') {
                gradientEndInput.style.display = 'none';
                biChromaticEndInput.style.display = 'none';
                angleLabel.style.display = 'none';
            } else if (selectedType === 'bi-chromatic') {
                gradientEndInput.style.display = 'none';
                biChromaticEndInput.style.display = 'inline';
                angleLabel.style.display = 'none';
            } else if (selectedType === 'linear') {
                gradientEndInput.style.display = 'inline';
                biChromaticEndInput.style.display = 'none';
                angleLabel.style.display = 'inline';
            } else if (selectedType === 'radial') {
                gradientEndInput.style.display = 'inline';
                biChromaticEndInput.style.display = 'none';
                angleLabel.style.display = 'none';
            }

            generateImage();
            saveColorsToLocalStorage();
        });
    });
    // Synchronize angle slider and input
    const angleSlider = rowDiv.querySelector('.angleSlider');
    const angleInput = rowDiv.querySelector('.angleInput');

    angleSlider.addEventListener('input', () => {
        angleInput.value = angleSlider.value;
        generateImage();
        saveColorsToLocalStorage();
    });

    angleInput.addEventListener('input', () => {
        angleInput.value = Math.min(Math.max(angleInput.value, 0), 360);
        angleSlider.value = angleInput.value;
        generateImage();
        saveColorsToLocalStorage();
    });

    // Duplicate button functionality
    const duplicateButton = rowDiv.querySelector('.duplicateColorRow');
    duplicateButton.addEventListener('click', function () {
        const newRow = rowDiv.cloneNode(true);
        rowDiv.parentNode.insertBefore(newRow, rowDiv.nextSibling);
        initializeRowEventListeners(newRow); // Initialize events for the new row
        saveColorsToLocalStorage();
        generateImage();
    });

    // Delete button functionality
    const deleteButton = rowDiv.querySelector('.deleteColorRow');
    deleteButton.addEventListener('click', function () {
        rowDiv.remove();
        saveColorsToLocalStorage();
        generateImage();
    });
}

function duplicateColorRow(rowDiv) {
    // Clone the row element without existing event listeners
    const duplicate = rowDiv.cloneNode(true);

    // Increment colorRowCount for the new row
    colorRowCount++;
    duplicate.setAttribute('id', `colorRow${colorRowCount}`); // Update the ID for the new row

    // Update all unique IDs and names inside the cloned row to avoid conflicts
    duplicate.querySelectorAll('[id]').forEach(element => {
        // Update IDs for each radio input and label
        element.id = element.id.replace(/\d+$/, colorRowCount);
    });

    // Update `name` attributes for radio buttons and `for` attributes for labels
    duplicate.querySelectorAll('[name^="gradientType"]').forEach(radio => {
        radio.name = `gradientType${colorRowCount}`;
    });
    duplicate.querySelectorAll('label[for]').forEach(label => {
        label.setAttribute('for', label.getAttribute('for').replace(/\d+$/, colorRowCount));
    });

    // Insert the duplicate row right below the original row
    colorRowsDiv.insertBefore(duplicate, rowDiv.nextSibling);

    // Reinitialize event listeners for the cloned row
    initializeRowEventListeners(duplicate);

    // Update the local storage and regenerate the canvas to reflect the changes
    saveColorsToLocalStorage();
    generateImage();
}

function generateImage() {
    const colors = document.querySelectorAll('.color-row');
    const colorCount = colors.length;

    // Calculate grid size and cell dimensions
    const gridSize = Math.max(2, Math.ceil(Math.sqrt(Math.pow(2, Math.ceil(Math.log2(colorCount))))));
    canvas.width = 256;
    canvas.height = 256;
    const cellSize = canvas.width / gridSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each color in the grid
    colors.forEach((row, index) => {
        const colorInput = row.querySelector('.colorInput').value;
        const gradientEndColor = row.querySelector('.gradientEnd').value;
        const biChromaticEndColor = row.querySelector('.biChromaticEnd').value;
        const selectedType = row.querySelector('.dropdown-toggle').textContent.trim().toLowerCase(); // Get selected gradient type
        const angle = parseFloat(row.querySelector('.angleSlider').value);

        const x = (index % gridSize) * cellSize;
        const y = Math.floor(index / gridSize) * cellSize;

        if (selectedType === 'bi-chromatic') {
            // Draw left half of the cell with the first color
            ctx.fillStyle = colorInput;
            ctx.fillRect(x, y, cellSize / 2, cellSize);

            // Draw right half of the cell with the second color
            ctx.fillStyle = biChromaticEndColor;
            ctx.fillRect(x + cellSize / 2, y, cellSize / 2, cellSize);

        } else if (selectedType === 'linear' || selectedType === 'radial') {
            if (selectedType === 'linear') {
                // Calculate linear gradient based on angle, rotating from the cell center
                const centerX = x + cellSize / 2;
                const centerY = y + cellSize / 2;
                const radians = (angle * Math.PI) / 180;
                const xEnd = centerX + Math.cos(radians) * (cellSize / 2);
                const yEnd = centerY + Math.sin(radians) * (cellSize / 2);
                const xStart = centerX - Math.cos(radians) * (cellSize / 2);
                const yStart = centerY - Math.sin(radians) * (cellSize / 2);

                const gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
                gradient.addColorStop(0, colorInput);
                gradient.addColorStop(1, gradientEndColor);
                ctx.fillStyle = gradient;
            } else if (selectedType === 'radial') {
                // Create radial gradient centered in each cell
                const gradient = ctx.createRadialGradient(x + cellSize / 2, y + cellSize / 2, 0, x + cellSize / 2, y + cellSize / 2, cellSize / 2);
                gradient.addColorStop(0, colorInput);
                gradient.addColorStop(1, gradientEndColor);
                ctx.fillStyle = gradient;
            }
        } else {
            // Use solid color if "solid" is selected
            ctx.fillStyle = colorInput;
        }

        // Draw the entire cell if not bi-chromatic
        if (selectedType !== 'bi-chromatic') {
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    });
}

function removeColorRow() {
    if (colorRowCount > 0) {
        const lastRow = document.getElementById(`colorRow${colorRowCount}`);
        lastRow.remove();
        colorRowCount--;
    }
}

function saveImage() {
    const link = document.createElement('a');
    link.download = 'color_grid.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function clearColorList() {
    document.querySelectorAll('.color-row').forEach(row => row.remove()); // Remove all rows
    localStorage.removeItem('colorsData'); // Clear local storage
    colorRowCount = 0; // Reset row count
}

function saveColorsToLocalStorage() {
    const colorsData = [];
    document.querySelectorAll('.color-row').forEach(row => {
        const color = row.querySelector('.colorInput').value;
        const gradientEndColor = row.querySelector('.gradientEnd').value;
        const gradientType = row.querySelector('.dropdown-toggle').textContent.trim().toLowerCase(); // Get selected type
        const angle = parseFloat(row.querySelector('.angleInput').value);

        colorsData.push({ color, gradientEndColor, gradientType, angle });
    });
    localStorage.setItem('colorsData', JSON.stringify(colorsData));
}

function loadColorsFromLocalStorage() {
    const colorsData = JSON.parse(localStorage.getItem('colorsData'));
    if (colorsData) {
        colorsData.forEach((data, index) => {
            addColorRow(); // Add a new row
            const row = document.getElementById(`colorRow${index + 1}`);

            // Set primary color and gradient end colors
            row.querySelector('.colorInput').value = data.color;
            row.querySelector('.gradientEnd').value = data.gradientEndColor;
            row.querySelector('.biChromaticEnd').value = data.biChromaticEndColor || '#ff0000'; // Set default if missing
            row.querySelector('.angleInput').value = data.angle || 0;
            row.querySelector('.angleSlider').value = data.angle || 0;

            // Set the dropdown to display the correct gradient type
            const dropdownButton = row.querySelector('.dropdown-toggle');
            dropdownButton.textContent = data.gradientType.charAt(0).toUpperCase() + data.gradientType.slice(1); // Capitalize first letter

            // Display controls based on gradient type
            const gradientEndInput = row.querySelector('.gradientEnd');
            const biChromaticEndInput = row.querySelector('.biChromaticEnd');
            const angleLabel = row.querySelector('.angleLabel');
            if (data.gradientType === 'solid') {
                gradientEndInput.style.display = 'none';
                biChromaticEndInput.style.display = 'none';
                angleLabel.style.display = 'none';
            } else if (data.gradientType === 'bi-chromatic') {
                gradientEndInput.style.display = 'none';
                biChromaticEndInput.style.display = 'inline';
                angleLabel.style.display = 'none';
            } else if (data.gradientType === 'linear') {
                gradientEndInput.style.display = 'inline';
                biChromaticEndInput.style.display = 'none';
                angleLabel.style.display = 'inline';
            } else if (data.gradientType === 'radial') {
                gradientEndInput.style.display = 'inline';
                biChromaticEndInput.style.display = 'none';
                angleLabel.style.display = 'none';
            }
        });
        generateImage(); // Generate image with the loaded colors
    }
}

// Event listeners for buttons
document.getElementById('addColorRow').addEventListener('click', () => {
    addColorRow();
    generateImage();
    saveColorsToLocalStorage();
});

document.getElementById('saveImage').addEventListener('click', saveImage);

document.getElementById('clearColorList').addEventListener('click', clearColorList);

// Load colors when the page loads
window.addEventListener('load', loadColorsFromLocalStorage);


document.addEventListener("DOMContentLoaded", function () {
    const colorRowsDiv = document.getElementById("colorRows");

    // Initialize Sortable on the colorRowsDiv
    Sortable.create(colorRowsDiv, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: function () {
            generateImage();
            saveColorsToLocalStorage();
        }
    });
});

document.getElementById('theme-toggle').addEventListener('click', function () {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');

    // Toggle the theme and icon
    if (html.getAttribute('data-bs-theme') === 'dark') {
        html.setAttribute('data-bs-theme', 'light');
        icon.classList.replace('bi-sun', 'bi-moon-stars-fill'); // Change icon to moon-stars-fill
    } else {
        html.setAttribute('data-bs-theme', 'dark');
        icon.classList.replace('bi-moon-stars-fill', 'bi-sun'); // Change icon to sun
    }
});

// Save configuration to a file
document.getElementById('saveToFile').addEventListener('click', function () {
    const colorsData = JSON.parse(localStorage.getItem('colorsData')) || [];
    const blob = new Blob([JSON.stringify(colorsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'grid.cgg';
    a.click();

    URL.revokeObjectURL(url); // Clean up
});

// Load configuration from a file
document.getElementById('loadFromFile').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            try {
                const colorsData = JSON.parse(content);

                // Clear existing rows
                document.querySelectorAll('.color-row').forEach(row => row.remove());
                colorRowCount = 0; // Reset row count

                // Save the loaded data to local storage and load it
                localStorage.setItem('colorsData', JSON.stringify(colorsData));
                loadColorsFromLocalStorage(); // Use existing load function to populate UI
            } catch (error) {
                alert('Invalid file format.');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }
});

// // Listen for changes to the canvas size dropdown
// document.getElementById('canvasSize').addEventListener('change', function () {
//     const newSize = parseInt(this.value);
//     updateCanvasSize(newSize);
// });

// // Function to update canvas size and redraw the grid
// function updateCanvasSize(size) {
//     canvas.width = size;
//     canvas.height = size;
//     generateImage(); // Redraw the grid with the new canvas size
// }