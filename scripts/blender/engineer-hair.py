"""A swept crop for the FAST engineer, modelled in the Head joint's local metres."""
import bpy
from math import sin, cos, pi, exp
from pathlib import Path
import sys

bpy.ops.wm.read_factory_settings(use_empty=True)
verts, faces, slots = [], [], []

def scalp(angle, t, lift=0):
    front = cos(angle)
    limit = 1.64 - .50*front + .12*sin(angle)*max(0,front)
    polar = limit*t
    wave = sin(polar)
    quiff = .021*exp(-((t-.43)/.32)**2)*max(0,front)
    x = (.09+lift)*sin(angle)*wave - .017*(1-t)**1.4
    y = .095 + (.12+lift)*cos(polar) + quiff
    z = .016 + (.110+lift)*cos(angle)*wave
    return (x,-z,y)

def surface(rows, closed, material):
    first=len(verts)
    width=len(rows[0])
    for row in rows: verts.extend(row)
    for j in range(len(rows)-1):
        for i in range(width if closed else width-1):
            a=first+j*width+i
            b=first+j*width+(i+1)%width
            faces.append((a,b,b+width,a+width))
            slots.append(material)

surface([[scalp(2*pi*i/72,j/24) for i in range(72)] for j in range(25)], True, 0)
# Narrow raised locks sweep from the crown, tapering into the temple fade.
for i in range(86):
    start=i*2*pi/86
    rows=[]
    for j in range(20):
        u=j/19
        t=.05+.94*u
        angle=start+.84*(1-u)**1.4+.035*sin(4*u+i)
        width=.032*(.12+.88*sin(pi*u)**.55)
        depth=.0027*(.2+.8*sin(pi*u))*(1+.28*sin(i*8.19))
        rows.append([scalp(angle+width*k,t,.00025+depth*(1-k*k)) for k in [-1,-.5,0,.5,1]])
    surface(rows,False,1+i%4)
mesh=bpy.data.meshes.new("Side parted crop")
mesh.from_pydata(verts,[],faces)
mesh.update()
obj=bpy.data.objects.new("Engineer haircut",mesh)
bpy.context.collection.objects.link(obj)
for value in [.021,.025,.029,.034,.023]:
    mat=bpy.data.materials.new("Dark chestnut")
    mat.use_nodes=True
    shader=mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value=(value,value*.63,value*.43,1)
    shader.inputs["Roughness"].default_value=.65
    mesh.materials.append(mat)
for poly,slot in zip(mesh.polygons,slots):
    poly.material_index=slot
    poly.use_smooth=True
# The inside surface is never visible; orient the cap and groom towards the light.
import bmesh
bm=bmesh.new();bm.from_mesh(mesh)
bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
for face in bm.faces:
    center=face.calc_center_median()
    if face.normal.dot(center - __import__("mathutils").Vector((0,-.016,.095)))<0:
        face.normal_flip()
bm.to_mesh(mesh);bm.free()
bpy.ops.export_scene.gltf(filepath=str(Path(sys.argv[-1]).resolve()))
