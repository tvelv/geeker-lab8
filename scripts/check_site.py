from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids = set()
        self.links = []
        self.feed(path.read_text(encoding="utf-8-sig"))
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if data.get("id"):
            self.ids.add(data["id"])
        for name in ("href", "src", "poster"):
            if data.get(name):
                self.links.append(data[name])

pages = {p: Page(p) for p in ROOT.glob("*.html")}
errors = []
checked = 0
for source, page in pages.items():
    for ref in page.links:
        u = urlsplit(ref)
        if u.scheme or u.netloc:
            continue
        if u.path.startswith("/"):
            errors.append(f"{source.name}: {ref} bypasses the project path")
            continue
        path = (source.parent / unquote(u.path)).resolve() if u.path else source
        checked += 1
        if not path.is_relative_to(ROOT) or not path.is_file():
            errors.append(f"{source.name}: missing file {ref}")
        elif path in pages and u.fragment and unquote(u.fragment) not in pages[path].ids:
            errors.append(f"{source.name}: missing anchor {ref}")
if errors:
    raise SystemExit("\n".join(errors))
print(f"OK: {len(pages)} HTML pages and {checked} local links or asset references")
