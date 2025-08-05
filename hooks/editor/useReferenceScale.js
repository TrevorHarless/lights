import { useCallback, useState } from "react";

export function useReferenceScale() {
  const [referenceLine, setReferenceLine] = useState(null);
  const [referenceLength, setReferenceLength] = useState(null); // in feet
  const [isSettingReference, setIsSettingReference] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [pendingReferenceLine, setPendingReferenceLine] = useState(null);

  // Start the reference line drawing mode
  const startReferenceMode = useCallback(() => {
    setIsSettingReference(true);
  }, []);

  // Cancel reference line drawing
  const cancelReferenceMode = useCallback(() => {
    setIsSettingReference(false);
    setPendingReferenceLine(null);
    setShowReferenceModal(false);
  }, []);

  // Called when user finishes drawing a reference line
  const handleReferenceLineComplete = useCallback((line) => {
    setPendingReferenceLine(line);
    setShowReferenceModal(true);
    setIsSettingReference(false);
  }, []);

  // Called when user confirms the reference length
  const confirmReferenceLength = useCallback(
    (lengthInFeet) => {
      if (pendingReferenceLine && lengthInFeet > 0) {
        setReferenceLine(pendingReferenceLine);
        setReferenceLength(parseFloat(lengthInFeet));
        setShowReferenceModal(false);
        setPendingReferenceLine(null);
      }
    },
    [pendingReferenceLine]
  );

  // Clear the reference line
  const clearReference = useCallback(() => {
    setReferenceLine(null);
    setReferenceLength(null);
  }, []);

  // Calculate the scale factor (pixels per foot)
  const getScaleFactor = useCallback(() => {
    if (!referenceLine || !referenceLength) return null;

    const { start, end } = referenceLine;
    const pixelLength = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    // Return pixels per foot
    const scaleFactor = pixelLength / referenceLength;

    // console.log('🔍 Scale Factor Debug:', {
    //   referenceLine,
    //   referenceLength,
    //   pixelLength,
    //   scaleFactor,
    // });

    return scaleFactor;
  }, [referenceLine, referenceLength]);

  // Convert real-world measurement to pixels
  const feetToPixels = useCallback(
    (feet) => {
      const scaleFactor = getScaleFactor();
      return scaleFactor ? feet * scaleFactor : null;
    },
    [getScaleFactor]
  );

  // Convert pixels to real-world measurement
  const pixelsToFeet = useCallback(
    (pixels) => {
      const scaleFactor = getScaleFactor();
      return scaleFactor ? pixels / scaleFactor : null;
    },
    [getScaleFactor]
  );

  // Calculate scaled light spacing based on real-world light spacing
  // Use 6 inches (0.5 feet) for better visual density on mobile screens
  const getScaledLightSpacing = useCallback(
    (lightSpacingInches = 6) => {
      const scaleFactor = getScaleFactor();
      if (!scaleFactor) return 30; // fallback to default pixel spacing

      const lightSpacingFeet = lightSpacingInches / 12; // convert inches to feet
      const spacing = lightSpacingFeet * scaleFactor; // convert to pixels

      // Ensure minimum spacing for usability (at least 8 pixels apart)
      const minSpacing = 8;
      const finalSpacing = Math.max(spacing, minSpacing);

      // console.log("🔍 Light Spacing Debug:", {
      //   scaleFactor,
      //   lightSpacingInches,
      //   lightSpacingFeet,
      //   calculatedSpacing: spacing,
      //   finalSpacing,
      // });

      return finalSpacing;
    },
    [getScaleFactor]
  );

  // Get the length of a line in real-world units
  const getLineLengthInFeet = useCallback(
    (start, end) => {
      const pixelLength = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      return pixelsToFeet(pixelLength);
    },
    [pixelsToFeet]
  );

  // Calculate light size scale factor based on reference
  // Standard holiday light bulbs are approximately 1 inch diameter
  const getLightSizeScale = useCallback(
    (lightDiameterInches = 1) => {
      const scaleFactor = getScaleFactor();
      if (!scaleFactor) return 1; // fallback to default size

      const lightDiameterFeet = lightDiameterInches / 12; // convert inches to feet
      const lightDiameterPixels = lightDiameterFeet * scaleFactor; // convert to pixels

      // Base light size is 30 pixels diameter (15 pixel radius * 2)
      const baseLightDiameter = 30;
      const sizeScale = lightDiameterPixels / baseLightDiameter;

      // Ensure minimum and maximum scale for usability
      const minScale = 0.3; // Don't let lights get smaller than 30% of original
      const maxScale = 3.0; // Don't let lights get larger than 300% of original
      const finalSizeScale = Math.min(Math.max(sizeScale, minScale), maxScale);

      // console.log("🔍 Light Size Debug:", {
      //   scaleFactor,
      //   lightDiameterInches,
      //   lightDiameterFeet,
      //   lightDiameterPixels,
      //   baseLightDiameter,
      //   calculatedSizeScale: sizeScale,
      //   finalSizeScale,
      // });

      return finalSizeScale;
    },
    [getScaleFactor]
  );

  return {
    // State
    referenceLine,
    referenceLength,
    isSettingReference,
    showReferenceModal,
    pendingReferenceLine,

    // Actions
    startReferenceMode,
    cancelReferenceMode,
    handleReferenceLineComplete,
    confirmReferenceLength,
    clearReference,

    // Calculations
    getScaleFactor,
    feetToPixels,
    pixelsToFeet,
    getScaledLightSpacing,
    getLightSizeScale,
    getLineLengthInFeet,

    // Helper to check if reference is set
    hasReference: referenceLine && referenceLength,
  };
}
