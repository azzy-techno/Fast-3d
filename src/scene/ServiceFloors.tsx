import { galleryOrder } from "./serviceGalleries";
import { ExhibitionFloor } from "./ElectricalFloor";

export function ServiceFloors() {
  return (
    <group name="stacked-service-floors">
      {galleryOrder.map((service) => (
        <ExhibitionFloor key={service} service={service} />
      ))}
    </group>
  );
}
