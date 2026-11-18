export interface Point {
  x: number;
  y: number;
}

export interface NodeDefinition {
  id: string;
  extensionId: string;
  label: string;
  defaultProperties: Record<string, unknown>;
  visual: NodeVisual;
}

export interface NodeInstance {
  id: string;
  definitionId: string;
  properties: Record<string, unknown>;
  position: Point;
}

export interface NodeVisual {
  elements: VisualElement[];
}

export type VisualElement =
  | {
      kind: "graphics";
      commands: GraphicsCommand[];
    }
  | {
      kind: "text";
      text: string;
      x: number;
      y: number;
      style: TextStyle;
    }
  | {
      kind: "svg";
      assetId: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      kind: "group";
      x: number;
      y: number;
      rotation: number;
      children: VisualElement[];
    };

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fill: number;
}

/** Drawing colors are RGB integers; alpha ranges from 0 to 1. */
export type GraphicsCommand =
  | { kind: "moveTo"; x: number; y: number }
  | { kind: "lineTo"; x: number; y: number }
  | { kind: "closePath" }
  | { kind: "rect"; x: number; y: number; width: number; height: number }
  | { kind: "circle"; x: number; y: number; radius: number }
  | { kind: "fill"; color: number; alpha: number }
  | { kind: "stroke"; color: number; alpha: number; width: number };
