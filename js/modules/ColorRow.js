export class ColorRow {
    constructor(id) {
        this.id = id;
        this.element = this.createRow();
        this.attributes = new Map(); // Store color attributes
        this.initializeEventListeners();
    }

    createRow() {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('color-row');
        rowDiv.setAttribute('id', `colorRow${this.id}`);

        rowDiv.innerHTML = `
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div class="flex items-center gap-2 p-2">
                <i class="bi bi-list px-3 text-gray-500 dark:text-gray-400 cursor-move drag-handle"></i>

                <!-- Lock button - hidden on mobile -->
                <button class="btn-square rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                              text-gray-700 dark:text-gray-300 lock-color transition-colors duration-200 hidden lg:flex" 
                        type="button" title="Lock/Unlock color">
                    <i class="bi bi-unlock"></i>
                </button>

                <!-- Gradient Type Dropdown - always visible -->
                <div class="relative group">
                    <button class="min-w-[135px] px-3 py-2 text-left bg-gray-700 hover:bg-gray-600 
                                 rounded-md dropdown-toggle text-white flex items-center justify-between" 
                            type="button" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false" 
                            id="dropdownMenu${this.id}">
                        <span>Solid</span>
                        <i class="bi bi-chevron-down text-sm"></i>
                    </button>
                    <ul class="dropdown-menu hidden group-focus-within:block absolute left-0 mt-1 w-full 
                               bg-gray-700 shadow-lg rounded-md z-10" 
                        aria-labelledby="dropdownMenu${this.id}">
                        <li><a class="dropdown-item block px-3 py-1 hover:bg-gray-600 text-white" href="#" data-type="solid">Solid</a></li>
                        <li><a class="dropdown-item block px-3 py-1 hover:bg-gray-600 text-white" href="#" data-type="bi-chromatic">Bi-Chromatic</a></li>
                        <li><a class="dropdown-item block px-3 py-1 hover:bg-gray-600 text-white" href="#" data-type="linear">Linear</a></li>
                        <li><a class="dropdown-item block px-3 py-1 hover:bg-gray-600 text-white" href="#" data-type="radial">Radial</a></li>
                        <li><a class="dropdown-item block px-3 py-1 hover:bg-gray-600 text-white" href="#" data-type="shade">Shade</a></li>
                    </ul>
                </div>

                <!-- Color inputs -->
                <input type="color" class="color-input rounded" value="#ffffff">
                <input type="color" class="color-input gradientEnd rounded hidden" value="#00ff00">
                <input type="color" class="color-input biChromaticEnd rounded hidden" value="#ff0000">
                
                <!-- Swap colors button - hidden on mobile -->
                <button class="btn-square rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                          swapColors hidden lg:flex" 
                        type="button" title="Swap Colors">
                    <i class="bi bi-arrow-left-right"></i>
                </button>

                <!-- Orientation toggle - hidden on mobile -->
                <button class="btn-square rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                          orientationToggle hidden lg:flex" 
                        type="button">
                    <i class="bi bi-arrow-right"></i>
                </button>
                
                <!-- Angle controls - hidden on mobile -->
                <label class="angleLabel hidden lg:flex items-center gap-2">
                    <input type="range" class="angleSlider w-24" min="0" max="360" value="90">
                    <input type="number" class="angleInput w-16 p-1 rounded border border-gray-300 dark:border-gray-600 hidden lg:block" 
                           min="0" max="360" step="5" value="90">
                </label>
                
                <!-- Action buttons -->
                <div class="ml-auto flex gap-2">
                    <!-- Duplicate button - hidden on mobile -->
                    <button class="btn-square rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                                  duplicateColorRow hidden lg:flex" 
                            type="button" title="Duplicate color row">
                        <i class="bi bi-files"></i>
                    </button>
                    <!-- Delete button - always visible -->
                    <button class="btn-square rounded-md bg-red-500 hover:bg-red-600 text-white deleteColorRow" 
                            type="button" title="Delete color row">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
            <!-- Assignable attributes container -->
            <div class="assignable-attributes flex flex-wrap gap-2 px-2 pb-1"></div>
            <!-- Add attributes container -->
            <div class="color-attributes flex flex-wrap gap-2 p-2 border-t border-gray-200 dark:border-gray-700"></div>
        </div>`;

        return rowDiv;
    }

    initializeEventListeners() {
        const colorInputs = this.element.querySelectorAll('.color-input');
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
            const mainColor = this.element.querySelector('.color-input');
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
        const lockButton = this.element.querySelector('.lock-color');
        lockButton.addEventListener('click', () => {
            const icon = lockButton.querySelector('i');
            if (icon.classList.contains('bi-unlock')) {
                icon.classList.replace('bi-unlock', 'bi-lock');
                this.element.classList.add('locked');
                lockButton.classList.add('bg-yellow-500', 'dark:bg-yellow-600', 'text-white', 'dark:text-white');
                lockButton.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            } else {
                icon.classList.replace('bi-lock', 'bi-unlock');
                this.element.classList.remove('locked');
                lockButton.classList.remove('bg-yellow-500', 'dark:bg-yellow-600', 'text-white', 'dark:text-white');
                lockButton.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            }
        });
    }

    updateInputVisibility(type, gradientEnd, biChromaticEnd, angleLabel) {
        const orientationToggle = this.element.querySelector('.orientationToggle');
        const swapButton = this.element.querySelector('.swapColors');

        // Use Tailwind's hidden class instead of display:none
        if (['linear', 'radial'].includes(type)) {
            gradientEnd.classList.remove('hidden');
        } else {
            gradientEnd.classList.add('hidden');
        }

        if (type === 'bi-chromatic') {
            biChromaticEnd.classList.remove('hidden');
            orientationToggle.classList.remove('hidden');
        } else {
            biChromaticEnd.classList.add('hidden');
            orientationToggle.classList.add('hidden');
        }

        if (type === 'linear') {
            angleLabel.classList.remove('hidden');
        } else {
            angleLabel.classList.add('hidden');
        }

        if (['bi-chromatic', 'linear', 'radial'].includes(type)) {
            swapButton.classList.remove('hidden');
        } else {
            swapButton.classList.add('hidden');
        }
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
            mainColor: this.element.querySelector('.color-input').value,
            gradientEnd: this.element.querySelector('.gradientEnd').value,
            biChromaticEnd: this.element.querySelector('.biChromaticEnd').value,
            angle: parseInt(this.element.querySelector('.angleInput').value),
            orientation: isHorizontal ? 'horizontal' : 'vertical',
            locked: this.isLocked(),
            attributes: Object.fromEntries(this.attributes)
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
        this.element.querySelector('.color-input').value = data.mainColor;
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
            const lockButton = this.element.querySelector('.lock-color');
            const icon = lockButton.querySelector('i');
            icon.classList.replace('bi-unlock', 'bi-lock');
            this.element.classList.add('locked');
            lockButton.classList.add('bg-yellow-500', 'dark:bg-yellow-600', 'text-white', 'dark:text-white');
            lockButton.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        }

        if (data.attributes) {
            this.attributes = new Map(Object.entries(data.attributes));
            this.updateAttributeDisplay();
        }
    }

    // Add method to check if row is locked
    isLocked() {
        return this.element.classList.contains('locked');
    }

    // Add new method to handle attributes
    addAttribute(name, color) {
        this.attributes.set(name, color);
        this.updateAttributeDisplay();
        this.updateAssignableAttributes();
    }

    removeAttribute(name) {
        this.attributes.delete(name);
        this.updateAttributeDisplay();
        this.updateAssignableAttributes();
    }

    updateAttributeDisplay() {
        const attributeContainer = this.element.querySelector('.color-attributes');
        if (!attributeContainer) return;

        attributeContainer.innerHTML = '';
        this.attributes.forEach((color, name) => {
            const attributeDiv = document.createElement('div');
            attributeDiv.className = 'flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded';
            attributeDiv.innerHTML = `
                <span class="text-sm">${name}</span>
                <input type="color" value="${color}" class="attribute-color" data-row-attribute="${name}">
                <button class="remove-attribute" data-row-attribute="${name}"><i class="bi bi-x"></i></button>
            `;
            attributeContainer.appendChild(attributeDiv);
        });
        // Add event listeners to attribute color inputs
        attributeContainer.querySelectorAll('.attribute-color').forEach(input => {
            input.addEventListener('input', (e) => {
                const name = e.target.dataset.rowAttribute;
                const color = e.target.value;
                this.attributes.set(name, color);
                this.dispatchChangeEvent();
            });
        });
        // Add event listeners to remove/reset buttons
        attributeContainer.querySelectorAll('.remove-attribute').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.closest('button').dataset.rowAttribute;
                if (this.availableAttributes && this.availableAttributes.has(name)) {
                    // Reset to global value (do not remove)
                    this.attributes.set(name, this.availableAttributes.get(name));
                    this.updateAttributeDisplay();
                    this.dispatchChangeEvent();
                } else {
                    // Remove non-global attribute
                    this.removeAttribute(name);
                    this.dispatchChangeEvent();
                }
            });
        });
    }

    // Add this method to set available global attributes for assignment
    setAvailableAttributes(attributesMap) {
        // Always store a copy, never a reference
        this.availableAttributes = new Map(attributesMap);
        this.updateAssignableAttributes();
    }

    updateAssignableAttributes() {
        const container = this.element.querySelector('.assignable-attributes');
        if (!container) return;
        container.innerHTML = '';
        if (!this.availableAttributes) return;
        this.availableAttributes.forEach((color, name) => {
            // Don't show if already assigned
            if (this.attributes.has(name)) return;
            const btn = document.createElement('button');
            btn.className = 'flex items-center gap-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600';
            btn.innerHTML = `<span>${name}</span><span style="display:inline-block;width:1.2em;height:1.2em;background:${color};border-radius:0.2em;"></span>`;
            btn.addEventListener('click', () => {
                this.addAttribute(name, color);
                this.updateAssignableAttributes();
            });
            container.appendChild(btn);
        });
    }
} 