import { Box, Cylinder, Pipe } from "./Primitives";
import { StaticInstances } from "./StaticInstances";
/** Real geometry for the roof: no image containing painted equipment/shadows. */
export function RooftopPlant() {
  return (
    <group name="modeled-rooftop-plant" position={[0, 23, 0]}>
      <StaticInstances>
        <Box
          p={[0, -0.04, -1]}
          s={[31.5, 0.08, 18.5]}
          c="#acb5b2"
          metal={0.08}
        />
        {[-12, -8, -4, 0, 4, 8, 12].map((x) => (
          <Box
            key={x}
            p={[x, 0.005, -1]}
            s={[0.018, 0.012, 18]}
            c="#8a9491"
            metal={0}
          />
        ))}
        {[-7, -3, 1, 5].map((z) => (
          <Box
            key={z}
            p={[0, 0.008, z]}
            s={[31, 0.012, 0.018]}
            c="#8a9491"
            metal={0}
          />
        ))}
        {/* Air handling unit on concrete plinths, filter banks and service doors. */}
        <group position={[-10, 0, -2]}>
          {[-2, 2].map((z) => (
            <Box
              key={z}
              p={[0, 0.18, z]}
              s={[5.1, 0.35, 0.45]}
              c="#c5c3b8"
              metal={0}
            />
          ))}
          <Box p={[0, 1.4, 0]} s={[4.7, 2.1, 5.3]} c="#a6b3b8" metal={0.65} />
          {[-1.45, 0, 1.45].map((x) => (
            <group key={x}>
              <Box
                p={[x, 1.4, 2.68]}
                s={[1.35, 1.9, 0.08]}
                c="#c1ccd0"
                metal={0.6}
              />
              <Box
                p={[x + 0.45, 1.3, 2.75]}
                s={[0.06, 0.4, 0.06]}
                c="#354449"
              />
            </group>
          ))}
          {Array.from({ length: 13 }, (_, i) => (
            <Box
              key={i}
              p={[-2.37, 0.55 + i * 0.13, 0]}
              s={[0.05, 0.05, 4.8]}
              c="#4c5e64"
              metal={0.5}
            />
          ))}
          <Box
            p={[0, 2.52, 0]}
            s={[4.85, 0.12, 5.45]}
            c="#c2cdd0"
            metal={0.7}
          />
        </group>
        {/* Rectangular supply/return ducts with raised flanges and supports. */}
        {[-7.6, -5.7].map((z, j) => (
          <group key={z}>
            <Box
              p={[-5, 1.15, z]}
              s={[10, 1.25, 1.3]}
              c={j ? "#a4b3bc" : "#bcc8cc"}
              metal={0.72}
            />
            {Array.from({ length: 9 }, (_, i) => (
              <group key={i} position={[-9.5 + i * 1.15, 0, z]}>
                <Box
                  p={[0, 1.15, 0]}
                  s={[0.08, 1.39, 1.44]}
                  c="#879aa4"
                  metal={0.7}
                />
                <Box p={[0, 0.25, 0]} s={[0.16, 0.5, 1.65]} c="#647c85" />
              </group>
            ))}
            <Box
              p={[0.65, 0.65, z]}
              s={[1.3, 2.2, 1.3]}
              c="#afbdc5"
              metal={0.7}
            />
            <Box
              p={[0.65, 1.73, z]}
              s={[1.45, 0.13, 1.45]}
              c="#cfdbdc"
              metal={0.65}
            />
          </group>
        ))}
        {/* Chilled-water headers, flanges, valve wheels and return risers. */}
        {[-0.34, 0.34].map((offset, j) => (
          <group key={j}>
            <Pipe
              a={[-12, 0.55, 4 + offset]}
              b={[4, 0.55, 4 + offset]}
              radius={0.16}
              c={j ? "#436f82" : "#63949e"}
            />
            <Pipe
              a={[-12, 0.55, 4 + offset]}
              b={[-12, 0.55, 1]}
              radius={0.16}
              c={j ? "#436f82" : "#63949e"}
            />
            <Pipe
              a={[4, 0.55, 4 + offset]}
              b={[4, 0.55, 2]}
              radius={0.16}
              c={j ? "#436f82" : "#63949e"}
            />
            {[-11, -8, -5, -2, 1, 3].map((x) => (
              <Cylinder
                key={x}
                p={[x, 0.55, 4 + offset]}
                radius={0.23}
                height={0.075}
                r={[0, 0, Math.PI / 2]}
                c="#829ca4"
              />
            ))}
          </group>
        ))}
        {[-10, -6, -2, 3].map((x) => (
          <group key={x}>
            <Box p={[x, 0.16, 4]} s={[0.22, 0.3, 1.5]} c="#d2cec0" metal={0} />
            <Pipe
              a={[x, 0.55, 3.66]}
              b={[x, 1, 3.66]}
              radius={0.035}
              c="#62777f"
            />
            <mesh position={[x, 1.03, 3.66]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.17, 0.024, 8, 20]} />
              <meshStandardMaterial
                color="#9e4936"
                metalness={0.5}
                roughness={0.35}
              />
            </mesh>
          </group>
        ))}
        {/* Cable ladder with individual rungs, drain gratings and raised service paths. */}
        {[-14.3, -13.7].map((x) => (
          <Box
            key={x}
            p={[x, 0.23, -1]}
            s={[0.06, 0.18, 15]}
            c="#879da6"
            metal={0.75}
          />
        ))}
        {Array.from({ length: 35 }, (_, i) => (
          <Box
            key={i}
            p={[-14, 0.16, -8 + i * 0.42]}
            s={[0.6, 0.045, 0.04]}
            c="#a2b5bd"
            metal={0.7}
          />
        ))}
        {[-13, 13].flatMap((x) =>
          [-8, 7].map((z) => (
            <group key={`${x}-${z}`}>
              <Box p={[x, 0.02, z]} s={[0.6, 0.035, 0.6]} c="#35474c" />
              {[-0.2, -0.1, 0, 0.1, 0.2].map((a) => (
                <Box
                  key={a}
                  p={[x + a, 0.05, z]}
                  s={[0.035, 0.025, 0.55]}
                  c="#91a2a8"
                />
              ))}
            </group>
          )),
        )}
        {Array.from({ length: 10 }, (_, i) => (
          <Box
            key={i}
            p={[10.7, 0.025, 6.8 - i * 1.05]}
            s={[2.7, 0.05, 0.94]}
            c="#d3d0bf"
            metal={0}
          />
        ))}
        {[-15.4, 15.4].map((x) => (
          <group key={x}>
            <Pipe
              a={[x, 1.05, -9]}
              b={[x, 1.05, 8]}
              radius={0.035}
              c="#9aafb6"
            />
            {[-8, -4, 0, 4, 8].map((z) => (
              <Cylinder
                key={z}
                p={[x, 0.53, z]}
                radius={0.035}
                height={1.06}
                c="#95aab2"
              />
            ))}
          </group>
        ))}
      </StaticInstances>
    </group>
  );
}
