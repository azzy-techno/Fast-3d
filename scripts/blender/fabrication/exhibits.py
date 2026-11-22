"""Build the sixteen FAST fabrication exhibits: blender -b -P scripts/blender/fabrication/exhibits.py"""
import math
import sys
from pathlib import Path
import bpy

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "electrical"))
from exhibits import box, tube, wire, loft, export_part, write_glb, materials, metal, paint

steel, bright, charcoal = "78909a", "ced6d3", "303c42"
primer, oxide, yellow, teal = "ad6950", "895143", "dfaa4e", "347976"
stone, ivory = "b8afa0", "e2e3dc"

# Shared transparent glazing so the hardware and guide remain visible through each panel.
glass = len(materials)
pane = bpy.data.materials.new("Architectural glazing")
pane.use_nodes = True
bs = pane.node_tree.nodes.get("Principled BSDF")
bs.inputs["Base Color"].default_value = (.43,.76,.80,1)
bs.inputs["Roughness"].default_value = .17
bs.inputs["Alpha"].default_value = .24
materials.append(pane)


def bolt(x,y,z,r=.062):
    tube((x,y,z),(x,y+.045,z),r,bright,metal,n=6)


def plate(x,y,z,w,d):
    box(x,y,z,w,.09,d,steel,metal)
    for dx in (-w*.34,w*.34):
        for dz in (-d*.34,d*.34): bolt(x+dx,y+.046,z+dz)


def profile_x(x,y,z,length,height,width,c=steel):
    for edge in (-1,1): box(x,y+edge*height*.43,z,length,.14*height,width,c,metal)
    box(x,y,z,length,height*.74,width*.15,c,metal)


def frame(x,y,z,w,h,d,c):
    for px in (x-w/2,x+w/2): box(px,y,z,.075,h,d,c,metal)
    for py in (y-h/2,y+h/2): box(x,py,z,w,.075,d,c,metal)


def front_bolt(x,y,z):
    tube((x,y,z),(x,y,z+.045),.065,bright,metal,n=6)


def skid():
    for z in (-.88,.88):
        profile_x(0,.48,z,5.65,.48,.29,oxide)
        for x in (-2.48,2.48):
            plate(x,.10,z,.57,.47)
            box(x,.22,z,.19,.21,.19,oxide)
    for x in (-2.65,-1.36,0,1.36,2.65):
        for y in (.31,.65): box(x,y,0,.28,.07,1.74,oxide,metal)
        box(x,.48,0,.065,.34,1.74,oxide,metal)
    for x in (-1.36,1.36):
        for z in (-.54,.54): plate(x,.74,z,.55,.46)
    for x in (-2.26,2.26):
        for z in (-.88,.88):
            # Open lifting eye with a machined bore.
            for i in range(18):
                a=i*math.tau/18;b=(i+1)*math.tau/18
                loft([[(x+r*math.cos(t),.87+r*math.sin(t),zz) for r,t in
                      [(.09,a),(.21,a),(.21,b),(.09,b)]] for zz in (z-.06,z+.06)],yellow,metal)


def tank():
    tube((0,.15,0),(0,2.64,0),1.23,"9db0ac",metal,n=52)
    tube((0,2.64,0),(0,2.97,0),1.25,bright,metal,r2=.16,n=52)
    for y in (.16,.99,1.82,2.63):
        tube((0,y-.02,0),(0,y+.02,0),1.245,steel,metal,n=52)
    tube((0,1.12,.96),(0,1.12,1.42),.39,teal,metal,n=32)
    tube((0,1.12,1.4),(0,1.12,1.49),.46,bright,metal,n=32)
    for i in range(10):
        a=i*math.tau/10;front_bolt(.39*math.cos(a),1.12+.39*math.sin(a),1.49)
    for z in (-.25,.28):
        tube((1.32,.08,z),(1.32,2.91,z),.04,steel)
    for i in range(10):
        tube((1.32,.29+i*.28,-.25),(1.32,.29+i*.28,.28),.032,steel)


def column(x,height,colour=primer,z=0):
    for dx in (-.14,.14): box(x+dx,height/2+.18,z,.064,height,.40,colour,metal)
    box(x,height/2+.18,z,.27,height,.057,colour,metal)
    plate(x,.11,z,.62,.68)


def structural():
    for x in (-2.18,2.18): column(x,2.50)
    profile_x(0,2.84,0,5.18,.40,.40,primer)
    for x in (-2.12,2.12):
        box(x,2.59,.08,.52,.40,.10,oxide)
        for dx in (-.14,.14): front_bolt(x+dx,2.6,.14)
    for y in (.62,1.43): box(0,y,.50,3.32,.10,.11,steel,metal)
    for i in range(6):
        x=-1.65+i*.55
        tube((x,.64 if i%2==0 else 1.41,.5),(x+.55,1.41 if i%2==0 else .64,.5),.046,steel)
    for x in (-1.60,1.60):box(x,.38,.50,.11,.42,.15,steel)


def cabinet_body(x,w,h,depth,colour):
    for xx in (x-w/2,x+w/2):box(xx,h/2+.2,0,.075,h,depth,colour,metal)
    for y in (.2,h+.2):box(x,y,0,w,.075,depth,colour,metal)
    box(x,h/2+.2,-depth/2,w,h,.065,colour,metal)


def control_panel():
    cabinet_body(-.70,2.45,2.55,.84,bright)
    box(-.71,1.48,-.33,2.13,2.29,.08,ivory)
    for y in (.72,1.36,2.02):
        box(-.74,y,-.21,1.92,.092,.11,steel)
        for i in range(6):
            x=-1.48+i*.29
            box(x,y+.05,-.10,.20,.33,.17,charcoal)
            box(x,y+.09,-.006,.13,.11,.024,teal)
    # Instrument door shown open beside the cabinet, front face visible.
    box(1.24,1.48,.41,1.36,2.53,.08,bright,metal)
    box(1.24,1.94,.46,.83,.57,.035,charcoal)
    box(1.24,1.94,.482,.66,.40,.022,"578e9b")
    for i,c in enumerate((teal,yellow,oxide)):
        tube((.87+i*.36,1.32,.45),(.87+i*.36,1.32,.51),.091,c)
    for x in (-1.74,.35,1.64): box(x,.11,0,.22,.22,.60,steel)


def kitchen_equipment():
    # Three fabricated basins, each with an open top and a drain.
    for x in (-2.18,2.18):
        for z in (-.54,.54):box(x,.74,z,.11,1.44,.11,steel,metal)
    box(0,.44,0,4.43,.08,1.09,bright,metal)
    for z in (-.70,.70):box(0,1.47,z,4.76,.11,.18,bright,metal)
    box(0,1.7,-.72,4.75,.49,.08,bright,metal)
    for x in (-2.30,-.76,.76,2.30):box(x,1.47,0,.15,.11,1.30,bright,metal)
    for x in (-1.54,0,1.54):
        box(x,1.02,0,1.34,.07,1.03,steel,metal)
        for dx in (-.68,.68):box(x+dx,1.24,0,.055,.46,1.08,bright,metal)
        for z in (-.55,.55):box(x,1.24,z,1.36,.46,.055,bright,metal)
        tube((x,1.05,0),(x,1.07,0),.11,charcoal)
    for x in (-.76,.76):
        wire([(x,1.53,-.61),(x,2.10,-.61),(x,2.16,-.29),(x,2.05,-.17)],.046,bright,metal)


def ancillaries():
    # Skid service stair, serrated treads and removable tubular handrails.
    for z in (-.68,.68):
        tube((-2.22,.18,z),(.80,1.76,z),.10,steel)
        for x,y in [(-2.13,.22),(-.72,.96),(.81,1.74),(2.15,1.74)]:
            tube((x,y,z),(x,y+1,z),.045,yellow)
        wire([(-2.22,1.22,z),(.81,2.74,z),(2.24,2.74,z)],.055,yellow,metal)
    for i in range(6):
        x=-2+i*.50;y=.28+i*.26
        for strip in range(4):box(x+(strip-1.5)*.097,y,0,.073,.064,1.35,steel,metal)
    box(1.48,1.73,0,1.57,.12,1.46,steel,metal)
    for z in (-.6,.6):box(2.12,.88,z,.14,1.66,.14,steel)


def finish():
    # A blast pot on wheels and three finish samples in a drying rack.
    tube((-1.62,.68,0),(-1.62,1.74,0),.53,primer,n=32)
    tube((-1.62,.38,0),(-1.62,.68,0),.16,primer,r2=.53,n=32)
    tube((-1.62,1.74,0),(-1.62,1.92,0),.53,primer,r2=.29,n=32)
    for z in (-.46,.46):
        tube((-1.87,.27,z-.08),(-1.87,.27,z+.08),.26,charcoal,n=24)
    wire([(-1.60,.42,.08),(-1.22,.11,.44),(-.54,.12,.92),(.03,.77,.70)],.078,charcoal)
    tube((.03,.77,.70),(.38,.98,.66),.098,bright,r2=.04)
    for x,colour in ((.45,"786959"),(1.25,oxide),(2.05,teal)):
        box(x,1.35,-.27,.72,1.72,.10,colour,metal)
        box(x,.37,-.27,.15,.53,.24,steel)
    box(1.23,.14,-.27,2.64,.20,.95,steel)


def erection():
    # A bolted splice and an erection cleat at the top of an anchored column.
    column(-1.38,2.29)
    profile_x(.05,2.60,0,3.57,.39,.39,primer)
    profile_x(2.21,2.60,0,.73,.39,.39,steel)
    box(1.83,2.60,.073,.67,.31,.09,steel,metal)
    for x in (1.58,1.75,1.93,2.10):
        for y in (2.52,2.68):front_bolt(x,y,.123)
    for z in (-.11,.11):
        tube((-1.37,1.96,z),(-.66,2.42,z),.081,oxide)
    box(-1.38,.11,0,1.20,.21,.98,stone)
    plate(-1.38,.26,0,.66,.72)


def enclosure():
    cabinet_body(-.52,2.52,2.45,.98,bright)
    frame(-.52,1.43,.51,2.46,2.34,.07,charcoal)
    box(-.55,1.42,-.36,2.18,2.1,.07,ivory)
    for x in (-1.39,.31):
        for y in (.55,2.24):front_bolt(x,y,-.30)
    box(1.61,1.43,.49,1.60,2.45,.07,bright,metal)
    frame(1.61,1.43,.535,1.44,2.27,.035,charcoal)
    for y in (.62,2.15):box(2.29,y,.60,.11,.21,.10,steel)
    for x in (-1.68,-.48,.66):box(x,.12,0,.17,.24,.77,steel)


def canopy():
    for x in (-2.44,2.44):
        for z in (-.69,.69):
            column(x,1.94,steel,z)
    for z in (-.70,.70):
        for y in (2.12,2.86): box(0,y,z,5.38,.12,.15,primer,metal)
        for i in range(8):
            x=-2.64+i*.66
            tube((x,2.15 if i%2==0 else 2.84,z),(x+.66,2.84 if i%2==0 else 2.15,z),.052,steel)
    for i in range(8):box(-2.55+i*.73,2.97,0,.10,.10,1.70,steel,metal)


def railing():
    box(0,.25,0,5.4,.49,.68,stone)
    for x in (-2.38,0,2.38):
        plate(x,.55,0,.37,.38)
        tube((x,.60,0),(x,2.13,0),.070,bright,n=24)
    tube((-2.61,2.17,0),(2.61,2.17,0),.070,bright,n=24)
    for x in (-1.19,1.19):
        box(x,1.36,.05,2.20,1.32,.04,"a7cdd2",glass)
        for dx in (-1.04,1.04):
            for y in (.90,1.82):box(x+dx,y,.07,.20,.115,.13,bright,metal)


def bollards():
    box(0,.11,0,5.05,.21,1.62,stone)
    for i,x in enumerate((-1.7,0,1.7)):
        tube((x,.22,0),(x,1.79,0),.24,bright,metal,n=28)
        tube((x,1.79,0),(x,1.87,0),.24,bright,metal,r2=.18,n=28)
        tube((x,1.52,0),(x,1.63,0),.245,teal,n=28)
        plate(x,.27,0,.71,.71)


def rails():
    for x in (-2.1,-.7,.7,2.1):
        box(x,.37,0,.53,.33,2.27,stone)
    for z in (-.69,.69):
        # Rolled rail section: broad foot, narrow web, rounded running head.
        box(0,.57,z,5.48,.092,.35,steel,metal)
        box(0,.74,z,5.48,.29,.083,steel,metal)
        box(0,.92,z,5.48,.12,.18,bright,metal)
        for x in (-2.1,-.7,.7,2.1):
            for dz in (-.20,.20):
                box(x,.58,z+dz,.24,.09,.14,oxide)
                bolt(x,.64,z+dz,.044)


def glazing():
    # A glazed personnel door with adjacent fixed light in extruded aluminium.
    for x,w in ((-1.05,1.71),(1.03,2.23)):
        frame(x,1.51,0,w,2.71,.16,bright)
        box(x,1.51,0,w-.12,2.57,.035,"abcfd1",glass)
    frame(-1.05,1.52,.093,1.51,2.52,.08,steel)
    box(-.51,1.36,.17,.39,.055,.11,bright,metal)
    for y in (.48,1.5,2.57):box(-1.84,y,.1,.09,.20,.09,charcoal)
    box(1.03,1.68,.04,2.23,.071,.11,bright,metal)
    box(0,.09,0,4.63,.18,.64,stone)


def brackets():
    # Enlarged sectional ceiling slice with twin strut channels, gussets and drop rods.
    for x in (-1.93,1.93):box(x,1.48,-.60,.17,2.87,.22,steel)
    box(0,2.92,-.12,4.58,.26,1.36,stone)
    for x in (-1.29,1.29):
        for z in (-.4,.34):
            box(x,2.75,z,.34,.09,.29,bright,metal)
            tube((x,1.43,z),(x,2.77,z),.046,bright)
            for y in (1.48,2.68):
                tube((x,y-.035,z),(x,y+.035,z),.089,charcoal,n=6)
    for z in (-.4,.34):
        box(0,1.42,z,3.49,.07,.24,steel,metal)
        for dz in (-.10,.10):box(0,1.49,z+dz,3.49,.13,.041,steel,metal)
    for x in (-1.29,1.29):box(x,1.30,0,.22,.14,1.15,primer,metal)


def cabinets():
    # Plinth and worktop, with a bank of drawers and a separate open shelf bay.
    box(0,.18,0,4.76,.28,1.04,charcoal)
    for x in (-2.35,-.82,.78,2.35):box(x,1.03,0,.085,1.54,1.10,bright,metal)
    for y in (.34,1.83):box(0,y,0,4.81,.09,1.20,bright,metal)
    box(0,1.04,-.53,4.70,1.54,.06,steel)
    box(0,1.99,-.56,4.81,.31,.055,bright,metal)
    for i in range(3):
        y=.61+i*.46
        box(-1.58,y,.59,1.41,.41,.10,bright,metal)
        box(-1.58,y+.06,.68,.56,.049,.10,charcoal)
    for x in (-.39,.38):
        box(x,1.08,.58,.71,1.32,.085,bright,metal)
        box(x*.35,1.34,.68,.047,.23,.10,charcoal)
    box(1.56,1.04,0,1.53,.065,1.07,bright,metal)


builders=[skid,tank,structural,control_panel,kitchen_equipment,ancillaries,finish,erection,
          enclosure,canopy,railing,bollards,rails,glazing,brackets,cabinets]
for i,build in enumerate(builders,1):
    build()
    export_part(f"Exhibit{i:02}")
write_glb(Path.cwd() / "public/assets/fabrication/exhibits.glb")
