"""Blender 5.2: approximate visual reconstruction from the supplied PNG.

Run: blender --background --python scripts/property-media/create-floor-plan-model.py
The PNG supplies relative layout only; pixel coordinates are not surveyed dimensions.
QA renders and .blend are written outside public assets, to a temporary directory.
"""
import bpy
import bmesh
import hashlib
import json
import math
import struct
import sys
import tempfile
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "public/images/floor-plan-showcase.png"
OUTPUT = ROOT / "public/models/property-media/floor-plan/floor-plan-showcase.glb"
QA = Path(tempfile.mkdtemp(prefix="ex-property-floor-plan-qa-"))
source_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
assert not OUTPUT.exists() or "--replace-generated" in sys.argv, "Refuse to overwrite an existing GLB without explicit review."
bpy.ops.wm.read_factory_settings(use_empty=True)

def material(name, color, roughness=.65, metal=0, alpha=1):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.diffuse_color = (*color, alpha)
    p = m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (*color, alpha)
    p.inputs["Roughness"].default_value = roughness
    p.inputs["Metallic"].default_value = metal
    p.inputs["Alpha"].default_value = alpha
    if alpha < 1:
        m.surface_render_method = "DITHERED"
    return m

ivory = material("Warm ivory plaster", (.76,.72,.63))
stone = material("Neutral limestone", (.67,.64,.57))
wood = material("Warm oak", (.35,.19,.083))
wood_light = material("Oak face", (.46,.29,.14))
fabric = material("Ivory upholstery", (.79,.75,.66), .92)
linen = material("Warm white linen", (.88,.84,.75), .96)
sage = material("Sage textile", (.28,.32,.21), .94)
dark = material("Charcoal metal", (.045,.047,.043), .35, .35)
bathstone = material("Bathroom grey stone", (.37,.39,.37))
white = material("Ceramic", (.89,.87,.82), .28)
glass = material("Neutral glazing", (.64,.76,.77), .12, 0, .19)
rug = material("Woven oatmeal rug", (.57,.51,.41), 1)
gold = material("Muted champagne hardware", (.48,.36,.18), .35, .65)

# Source image positions -> Blender XY. Blender Z-up converts to glTF Y-up on export.
def xy(x,y): return ((x-725)*.01, (490-y)*.01)

def finish(obj, name, mat):
    obj.name = name
    obj.data.materials.append(mat)
    return obj

def box(name, x1,y1,x2,y2,z,h,mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(*xy((x1+x2)/2,(y1+y2)/2), z+h/2))
    obj = bpy.context.object
    obj.dimensions = (abs(x2-x1)*.01, abs(y2-y1)*.01, h)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    finish(obj,name,mat)
    if bevel:
        mod = obj.modifiers.new("Small physical edge", "BEVEL")
        mod.width = bevel
        mod.segments = 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj

def cylinder(name,x,y,r,z,h,mat,vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=r*.01, depth=h, location=(*xy(x,y),z+h/2))
    return finish(bpy.context.object,name,mat)

def slab(name,points,z,h,mat):
    n=len(points)
    verts=[(*xy(x,y),height) for height in (z,z+h) for x,y in points]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    bm=bmesh.new(); bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces)); bm.to_mesh(mesh); bm.free()
    obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj)
    return finish(obj,name,mat)

H=1.35
Z=.20
def wall(name,x1,y1,x2,y2): return box(name,x1,y1,x2,y2,Z,H,ivory)
def window(name,x1,y1,x2,y2):
    box(name+" sill wall",x1,y1,x2,y2,Z,.42,ivory)
    box(name+" frame bottom",x1,y1,x2,y2,Z+.42,.05,dark)
    box(name+" frame top",x1,y1,x2,y2,Z+1.22,.05,dark)
    if x2-x1 > y2-y1:
        cy=(y1+y2)/2
        box(name+" glazing",x1,cy-1,x2,cy+1,Z+.47,.75,glass)
        for x in (x1,(x1+x2)/2,x2-3): box(name+" mullion",x,y1,x+3,y2,Z+.47,.75,dark)
    else:
        cx=(x1+x2)/2
        box(name+" glazing",cx-1,y1,cx+1,y2,Z+.47,.75,glass)
        for y in (y1,(y1+y2)/2,y2-3): box(name+" mullion",x1,y,x2,y+3,Z+.47,.75,dark)

footprint=[(50,25),(150,25),(160,45),(345,45),(345,25),(570,25),(590,115),(895,115),(895,25),(1400,25),(1400,930),(940,930),(920,960),(110,960),(110,395),(50,370)]
slab("Continuous structural floor slab",footprint,0,Z,stone)

# Bedroom, wet-area and balcony finishes are shallow solid meshes.
for name,rect,mat in [
    ("Bedroom west oak",(70,75,411,329),wood),
    ("Master bedroom oak",(925,74,1385,383),wood),
    ("Bedroom southeast oak",(943,567,1385,888),wood),
    ("West bathroom stone",(436,65,568,331),bathstone),
    ("East bathroom stone",(1068,416,1385,549),bathstone),
    ("Laundry stone",(935,537,1042,658),bathstone),
    ("Balcony finish",(130,820,564,932),stone),
]: box(name,*rect,Z,.018,mat)

# Exterior footprint: the visible glazing is segmented by genuine wall volumes.
wall("West bedroom outside",50,25,73,370)
wall("West bedroom NW pier",73,25,150,75)
window("West bedroom north window",150,45,345,64)
wall("North central pier",345,25,437,72)
window("Bathroom north window",437,44,547,63)
wall("Bathroom NE pier",547,25,572,115)
wall("Kitchen NW step",572,96,600,139)
window("Kitchen north window",600,115,815,136)
wall("Kitchen NE pier",815,115,923,143)
wall("Master NW pier",895,25,925,143)
window("Master north window",925,43,1235,64)
wall("Master north solid",1235,25,1400,73)
wall("Master east wall",1380,73,1400,417)
window("East bathroom window",1380,417,1400,550)
wall("Southeast east wall",1380,550,1400,930)
wall("Southeast corner",1340,888,1400,930)
window("Southeast bedroom south window",1020,888,1340,909)
wall("Southeast south pier",920,888,1020,930)
wall("Entry south wall",710,920,920,960)
wall("Entry west pier",565,820,630,960)
window("Balcony south glazing",130,933,565,953)
wall("Balcony west parapet",110,802,131,953)
window("Living west glazing",112,635,132,802)
wall("Living west wall",112,363,132,635)
wall("Bedroom SW return",50,329,145,370)
window("West bedroom internal glazed edge",145,329,301,348)
wall("West bedroom south short return",381,329,432,351)
wall("West bedroom bath partition",410,70,433,329)
wall("Bath kitchen partition",570,115,592,365)
wall("Bathroom entrance return",500,330,570,351)
wall("Master kitchen partition",900,141,922,349)
wall("Master door pier",900,349,938,422)
wall("Master south bath wall",1008,386,1380,407)
wall("Bathroom west partition",1046,412,1068,548)
wall("Bathroom south partition",1068,548,1380,570)
wall("Laundry north partition",916,515,1046,537)
wall("Laundry west partition",916,537,935,672)
wall("Laundry bedroom partition",1046,548,1068,678)
wall("Laundry sill enclosure",935,658,1068,678)
wall("Bedroom entrance south return",916,755,942,888)
wall("Bedroom west lower wall",916,888,940,930)
window("Living balcony glazing",132,799,565,819)

# Visible door leaves; open gaps remain in partitions. No hidden corridors inferred.
def door(name,x,y,width,angle):
    obj=box(name,x,y,x+width,y+4,Z,1.13,wood_light,.008)
    # Move mesh relative to hinge, then rotate around that real hinge.
    hinge=Vector((*xy(x,y),Z))
    shift=obj.location-hinge
    for v in obj.data.vertices: v.co += shift
    obj.location=hinge; obj.rotation_euler.z=math.radians(angle)
door("West bedroom open door",381,330,76,145)
door("West bathroom open door",500,335,61,145)
door("Master open door",936,403,77,45)
door("Southeast bedroom open door",940,676,78,-50)
door("Entrance open door",632,941,80,35)

def bed(name,x1,y1,x2,y2,head="north"):
    box(name+" frame",x1,y1,x2,y2,Z+.04,.20,wood,.035)
    box(name+" mattress",x1+3,y1+3,x2-3,y2-3,Z+.24,.21,linen,.055)
    if head=="north":
        box(name+" headboard",x1-3,y1-7,x2+3,y1+2,Z,.75,fabric,.035)
        w=(x2-x1-18)/2
        for i in range(2): box(name+" pillow",x1+6+i*(w+5),y1+10,x1+6+i*(w+5)+w,y1+43,Z+.45,.11,linen,.05)
        box(name+" sage throw",x1+3,y2-65,x2-3,y2-8,Z+.454,.026,sage,.014)
    else:
        box(name+" headboard",x1-7,y1-3,x1+2,y2+3,Z,.75,fabric,.035)
        for y in (y1+6,(y1+y2)/2+3): box(name+" pillow",x1+9,y,x1+40,y+55,Z+.45,.11,linen,.05)
        box(name+" sage throw",x2-67,y1+3,x2-8,y2-3,Z+.454,.026,sage,.014)
bed("West bedroom",103,107,314,270,"west")
bed("Master bed",1030,97,1228,342)
bed("Southeast bed",1095,576,1298,819)
for name,rect in [("West wardrobe",(355,152,400,289)),("Master wardrobe",(1324,80,1370,366)),("Southeast wardrobe",(950,771,1000,882))]:
    box(name,*rect,Z,1.08,wood,.012)
    x1,y1,x2,y2=rect
    for y in range(y1+8,y2-5,22): box(name+" seam",x1-1,y,x1+1,y+1,Z+.05,.95,gold)
for x,y in [(999,116),(1250,111),(1067,596),(1320,852)]:
    box("Bedside cabinet",x-20,y-20,x+20,y+20,Z,.38,wood_light,.015)
    cylinder("Bedside lamp base",x,y,7,Z+.38,.07,gold)
    cylinder("Bedside lamp shade",x,y,12,Z+.51,.14,linen)

# Living room L sofa and furniture.
box("Living woven rug",215,427,553,775,Z+.018,.018,rug,.01)
box("Sofa north base",285,445,551,518,Z+.04,.26,fabric,.055)
box("Sofa east base",474,484,551,728,Z+.04,.26,fabric,.055)
box("Sofa north back",285,431,551,450,Z+.16,.57,fabric,.06)
box("Sofa east back",539,449,560,728,Z+.16,.57,fabric,.06)
for x in (290,369,448): box("Sofa seat cushion",x,451,x+73,511,Z+.30,.13,linen,.035)
for y in (524,595,666): box("Sofa chaise cushion",480,y,534,y+64,Z+.30,.13,linen,.035)
for x,y in [(300,443),(470,460),(543,680)]: box("Sofa sage cushion",x,y,x+25,y+30,Z+.49,.14,sage,.035)
cylinder("Coffee table plinth",365,622,31,Z,.27,wood)
cylinder("Coffee table stone top",365,622,48,Z+.27,.055,white,48)
box("TV console",153,470,185,720,Z,.40,wood,.015)
box("TV screen body",147,490,154,665,Z+.46,.64,dark,.008)

def chair(name,x,y,angle=0):
    made=[]
    made.append(box(name+" seat",x-18,y-18,x+18,y+18,Z+.31,.10,fabric,.045))
    made.append(box(name+" back",x-19,y+14,x+19,y+22,Z+.35,.40,fabric,.035))
    for dx in (-13,13):
        for dy in (-13,13): made.append(box(name+" leg",x+dx-2,y+dy-2,x+dx+2,y+dy+2,Z,.31,wood))
    pivot=Vector((*xy(x,y),0))
    from mathutils import Matrix
    rot=Matrix.Rotation(math.radians(angle),4,"Z")
    for obj in made:
        obj.location=pivot+rot.to_3x3()@(obj.location-pivot)
        obj.rotation_euler.z=math.radians(angle)
chair("Living lounge chair",279,712,-35)
box("Dining tabletop",675,505,783,718,Z+.67,.075,wood_light,.065)
for x in (686,769):
    for y in (516,705): box("Dining table leg",x-4,y-4,x+4,y+4,Z,.67,wood)
for y in (551,615,679):
    chair("Dining west chair",650,y,-90)
    chair("Dining east chair",810,y,90)
chair("Dining north chair",730,478,180)
chair("Dining south chair",730,745)

# Kitchen walls leave the dining side open, matching the visible U-shaped counter.
for name,rect in [("Kitchen rear cabinets",(603,151,822,219)),("Kitchen return",(603,215,647,329)),("Kitchen peninsula",(603,291,780,350))]:
    box(name,*rect,Z,.64,ivory,.01)
    box(name+" worktop",rect[0]-2,rect[1]-2,rect[2]+2,rect[3]+2,Z+.64,.055,white,.015)
box("Cooktop",687,168,750,206,Z+.695,.012,dark,.01)
for x in (703,733):
    for y in (179,195): cylinder("Cooktop ring",x,y,6,Z+.709,.006,bathstone,20)
box("Refrigerator",833,177,890,267,Z,1.18,dark,.015)
box("Refrigerator face",833,265,890,269,Z+.05,1.10,bathstone,.008)
for x in (660,710,760):
    cylinder("Counter stool seat",x,373,16,Z+.48,.075,wood_light)
    for dx,dy in [(-10,-10),(10,-10),(-10,10),(10,10)]: box("Counter stool leg",x+dx-2,373+dy-2,x+dx+2,373+dy+2,Z,.48,wood)

def toilet(name,x,y):
    cylinder(name+" pedestal",x,y,10,Z,.26,white)
    obj=cylinder(name+" bowl",x,y-4,16,Z+.26,.12,white)
    obj.scale.y=1.25
    box(name+" cistern",x-15,y+12,x+15,y+23,Z+.18,.40,white,.025)
toilet("West WC",541,198)
toilet("East WC",1193,505)
for name,rect in [("West basin cabinet",(524,258,568,320)),("East basin cabinet",(1080,507,1144,548))]:
    box(name,*rect,Z,.56,wood_light,.015)
    box(name+" basin",rect[0]+3,rect[1]+3,rect[2]-3,rect[3]-3,Z+.56,.055,white,.015)
for name,rect in [("West shower",(438,70,566,149)),("East shower",(1270,419,1378,545))]:
    box(name+" tray",*rect,Z,.025,bathstone)
    x1,y1,x2,y2=rect
    box(name+" glass screen",x1,y2-2,x2,y2,Z+.025,1.0,glass)
    cylinder(name+" drain",(x1+x2)/2,(y1+y2)/2,4,Z+.03,.008,dark)
box("Laundry washer",958,593,1033,651,Z,.62,white,.025)
washer=cylinder("Washer circular door",996,653,20,Z+.12,.03,dark)
washer.rotation_euler.x=math.pi/2
washer.location=(*xy(996,653),Z+.32)
cylinder("Balcony table",430,866,23,Z+.48,.05,wood_light)
cylinder("Balcony table pedestal",430,866,6,Z,.48,wood)
chair("Balcony chair",512,876,-30)

# Union intersecting plaster/sofa volumes to remove coincident surface artifacts.
for mat in (ivory, fabric, white):
    solids=[o for o in bpy.context.scene.objects if o.type=="MESH" and o.data.materials and o.data.materials[0]==mat]
    base=solids[0]
    operands=bpy.data.collections.new("Temporary union operands")
    bpy.context.scene.collection.children.link(operands)
    for obj in solids[1:]: operands.objects.link(obj)
    bpy.ops.object.select_all(action="DESELECT")
    base.select_set(True); bpy.context.view_layer.objects.active=base
    mod=base.modifiers.new("Clean solid intersections", "BOOLEAN")
    mod.operation="UNION"; mod.solver="EXACT"; mod.operand_type="COLLECTION"; mod.collection=operands
    bpy.ops.object.modifier_apply(modifier=mod.name)
    base.name=mat.name+" unified solids"
    for obj in solids[1:]: bpy.data.objects.remove(obj,do_unlink=True)
    bpy.data.collections.remove(operands)

# Only meshes: lights/cameras for QA never become model dependencies.
meshes=[o for o in bpy.context.scene.objects if o.type=="MESH"]
for o in meshes:
    o.select_set(True)
    o["reconstruction"]="Approximate visual reference; not CAD/BIM"
OUTPUT.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(OUTPUT),export_format="GLB",use_selection=True,export_yup=True,export_apply=True,export_cameras=False,export_lights=False,export_extras=True)

# Validate GLB structure and re-import in a genuinely clean scene.
data=OUTPUT.read_bytes()
magic,version,length=struct.unpack_from("<4sII",data)
assert magic==b"glTF" and version==2 and length==len(data)
json_length,json_type=struct.unpack_from("<II",data,12)
assert json_type==0x4E4F534A
gltf=json.loads(data[20:20+json_length])
assert gltf.get("meshes") and len(gltf["meshes"])>30
assert not gltf.get("images"), "Source PNG must not be embedded as a billboard."
assert all("uri" not in b for b in gltf.get("buffers",[]))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(OUTPUT))
objects=[o for o in bpy.context.scene.objects if o.type=="MESH"]
coords=[o.matrix_world@Vector(c) for o in objects for c in o.bound_box]
lo=[min(v[i] for v in coords) for i in range(3)]
hi=[max(v[i] for v in coords) for i in range(3)]
triangles=0
for o in objects:
    o.data.calc_loop_triangles(); triangles+=len(o.data.loop_triangles)
    assert all(math.isfinite(c) for v in o.data.vertices for c in v.co)
    assert len(o.data.materials)>0
assert lo[2]>=-.001 and hi[2]<3
assert abs((lo[0]+hi[0])/2)<.1 and abs((lo[1]+hi[1])/2)<.2
assert hi[0]-lo[0]<16 and hi[1]-lo[1]<12 and triangles<100000
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==source_hash
report={"blender":bpy.app.version_string,"source_sha256":source_hash,"glb_bytes":len(data),"mesh_nodes":len(objects),"triangles":triangles,"materials":len(gltf.get("materials",[])),"embedded_images":len(gltf.get("images",[])),"gltf_bounds_xyz":[hi[0]-lo[0],hi[2]-lo[2],hi[1]-lo[1]],"blender_bounds_min":lo,"blender_bounds_max":hi,"qa_directory":str(QA)}
(QA/"validation.json").write_text(json.dumps(report,indent=2),encoding="utf-8")

scene=bpy.context.scene
scene.render.engine="CYCLES"; scene.cycles.samples=24
scene.render.resolution_x=1100; scene.render.resolution_y=900; scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new("QA neutral environment"); scene.world.use_nodes=True
scene.world.node_tree.nodes["Background"].inputs[0].default_value=(.72,.74,.78,1)
scene.world.node_tree.nodes["Background"].inputs[1].default_value=.65
scene.view_settings.view_transform="AgX"
def aim(obj,point): obj.rotation_euler=(Vector(point)-obj.location).to_track_quat("-Z","Y").to_euler()
for loc,power,size in [((1,-3,13),2200,9),((-7,3,8),1400,7)]:
    bpy.ops.object.light_add(type="AREA",location=loc)
    light=bpy.context.object; light.data.energy=power; light.data.shape="DISK"; light.data.size=size; aim(light,(0,0,0))
box("QA ground only",-1000,-1000,2450,1980,-.04,.025,material("QA backdrop",(.27,.28,.29)))
bpy.ops.object.camera_add(); camera=bpy.context.object; scene.camera=camera
camera.data.type="ORTHO"; camera.data.ortho_scale=18.2; camera.data.clip_end=200
for name,loc in [("front-three-quarter",(10,-14,17)),("rear-three-quarter",(-10,14,17)),("side",(16,2,13)),("elevated-top",(0,-.05,22))]:
    camera.location=loc; aim(camera,(0,0,.1))
    scene.render.filepath=str(QA/(name+".png"))
    bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(QA/"floor-plan-qa.blend"))
print("MODEL_REPORT="+json.dumps(report))
