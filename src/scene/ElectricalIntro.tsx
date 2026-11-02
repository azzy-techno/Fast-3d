import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { Box } from "./Primitives";

/** An entrance poster, facing visitors as the lift doors open. */
export function ElectricalIntro() {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1536;
    canvas.height = 768;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#102b37";
    c.fillRect(0, 0, 1536, 768);
    c.strokeStyle = "#2d5360";
    c.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      c.beginPath();
      c.moveTo(1030 + i * 60, 0);
      c.lineTo(1030 + i * 60, 210 + i * 45);
      c.lineTo(1430, 420 + i * 40);
      c.stroke();
      c.beginPath();
      c.arc(1430, 420 + i * 40, 7, 0, Math.PI * 2);
      c.stroke();
    }
    c.fillStyle = "#dfbe7c";
    c.font = "500 26px sans-serif";
    c.fillText("FAST O&M     /     LEVEL 11", 90, 100);
    c.fillStyle = "#f2f1e8";
    c.font = "600 116px sans-serif";
    c.fillText("ELECTRICAL", 80, 280);
    c.font = "400 76px sans-serif";
    c.fillText("SERVICES", 86, 365);
    c.font = "400 30px sans-serif";
    c.fillStyle = "#c2d8da";
    c.fillText("Powering the building. Connecting every system.", 90, 440);
    c.font = "400 32px Cairo, sans-serif";
    c.fillText("الخدمات الكهربائية — الطاقة والتحكم والربط", 90, 505);
    c.strokeStyle = "#a58e60";
    c.beginPath();
    c.moveTo(90, 560);
    c.lineTo(1446, 560);
    c.stroke();
    ["01  CONTRACTING", "02  AUTOMATION", "03  LV + ELV"].forEach(
      (label, i) => {
        c.font = "500 24px sans-serif";
        c.fillStyle = "#e4ca92";
        c.fillText(label, 90 + i * 465, 625);
      },
    );
    c.font = "400 23px sans-serif";
    c.fillStyle = "#bdd0d3";
    c.fillText(
      "16 guided stations   /   Choose your pace   /   Exit lift at the end",
      90,
      700,
    );
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <group
      position={[0, 2.7, 3.8]}
      rotation={[0, Math.PI, 0]}
      name="electrical-introduction-poster"
    >
      <Box p={[0, 0, -0.1]} s={[9.4, 4.8, 0.16]} c="#30464e" metal={0.6} />
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[9, 4.5]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      {[-4.62, 4.62].map((x) => (
        <Box key={x} p={[x, 0, 0]} s={[0.035, 4.6, 0.035]} c="#e6c483" glow />
      ))}
    </group>
  );
}
