# -*- coding: utf-8 -*-
"""
蒙古族纹样平台 - 轻量 HTTP 服务器（Python 版）
功能：静态文件服务 + JSON 数据读写 API + 纹样上传（PNG/JPG 自动转 SVG）

使用方式：
  python server.py          # 默认端口 8766
  python server.py 9000     # 指定端口 9000

在 PyCharm 中：右键本文件 → Run 'server' 即可启动
首次启动会自动安装所需依赖（Pillow、potracer），无需手动操作。
"""

import http.server
import json
import os
import sys
import subprocess
import webbrowser
import urllib.parse
import posixpath
import io
import tempfile

# ===== 自动安装依赖 =====
def ensure_dependencies():
    """检测并自动安装所需的 Python 包"""
    deps = {
        'PIL': 'Pillow',       # pip 包名
        'potrace': 'potracer', # pip 包名是 potracer，导入名是 potrace
        'numpy': 'numpy',
    }
    missing = []
    for module, pip_name in deps.items():
        try:
            __import__(module)
        except ImportError:
            missing.append(pip_name)

    if missing:
        print(f'\n  📦 首次启动，正在自动安装依赖: {", ".join(missing)}')
        print('  （这只需要一次，请稍等几秒...）\n')
        subprocess.check_call(
            [sys.executable, '-m', 'pip', 'install', '--quiet'] + missing
        )
        print('  ✅ 依赖安装完成！\n')

ensure_dependencies()

# 安装完成后再导入
from PIL import Image
import numpy as np
import potrace

# ===== 配置 =====
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, 'data')
SVG_DIR = os.path.join(ROOT, 'wenyang_svg')

# 确保目录存在
os.makedirs(DATA_DIR, exist_ok=True)
for cat in ('geo', 'rel', 'bio'):
    os.makedirs(os.path.join(SVG_DIR, cat), exist_ok=True)

MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.htm':  'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.mjs':  'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf':  'font/ttf',
    '.wasm': 'application/wasm',
    '.tflite': 'application/octet-stream',
    '.binarypb': 'application/octet-stream',
    '.data': 'application/octet-stream',
}

# ===== PNG/JPG → SVG 转换 =====
def image_to_svg(image_bytes, filename):
    """
    将 PNG/JPG 图片转换为标准格式 SVG（单色母体纹样）
    流程：打开图片 → 灰度化 → 二值化 → potrace 描边 → 生成 SVG 路径
    """
    img = Image.open(io.BytesIO(image_bytes))

    # 转为灰度图
    img = img.convert('L')

    # 自适应大小，长边缩放到 500px 以内（加快 trace 速度）
    max_side = 500
    w, h = img.size
    if max(w, h) > max_side:
        scale = max_side / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    w, h = img.size

    # 二值化：Otsu 阈值（使用 numpy）
    arr = np.array(img)
    # 简单阈值：取中值作为分割点，前景（纹样线条）为深色
    threshold = np.mean(arr)
    # potrace 需要的 bitmap：True 表示前景（黑色/线条）
    bitmap = arr < threshold

    # 使用 potrace 进行矢量描边
    bmp = potrace.Bitmap(bitmap)
    path = bmp.trace(
        turdsize=2,        # 忽略小于此面积的斑点
        turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
        alphamax=1.0,      # 平滑度
        opticurve=True,
        opttolerance=0.2,
    )

    # 生成 SVG 路径数据
    # 将 potrace 坐标映射到标准 viewBox（550×689 的绘图区域，偏移 -10,-10）
    # 原始坐标系是 0~w, 0~h，需要缩放到 550×689 并居中
    target_w, target_h = 550, 689
    scale_x = target_w / w
    scale_y = target_h / h
    scale_factor = min(scale_x, scale_y)

    # 居中偏移
    rendered_w = w * scale_factor
    rendered_h = h * scale_factor
    offset_x = (target_w - rendered_w) / 2
    offset_y = (target_h - rendered_h) / 2

    paths = []
    for curve in path:
        parts = []
        start = curve.start_point
        sx = start.x * scale_factor + offset_x
        sy = start.y * scale_factor + offset_y
        parts.append(f'M {sx:.1f},{sy:.1f}')

        for segment in curve:
            ep = segment.end_point
            if segment.is_corner:
                c = segment.c
                cx = c.x * scale_factor + offset_x
                cy = c.y * scale_factor + offset_y
                ex = ep.x * scale_factor + offset_x
                ey = ep.y * scale_factor + offset_y
                parts.append(f'L {cx:.1f},{cy:.1f}')
                parts.append(f'L {ex:.1f},{ey:.1f}')
            else:
                c1 = segment.c1
                c2 = segment.c2
                c1x = c1.x * scale_factor + offset_x
                c1y = c1.y * scale_factor + offset_y
                c2x = c2.x * scale_factor + offset_x
                c2y = c2.y * scale_factor + offset_y
                ex = ep.x * scale_factor + offset_x
                ey = ep.y * scale_factor + offset_y
                parts.append(f'C {c1x:.1f},{c1y:.1f} {c2x:.1f},{c2y:.1f} {ex:.1f},{ey:.1f}')

        parts.append('Z')
        paths.append(' '.join(parts))

    path_data = ' '.join(paths)

    # 组装标准格式 SVG
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="-10 -10 570 709" 
     class="mongolian-pattern">
  <path d="{path_data}" fill="currentColor"/>
</svg>
'''
    return svg_content


# ===== HTTP 处理器 =====
class PatternHandler(http.server.BaseHTTPRequestHandler):
    """自定义请求处理器：静态文件 + JSON API + 纹样上传"""

    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} - {fmt % args}")

    def _set_cors(self):
        """设置 CORS 头"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors()
        self.end_headers()

    def do_GET(self):
        url_path = urllib.parse.unquote(self.path.split('?')[0])

        # ===== API：获取纹样文件列表 =====
        if url_path == '/api/patterns':
            result = {}
            for cat in ('geo', 'rel', 'bio'):
                cat_dir = os.path.join(SVG_DIR, cat)
                files = sorted([
                    f for f in os.listdir(cat_dir)
                    if f.endswith('.svg')
                ])
                result[cat] = files
            self._send_json(200, result)
            return

        # ===== API：读取 JSON 数据 =====
        if url_path.startswith('/api/data/'):
            filename = posixpath.basename(url_path)
            if not filename.endswith('.json'):
                self._send_json(400, {'error': 'Only .json files allowed'})
                return
            file_path = os.path.join(DATA_DIR, filename)
            if not os.path.abspath(file_path).startswith(os.path.abspath(DATA_DIR)):
                self._send_error(403, 'Forbidden')
                return
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = f.read()
            except FileNotFoundError:
                data = '{}'
            self.send_response(200)
            self._set_cors()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(data.encode('utf-8'))
            return

        # ===== 静态文件服务 =====
        if url_path == '/':
            url_path = '/index.html'

        rel_path = url_path.lstrip('/')
        file_path = os.path.join(ROOT, rel_path)

        if not os.path.abspath(file_path).startswith(os.path.abspath(ROOT)):
            self._send_error(403, 'Forbidden')
            return

        if not os.path.isfile(file_path):
            self._send_error(404, 'Not Found')
            return

        _, ext = os.path.splitext(file_path)
        content_type = MIME_TYPES.get(ext.lower(), 'application/octet-stream')

        try:
            with open(file_path, 'rb') as f:
                content = f.read()
        except Exception:
            self._send_error(500, 'Internal Server Error')
            return

        self.send_response(200)
        self._set_cors()
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self):
        url_path = urllib.parse.unquote(self.path.split('?')[0])

        # ===== API：上传纹样（支持 PNG/JPG/SVG） =====
        if url_path == '/api/upload-pattern':
            content_type_header = self.headers.get('Content-Type', '')
            content_length = int(self.headers.get('Content-Length', 0))

            if 'multipart/form-data' not in content_type_header:
                self._send_json(400, {'error': '需要 multipart/form-data 格式'})
                return

            # 解析 multipart 数据
            boundary = content_type_header.split('boundary=')[1].strip()
            body = self.rfile.read(content_length)

            # 简单解析 multipart（提取 file 和 category 字段）
            parts = self._parse_multipart(body, boundary)
            file_data = parts.get('file')
            file_name = parts.get('file_name', 'unknown.svg')
            category = parts.get('category', 'geo')

            if not file_data:
                self._send_json(400, {'error': '未找到文件数据'})
                return

            if category not in ('geo', 'rel', 'bio'):
                category = 'geo'

            # 根据文件类型决定是否需要转换
            ext = os.path.splitext(file_name)[1].lower()
            base_name = os.path.splitext(file_name)[0]

            if ext == '.svg':
                # SVG 直接保存
                svg_content = file_data.decode('utf-8', errors='replace')
            elif ext in ('.png', '.jpg', '.jpeg'):
                # PNG/JPG → 自动转 SVG
                try:
                    svg_content = image_to_svg(file_data, file_name)
                except Exception as e:
                    self._send_json(500, {'error': f'图片转换失败: {str(e)}'})
                    return
            else:
                self._send_json(400, {'error': f'不支持的文件格式: {ext}，请上传 PNG/JPG/SVG'})
                return

            # 保存 SVG 文件到对应分类文件夹
            svg_filename = base_name + '.svg'
            save_path = os.path.join(SVG_DIR, category, svg_filename)

            # 如果同名文件已存在，加序号
            counter = 1
            while os.path.exists(save_path):
                svg_filename = f'{base_name}_{counter}.svg'
                save_path = os.path.join(SVG_DIR, category, svg_filename)
                counter += 1

            with open(save_path, 'w', encoding='utf-8') as f:
                f.write(svg_content)

            print(f'  ✅ 纹样已保存: {category}/{svg_filename}')
            self._send_json(200, {
                'ok': True,
                'file': svg_filename,
                'category': category,
                'path': f'wenyang_svg/{category}/{svg_filename}'
            })
            return

        # ===== API：写入 JSON 数据 =====
        if url_path.startswith('/api/data/'):
            filename = posixpath.basename(url_path)
            if not filename.endswith('.json'):
                self._send_json(400, {'error': 'Only .json files allowed'})
                return
            file_path = os.path.join(DATA_DIR, filename)
            if not os.path.abspath(file_path).startswith(os.path.abspath(DATA_DIR)):
                self._send_error(403, 'Forbidden')
                return

            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')

            try:
                json.loads(body)
            except json.JSONDecodeError:
                self._send_json(400, {'error': 'Invalid JSON'})
                return

            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(body)
            except Exception:
                self._send_json(500, {'error': 'Write failed'})
                return

            self._send_json(200, {'ok': True})
            return

        self._send_error(404, 'Not Found')

    def do_DELETE(self):
        url_path = urllib.parse.unquote(self.path.split('?')[0])

        # ===== API：删除纹样 =====
        if url_path.startswith('/api/delete-pattern/'):
            # 格式: /api/delete-pattern/geo/filename.svg
            parts = url_path.replace('/api/delete-pattern/', '').split('/', 1)
            if len(parts) != 2:
                self._send_json(400, {'error': '路径格式错误'})
                return
            category, filename = parts
            if category not in ('geo', 'rel', 'bio'):
                self._send_json(400, {'error': '无效的分类'})
                return

            file_path = os.path.join(SVG_DIR, category, filename)
            if not os.path.abspath(file_path).startswith(os.path.abspath(SVG_DIR)):
                self._send_error(403, 'Forbidden')
                return

            if not os.path.exists(file_path):
                self._send_json(404, {'error': '文件不存在'})
                return

            os.remove(file_path)
            print(f'  🗑️ 纹样已删除: {category}/{filename}')
            self._send_json(200, {'ok': True})
            return

        self._send_error(404, 'Not Found')

    def _parse_multipart(self, body, boundary):
        """简单的 multipart/form-data 解析器"""
        result = {}
        boundary_bytes = ('--' + boundary).encode()
        parts = body.split(boundary_bytes)

        for part in parts:
            if not part or part == b'--\r\n' or part == b'--':
                continue

            # 分离 header 和 body
            if b'\r\n\r\n' in part:
                header_section, content = part.split(b'\r\n\r\n', 1)
            elif b'\n\n' in part:
                header_section, content = part.split(b'\n\n', 1)
            else:
                continue

            # 去除末尾的 \r\n
            if content.endswith(b'\r\n'):
                content = content[:-2]

            header_str = header_section.decode('utf-8', errors='replace')

            # 提取字段名
            if 'name="file"' in header_str or 'name="pattern"' in header_str:
                result['file'] = content
                # 提取文件名
                if 'filename="' in header_str:
                    fname = header_str.split('filename="')[1].split('"')[0]
                    result['file_name'] = fname
            elif 'name="category"' in header_str:
                result['category'] = content.decode('utf-8').strip()

        return result

    def _send_json(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self._set_cors()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_error(self, code, message):
        body = message.encode('utf-8')
        self.send_response(code)
        self._set_cors()
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    server = http.server.HTTPServer(('', PORT), PatternHandler)
    url = f'http://localhost:{PORT}'
    print()
    print('  ✨ 蒙古族纹样交互设计平台 (Python Server)')
    print('  ─────────────────────────────────')
    print(f'  🌐 {url}')
    print()
    print('  📁 纹样文件夹:')
    print(f'     wenyang_svg/geo/  ← 几何纹样')
    print(f'     wenyang_svg/rel/  ← 宗教纹样')
    print(f'     wenyang_svg/bio/  ← 动植物纹样')
    print()
    print('  📤 支持上传: PNG / JPG / SVG（自动转换并保存）')
    print()
    print('  按 Ctrl+C 停止服务器')
    print()

    webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  服务器已停止')
        server.server_close()
