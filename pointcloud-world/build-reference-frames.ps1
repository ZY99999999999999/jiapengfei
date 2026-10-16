# Only builds small sampling references for particle geometry; source media is untouched.
Add-Type -AssemblyName System.Drawing
$root = 'F:\毕业设计\毕业设计2\毕业设计2'
$dest = Join-Path $PSScriptRoot 'reference-frames'
New-Item -ItemType Directory -Path $dest -Force | Out-Null
$clips = @(
  @{ key='caterpillar-flower'; dir='二'; frames=@(0,72,144) },
  @{ key='caterpillar-curl'; dir='可以倒放，使用毛毛虫那段'; frames=@(0,72,144) },
  @{ key='cocoon-butterfly'; dir='可以用一个蚕蛹'; frames=@(0,72,144) },
  @{ key='motif-gathering'; dir='全家福'; frames=@(0,72,144) },
  @{ key='butterfly-turn'; dir='三'; frames=@(0,72,144) },
  @{ key='dragon-phoenix'; dir='视频四'; frames=@(0,72,144) },
  @{ key='camel-motion'; dir='骆驼'; frames=@(0,96,192); animal=$true }
)
foreach ($clip in $clips) {
  $srcDir = if ($clip.animal) { Join-Path $root '动物\骆驼\骆驼_去背景' } else { Join-Path (Join-Path $root '植物动态_去背景') $clip.dir }
  for ($i=0; $i -lt 3; $i++) {
    $source = Join-Path $srcDir ('frame_{0:d4}.png' -f $clip.frames[$i])
    if (!(Test-Path -LiteralPath $source)) { throw "Missing reference frame: $source" }
    $bitmap = [System.Drawing.Image]::FromFile($source)
    try {
      $small = New-Object System.Drawing.Bitmap 320, 180
      try {
        $graphics = [System.Drawing.Graphics]::FromImage($small)
        try {
          $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $graphics.Clear([System.Drawing.Color]::Black)
          $graphics.DrawImage($bitmap, 0, 0, 320, 180)
        } finally { $graphics.Dispose() }
        $target = Join-Path $dest ($clip.key + '-' + $i + '.jpg')
        $small.Save($target, [System.Drawing.Imaging.ImageFormat]::Jpeg)
      } finally { $small.Dispose() }
    } finally { $bitmap.Dispose() }
  }
}
Write-Output (Get-ChildItem -LiteralPath $dest -File | Measure-Object Length -Sum | Select-Object Count,Sum)
