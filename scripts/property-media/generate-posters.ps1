[CmdletBinding()]
param(
  [string]$SourceRoot,
  [string]$OutputRoot
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not $SourceRoot) { $SourceRoot = Join-Path $projectRoot "public\media\property-media" }
if (-not $OutputRoot) { $OutputRoot = Join-Path $projectRoot "public\images\property-media\posters" }
$SourceRoot = $SourceRoot.TrimEnd([char]'\')

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class PropertyMediaPosterExtractor {
  [StructLayout(LayoutKind.Sequential)]
  public struct SIZE {
    public int cx;
    public int cy;
    public SIZE(int width, int height) { cx = width; cy = height; }
  }

  [Flags]
  public enum SIIGBF {
    BIGGERSIZEOK = 1,
    THUMBNAILONLY = 8
  }

  [ComImport, Guid("bcc18b79-ba16-442f-80c4-8a59c30c463b"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IShellItemImageFactory {
    void GetImage(SIZE size, SIIGBF flags, out IntPtr bitmapHandle);
  }

  [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
  private static extern void SHCreateItemFromParsingName(
    string path,
    IntPtr bindContext,
    ref Guid interfaceId,
    [MarshalAs(UnmanagedType.Interface)] out IShellItemImageFactory item);

  [DllImport("gdi32.dll")]
  private static extern bool DeleteObject(IntPtr objectHandle);

  public static void Save(string inputPath, string outputPath) {
    Guid interfaceId = typeof(IShellItemImageFactory).GUID;
    IShellItemImageFactory item;
    SHCreateItemFromParsingName(inputPath, IntPtr.Zero, ref interfaceId, out item);

    IntPtr bitmapHandle;
    item.GetImage(new SIZE(960, 960), SIIGBF.BIGGERSIZEOK | SIIGBF.THUMBNAILONLY, out bitmapHandle);
    try {
      using (var image = Image.FromHbitmap(bitmapHandle)) {
        image.Save(outputPath, ImageFormat.Jpeg);
      }
    } finally {
      DeleteObject(bitmapHandle);
    }
  }
}
'@

Get-ChildItem -LiteralPath $SourceRoot -Recurse -Filter "*.mp4" |
  Where-Object { $_.Directory.Name -ne "intro" } |
  ForEach-Object {
    $relativeDirectory = $_.DirectoryName.Substring($SourceRoot.Length).TrimStart([char]'\')
    $targetDirectory = Join-Path $OutputRoot $relativeDirectory
    New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null
    $targetPath = Join-Path $targetDirectory ("{0}.jpg" -f $_.BaseName)
    [PropertyMediaPosterExtractor]::Save($_.FullName, $targetPath)
    Get-Item -LiteralPath $targetPath | Select-Object FullName, Length
  }
