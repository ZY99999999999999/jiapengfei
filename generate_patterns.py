#!/usr/bin/env python3
"""
蒙古族传统纹样 SVG 生成器
用数学公式精确复刻经典蒙古族几何纹样、宗教纹样和动植物纹样
输出为 SVG 文件，存入 pattern_images/ 文件夹
"""
import os
import math

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pattern_images')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def save_svg(filename, content, width=400, height=400):
    """保存SVG文件"""
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
{content}
</svg>'''
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"  ✓ {filename}")

# ============================================================
# 几何纹样
# ============================================================

def gen_huiwen_1():
    """回纹 - 经典T形回纹边饰"""
    paths = []
    # 背景
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    # 绘制3x3的回纹单元
    unit = 100
    for row in range(3):
        for col in range(3):
            x = col * unit + 50 + 25
            y = row * unit + 50 + 25
            # 经典回纹: 由外向内螺旋
            paths.append(f'''<path d="M{x},{y} L{x+50},{y} L{x+50},{y+50} L{x-0},{y+50} L{x},{y+40} L{x+40},{y+40} L{x+40},{y+10} L{x+10},{y+10} L{x+10},{y+30} L{x+25},{y+30}" 
                fill="none" stroke="#c9a84c" stroke-width="3" stroke-linecap="square"/>''')
    save_svg('huiwen_classic.svg', '\n'.join(paths))

def gen_huiwen_2():
    """回纹 - 连续回纹带（二方连续）"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    # 横向连续回纹带
    for band_y in [100, 200, 300]:
        for i in range(8):
            x = i * 50
            # 交替方向的回纹
            if i % 2 == 0:
                paths.append(f'<path d="M{x},{band_y-15} L{x+25},{band_y-15} L{x+25},{band_y+15} L{x+5},{band_y+15} L{x+5},{band_y-5} L{x+20},{band_y-5} L{x+20},{band_y+5} L{x+10},{band_y+5}" fill="none" stroke="#c9a84c" stroke-width="2.5"/>')
            else:
                paths.append(f'<path d="M{x},{band_y+15} L{x+25},{band_y+15} L{x+25},{band_y-15} L{x+5},{band_y-15} L{x+5},{band_y+5} L{x+20},{band_y+5} L{x+20},{band_y-5} L{x+10},{band_y-5}" fill="none" stroke="#c9a84c" stroke-width="2.5"/>')
    save_svg('huiwen_band.svg', '\n'.join(paths))

def gen_huiwen_3():
    """回纹 - 四方连续回纹（回回锦）"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#0f1525"/>')
    size = 40
    for row in range(5):
        for col in range(5):
            cx = col * 80 + 40
            cy = row * 80 + 40
            # 四个方向的回纹组成一个单元
            paths.append(f'''<rect x="{cx-size//2}" y="{cy-size//2}" width="{size}" height="{size}" fill="none" stroke="#c9a84c" stroke-width="1.5"/>''')
            # 内部螺旋
            s = size // 2 - 5
            paths.append(f'''<path d="M{cx-s},{cy-s} L{cx+s},{cy-s} L{cx+s},{cy+s} L{cx-s+8},{cy+s} L{cx-s+8},{cy-s+8} L{cx+s-8},{cy-s+8} L{cx+s-8},{cy+s-8}" fill="none" stroke="#c9a84c" stroke-width="2"/>''')
    save_svg('huiwen_grid.svg', '\n'.join(paths))

def gen_wanzi_1():
    """万字纹 - 单体卍"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    arm = 60
    hook = 30
    sw = 8
    # 卍字形
    paths.append(f'''<path d="M{cx-arm},{cy} L{cx+arm},{cy} M{cx},{cy-arm} L{cx},{cy+arm}
        M{cx+arm},{cy} L{cx+arm},{cy-hook} M{cx-arm},{cy} L{cx-arm},{cy+hook}
        M{cx},{cy-arm} L{cx+hook},{cy-arm} M{cx},{cy+arm} L{cx-hook},{cy+arm}" 
        fill="none" stroke="#c9a84c" stroke-width="{sw}" stroke-linecap="square"/>''')
    # 外框装饰圆
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="100" fill="none" stroke="rgba(201,168,76,0.3)" stroke-width="2"/>')
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="110" fill="none" stroke="rgba(201,168,76,0.15)" stroke-width="1"/>')
    save_svg('wanzi_single.svg', '\n'.join(paths))

def gen_wanzi_2():
    """万字纹 - 万字不断头（连续纹）"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    # 连续万字纹网格
    unit = 50
    for row in range(4):
        for col in range(4):
            x = col * unit + 75
            y = row * unit + 75
            # 简化的连续万字
            paths.append(f'''<path d="M{x},{y} L{x+unit//2},{y} L{x+unit//2},{y-unit//4} M{x},{y} L{x},{y+unit//2} L{x+unit//4},{y+unit//2}" 
                fill="none" stroke="#c9a84c" stroke-width="2.5" stroke-linecap="square"/>''')
    # 边框
    paths.append('<rect x="60" y="60" width="280" height="280" fill="none" stroke="rgba(201,168,76,0.4)" stroke-width="1.5" rx="4"/>')
    save_svg('wanzi_continuous.svg', '\n'.join(paths))

def gen_panchang_1():
    """盘长纹 - 经典八吉祥盘长结"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 经典盘长纹：交叉环绕的绳结图案
    # 用贝塞尔曲线模拟
    w, h = 70, 90
    paths.append(f'''<path d="
        M{cx-w},{cy-h} L{cx+w},{cy-h} Q{cx+w+20},{cy-h} {cx+w+20},{cy-h+20}
        L{cx+w+20},{cy+h-20} Q{cx+w+20},{cy+h} {cx+w},{cy+h}
        L{cx-w},{cy+h} Q{cx-w-20},{cy+h} {cx-w-20},{cy+h-20}
        L{cx-w-20},{cy-h+20} Q{cx-w-20},{cy-h} {cx-w},{cy-h} Z"
        fill="none" stroke="#c9a84c" stroke-width="3"/>''')
    # 内部交叉线
    paths.append(f'''<path d="M{cx-w+20},{cy-h+20} L{cx+w-20},{cy+h-20} M{cx+w-20},{cy-h+20} L{cx-w+20},{cy+h-20}" fill="none" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 内部小环
    paths.append(f'<rect x="{cx-30}" y="{cy-40}" width="60" height="80" rx="10" fill="none" stroke="#c9a84c" stroke-width="2.5"/>')
    # 四角装饰
    for dx, dy in [(-1,-1),(1,-1),(-1,1),(1,1)]:
        paths.append(f'<circle cx="{cx+dx*50}" cy="{cy+dy*60}" r="6" fill="none" stroke="#c9a84c" stroke-width="2"/>')
    save_svg('panchang_classic.svg', '\n'.join(paths))

def gen_panchang_2():
    """盘长纹 - 菱形变体盘长"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#0f1525"/>')
    cx, cy = 200, 200
    # 菱形盘长
    s = 80
    # 外菱形
    paths.append(f'<polygon points="{cx},{cy-s} {cx+s},{cy} {cx},{cy+s} {cx-s},{cy}" fill="none" stroke="#c9a84c" stroke-width="3"/>')
    # 内菱形
    s2 = 50
    paths.append(f'<polygon points="{cx},{cy-s2} {cx+s2},{cy} {cx},{cy+s2} {cx-s2},{cy}" fill="none" stroke="#c9a84c" stroke-width="2.5"/>')
    # 交叉绳结效果
    s3 = 65
    paths.append(f'''<path d="M{cx},{cy-s3} Q{cx+20},{cy-20} {cx+s3},{cy} Q{cx+20},{cy+20} {cx},{cy+s3} Q{cx-20},{cy+20} {cx-s3},{cy} Q{cx-20},{cy-20} {cx},{cy-s3}" fill="none" stroke="rgba(201,168,76,0.6)" stroke-width="2" stroke-dasharray="8,4"/>''')
    # 四端延伸
    for angle in [0, 90, 180, 270]:
        rad = math.radians(angle)
        x1 = cx + math.cos(rad) * s
        y1 = cy + math.sin(rad) * s
        x2 = cx + math.cos(rad) * (s + 25)
        y2 = cy + math.sin(rad) * (s + 25)
        paths.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#c9a84c" stroke-width="2.5"/>')
    save_svg('panchang_diamond.svg', '\n'.join(paths))

def gen_panchang_3():
    """盘长纹 - 圆形盘长"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 圆形盘长：多个圆环交织
    for i in range(4):
        angle = i * 45
        rad = math.radians(angle)
        ox = cx + math.cos(rad) * 35
        oy = cy + math.sin(rad) * 35
        paths.append(f'<circle cx="{ox}" cy="{oy}" r="50" fill="none" stroke="#c9a84c" stroke-width="2.5"/>')
    # 中心点
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="8" fill="#c9a84c" opacity="0.6"/>')
    # 外圈
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="95" fill="none" stroke="rgba(201,168,76,0.3)" stroke-width="1.5"/>')
    save_svg('panchang_round.svg', '\n'.join(paths))

def gen_harmuur_1():
    """哈木尔纹 - 经典牛鼻形"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 经典哈木尔：两条对称内旋曲线（牛鼻形）
    paths.append(f'''<path d="M{cx},{cy-20} 
        C{cx-30},{cy-20} {cx-60},{cy-40} {cx-70},{cy-10}
        C{cx-80},{cy+20} {cx-50},{cy+40} {cx-30},{cy+30}
        C{cx-10},{cy+20} {cx-5},{cy} {cx},{cy-20}" 
        fill="none" stroke="#c9a84c" stroke-width="4"/>''')
    paths.append(f'''<path d="M{cx},{cy-20} 
        C{cx+30},{cy-20} {cx+60},{cy-40} {cx+70},{cy-10}
        C{cx+80},{cy+20} {cx+50},{cy+40} {cx+30},{cy+30}
        C{cx+10},{cy+20} {cx+5},{cy} {cx},{cy-20}" 
        fill="none" stroke="#c9a84c" stroke-width="4"/>''')
    # 上方延伸的鼻梁
    paths.append(f'''<path d="M{cx},{cy-20} L{cx},{cy-70}" fill="none" stroke="#c9a84c" stroke-width="4" stroke-linecap="round"/>''')
    # 两侧卷曲延伸
    paths.append(f'''<path d="M{cx-70},{cy-10} C{cx-90},{cy-30} {cx-80},{cy-60} {cx-55},{cy-65}" fill="none" stroke="#c9a84c" stroke-width="3" stroke-linecap="round"/>''')
    paths.append(f'''<path d="M{cx+70},{cy-10} C{cx+90},{cy-30} {cx+80},{cy-60} {cx+55},{cy-65}" fill="none" stroke="#c9a84c" stroke-width="3" stroke-linecap="round"/>''')
    # 装饰圆圈
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="100" fill="none" stroke="rgba(201,168,76,0.2)" stroke-width="1.5"/>')
    save_svg('harmuur_classic.svg', '\n'.join(paths))

def gen_harmuur_2():
    """哈木尔纹 - 团状哈木尔（向四周扩展）"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#0f1525"/>')
    cx, cy = 200, 200
    # 四个方向的哈木尔纹组合成团状
    for angle in [0, 90, 180, 270]:
        rad = math.radians(angle)
        # 旋转坐标
        cos_a = math.cos(rad)
        sin_a = math.sin(rad)
        # 每个方向画一个卷曲
        r1, r2 = 30, 60
        paths.append(f'''<path d="M{cx},{cy} 
            C{cx + cos_a*r1 - sin_a*r1},{cy + sin_a*r1 + cos_a*r1} 
            {cx + cos_a*r2 - sin_a*10},{cy + sin_a*r2 + cos_a*10} 
            {cx + cos_a*r2},{cy + sin_a*r2}" 
            fill="none" stroke="#c9a84c" stroke-width="3.5" stroke-linecap="round"/>''')
        # 卷曲末端
        paths.append(f'''<circle cx="{cx + cos_a*r2}" cy="{cy + sin_a*r2}" r="8" fill="none" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 中心装饰
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="12" fill="#c9a84c" opacity="0.4"/>')
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="6" fill="#c9a84c" opacity="0.7"/>')
    save_svg('harmuur_group.svg', '\n'.join(paths))

def gen_harmuur_3():
    """哈木尔纹 - 勾联式哈木尔"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    # 勾联式：多个哈木尔纹首尾相连
    for i in range(3):
        y = 130 + i * 70
        for j in range(3):
            x = 100 + j * 100
            # S形勾联
            paths.append(f'''<path d="M{x-30},{y} C{x-30},{y-20} {x-10},{y-25} {x},{y-15} C{x+10},{y-5} {x+10},{y+15} {x},{y+20} C{x-10},{y+25} {x-30},{y+20} {x-30},{y}" fill="none" stroke="#c9a84c" stroke-width="2.5"/>''')
    save_svg('harmuur_linked.svg', '\n'.join(paths))

def gen_ebuir_1():
    """额布尔犄纹 - 经典盘羊角"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 左侧犄角 - 螺旋渐开
    paths.append(f'''<path d="M{cx-10},{cy-50} C{cx-40},{cy-80} {cx-80},{cy-70} {cx-90},{cy-40} C{cx-100},{cy-10} {cx-80},{cy+20} {cx-55},{cy+10} C{cx-35},{cy+2} {cx-30},{cy-20} {cx-40},{cy-40}" fill="none" stroke="#c9a84c" stroke-width="4" stroke-linecap="round"/>''')
    # 右侧犄角 - 镜像
    paths.append(f'''<path d="M{cx+10},{cy-50} C{cx+40},{cy-80} {cx+80},{cy-70} {cx+90},{cy-40} C{cx+100},{cy-10} {cx+80},{cy+20} {cx+55},{cy+10} C{cx+35},{cy+2} {cx+30},{cy-20} {cx+40},{cy-40}" fill="none" stroke="#c9a84c" stroke-width="4" stroke-linecap="round"/>''')
    # 顶部连接
    paths.append(f'''<path d="M{cx-10},{cy-50} Q{cx},{cy-60} {cx+10},{cy-50}" fill="none" stroke="#c9a84c" stroke-width="4" stroke-linecap="round"/>''')
    # 底部装饰
    paths.append(f'<circle cx="{cx}" cy="{cy+40}" r="5" fill="#c9a84c" opacity="0.6"/>')
    save_svg('ebuir_classic.svg', '\n'.join(paths))

def gen_ebuir_2():
    """额布尔犄纹 - 对称双犄角组合"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#0f1525"/>')
    # 上下两组犄角纹
    for flip in [1, -1]:
        cy = 200 + flip * 60
        cx = 200
        # 螺旋犄角
        for side in [-1, 1]:
            points = []
            for t in range(0, 360, 10):
                r = 20 + t * 0.12
                angle = math.radians(t * side * 0.8 + (90 if flip == 1 else -90))
                px = cx + side * (20 + r * math.cos(angle) * 0.5)
                py = cy + flip * (-r * math.sin(angle) * 0.3)
                points.append(f"{px},{py}")
            if len(points) > 1:
                paths.append(f'<polyline points="{" ".join(points)}" fill="none" stroke="#c9a84c" stroke-width="2.5" stroke-linecap="round"/>')
    save_svg('ebuir_double.svg', '\n'.join(paths))

def gen_fangsheng():
    """方胜纹 - 两个菱形交叠"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    s = 55
    offset = 35
    # 左菱形
    paths.append(f'<polygon points="{cx-offset},{cy-s} {cx-offset+s},{cy} {cx-offset},{cy+s} {cx-offset-s},{cy}" fill="none" stroke="#c9a84c" stroke-width="3"/>')
    # 右菱形
    paths.append(f'<polygon points="{cx+offset},{cy-s} {cx+offset+s},{cy} {cx+offset},{cy+s} {cx+offset-s},{cy}" fill="none" stroke="#c9a84c" stroke-width="3"/>')
    # 交叠区域填充
    paths.append(f'<polygon points="{cx-offset+s},{cy} {cx+offset-s},{cy} {cx},{cy+20} {cx},{cy-20}" fill="rgba(201,168,76,0.15)" stroke="none"/>')
    save_svg('fangsheng.svg', '\n'.join(paths))

def gen_hana():
    """哈那纹 - 蒙古包哈那骨架纹"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    # 哈那是蒙古包的格栅壁体，交叉的木棍形成菱形网格
    for i in range(10):
        # 正斜线
        x1 = i * 45 - 20
        paths.append(f'<line x1="{x1}" y1="50" x2="{x1+300}" y2="350" stroke="#c9a84c" stroke-width="2" opacity="0.8"/>')
        # 反斜线
        paths.append(f'<line x1="{x1+300}" y1="50" x2="{x1}" y2="350" stroke="#c9a84c" stroke-width="2" opacity="0.8"/>')
    # 交叉点装饰
    for row in range(5):
        for col in range(6):
            x = col * 65 + 30 + (row % 2) * 32
            y = row * 70 + 80
            if 20 < x < 380 and 40 < y < 370:
                paths.append(f'<circle cx="{x}" cy="{y}" r="3" fill="#c9a84c" opacity="0.5"/>')
    save_svg('hana_pattern.svg', '\n'.join(paths))

def gen_juzi():
    """锯齿纹 - 蒙古族常见几何边饰"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    # 多行锯齿纹带
    for band_idx, band_y in enumerate([80, 160, 240, 320]):
        points = []
        for i in range(16):
            x = i * 25 + 10
            if i % 2 == 0:
                points.append(f"{x},{band_y-15}")
            else:
                points.append(f"{x},{band_y+15}")
        paths.append(f'<polyline points="{" ".join(points)}" fill="none" stroke="#c9a84c" stroke-width="2.5"/>')
        # 镜像锯齿
        points2 = []
        for i in range(16):
            x = i * 25 + 10
            if i % 2 == 0:
                points2.append(f"{x},{band_y+15}")
            else:
                points2.append(f"{x},{band_y-15}")
        paths.append(f'<polyline points="{" ".join(points2)}" fill="none" stroke="rgba(201,168,76,0.4)" stroke-width="1.5"/>')
    save_svg('juzi_zigzag.svg', '\n'.join(paths))

def gen_lingxing():
    """菱形纹 - 连续菱形几何纹"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#0f1525"/>')
    # 菱形网格
    size = 40
    for row in range(5):
        for col in range(5):
            cx = col * 80 + 40
            cy = row * 80 + 40
            paths.append(f'<polygon points="{cx},{cy-size} {cx+size},{cy} {cx},{cy+size} {cx-size},{cy}" fill="none" stroke="#c9a84c" stroke-width="2"/>')
            # 内部小菱形
            s2 = size // 2
            paths.append(f'<polygon points="{cx},{cy-s2} {cx+s2},{cy} {cx},{cy+s2} {cx-s2},{cy}" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="1"/>')
    save_svg('lingxing_grid.svg', '\n'.join(paths))

# ============================================================
# 宗教纹样
# ============================================================

def gen_juancao_1():
    """卷草纹 - S形连续卷草"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    # S形主茎
    paths.append(f'''<path d="M50,200 C100,100 150,300 200,200 C250,100 300,300 350,200" fill="none" stroke="#c9a84c" stroke-width="3"/>''')
    # 上方卷曲叶片
    for x in [100, 200, 300]:
        paths.append(f'''<path d="M{x},{200-40} C{x-20},{200-70} {x+10},{200-80} {x+25},{200-55} C{x+15},{200-45} {x+5},{200-35} {x},{200-40}" fill="rgba(201,168,76,0.2)" stroke="#c9a84c" stroke-width="2"/>''')
    # 下方卷曲叶片
    for x in [150, 250, 350]:
        paths.append(f'''<path d="M{x},{200+40} C{x+20},{200+70} {x-10},{200+80} {x-25},{200+55} C{x-15},{200+45} {x-5},{200+35} {x},{200+40}" fill="rgba(201,168,76,0.2)" stroke="#c9a84c" stroke-width="2"/>''')
    save_svg('juancao_s_wave.svg', '\n'.join(paths))

def gen_juancao_2():
    """卷草纹 - 环形卷草"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 圆形主茎
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="80" fill="none" stroke="#c9a84c" stroke-width="2.5"/>')
    # 向外伸展的卷草
    for i in range(8):
        angle = math.radians(i * 45)
        x1 = cx + math.cos(angle) * 80
        y1 = cy + math.sin(angle) * 80
        x2 = cx + math.cos(angle) * 120
        y2 = cy + math.sin(angle) * 120
        # 卷曲末端
        ctrl_angle = angle + 0.5
        cx2 = x2 + math.cos(ctrl_angle) * 20
        cy2 = y2 + math.sin(ctrl_angle) * 20
        paths.append(f'''<path d="M{x1},{y1} Q{x2},{y2} {cx2},{cy2}" fill="none" stroke="#c9a84c" stroke-width="2.5" stroke-linecap="round"/>''')
        # 小叶
        paths.append(f'<circle cx="{cx2}" cy="{cy2}" r="5" fill="rgba(201,168,76,0.3)" stroke="#c9a84c" stroke-width="1.5"/>')
    # 中心花
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="15" fill="rgba(201,168,76,0.15)" stroke="#c9a84c" stroke-width="2"/>')
    save_svg('juancao_ring.svg', '\n'.join(paths))

def gen_lianhua_1():
    """莲花纹 - 八瓣莲花"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 八瓣莲花
    petals = 8
    for i in range(petals):
        angle = math.radians(i * 360 / petals - 90)
        # 花瓣外端
        px = cx + math.cos(angle) * 80
        py = cy + math.sin(angle) * 80
        # 花瓣两侧控制点
        a1 = angle - 0.4
        a2 = angle + 0.4
        c1x = cx + math.cos(a1) * 50
        c1y = cy + math.sin(a1) * 50
        c2x = cx + math.cos(a2) * 50
        c2y = cy + math.sin(a2) * 50
        paths.append(f'''<path d="M{cx},{cy} Q{c1x},{c1y} {px},{py} Q{c2x},{c2y} {cx},{cy}" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="2"/>''')
    # 中心圆
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="20" fill="rgba(201,168,76,0.2)" stroke="#c9a84c" stroke-width="2.5"/>')
    # 中心点
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="6" fill="#c9a84c" opacity="0.6"/>')
    save_svg('lianhua_8petal.svg', '\n'.join(paths))

def gen_lianhua_2():
    """莲花纹 - 侧面莲花（用于边饰）"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#0f1525"/>')
    cx, cy = 200, 220
    # 侧面莲花 - 层层花瓣
    for layer in range(3):
        r = 50 + layer * 25
        n_petals = 5 + layer * 2
        for i in range(n_petals):
            angle = math.radians(180 + i * 180 / (n_petals - 1))
            px = cx + math.cos(angle) * r
            py = cy + math.sin(angle) * r * 0.6
            paths.append(f'''<ellipse cx="{px}" cy="{py}" rx="12" ry="{18-layer*3}" fill="rgba(201,168,76,{0.15-layer*0.03})" stroke="#c9a84c" stroke-width="{2-layer*0.3}" transform="rotate({math.degrees(angle)+90},{px},{py})"/>''')
    # 莲座
    paths.append(f'''<path d="M{cx-80},{cy+20} Q{cx},{cy+40} {cx+80},{cy+20}" fill="none" stroke="#c9a84c" stroke-width="2.5"/>''')
    save_svg('lianhua_side.svg', '\n'.join(paths))

def gen_baoxiang_1():
    """宝相花纹 - 多层对称宝相花"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 外层大瓣 (8瓣)
    for i in range(8):
        angle = math.radians(i * 45)
        px = cx + math.cos(angle) * 95
        py = cy + math.sin(angle) * 95
        paths.append(f'''<ellipse cx="{px}" cy="{py}" rx="22" ry="35" fill="rgba(201,168,76,0.08)" stroke="#c9a84c" stroke-width="1.5" transform="rotate({i*45},{px},{py})"/>''')
    # 中层花瓣 (8瓣，旋转22.5度)
    for i in range(8):
        angle = math.radians(i * 45 + 22.5)
        px = cx + math.cos(angle) * 60
        py = cy + math.sin(angle) * 60
        paths.append(f'''<ellipse cx="{px}" cy="{py}" rx="15" ry="25" fill="rgba(201,168,76,0.12)" stroke="#c9a84c" stroke-width="2" transform="rotate({i*45+22.5},{px},{py})"/>''')
    # 内层圆
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="25" fill="rgba(201,168,76,0.15)" stroke="#c9a84c" stroke-width="2.5"/>')
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="10" fill="#c9a84c" opacity="0.4"/>')
    save_svg('baoxiang_multi.svg', '\n'.join(paths))

def gen_fasuo():
    """法螺纹 - 佛教八宝之一"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 螺壳主体
    paths.append(f'''<path d="M{cx},{cy-80} C{cx+50},{cy-60} {cx+60},{cy-20} {cx+50},{cy+20} C{cx+40},{cy+60} {cx},{cy+80} {cx-10},{cy+70} C{cx-20},{cy+60} {cx-30},{cy+30} {cx-20},{cy} C{cx-10},{cy-30} {cx+10},{cy-50} {cx},{cy-80}" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="3"/>''')
    # 螺旋线
    for i in range(4):
        r = 20 + i * 15
        paths.append(f'''<path d="M{cx-r*0.3},{cy-r} C{cx+r*0.5},{cy-r*0.8} {cx+r*0.6},{cy+r*0.3} {cx-r*0.2},{cy+r*0.5}" fill="none" stroke="#c9a84c" stroke-width="1.5" opacity="{0.8-i*0.15}"/>''')
    save_svg('fasuo_conch.svg', '\n'.join(paths))

def gen_falun():
    """法轮纹 - 佛教八宝之一"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    r = 80
    # 外轮
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#c9a84c" stroke-width="3"/>')
    # 轮毂
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="20" fill="rgba(201,168,76,0.2)" stroke="#c9a84c" stroke-width="2.5"/>')
    # 八根辐条
    for i in range(8):
        angle = math.radians(i * 45)
        x1 = cx + math.cos(angle) * 20
        y1 = cy + math.sin(angle) * 20
        x2 = cx + math.cos(angle) * r
        y2 = cy + math.sin(angle) * r
        paths.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#c9a84c" stroke-width="2.5"/>')
    # 轮圈上的珠子
    for i in range(8):
        angle = math.radians(i * 45 + 22.5)
        px = cx + math.cos(angle) * r
        py = cy + math.sin(angle) * r
        paths.append(f'<circle cx="{px}" cy="{py}" r="5" fill="#c9a84c" opacity="0.5"/>')
    save_svg('falun_wheel.svg', '\n'.join(paths))

def gen_shuangyu():
    """双鱼纹 - 佛教八宝之一"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 左鱼
    paths.append(f'''<path d="M{cx-30},{cy-70} C{cx-60},{cy-40} {cx-60},{cy+40} {cx-30},{cy+70} C{cx-10},{cy+50} {cx-10},{cy-50} {cx-30},{cy-70}" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 右鱼
    paths.append(f'''<path d="M{cx+30},{cy-70} C{cx+60},{cy-40} {cx+60},{cy+40} {cx+30},{cy+70} C{cx+10},{cy+50} {cx+10},{cy-50} {cx+30},{cy-70}" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 鱼眼
    paths.append(f'<circle cx="{cx-35}" cy="{cy-20}" r="5" fill="#c9a84c" opacity="0.7"/>')
    paths.append(f'<circle cx="{cx+35}" cy="{cy-20}" r="5" fill="#c9a84c" opacity="0.7"/>')
    # 尾巴
    paths.append(f'''<path d="M{cx-30},{cy+70} L{cx-45},{cy+90} M{cx-30},{cy+70} L{cx-15},{cy+90}" fill="none" stroke="#c9a84c" stroke-width="2"/>''')
    paths.append(f'''<path d="M{cx+30},{cy+70} L{cx+45},{cy+90} M{cx+30},{cy+70} L{cx+15},{cy+90}" fill="none" stroke="#c9a84c" stroke-width="2"/>''')
    save_svg('shuangyu_fish.svg', '\n'.join(paths))

def gen_baosan():
    """宝伞纹 - 佛教八宝之一"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#0f1525"/>')
    cx, cy = 200, 180
    # 伞盖
    paths.append(f'''<path d="M{cx-80},{cy} Q{cx},{cy-60} {cx+80},{cy}" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="3"/>''')
    # 伞柄
    paths.append(f'<line x1="{cx}" y1="{cy}" x2="{cx}" y2="{cy+120}" stroke="#c9a84c" stroke-width="3"/>')
    # 伞顶宝珠
    paths.append(f'<circle cx="{cx}" cy="{cy-60}" r="8" fill="rgba(201,168,76,0.3)" stroke="#c9a84c" stroke-width="2"/>')
    # 飘带
    paths.append(f'''<path d="M{cx-80},{cy} C{cx-90},{cy+20} {cx-85},{cy+40} {cx-75},{cy+50}" fill="none" stroke="#c9a84c" stroke-width="2"/>''')
    paths.append(f'''<path d="M{cx+80},{cy} C{cx+90},{cy+20} {cx+85},{cy+40} {cx+75},{cy+50}" fill="none" stroke="#c9a84c" stroke-width="2"/>''')
    # 伞面纹饰
    for i in range(5):
        x = cx - 60 + i * 30
        paths.append(f'''<path d="M{x},{cy-5} Q{x+15},{cy-20} {x+30},{cy-5}" fill="none" stroke="rgba(201,168,76,0.4)" stroke-width="1.5"/>''')
    save_svg('baosan_umbrella.svg', '\n'.join(paths))

def gen_baoping():
    """宝瓶纹 - 佛教八宝之一"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 瓶身
    paths.append(f'''<path d="M{cx-30},{cy-60} C{cx-50},{cy-40} {cx-50},{cy+40} {cx-30},{cy+60} L{cx+30},{cy+60} C{cx+50},{cy+40} {cx+50},{cy-40} {cx+30},{cy-60} Z" fill="rgba(201,168,76,0.08)" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 瓶颈
    paths.append(f'''<path d="M{cx-15},{cy-60} L{cx-15},{cy-80} L{cx+15},{cy-80} L{cx+15},{cy-60}" fill="none" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 瓶口
    paths.append(f'''<path d="M{cx-20},{cy-80} L{cx-20},{cy-85} Q{cx},{cy-95} {cx+20},{cy-85} L{cx+20},{cy-80}" fill="none" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 如意宝珠冒出
    paths.append(f'<circle cx="{cx}" cy="{cy-100}" r="8" fill="rgba(201,168,76,0.3)" stroke="#c9a84c" stroke-width="2"/>')
    # 瓶身装饰
    paths.append(f'<ellipse cx="{cx}" cy="{cy}" rx="25" ry="20" fill="none" stroke="rgba(201,168,76,0.4)" stroke-width="1.5"/>')
    save_svg('baoping_vase.svg', '\n'.join(paths))

# ============================================================
# 动植物纹样 / 自然纹样
# ============================================================

def gen_yunwen_1():
    """云纹 - 如意云头"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 如意云头：三个圆弧组成
    paths.append(f'''<path d="M{cx-60},{cy} C{cx-60},{cy-40} {cx-30},{cy-50} {cx},{cy-30} C{cx+30},{cy-50} {cx+60},{cy-40} {cx+60},{cy} C{cx+40},{cy+10} {cx+20},{cy+5} {cx},{cy+15} C{cx-20},{cy+5} {cx-40},{cy+10} {cx-60},{cy}" fill="rgba(201,168,76,0.15)" stroke="#c9a84c" stroke-width="3"/>''')
    # 云尾
    paths.append(f'''<path d="M{cx},{cy+15} C{cx+5},{cy+30} {cx-5},{cy+50} {cx},{cy+70} C{cx+10},{cy+60} {cx+15},{cy+45} {cx+5},{cy+30}" fill="none" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 小云朵装饰
    for x, y in [(120, 130), (280, 150), (150, 280), (270, 270)]:
        paths.append(f'''<path d="M{x-15},{y} C{x-15},{y-10} {x},{y-12} {x+15},{y} C{x+10},{y+5} {x-10},{y+5} {x-15},{y}" fill="rgba(201,168,76,0.1)" stroke="rgba(201,168,76,0.5)" stroke-width="1.5"/>''')
    save_svg('yunwen_ruyi.svg', '\n'.join(paths))

def gen_yunwen_2():
    """云纹 - 行云纹（流动式）"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#0f1525"/>')
    # 多层流动云纹
    for i, y in enumerate([100, 180, 260, 340]):
        offset = i * 30
        paths.append(f'''<path d="M{-20+offset},{y} C{40+offset},{y-30} {80+offset},{y-30} {120+offset},{y} C{160+offset},{y+30} {200+offset},{y+30} {240+offset},{y} C{280+offset},{y-30} {320+offset},{y-30} {360+offset},{y}" fill="none" stroke="#c9a84c" stroke-width="2.5" opacity="{0.9-i*0.15}"/>''')
        # 云头卷曲
        paths.append(f'''<circle cx="{120+offset}" cy="{y}" r="8" fill="rgba(201,168,76,0.15)" stroke="rgba(201,168,76,0.5)" stroke-width="1.5"/>''')
    save_svg('yunwen_flowing.svg', '\n'.join(paths))

def gen_yunwen_3():
    """云纹 - 团云纹"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 200
    # 团云：多个圆弧组成的圆形云团
    for i in range(6):
        angle = math.radians(i * 60)
        r = 55
        px = cx + math.cos(angle) * r
        py = cy + math.sin(angle) * r
        paths.append(f'<circle cx="{px}" cy="{py}" r="30" fill="rgba(201,168,76,0.06)" stroke="#c9a84c" stroke-width="2"/>')
    # 中心
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="25" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="2.5"/>')
    # 外轮廓
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="85" fill="none" stroke="rgba(201,168,76,0.25)" stroke-width="1.5" stroke-dasharray="6,4"/>')
    save_svg('yunwen_cluster.svg', '\n'.join(paths))

def gen_huowen():
    """火纹 - 蒙古族传统火焰纹"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 250
    # 主火焰
    paths.append(f'''<path d="M{cx},{cy} C{cx-20},{cy-40} {cx-30},{cy-80} {cx-10},{cy-120} C{cx},{cy-90} {cx+5},{cy-130} {cx},{cy-160} C{cx+15},{cy-130} {cx+25},{cy-90} {cx+10},{cy-120} C{cx+30},{cy-80} {cx+20},{cy-40} {cx},{cy}" fill="rgba(201,168,76,0.15)" stroke="#c9a84c" stroke-width="3"/>''')
    # 左侧小火焰
    paths.append(f'''<path d="M{cx-25},{cy-10} C{cx-40},{cy-40} {cx-50},{cy-70} {cx-35},{cy-90} C{cx-30},{cy-70} {cx-25},{cy-50} {cx-25},{cy-10}" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="2"/>''')
    # 右侧小火焰
    paths.append(f'''<path d="M{cx+25},{cy-10} C{cx+40},{cy-40} {cx+50},{cy-70} {cx+35},{cy-90} C{cx+30},{cy-70} {cx+25},{cy-50} {cx+25},{cy-10}" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="2"/>''')
    # 底座
    paths.append(f'''<ellipse cx="{cx}" cy="{cy+10}" rx="40" ry="10" fill="none" stroke="#c9a84c" stroke-width="2"/>''')
    save_svg('huowen_flame.svg', '\n'.join(paths))

def gen_shanwen():
    """山纹 - 蒙古族山形纹"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    # 远山
    paths.append(f'''<path d="M0,300 L80,180 L160,260 L240,150 L320,230 L400,170 L400,400 L0,400 Z" fill="rgba(201,168,76,0.05)" stroke="rgba(201,168,76,0.3)" stroke-width="1.5"/>''')
    # 近山
    paths.append(f'''<path d="M0,350 L100,220 L200,300 L300,200 L400,280 L400,400 L0,400 Z" fill="rgba(201,168,76,0.08)" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 山顶敖包
    paths.append(f'<circle cx="300" cy="195" r="6" fill="rgba(201,168,76,0.4)" stroke="#c9a84c" stroke-width="1.5"/>')
    # 天空云纹
    paths.append(f'''<path d="M80,80 C100,60 130,60 150,80" fill="none" stroke="rgba(201,168,76,0.4)" stroke-width="1.5"/>''')
    paths.append(f'''<path d="M250,100 C270,80 300,80 320,100" fill="none" stroke="rgba(201,168,76,0.3)" stroke-width="1.5"/>''')
    save_svg('shanwen_mountain.svg', '\n'.join(paths))

def gen_shuibowen():
    """水波纹 - 连续波浪"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#0f1525"/>')
    # 多层水波
    for i in range(8):
        y = 60 + i * 45
        paths.append(f'''<path d="M0,{y} C50,{y-20} 100,{y+20} 150,{y} C200,{y-20} 250,{y+20} 300,{y} C350,{y-20} 400,{y+20} 450,{y}" fill="none" stroke="#c9a84c" stroke-width="2" opacity="{0.9-i*0.08}"/>''')
    save_svg('shuibowen_wave.svg', '\n'.join(paths))

def gen_horse():
    """马纹 - 奔马侧影"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    # 简化的奔马轮廓
    paths.append(f'''<path d="M100,250 C110,230 130,210 150,200 C160,195 170,185 175,170 C178,160 185,150 195,145 L200,130 C205,125 210,128 208,135 L205,145 C215,140 230,138 240,140 C260,142 280,148 295,160 C310,172 320,185 325,200 C330,215 328,230 320,240 L340,270 C342,278 338,280 335,275 L315,250 C310,255 300,258 290,260 L295,290 C296,298 292,300 289,295 L280,265 C270,267 260,268 250,267 L255,295 C256,303 252,305 249,300 L240,268 C230,265 220,262 210,260 C200,258 185,258 175,262 L170,290 C169,298 165,299 164,293 L165,262 C155,265 145,270 140,280 C138,285 134,284 135,278 C138,270 142,260 148,252 C140,255 130,256 125,258 C120,260 118,256 122,253 C128,250 135,247 145,245 C138,248 130,250 125,252" fill="rgba(201,168,76,0.15)" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 鬃毛飘动
    paths.append(f'''<path d="M195,145 C185,130 180,120 185,110 C188,115 192,125 195,130" fill="none" stroke="#c9a84c" stroke-width="2"/>''')
    paths.append(f'''<path d="M200,148 C192,135 190,122 195,112" fill="none" stroke="rgba(201,168,76,0.6)" stroke-width="1.5"/>''')
    save_svg('horse_gallop.svg', '\n'.join(paths))

def gen_deer():
    """鹿纹 - 鹿石风格鹿"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 220
    # 鹿身体（简洁几何化，模仿鹿石风格）
    paths.append(f'''<path d="M{cx-40},{cy} C{cx-50},{cy-20} {cx-40},{cy-50} {cx-20},{cy-60} L{cx+30},{cy-65} C{cx+50},{cy-60} {cx+60},{cy-40} {cx+55},{cy-20} C{cx+50},{cy} {cx+40},{cy+10} {cx+30},{cy+10} L{cx-20},{cy+10} C{cx-35},{cy+10} {cx-40},{cy+5} {cx-40},{cy}" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 鹿头
    paths.append(f'''<path d="M{cx-20},{cy-60} C{cx-30},{cy-70} {cx-35},{cy-85} {cx-25},{cy-90} C{cx-15},{cy-95} {cx-10},{cy-85} {cx-15},{cy-70}" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="2"/>''')
    # 鹿角（鹿石风格 - 向后飘扬）
    paths.append(f'''<path d="M{cx-25},{cy-90} C{cx-15},{cy-110} {cx},{cy-120} {cx+20},{cy-125} C{cx+30},{cy-128} {cx+40},{cy-125} {cx+45},{cy-120}" fill="none" stroke="#c9a84c" stroke-width="2.5" stroke-linecap="round"/>''')
    paths.append(f'''<path d="M{cx-20},{cy-95} C{cx-10},{cy-105} {cx+5},{cy-110} {cx+15},{cy-108}" fill="none" stroke="#c9a84c" stroke-width="2" stroke-linecap="round"/>''')
    paths.append(f'''<path d="M{cx+10},{cy-122} L{cx+15},{cy-135} M{cx+25},{cy-125} L{cx+30},{cy-140} M{cx+40},{cy-122} L{cx+45},{cy-135}" fill="none" stroke="#c9a84c" stroke-width="1.8" stroke-linecap="round"/>''')
    # 四条腿
    for lx in [cx-30, cx-15, cx+20, cx+40]:
        paths.append(f'<line x1="{lx}" y1="{cy+10}" x2="{lx-5}" y2="{cy+60}" stroke="#c9a84c" stroke-width="2"/>')
    save_svg('deer_stone.svg', '\n'.join(paths))

def gen_camel():
    """骆驼纹"""
    paths = []
    paths.append('<rect width="400" height="400" fill="#1a1a2e"/>')
    cx, cy = 200, 220
    # 骆驼身体轮廓
    paths.append(f'''<path d="M{cx-60},{cy} C{cx-70},{cy-20} {cx-50},{cy-50} {cx-30},{cy-55} C{cx-20},{cy-70} {cx-10},{cy-75} {cx},{cy-65} C{cx+10},{cy-75} {cx+20},{cy-70} {cx+30},{cy-55} C{cx+50},{cy-50} {cx+70},{cy-20} {cx+60},{cy}" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" stroke-width="2.5"/>''')
    # 颈和头
    paths.append(f'''<path d="M{cx-30},{cy-55} C{cx-45},{cy-70} {cx-55},{cy-90} {cx-50},{cy-105}