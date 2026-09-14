#!/usr/bin/env python3
"""Assemble deploy/design-N.html from src/design-N.html + shared partials.
Run:  python3 build.py        (from the Client Website folder)"""
import io, os, re, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC, OUT, SH = os.path.join(ROOT, "src"), os.path.join(ROOT, "deploy"), os.path.join(ROOT, "deploy", "shared")
rd = lambda p: io.open(p, encoding="utf-8").read()

HEAD = '''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon.png" sizes="256x256" type="image/png">
<link rel="apple-touch-icon" href="favicon.png">
<meta name="theme-color" content="#0B1C26">
<meta name="description" content="Independent electrical design, classification and inspection for offshore wind, solar and industrial power systems. Belgium, France, Spain.">
<script>(function(){try{var t=localStorage.getItem("ee-theme");if(t)document.documentElement.setAttribute("data-theme",t);else if(matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.setAttribute("data-theme","dark")}catch(e){}})()</script>
<link rel="stylesheet" href="shared/base.css">'''

SUNMOON = '''<button class="icon-btn" id="theme" aria-label="Toggle dark mode">
<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" stroke-linecap="round"/></svg>
<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" stroke-linejoin="round"/></svg>
</button>'''

TOOLS = '''<div class="tools">
<div class="lang" role="group" aria-label="Language"><button data-lang="en">EN</button><button data-lang="fr">FR</button><button data-lang="nl">NL</button></div>
''' + SUNMOON + '''
<button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="drawer"><i></i><i></i><i></i></button>
</div>'''

NAV = '''<nav class="main" aria-label="Main">
<a href="#services" data-i18n="nav1">Services</a><a href="#sectors" data-i18n="nav6">Sectors</a>
<a href="#projects" data-i18n="nav2">Projects</a><a href="#approach" data-i18n="nav3">Approach</a>
<a href="#about" data-i18n="nav4">About</a><a href="#contact" data-i18n="nav5">Contact</a>
</nav>'''

SCRIPTS = '''<script src="shared/content.js"></script>
<script src="shared/app.js"></script>'''

RIBBON = '''<a class="skip" href="#main" data-i18n="skip">Skip to content</a>
<div class="prog" id="prog"></div>
<div class="ribbon">Design concept for <b>Energy Experts BV</b> &middot; placeholder content &middot; not a live site</div>'''

LEGAL = '''<b>Energy Experts BV</b><br>Albrecht Rodenbachlaan 29, 1850 Grimbergen<br>
<span data-i18n="fEnt">Enterprise no.</span> BE 0XXX.XXX.XXX &middot; <span data-i18n="fVat">VAT</span> BE 0XXX.XXX.XXX &middot; RPR Brussel'''

FOOT_LINKS = '''<div><h4 data-i18n="fNav">Site</h4><a href="#services" data-i18n="nav1b">Services</a><a href="#sectors" data-i18n="nav6b">Sectors</a><a href="#projects" data-i18n="nav2b">Projects</a><a href="#approach" data-i18n="nav3b">Approach</a></div>
<div><h4 data-i18n="fComp">Company</h4><a href="#about" data-i18n="nav4b">About</a><a href="#faq" data-i18n="fFaq">FAQ</a><a href="#contact" data-i18n="nav5b">Contact</a><a href="#" data-i18n="fCareer">Careers</a></div>
<div><h4 data-i18n="fLegal">Legal</h4><a href="#" data-i18n="fl1">Privacy policy</a><a href="#" data-i18n="fl3">Terms &amp; conditions</a><a href="#" data-i18n="fl4">Complaints</a><a href="img/CREDITS.txt" data-i18n="photoCredits">Photo credits</a></div>'''

FOOT_BTM = '''<span>&copy; 2026 Energy Experts BV</span>
<span><button id="ckOpen" data-i18n="fCk">Cookie settings</button> &middot; <span data-i18n="fBtm">Design concept &middot; placeholder content</span></span>'''

REPL = {
  "@head": HEAD, "@tools": TOOLS, "@nav": NAV, "@sunmoon": SUNMOON, "@scripts": SCRIPTS,
  "@ribbon": RIBBON, "@legal": LEGAL, "@footlinks": FOOT_LINKS, "@footbtm": FOOT_BTM,
  "@partials": rd(os.path.join(SH, "partials.html")),
  "@form": rd(os.path.join(SH, "form.html")),
  "@map": rd(os.path.join(SH, "map.html")),
}
built = 0
for fn in sorted(os.listdir(SRC)):
    if not fn.endswith(".html"): continue
    html = rd(os.path.join(SRC, fn))
    for k, v in REPL.items(): html = html.replace("<!-- %s -->" % k, v)
    left = re.findall(r"<!-- @\w+ -->", html)
    if left: print("WARN unknown markers in", fn, left)
    io.open(os.path.join(OUT, fn), "w", encoding="utf-8").write(html)
    built += 1
    print("built", fn, len(html.encode()), "bytes")
print("done:", built, "files")
