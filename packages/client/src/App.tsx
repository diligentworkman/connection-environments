import { styleMap } from "lit/directives/style-map.js";
import { adaptState } from "promethium-js";

export function App() {
  const count = adaptState(0);

  const fontStyles = {
    fontFamily: "sans-serif",
  };

  const containerStyles = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  };

  const headerStyles = {
    marginBottom: "10px",
  };

  const buttonStyles = {
    border: "2px solid black",
    borderRadius: "5px",
    backgroundColor: "#08759E",
    color: "white",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    fontSize: "24px",
  };

  const textStyles = {
    margin: "15px",
    fontSize: "22px",
    fontWeight: "600",
  };

  return () => (
    <div $attr:style={styleMap(containerStyles)}>
      <h1 $attr:style={styleMap({ ...fontStyles, ...headerStyles })}>
        Counter
      </h1>
      <div>
        <button
          $attr:style={styleMap({ ...fontStyles, ...buttonStyles })}
          on:click={() => count.set(count.value - 1)}
        >
          -
        </button>
        <span $attr:style={styleMap({ ...fontStyles, ...textStyles })}>
          {count.value}
        </span>
        <button
          $attr:style={styleMap({ ...fontStyles, ...buttonStyles })}
          on:click={() => count.set(count.value)}
        >
          +
        </button>
      </div>
    </div>
  );
}
