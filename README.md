# Color Grid Generator : [website](https://andreadev3d.github.io/ColorGridGenerator/)

A web-based tool for creating and managing color grids with various gradient types. Perfect for generating color palettes, testing color combinations, and creating visual assets.

![image](/banner/banner_1.4.0.png)


## Features

### Color Management
- Add unlimited color rows
- Five gradient types:
  - Solid colors
  - Bi-chromatic (split colors with adjustable orientation)
  - Linear gradients (with adjustable angle)
  - Radial gradients
  - Shade gradients (automatic lighter/darker variations)
- Drag and drop to reorder colors
- Duplicate existing color rows
- Delete individual color rows
- Clear all colors
- Two randomization options:
  - Randomize All (types and colors)
  - Randomize Colors Only (preserves gradient types)
- Swap colors within a gradient
- Lock individual colors to prevent randomization

### Grid Customization
- Adjustable grid dimensions (1-16 rows and columns)
- Automatic grid layout optimization
- Preview updates in real-time

### Import/Export
- Save color configurations to file (.cgg format)
- Load color configurations from file
- Export grid as PNG image
- Automatic save to local storage

### User Interface
- Dark/Light theme toggle
- Mobile-responsive design
- Floating "Add Color" button
- Intuitive color controls
- Touch-friendly interface
- Color locking system with visual feedback

## Usage

1. Add colors using the "Add Color" button
2. Choose gradient type from the dropdown menu
3. Adjust colors using the color pickers
4. Customize gradient settings:
   - Bi-chromatic: Toggle horizontal/vertical split
   - Linear gradient: Adjust angle with slider
   - Shade: Automatically generates lighter/darker variations
5. Lock colors you want to keep during randomization
6. Arrange colors by dragging
7. Adjust grid size using row/column inputs
8. Export your creation as an image or save the configuration

## Technical Details

Built with:
- HTML5 Canvas for grid rendering
- CSS Grid and Flexbox for layout
- JavaScript ES6+ modules
- Tailwind CSS 4 for UI components
- Local Storage for persistence
- Sortable.js for drag-and-drop functionality

## Version History

### v1.4.0
- Added Tailwind CSS 4
- Added build:css script

### v1.3.0
- Added color locking system
- Added separate randomization modes
- Added shade gradient type
- Improved color management system

### v1.2.0
- Added randomize functionality
- Added grid size controls
- Improved mobile responsiveness
- Added color swap feature
- Added floating add button

## License

[Add your license information here]



If you'd like to host the app locally, follow these steps:

1. Clone this repository:
   ```bash
   git clone https://github.com/AndreaDev3D/ColorGridGenerator.git


2. Build Tailwind CSS
   ```bash
   npm run build:css
   ```


