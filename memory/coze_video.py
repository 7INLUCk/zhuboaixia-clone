#!/usr/bin/env python3
"""
coze_video.py — 豆包 Seed Dance 1.5 Pro 视频生成脚本
从图片生成视频，支持绿幕人像。

使用方法：
    python3 coze_video.py --image "图片URL" --prompt "描述" --output /tmp/output.mp4

参数说明：
    --image      输入图片URL
    --prompt     视频动作描述
    --duration   视频时长，可选 5/10（默认 5）
    --resolution 分辨率，可选 720p/1080p（默认 720p）
    --sound      是否生成声音（默认 true）
    --output     输出视频保存路径（默认 /tmp/coze_video.mp4）
"""

import argparse
import json
import sys
import urllib.request
import urllib.error
import os

# 配置
COZE_API_URL = "https://api.coze.cn/v1/workflow/stream_run"
COZE_PAT_TOKEN = "pat_S9JEK3AHHUfllNAupHRVNuxw4ZBkqUziZOeGpaUR5meX50Q5iSKZPzHc7b4xBVXk"
WORKFLOW_ID = "7589158640256614436"


def generate_video(image_url: str, prompt: str, duration: str = "5", 
                   resolution: str = "720p", sound: bool = True) -> str:
    """
    调用豆包 Seed Dance 1.5 Pro 生成视频
    返回视频 URL
    """
    payload = json.dumps({
        "workflow_id": WORKFLOW_ID,
        "parameters": {
            "image": [image_url],
            "prompt": prompt,
            "duration": duration,
            "resolution": resolution,
            "sound": sound
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        COZE_API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {COZE_PAT_TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            raw_lines = resp.read().decode("utf-8").splitlines()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode()}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"网络错误: {e.reason}")

    # 解析 SSE 流，找到 End 节点的 video URL
    for line in raw_lines:
        if not line.startswith("data:"):
            continue
        try:
            data = json.loads(line[5:].strip())
        except json.JSONDecodeError:
            continue

        if data.get("node_type") == "End" or data.get("node_title") == "End":
            content_str = data.get("content", "")
            try:
                content = json.loads(content_str)
                output = content.get("output", [])
                if output:
                    return output[0]
            except (json.JSONDecodeError, AttributeError):
                pass

    raise RuntimeError("未找到视频 URL")


def download_video(url: str, output_path: str) -> None:
    """下载视频到本地"""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    urllib.request.urlretrieve(url, output_path)


def main():
    parser = argparse.ArgumentParser(description="豆包 Seed Dance 1.5 Pro 视频生成")
    parser.add_argument("--image", required=True, help="输入图片URL")
    parser.add_argument("--prompt", required=True, help="视频动作描述")
    parser.add_argument("--duration", default="5", choices=["5", "10"], help="视频时长")
    parser.add_argument("--resolution", default="720p", choices=["720p", "1080p"], help="分辨率")
    parser.add_argument("--sound", default="true", help="是否生成声音")
    parser.add_argument("--output", default="/tmp/coze_video.mp4", help="保存路径")
    args = parser.parse_args()

    sound_bool = args.sound.lower() != "false"

    print(f"🎬 生成中... prompt={args.prompt[:50]}...")
    print(f"   duration={args.duration}s  resolution={args.resolution}  sound={sound_bool}")

    try:
        url = generate_video(
            args.image, args.prompt, 
            args.duration, args.resolution, sound_bool
        )
        print(f"✅ 生成成功！")
        print(f"   视频 URL: {url}")
        download_video(url, args.output)
        print(f"   已下载到: {args.output}")
        print(f"URL:{url}")
    except RuntimeError as e:
        print(f"❌ 生成失败: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()