# Electrical hall modelling references

The exhibits are original service illustrations at gallery scale. FAST’s **Electrical Pre-Qualification 2026**, pages 7–9 and 18–21, supplied project-specific visual references for the coupled RMU bays, cable terminations and buried runs, transformer fins, pillar fuse ways, meter wiring, louvred generator enclosure and installed lighting. The source document is the company profile supplied with the project.

Additional photographs inspected during modelling:

| Photograph | Detail used |
| --- | --- |
| [Nova Electrical Switchgear, draw-out MCC](https://github.com/MoulieshN/Nova-electrical-switchgear/blob/HEAD/images/Drawout_type_MCC_Panel.jpeg) | Repeated steel sections, drawer proportions and recessed breaker faces |
| [Interallied, distribution switchboard](https://github.com/Farhan-Ahm/interallied/blob/HEAD/public/products/dis-swb.jpg) | Incoming breaker compartments and rows of narrower outgoing ways |
| [Interallied, transformer](https://github.com/Farhan-Ahm/interallied/blob/HEAD/public/products/pt-2000.jpeg) | Tank, top bushings and external cooling surfaces |
| [OpenEnergyMonitor, current sensors](https://github.com/openenergymonitor/docs/blob/HEAD/main/applications/img/solar-pv/CTs-on-cables-333mV.webp) | Split-core sensor body and insulated conductor passing through the window |
| [Nova Electrical Switchgear, drive and PLC panel](https://github.com/MoulieshN/Nova-electrical-switchgear/blob/HEAD/images/Drive_With_PLC.jpeg) | Grouped modules, terminal rows and wire ducts |
| [Megavents, axial blower](https://github.com/punith112/Megavents-Rice-Mill-Air-Handling-Systems-/blob/HEAD/images/axial_blower_wm.jpg) | Cylindrical casing, impeller hub and welded support frame |
| [FAST electrical automation](https://fast-arabia.com/assets/img/elec-scope-2.webp) and [FAST electrical contracting](https://fast-arabia.com/assets/img/elec-scope-1.webp) | Modular protective devices and handheld commissioning instruments |

Instrument legends, enclosure geometry and finishes are authored for the tour. The diagnostic readings illustrate the rendered instruments. The exhibits do not identify an installed OEM or equipment rating at a particular site.

Rebuild from the repository root with `blender -b --python-exit-code 1 -P scripts/blender/electrical/exhibits.py`. This uses Pillow with DejaVu Sans and the repository’s glTF Transform installation.
