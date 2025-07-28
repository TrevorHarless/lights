# Lights Editor Page — Feature Specification

This feature allows Holiday Light Installation businesses to create visual mockups of a customer’s home with holiday lights overlaid on their uploaded house image.

---

## 🎯 User Story

> As a holiday light installer, I want to edit a project's uploaded house image by dragging and placing light assets on top of it, so I can create a visual mockup to share with my customer.

---

## 🚀 Core Functional Requirements (v1.0)

### 1. Project Context

- The editor is scoped to a **specific project** with an uploaded image.
- Only accessible after the image has been uploaded.

### 2. Canvas Area

- Shows the uploaded house image as a **background**.
- Supports overlaying multiple **light assets** on top.

### 3. Light Asset Palette

- A **scrollable sidebar** of categorized light asset thumbnails (e.g., string lights, wreaths, tree wraps).
- Assets are **draggable** into the canvas.

### 4. Asset Manipulation

- Once placed on the canvas, each light asset should support:
  - **Move**
  - **Scale**
  - **Rotate**
- Transformations should persist while editing and after saving.

### 5. Undo/Redo

- Basic undo/redo stack for user interactions.
- Limited to recent session actions (in-memory only for MVP).

### 6. Save Project State (IMPLEMENT LATER)

- Saves the current mockup state to the backend (Supabase).
- Saved data includes:
  - Light asset type ID
  - Position (x, y)
  - Scale factor
  - Rotation angle

### 7. Export Mockup

- Button to **export the edited canvas** to an image.
- Implementation:
  - Use `react-native-view-shot` to capture the canvas.
  - Allow user to save to device or share.

---

### UI Components

- **Header Bar**: Project title, back navigation
- **Sidebar (Left)**: Categorized asset thumbnails
- **Canvas**: Image with draggable SVG/vector assets
- **Footer Buttons**: Save + Export

---


# More Features for Editor Page
- Need roof line lights
- Need mini lights - close together
- Wreaths
- Wreath with Bow
- Ability to put an individual light
- Option to export directly to iMessage/Photo Lib
- When selecting a line: can move edges and entire line
- Zoom in on photo for precise placement -- maintain overal light placement when doing this
- Cost estimate based on amount of lights in image...? idk how this would work, talk to Justin