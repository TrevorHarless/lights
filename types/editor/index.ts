export interface Point {
  x: number;
  y: number;
}

export interface Vector {
  start: Point;
  end: Point;
}

export interface LightString {
  id: string;
  start: Point;
  end: Point;
  assetId: string;
  spacing?: number;
  createdAt: number;
}

export interface LightAsset {
  id: string;
  name: string;
  spacing: number;
  renderFunction: (props: LightRenderProps) => JSX.Element;
}

export interface LightRenderProps {
  x: number;
  y: number;
  scale: number;
  gradientId: string;
}

export interface DrawingState {
  isDrawing: boolean;
  startPoint: Point | null;
  currentPoint: Point | null;
  selectedAssetId: string;
}

export interface SelectionState {
  selectedStringId: string | null;
  selectedEndpoint: 'start' | 'end' | null;
}

export interface EditorState {
  lightStrings: LightString[];
  drawing: DrawingState;
  selection: SelectionState;
  selectedAssetId: string;
  undoStack: LightString[][];
  redoStack: LightString[][];
}

export interface GestureState {
  isDragging: boolean;
  dragDistance: number;
  startTime: number;
}

export const GESTURE_CONSTANTS = {
  TAP_THRESHOLD: 10, // pixels
  TIME_THRESHOLD: 200, // milliseconds
  SELECTION_THRESHOLD: 20, // pixels for proximity selection
  UNDO_DELAY: 5000, // milliseconds
} as const;