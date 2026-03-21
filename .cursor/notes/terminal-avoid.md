# Terminal Commands to Avoid

## PowerShell + System.Drawing (Image Inspection)

**Problem**: Running PowerShell commands that load `System.Drawing` to read image dimensions (e.g. `Add-Type -AssemblyName System.Drawing`, `[System.Drawing.Image]::FromFile()`) can **crash Cursor** or hang indefinitely.

**Cause**: Loading GDI+/System.Drawing in Cursor's sandboxed terminal can destabilize the IDE process.

**Avoid**:
- `Add-Type -AssemblyName System.Drawing`
- `[System.Drawing.Image]::FromFile(...)`
- Any PowerShell that loads image metadata programmatically

**Use instead**:
- Hardcode known dimensions (e.g. Kenney sprites: ~70×79px or use individual PNGs)
- Load individual pose files instead of parsing tilesheets
- Check asset pack documentation; skip runtime image inspection
