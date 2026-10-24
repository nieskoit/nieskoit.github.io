#!/usr/bin/env python3
"""Generate public/sitemap.xml from real HTML pages in public/.

Run from any working directory: python tools/generate_sitemap.py
No third-party dependencies required.
"""
from pathlib import Path
from urllib.parse import quote
from xml.etree import ElementTree as ET

BASE_URL = "https://krainatworcow.pl"
ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SITEMAP = PUBLIC / "sitemap.xml"
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace("", NS)


def route_for(html_path: Path) -> str:
    relative = html_path.relative_to(PUBLIC)
    if relative.as_posix() == "index.html":
        return "/"
    if relative.name == "index.html":
        route = "/" + relative.parent.as_posix().strip("/") + "/"
    else:
        route = "/" + relative.as_posix()
    # Keep URL path separators and safe URL characters; encode spaces/non-ASCII segments.
    return "/".join(quote(part, safe="-._~!$&'()*+,;=:@") for part in route.split("/"))


def is_indexable(html_path: Path) -> bool:
    rel = html_path.relative_to(PUBLIC).as_posix().lower()
    if rel == "404.html" or rel.startswith(("pv/", "assets/", "fonts/")):
        return False
    try:
        head = html_path.read_text(encoding="utf-8", errors="ignore")[:30000].lower()
    except OSError:
        return False
    # Respect explicit noindex directives; ordinary pages are included by default.
    return 'content="noindex' not in head and "content='noindex" not in head


def main() -> int:
    if not PUBLIC.is_dir():
        raise SystemExit(f"Nie znaleziono katalogu strony: {PUBLIC}")

    pages = sorted(
        (path for path in PUBLIC.rglob("*.html") if is_indexable(path)),
        key=lambda path: route_for(path),
    )
    root = ET.Element(f"{{{NS}}}urlset")
    urls = set()
    for page in pages:
        loc = BASE_URL + route_for(page)
        if loc in urls:
            continue
        urls.add(loc)
        url_node = ET.SubElement(root, f"{{{NS}}}url")
        ET.SubElement(url_node, f"{{{NS}}}loc").text = loc

    ET.indent(root, space="  ")
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    SITEMAP.write_text(xml + ET.tostring(root, encoding="unicode") + "\n", encoding="utf-8")
    print(f"Sitemap wygenerowany: {SITEMAP}")
    print(f"Liczba adresów: {len(urls)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
