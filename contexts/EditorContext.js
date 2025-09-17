import React, { createContext, useContext } from "react";
import { useDecorShapes } from "~/hooks/editor/useDecorShapes";
import { useLightStrings } from "~/hooks/editor/useLightStrings";
import { useSingularLights } from "~/hooks/editor/useSingularLights";
import { useUndoSystem } from "~/hooks/editor/useUndoSystem";

const EditorContext = createContext();

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
};

export const EditorProvider = ({
  children,
  lightAssets = [],
  getScaledSpacing = null,
  getLightSizeScale = null,
}) => {
  // Create central undo system
  const undoSystem = useUndoSystem();

  // Initialize all editor hooks with the shared undo system
  const singularLightsHook = useSingularLights(lightAssets, undoSystem);
  const lightStringsHook = useLightStrings(
    lightAssets,
    getScaledSpacing,
    undoSystem,
    getLightSizeScale
  );
  const decorShapesHook = useDecorShapes(undoSystem);

  // Global undo function that works for all entity types
  const performUndo = () => {
    if (!undoSystem.canUndo) return false;

    const lastAction = undoSystem.peekLastAction();
    if (!lastAction) return false;

    // Route to appropriate hook's undo function based on action type
    if (lastAction.type.includes("SINGULAR_LIGHT")) {
      return singularLightsHook.undoLastAction();
    } else if (lastAction.type.includes("LIGHT_STRING")) {
      return lightStringsHook.undoLastAction();
    } else if (lastAction.type.includes("DECOR_SHAPE")) {
      return decorShapesHook.undoLastAction();
    }

    return false;
  };

  // Get user-friendly message for last action
  const getLastActionMessage = () => {
    const lastAction = undoSystem.peekLastAction();
    if (!lastAction) return null;

    const actionMessages = {
      ADD_SINGULAR_LIGHT: "Added light",
      DELETE_SINGULAR_LIGHT: "Deleted light",
      MOVE_SINGULAR_LIGHT: "Moved light",
      ADD_LIGHT_STRING: "Added light string",
      DELETE_LIGHT_STRING: "Deleted light string",
      MOVE_LIGHT_STRING: "Moved light string",
      ADD_DECOR_SHAPE: "Added decoration",
      DELETE_DECOR_SHAPE: "Deleted decoration",
      MOVE_DECOR_SHAPE: "Moved decoration",
      RESIZE_DECOR_SHAPE: "Resized decoration",
    };

    return actionMessages[lastAction.type] || "Last action";
  };

  const contextValue = {
    // Undo system
    undoSystem,
    canUndo: undoSystem.canUndo,
    performUndo,
    getLastActionMessage,
    clearUndoHistory: undoSystem.clearUndoHistory,

    // Editor hooks
    singularLights: singularLightsHook,
    lightStrings: lightStringsHook,
    decorShapes: decorShapesHook,

    // Convenience functions
    clearAll: () => {
      singularLightsHook.clearAllSingularLights();
      lightStringsHook.clearAllLightStrings();
      decorShapesHook.clearDecor();
    },

    // Load functions for persisted data
    loadEditor: (editorData) => {
      if (editorData.singularLights) {
        singularLightsHook.loadSingularLights(editorData.singularLights);
      }
      if (editorData.lightStrings) {
        lightStringsHook.loadLightStrings(editorData.lightStrings);
      }
      if (editorData.decorShapes) {
        decorShapesHook.loadDecor(editorData.decorShapes);
      }
      // Clear undo history after loading
      undoSystem.clearUndoHistory();
    },

    // Export current editor state
    exportEditor: () => ({
      singularLights: singularLightsHook.singularLights,
      lightStrings: lightStringsHook.lightStrings,
      decorShapes: decorShapesHook.decor,
    }),
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};
