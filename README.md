**Status**: In early development. Unpublished. Expect bugs.

# Autocomplete blender operators for VS Code

In Blender addons, we often use pure strings to call operators from UI. This addon provides autocompletion for those strings.

Autocompletion is triggered if word `operator` is present in current line, or line above in `.py` files.

```python
import bpy

class HelloWorldPanel(bpy.types.Panel):
    """Creates a Panel in the Object properties window"""
    bl_label = "Hello World Panel"
    bl_idname = "OBJECT_PT_hello"
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = "object"

    def draw(self, context):
        self.layout.operator("mesh.primitive_cube_add") # autocompletes this string

bpy.utils.register_class(HelloWorldPanel)
```

I hope to merge this addon [Blender Development](https://github.com/JacquesLucke/blender_vscode), but for now I am learning how to write VS addons with TypeScript.

## Installation

The extension is [installed](https://code.visualstudio.com/docs/editor/extension-gallery) like any other extension in Visual Studio Code.

## Features

- [x] settings: set path to Blender executable
- [x] autocomplete string with blender operators 
  - [x] get and cache list of operators from Blender
  - [x] manually refresh list of operators
- [ ] optional: go to definition of operator
  - [ ] include files in `C:\\Program Files\\Blender Foundation\\Blender 2.93\\2.93\\scripts\\startup\\bl_operators`
  - [ ] include custom addons
  - [ ] include operators implemented in C - go to C source code (if provided) or website
- [ ] optional: use language server instead of executing extenal commands
- [ ] add tests