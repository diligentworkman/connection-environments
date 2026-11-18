import type {
  NodeDefinition,
  NodeInstance,
  NodeVisual,
} from "@connection-environments/core";
import { Container, Graphics, Text } from "pixi.js";

function renderVisual(visual: NodeVisual): Container {
  const container = new Container();

  try {
    for (const element of visual.elements) {
      switch (element.kind) {
        case "graphics": {
          const graphics = new Graphics();
          container.addChild(graphics);
          for (const command of element.commands) {
            switch (command.kind) {
              case "moveTo":
                graphics.moveTo(command.x, command.y);
                break;
              case "lineTo":
                graphics.lineTo(command.x, command.y);
                break;
              case "closePath":
                graphics.closePath();
                break;
              case "rect":
                graphics.rect(
                  command.x,
                  command.y,
                  command.width,
                  command.height,
                );
                break;
              case "circle":
                graphics.circle(command.x, command.y, command.radius);
                break;
              case "fill":
                graphics.fill({ color: command.color, alpha: command.alpha });
                break;
              case "stroke":
                graphics.stroke({
                  color: command.color,
                  alpha: command.alpha,
                  width: command.width,
                });
                break;
              default: {
                const unsupported: never = command;
                throw new Error(
                  `Unsupported graphics command: ${String(unsupported)}`,
                );
              }
            }
          }
          break;
        }
        case "text": {
          const text = new Text({ text: element.text, style: element.style });
          container.addChild(text);
          text.position.set(element.x, element.y);
          break;
        }
        case "group": {
          const group = renderVisual({ elements: element.children });
          container.addChild(group);
          group.position.set(element.x, element.y);
          group.rotation = element.rotation;
          break;
        }
        case "svg":
          throw new Error(
            "SVG rendering requires extension-scoped asset resolution.",
          );
        default: {
          const unsupported: never = element;
          throw new Error(`Unsupported visual element: ${String(unsupported)}`);
        }
      }
    }

    return container;
  } catch (error) {
    container.destroy({ children: true });
    throw error;
  }
}

export function renderNode(
  definition: NodeDefinition,
  instance: NodeInstance,
): Container {
  if (instance.definitionId !== definition.id) {
    throw new Error(`Node "${instance.id}" references a different definition.`);
  }
  const container = renderVisual(definition.visual);
  container.label = instance.id;
  container.position.set(instance.position.x, instance.position.y);

  return container;
}
