<script lang="ts">
    import type { NodeDefinition, NodeInstance } from "@connection-environments/core";
    import { Application } from "pixi.js";
    import { onMount } from "svelte";
    import { renderNode } from "./lib/render-node.js";

    let canvasHost: HTMLDivElement;
    let initializationError = $state<string | null>(null);

    onMount(() => {
        const application = new Application();
        let disposed = false;
        let initialized = false;

        async function initializeCanvas() {
            try {
                await application.init({
                    resizeTo: window,
                    background: 0x16171d,
                    antialias: true,
                    autoDensity: true,
                    resolution: window.devicePixelRatio || 1,
                });
                initialized = true;
                if (disposed) {
                    application.destroy({ removeView: true }, { children: true });

                    return;
                }
                // @user: Temporary trusted fixture, not an installed extension. Definition
                // supplies local drawing; instance supplies placement and property state.
                const definition: NodeDefinition = {
                    id: "host-preview:node",
                    extensionId: "host-preview",
                    label: "Preview node",
                    defaultProperties: {},
                    visual: {
                        elements: [
                            {
                                kind: "graphics",
                                commands: [
                                    { kind: "rect", x: 0, y: 0, width: 180, height: 80 },
                                    { kind: "fill", color: 0x293345, alpha: 1 },
                                    { kind: "stroke", color: 0x91b9ff, alpha: 1, width: 2 },
                                ],
                            },
                            {
                                kind: "text",
                                text: "Preview node",
                                x: 16,
                                y: 26,
                                style: {
                                    fontFamily: "sans-serif",
                                    fontSize: 20,
                                    fill: 0xf3f4f6,
                                },
                            },
                        ],
                    },
                };
                const instance: NodeInstance = {
                    id: "preview-node-1",
                    definitionId: definition.id,
                    properties: structuredClone(definition.defaultProperties),
                    position: { x: 80, y: 80 },
                };
                application.stage.addChild(renderNode(definition, instance));
                canvasHost.appendChild(application.canvas);
            } catch (error) {
                console.error("Failed to initialize graph canvas", error);
                if (!disposed) {
                    initializationError = "Could not initialize graph canvas.";
                }
            }
        }
        void initializeCanvas();

        return () => {
            disposed = true;
            if (initialized) {
                application.destroy({ removeView: true }, { children: true });
            }
        };
    });
</script>

<main aria-label="Graph workspace">
    <div class="canvas-host" bind:this={canvasHost}></div>
    {#if initializationError}
        <p role="alert">{initializationError}</p>
    {/if}
</main>

<style>
    main {
        position: fixed;
        inset: 0;
        background: #16171d;
        text-align: left;
    }

    .canvas-host {
        width: 100%;
        height: 100%;
    }

    .canvas-host :global(canvas) {
        display: block;
    }

    p {
        position: absolute;
        top: 1rem;
        left: 1rem;
        color: #f3f4f6;
    }
</style>
