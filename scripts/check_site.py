from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"

class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.resources = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)

        for attr in ("src", "href", "poster"):
            value = attrs.get(attr)
            if value:
                self.resources.append(value)

def resolve_resource(reference, base):
    reference = unquote(reference.strip())
    parsed = urlsplit(reference)

    if parsed.scheme or parsed.netloc or not parsed.path:
        return None

    path = parsed.path

    if path.startswith("/"):
        result = ROOT / path.lstrip("/")
    else:
        result = base / path

    if path.endswith("/"):
        result = result / "index.html"

    return result.resolve()

def main():
    errors = []

    if not INDEX.is_file():
        print("ERROR: index.html not found!")
        raise SystemExit(1)

    print("Checking index.html...")

    parser = SiteParser()
    parser.feed(INDEX.read_text(encoding="utf-8"))

    css_files = []

    for reference in parser.resources:
        resource = resolve_resource(reference, ROOT)

        if resource is None:
            continue

        if not resource.is_file():
            errors.append(f"Missing resource: {reference}")
        else:
            print(f"OK: {reference}")

            if resource.suffix.lower() == ".css":
                css_files.append(resource)

    for css_file in css_files:
        print(f"Checking CSS: {css_file.name}")

        content = css_file.read_text(encoding="utf-8")

        urls = re.findall(
            r"url\(\s*['\"]?(.*?)['\"]?\s*\)",
            content
        )

        for url in urls:
            resource = resolve_resource(url, css_file.parent)

            if resource is None:
                continue

            if not resource.is_file():
                errors.append(f"Missing CSS resource: {url}")
            else:
                print(f"OK: CSS resource {url}")

    if errors:
        print("\nCHECK FAILED:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)

    print("\nSUCCESS: All local resources exist!")

if __name__ == "__main__":
    main()
