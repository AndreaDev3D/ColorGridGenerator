export class ColorRow {
    constructor(id) {
        this.id = id;
        this.element = this.createRow();
        this.initializeEventListeners();
    }

    createRow() {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('color-row');
        rowDiv.setAttribute('id', `colorRow${this.id}`);

        rowDiv.innerHTML = `
        <div class="card w-100 text-start">
            <div class="card-body hstack gap-2 ps-0 py-1 pe-1">
                <i class="bi bi-list px-3 fw-5 drag-handle"></i>

                <!-- Add lock button at the start -->
                <button class="btn btn-secondary lockColor" type="button" title="Lock/Unlock color">
                    <i class="bi bi-unlock"></i>
                </button>

                <!-- Gradient Type Dropdown -->
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="dropdownMenu${this.id}" style="min-width:135px;">
                        Solid
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenu${this.id}">
                        <li><a class="dropdown-item" href="#" data-type="solid">Solid</a></li>
                        <li><a class="dropdown-item" href="#" data-type="bi-chromatic">Bi-Chromatic</a></li>
                        <li><a class="dropdown-item" href="#" data-type="linear">Linear</a></li>
                        <li><a class="dropdown-item" href="#" data-type="radial">Radial</a></li>
                        <li><a class="dropdown-item" href="#" data-type="shade">Shade</a></li>
                    </ul>
                </div>

                <input type="color" class="colorInput" value="#ffffff">
                <input type="color" class="colorInput gradientEnd" value="#00ff00" style="display:none;">
                <input type="color" class="colorInput biChromaticEnd" value="#ff0000" style="display:none;">
                
                <!-- Add swap colors button -->
                <button class="btn btn-secondary swapColors" style="display:none;" type="button" title="Swap Colors">
                    <i class="bi bi-arrow-left-right"></i>
                </button>

                <!-- Orientation toggle button for bi-chromatic -->
                <button class="btn btn-secondary orientationToggle" style="display:none;" type="button">
                    <i class="bi bi-arrow-right"></i>
                </button>
                
                <!-- Angle controls -->
                <label class="angleLabel" style="display:none;">
                    <input type="range" class="angleSlider" min="0" max="360" value="90">
                    <input type="number" class="angleInput rounded-2 border-1 p-1 border-secondary" min="0" max="360" step="5" value="90" style="width: 60px;">
                </label>
                
                <button class="btn btn-secondary duplicateColorRow ms-auto" type="button" 
                    title="Duplicate color row">
                    <i class="bi bi-files"></i>
                </button>
                <button class="btn btn-danger deleteColorRow" type="button" 
                    title="Delete color row">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>`;

        return rowDiv;
    }

    initializeEventListeners() {
        const colorInputs = this.element.querySelectorAll('.colorInput');
        const gradientEndInput = this.element.querySelector('.gradientEnd');
        const biChromaticEndInput = this.element.querySelector('.biChromaticEnd');
        const angleLabel = this.element.querySelector('.angleLabel');
        const dropdownButton = this.element.querySelector('.dropdown-toggle');
        const dropdownItems = this.element.querySelectorAll('.dropdown-item');
        const angleSlider = this.element.querySelector('.angleSlider');
        const angleInput = this.element.querySelector('.angleInput');

        // Handle dropdown selection
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedType = item.getAttribute('data-type');
                dropdownButton.textContent = item.textContent;

                this.updateInputVisibility(selectedType, gradientEndInput, biChromaticEndInput, angleLabel);
                this.dispatchChangeEvent();
            });
        });

        // Color input changes
        colorInputs.forEach(input => {
            input.addEventListener('input', () => this.dispatchChangeEvent());
        });

        // Angle controls
        angleSlider.addEventListener('input', () => {
            angleInput.value = angleSlider.value;
            this.dispatchChangeEvent();
        });

        angleInput.addEventListener('input', () => {
            angleInput.value = Math.min(Math.max(angleInput.value, 0), 360);
            angleSlider.value = angleInput.value;
            this.dispatchChangeEvent();
        });

        const orientationToggle = this.element.querySelector('.orientationToggle');
        orientationToggle.addEventListener('click', () => {
            const icon = orientationToggle.querySelector('i');
            if (icon.classList.contains('bi-arrow-right')) {
                icon.classList.replace('bi-arrow-right', 'bi-arrow-down');
            } else {
                icon.classList.replace('bi-arrow-down', 'bi-arrow-right');
            }
            this.dispatchChangeEvent();
        });

        const swapButton = this.element.querySelector('.swapColors');
        swapButton.addEventListener('click', () => {
            const mainColor = this.element.querySelector('.colorInput');
            const gradientEnd = this.element.querySelector('.gradientEnd');
            const biChromaticEnd = this.element.querySelector('.biChromaticEnd');

            // Get the current type
            const type = this.element.querySelector('.dropdown-toggle').textContent.trim().toLowerCase();

            if (type === 'bi-chromatic') {
                // Swap bi-chromatic colors
                const temp = mainColor.value;
                mainColor.value = biChromaticEnd.value;
                biChromaticEnd.value = temp;
            } else if (['linear', 'radial'].includes(type)) {
                // Swap gradient colors
                const temp = mainColor.value;
                mainColor.value = gradientEnd.value;
                gradientEnd.value = temp;
            }

            this.dispatchChangeEvent();
        });

        // Add lock button handler
        const lockButton = this.element.querySelector('.lockColor');
        lockButton.addEventListener('click', () => {
            const icon = lockButton.querySelector('i');
            if (icon.classList.contains('bi-unlock')) {
                icon.classList.replace('bi-unlock', 'bi-lock');
                this.element.classList.add('locked');
            } else {
                icon.classList.replace('bi-lock', 'bi-unlock');
                this.element.classList.remove('locked');
            }
        });
    }

    updateInputVisibility(type, gradientEnd, biChromaticEnd, angleLabel) {
        const orientationToggle = this.element.querySelector('.orientationToggle');
        const swapButton = this.element.querySelector('.swapColors');

        gradientEnd.style.display = ['linear', 'radial'].includes(type) ? 'inline' : 'none';
        biChromaticEnd.style.display = type === 'bi-chromatic' ? 'inline' : 'none';
        orientationToggle.style.display = type === 'bi-chromatic' ? 'inline' : 'none';
        angleLabel.style.display = type === 'linear' ? 'inline' : 'none';
        swapButton.style.display = ['bi-chromatic', 'linear', 'radial'].includes(type) ? 'inline' : 'none';
    }

    dispatchChangeEvent() {
        this.element.dispatchEvent(new Event('colorchange', { bubbles: true }));
    }

    getColorData() {
        const dropdownButton = this.element.querySelector('.dropdown-toggle');
        const orientationToggle = this.element.querySelector('.orientationToggle');
        const isHorizontal = orientationToggle.querySelector('i').classList.contains('bi-arrow-right');

        return {
            type: dropdownButton.textContent.trim().toLowerCase(),
            mainColor: this.element.querySelector('.colorInput').value,
            gradientEnd: this.element.querySelector('.gradientEnd').value,
            biChromaticEnd: this.element.querySelector('.biChromaticEnd').value,
            angle: parseInt(this.element.querySelector('.angleInput').value),
            orientation: isHorizontal ? 'horizontal' : 'vertical',
            locked: this.isLocked()
        };
    }

    setColorData(data) {
        const dropdownButton = this.element.querySelector('.dropdown-toggle');
        const gradientEndInput = this.element.querySelector('.gradientEnd');
        const biChromaticEndInput = this.element.querySelector('.biChromaticEnd');
        const angleLabel = this.element.querySelector('.angleLabel');

        // Set the type
        dropdownButton.textContent = data.type.charAt(0).toUpperCase() + data.type.slice(1);

        // Set the colors
        this.element.querySelector('.colorInput').value = data.mainColor;
        gradientEndInput.value = data.gradientEnd;
        biChromaticEndInput.value = data.biChromaticEnd;

        // Set the angle
        this.element.querySelector('.angleInput').value = data.angle;
        this.element.querySelector('.angleSlider').value = data.angle;

        // Update visibility
        this.updateInputVisibility(data.type, gradientEndInput, biChromaticEndInput, angleLabel);

        // Set orientation if it exists in the data
        if (data.orientation) {
            const orientationToggle = this.element.querySelector('.orientationToggle');
            const icon = orientationToggle.querySelector('i');
            if (data.orientation === 'vertical') {
                icon.classList.replace('bi-arrow-right', 'bi-arrow-down');
            } else {
                icon.classList.replace('bi-arrow-down', 'bi-arrow-right');
            }
        }

        // Set locked state if it exists in the data
        if (data.locked) {
            const lockButton = this.element.querySelector('.lockColor');
            const icon = lockButton.querySelector('i');
            icon.classList.replace('bi-unlock', 'bi-lock');
            this.element.classList.add('locked');
        }
    }

    // Add method to check if row is locked
    isLocked() {
        return this.element.classList.contains('locked');
    }
} 