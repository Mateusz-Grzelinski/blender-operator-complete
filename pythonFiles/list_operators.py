import argparse
from dataclasses import dataclass
import dataclasses
import inspect
import json
import os
import sys
import types
from typing import Optional

filename = os.path.basename(__file__)

parser = argparse.ArgumentParser(
    # usage='blender --python %(prog)s - [options]',
    prog=f"blender --background --python {filename} --",
    description=f"""Lists all currently available operators in 'bpy.ops' and save to json file. Launch from Blender""",
)
parser.add_argument(
    "--out", metavar="operators.json", help="output file", default="operators.json"
)
argv = sys.argv
argv = argv[argv.index("--") + 1 :]  # get all args after "--"
args = parser.parse_args(argv)

try:
    import bpy
except ImportError:
    parser.print_help()
    exit(1)


@dataclass
class Operator:
    op: str
    """mesh.primitive_cube_add"""
    src: Optional[str]
    """Path to file with line number or link to website"""


operators = 0
operator_modules = 0
oks = 0
fails = 0


def get_source(operator: "bpy.ops._BPyOpsSubModOp"):
    global fails, oks
    op_struct = operator.get_rna_type()
    id = op_struct.identifier
    cls = getattr(bpy.types, id, None)  # watch for changes in blender 3.0
    try:
        src = inspect.getfile(cls)
        oks += 1
    except TypeError:
        fails += 1
        src = None
    return src


results = []
for module_alias, module in inspect.getmembers(bpy.ops):
    module: types.ModuleType
    operator_modules +=1
    for operator_alias, operator in inspect.getmembers(module):
        operator: "bpy.ops._BPyOpsSubModOp"
        source = get_source(operator)
        operators += 1
        results.append(Operator(operator.idname_py(), source))

out_dir = os.path.dirname(args.out)
if out_dir:
    os.makedirs(out_dir, exist_ok=True)
with open(args.out, "w") as out:
    json.dump([dataclasses.asdict(op) for op in results], out)

print(f"Found {operators} operators in {operator_modules} modules")
print(f"Found local source files for {oks} operators out of {operators}")
# print(f"Can not get source files for {fails} operators")
