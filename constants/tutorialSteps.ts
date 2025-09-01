export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  buttonText?: string; // Custom button text (default: "Next")
  icon?: string; // MaterialIcons icon name to show
  waitForAction?: string; // Action to wait for before showing next step
}

export const EDITOR_TUTORIAL_STEPS: TutorialStep[] = [
  // === NAVIGATION TUTORIAL ===
  {
    id: 'welcome',
    title: '💡 Welcome to the Light Editor',
    message: 'Let\'s learn how to design light displays! First, let\'s explore how to navigate around your image.',
    buttonText: 'Let\'s Start!'
  },
  
  {
    id: 'zoom_and_pan',
    title: '👆 Zoom and Pan',
    message: 'You can zoom in/out and pan around your image using 2 fingers. Try pinching to zoom and dragging with 2 fingers to move around.',
    buttonText: 'Try it now!',
    waitForAction: 'zoom_or_pan_detected'
  },
  
  {
    id: 'reset_zoom',
    title: '🔄 Reset Zoom',
    message: 'Great! Now tap the reset zoom icon in the top right to fit the picture back to your screen.',
    buttonText: 'Got it!',
    icon: 'zoom-out-map',
    waitForAction: 'reset_zoom_clicked'
  },

  // === REFERENCE MEASUREMENT TUTORIAL ===
  {
    id: 'start_reference_tutorial',
    title: 'Reference Measurement',
    message: 'Perfect! Now let\'s set up a reference measurement for accurate sizing of your lights.',
    buttonText: 'Continue'
  },
  
  {
    id: 'explain_reference_measurement',
    title: 'Why Reference Measurement?',
    message: 'Setting a reference measurement helps ensure your lights are properly sized. We\'ll draw a line on something with a known length (like a garage or window).',
    buttonText: 'Got it!'
  },
  
  {
    id: 'click_ruler_icon',
    title: 'Click the Ruler Icon',
    message: 'Tap the ruler icon in the bottom toolbar to begin setting up your reference measurement.',
    buttonText: 'Got it!',
    icon: 'straighten',
    waitForAction: 'ruler_icon_clicked'
  },
  
  {
    id: 'draw_reference_line',
    title: 'Draw Reference Line',
    message: 'Now drag and drop to draw a line on something with a known length (like a garage or window). You\'ll enter the real-world measurement next.',
    buttonText: 'Start Drawing!',
    waitForAction: 'reference_measurement_taken'
  },
  
  // === STRING LIGHT/MODES TUTORIAL ===
  {
    id: 'reference_complete',
    title: '✅ Reference Set!',
    message: 'Perfect! Now let\'s learn about the different modes.',
    buttonText: 'Continue'
  },
  
  {
    id: 'explain_modes',
    title: 'Editor Modes',
    message: 'There are 4 modes:\n\n🧵 String Mode - Draw connected light strings\n👆 Tap Mode - Place individual lights\n⭐ Decor Mode - Add decorations\n📏 Measure Mode - Estimate real world measurements',
    buttonText: 'Next'
  },
  
  {
    id: 'switch_to_string_mode',
    title: 'Switch to String Mode',
    message: 'Now tap the mode button and choose "String Mode" to start placing lights.',
    buttonText: 'Got it!',
    icon: 'timeline',
    waitForAction: 'string_mode_selected'
  },
  
  {
    id: 'light_categories',
    title: 'Light Categories',
    message: 'Use this button in the bottom toolbar to choose what type of lights you want to use. There are many styles available!',
    buttonText: 'Got it!',
    icon: 'category',
    waitForAction: 'category_selection_closed'
  },
  
  {
    id: 'start_drawing',
    title: '✨ Ready to Draw!',
    message: 'Now you can start designing! Drag and drop to place lights. Use the toolbar at the bottom to change modes and light types.',
    buttonText: 'Got it!',
    waitForAction: 'first_string_light_drawn'
  },
  
  {
    id: 'dark_mode_feature',
    title: '🌙 Dark Mode',
    message: 'Try the Dark Mode button in the top toolbar! It simulates how your lights will look at night by darkening the background.',
    buttonText: 'Got it!',
    icon: 'nightlight-round',
    waitForAction: 'dark_mode_toggled'
  },
  
  {
    id: 'export_feature',
    title: '📷 Export Your Design',
    message: 'When you\'re happy with your design, use the Export button in the top toolbar to save your light display to your photo library!',
    buttonText: 'Continue',
    icon: 'file-download'
  },
  
  // === MEASURE MODE TUTORIAL ===
  {
    id: 'measure_mode_intro',
    title: '📏 Measure Mode',
    message: 'Let\'s explore one more useful feature - Measure Mode! This helps you estimate real-world distances.',
    buttonText: 'Continue'
  },
  
  {
    id: 'open_measure_mode',
    title: 'Open Modes Menu',
    message: 'Tap the mode button in the bottom toolbar to access the modes menu and select "Measure Mode".',
    buttonText: 'Got it!',
    icon: 'timeline',
    waitForAction: 'measure_mode_selected'
  },
  
  {
    id: 'explain_measure_mode',
    title: '📐 What is Measure Mode?',
    message: 'Measure Mode lets you estimate real-world distances like rooflines, walls, or spaces based on your reference measurement. Perfect for planning!',
    buttonText: 'Try it!'
  },
  
  {
    id: 'try_measuring',
    title: '📏 Try Measuring',
    message: 'Now drag and drop to measure the estimated length of something in your image. The measurement will show the real-world distance!',
    buttonText: 'Start Measuring!',
    waitForAction: 'measurement_line_drawn'
  },
  
  {
    id: 'tutorial_complete',
    title: '🎉 Tutorial Complete!',
    message: 'Congratulations! You\'ve learned all the key features of the Light Editor. You\'re ready to create amazing light displays!',
    buttonText: 'Finish Tutorial!'
  },
];

export const TUTORIAL_FLOWS = {
  editor_intro: EDITOR_TUTORIAL_STEPS,
  // Can add more tutorial flows here later
  // editor_advanced: ADVANCED_TUTORIAL_STEPS,
  // export_tutorial: EXPORT_TUTORIAL_STEPS,
} as const;