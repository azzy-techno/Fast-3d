import { render } from "preact";
import "@fontsource-variable/sora";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource/cairo/arabic-400.css";
import "@fontsource/cairo/arabic-600.css";
import "@fontsource/cairo/arabic-700.css";
import "./ui/styles.css";
import { App } from "./ui/App";
import { initAudio } from "./audio";
import { initVoice } from "./voice";

render(<App />, document.getElementById("root")!);
initAudio();
initVoice();
