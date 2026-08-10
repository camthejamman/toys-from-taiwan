/**
 * Builds docs/icon-guide.html — a self-contained visual reference for every
 * symbol in src/assets/sprite.svg.
 *
 *   npm run build-icon-guide
 *
 * Geometry (viewBox / aspect ratio / sizing hint) and usage counts are DERIVED
 * here from the sprite and from src/, so they can never drift. Only the prose —
 * descriptions, keywords and grouping — is curated, in scripts/icon-catalog.json.
 * Add a symbol to the sprite and it still appears (under "Other", with a warning)
 * until you describe and group it there.
 *
 * Self-contained on purpose: sprite symbols, both webfont weights, all CSS and JS
 * are inlined, so the file works from file:// and satisfies the Artifact CSP,
 * which blocks every external host.
 *
 * Written WITHOUT <html>/<head>/<body> wrappers: Artifact supplies that skeleton
 * at publish time and browsers reconstruct it when the file is opened directly,
 * so one file serves both.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, resolve, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'docs/icon-guide.html')

const spriteRaw = readFileSync(resolve(ROOT, 'src/assets/sprite.svg'), 'utf8')
const catalog = JSON.parse(readFileSync(resolve(ROOT, 'scripts/icon-catalog.json'), 'utf8'))

// ---- geometry, parsed from the sprite itself -----------------------------
const icons = []
{
  const re = /<symbol\s+id="([^"]+)"\s+viewBox="([^"]+)"\s*>([\s\S]*?)<\/symbol>/g
  let m
  while ((m = re.exec(spriteRaw))) {
    const [, id, viewBox] = m
    const [, , w, h] = viewBox.split(/\s+/).map(Number)
    const aspect = +(w / h).toFixed(3)
    const square = Math.abs(aspect - 1) < 0.01
    icons.push({
      id, viewBox, aspect, square,
      // Sprite <svg>s have no intrinsic aspect ratio, so a non-square icon needs
      // an explicit width for a given height or it balloons to the 300px default.
      sizingHint: square ? 'h-6 w-6' : `h-[1.5em] w-[${+(1.5 * aspect).toFixed(2)}em]`,
    })
  }
}
if (!icons.length) throw new Error('no <symbol> found in sprite.svg — did its format change?')

// ---- usage, scanned from src/ --------------------------------------------
{
  const files = []
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.(tsx?|json)$/.test(e)) files.push(p)
    }
  }
  walk(resolve(ROOT, 'src'))
  const texts = files.map((f) => [relative(ROOT, f), readFileSync(f, 'utf8')])
  for (const i of icons) {
    i.files = texts.filter(([, t]) => t.includes(i.id)).map(([f]) => f)
    i.used = i.files.length > 0
  }
}

// ---- inline assets -------------------------------------------------------
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64')
const FONT_R = b64('src/assets/fonts/TeXGyreHeros-Regular-latin.woff2')
const FONT_B = b64('src/assets/fonts/TeXGyreHeros-Bold-latin.woff2')

// Strip the sprite's outer <svg> wrapper; keep <defs> and every <symbol>.
const spriteInner = spriteRaw
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .trim()

// ---- merge geometry + catalogue ------------------------------------------
const byId = new Map(icons.map((i) => [i.id, i]))
const cat = new Map((catalog.icons || []).map((c) => [c.id, c]))

let groups = (catalog.groups || []).map((g) => ({
  ...g,
  ids: g.ids.filter((id) => byId.has(id)),
}))

// Never silently drop an icon: anything the scheme missed lands in Other.
const placed = new Set(groups.flatMap((g) => g.ids))
const orphans = icons.map((i) => i.id).filter((id) => !placed.has(id))
if (orphans.length) {
  groups.push({ title: 'Other', subtitle: 'Not assigned by the category pass', ids: orphans })
  console.warn('WARN orphaned ids placed in "Other":', orphans.join(', '))
}
// And never show one twice.
const seen = new Set()
for (const g of groups) {
  g.ids = g.ids.filter((id) => (seen.has(id) ? false : (seen.add(id), true)))
}
groups = groups.filter((g) => g.ids.length)

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const ratio = (i) => {
  if (i.square) return '1:1'
  const a = i.aspect
  return a >= 1 ? `${a.toFixed(2)}:1` : `1:${(1 / a).toFixed(2)}`
}

// ---- tiles ---------------------------------------------------------------
const tile = (id) => {
  const i = byId.get(id)
  const c = cat.get(id) || {}
  // The identify pass flags icons whose art is MORE SPECIFIC than the name
  // implies. Independent review rejected both as "misleading", so these are
  // surfaced as informational notes, not errors.
  const noted = c.nameMatchesArt === false
  const search = [id, id.replace(/^icon-/, ''), c.appearance, c.description, ...(c.keywords || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return `
      <button class="tile" type="button" data-id="${esc(id)}" data-search="${esc(search)}"
              data-snippet="&lt;SpriteIcon name=&quot;${esc(id)}&quot; /&gt;"
              aria-label="Copy JSX snippet for ${esc(id)}">
        <span class="stage"><svg class="ico" aria-hidden="true"><use href="#${esc(id)}"></use></svg></span>
        <span class="tname">${esc(id.replace(/^icon-/, ''))}</span>
        <span class="tflags">
          ${i.square ? '' : `<span class="chip chip-ratio" title="Non-square — needs an explicit width">${ratio(i)}</span>`}
          ${i.used ? '' : '<span class="chip chip-unused" title="No reference found in src/">unused</span>'}
          ${noted ? `<span class="chip chip-note" title="${esc(c.mismatchNote || '')}">note</span>` : ''}
        </span>
        <span class="tdetail">
          ${c.appearance ? `<span class="tapp">${esc(c.appearance)}</span>` : ''}
          <code class="tvb">viewBox="${esc(i.viewBox)}"</code>
          <code class="tsize">${esc(i.sizingHint)}</code>
          ${i.used ? `<span class="tuse">${i.files.length} file${i.files.length === 1 ? '' : 's'}</span>` : ''}
        </span>
      </button>`
}

const sections = groups
  .map(
    (g) => `
    <section class="group" data-group="${esc(g.title)}">
      <header class="ghead">
        <h2>${esc(g.title)}</h2>
        <div class="rainbow-bar" aria-hidden="true"></div>
        <p class="gsub">${esc(g.subtitle)} <span class="gcount">${g.ids.length}</span></p>
      </header>
      <div class="grid">${g.ids.map(tile).join('')}</div>
    </section>`,
  )
  .join('')

const chips = groups
  .map((g) => `<button class="fchip" type="button" data-filter="${esc(g.title)}">${esc(g.title)}</button>`)
  .join('')

const nonSquare = icons.filter((i) => !i.square)
const unused = icons.filter((i) => !i.used)
const noted = (catalog.icons || []).filter((c) => c.nameMatchesArt === false)

// ---- page ----------------------------------------------------------------
const html = `<title>Icon Guide · Toys From Taiwan sprite</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
@font-face{font-family:'TeX Gyre Heros';src:url(data:font/woff2;base64,${FONT_R}) format('woff2');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'TeX Gyre Heros';src:url(data:font/woff2;base64,${FONT_B}) format('woff2');font-weight:700;font-style:normal;font-display:swap}

/* Tokens mirror src/styles.css so the guide reads as part of the project.
   Light is the complete set on bare :root; dark redefines ONLY tokens, once
   for prefers-color-scheme (guarded so an explicit light choice wins) and
   once for the [data-theme] stamp. No component color lives in either block. */
:root{
  --ink:#16324c; --muted:#3f5a73;
  --surface:#f4fafe; --surface-2:rgba(255,255,255,.68);
  --border:rgba(103,165,210,.4); --accent:#025d92; --accent-ink:#fff;
  --ground-a:#aed9f4; --ground-b:#d5ecfa; --ground-c:#ecf7fe;
  --stage:rgba(255,255,255,.55); --shadow:rgba(9,40,66,.18);
  --chip:rgba(2,93,146,.10); --note:#8a5a00; --note-bg:rgba(138,90,0,.10);
  --radius:.625rem;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --ink:#e6effd; --muted:#9db1cd;
    --surface:#0d1630; --surface-2:rgba(10,18,40,.62);
    --border:rgba(148,180,255,.18); --accent:#67c7f5; --accent-ink:#04121f;
    --ground-a:#03050d; --ground-b:#070d20; --ground-c:#0d1730;
    --stage:rgba(255,255,255,.05); --shadow:rgba(0,0,0,.5);
    --chip:rgba(103,199,245,.14); --note:#ffd479; --note-bg:rgba(255,212,121,.12);
  }
}
:root[data-theme="dark"]{
  --ink:#e6effd; --muted:#9db1cd;
  --surface:#0d1630; --surface-2:rgba(10,18,40,.62);
  --border:rgba(148,180,255,.18); --accent:#67c7f5; --accent-ink:#04121f;
  --ground-a:#03050d; --ground-b:#070d20; --ground-c:#0d1730;
  --stage:rgba(255,255,255,.05); --shadow:rgba(0,0,0,.5);
  --chip:rgba(103,199,245,.14); --note:#ffd479; --note-bg:rgba(255,212,121,.12);
}

*{box-sizing:border-box}
body{
  margin:0; color:var(--ink);
  background:linear-gradient(180deg,var(--ground-a) 0%,var(--ground-b) 48%,var(--ground-c) 100%);
  background-attachment:fixed;
  font-family:'TeX Gyre Heros','Helvetica Neue',Helvetica,Arial,sans-serif;
  font-size:16px; line-height:1.5; -webkit-font-smoothing:antialiased;
}
code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
h1,h2{text-wrap:balance;margin:0}

.wrap{max-width:96rem;margin:0 auto;padding:2rem 1rem 5rem}
@media(min-width:768px){.wrap{padding:2.5rem 2rem 6rem}}

/* masthead */
.mast{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.5rem}
.eyebrow{margin:0;font-size:.75rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.mast h1{font-size:clamp(1.75rem,5vw,2.75rem);font-weight:700;letter-spacing:-.01em}
.lede{margin:.25rem 0 0;max-width:62ch;color:var(--muted)}
.rainbow-bar{height:4px;border-radius:2px;background-image:linear-gradient(90deg,#e0508c,#e08a3c,#b9b32c,#3cb45c,#2e9fd0,#7f6ae0)}
.mast .rainbow-bar{width:min(22rem,60%)}

/* stats */
.stats{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem}
.stat{display:flex;align-items:baseline;gap:.4rem;padding:.4rem .7rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-2);backdrop-filter:blur(8px)}
.stat b{font-size:1.05rem;font-variant-numeric:tabular-nums}
.stat span{font-size:.78rem;color:var(--muted)}

/* toolbar */
.bar{position:sticky;top:0;z-index:20;margin:1.25rem 0 2rem;padding:.7rem;
  display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;
  border:1px solid var(--border);border-radius:var(--radius);
  background:var(--surface);box-shadow:0 6px 18px -10px var(--shadow)}
.search{flex:1 1 15rem;min-width:0;display:flex;align-items:center;gap:.5rem;
  padding:.5rem .7rem;border:1px solid var(--border);border-radius:.375rem;background:var(--surface-2)}
.search input{flex:1;min-width:0;border:0;background:transparent;color:var(--ink);font:inherit;font-size:.9rem;outline:none}
.search input::placeholder{color:var(--muted)}
.fchips{display:flex;flex-wrap:wrap;gap:.35rem}
.fchip,.tgl{cursor:pointer;font:inherit;font-size:.8rem;font-weight:700;
  padding:.4rem .7rem;border:1px solid var(--border);border-radius:.375rem;
  background:var(--surface-2);color:var(--ink);transition:background .15s,color .15s,border-color .15s}
.fchip:hover,.tgl:hover{border-color:var(--accent);color:var(--accent)}
.fchip[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.tgl[aria-pressed="true"]{background:var(--chip);border-color:var(--accent);color:var(--accent)}
.count{margin-left:auto;font-size:.8rem;color:var(--muted);font-variant-numeric:tabular-nums}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* groups */
.group{margin-bottom:2.75rem}
.group[hidden]{display:none}
.ghead{margin-bottom:1rem}
.ghead h2{font-size:1.35rem;font-weight:700;display:inline-block}
.ghead .rainbow-bar{width:100%;max-width:9rem;margin-top:.4rem}
.gsub{margin:.5rem 0 0;font-size:.85rem;color:var(--muted)}
.gcount{display:inline-block;margin-left:.35rem;padding:.05rem .4rem;border-radius:999px;
  background:var(--chip);color:var(--accent);font-weight:700;font-variant-numeric:tabular-nums}

/* grid */
.grid{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(9.5rem,1fr))}
.tile{display:flex;flex-direction:column;align-items:center;gap:.5rem;
  padding:1rem .6rem;cursor:pointer;text-align:center;
  border:1px solid var(--border);border-radius:var(--radius);
  background:var(--surface);color:var(--ink);font:inherit;
  box-shadow:0 4px 10px -8px var(--shadow);
  transition:transform .15s,border-color .15s,box-shadow .15s}
.tile:hover{transform:translateY(-2px);border-color:var(--accent);box-shadow:0 10px 20px -12px var(--shadow)}
.tile[hidden]{display:none}
.tile.copied{border-color:var(--accent);background:var(--chip)}
.stage{display:grid;place-items:center;width:100%;height:4.5rem;border-radius:.375rem;background:var(--stage)}
/* No viewBox on the outer svg: the <use> adopts each symbol's own viewBox and
   scales to fit with preserveAspectRatio meet, so every aspect ratio renders
   true inside one square stage. Same shape as SpriteIcon.tsx. */
.ico{width:2.75rem;height:2.75rem;fill:currentColor;color:var(--ink)}
body.tint .ico{fill:var(--tint,currentColor)}
.tname{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.78rem;
  line-height:1.25;word-break:break-word;color:var(--ink)}
.tflags{display:flex;flex-wrap:wrap;gap:.25rem;justify-content:center}
.chip{font-size:.62rem;font-weight:700;letter-spacing:.03em;padding:.1rem .35rem;border-radius:999px;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.chip-ratio{background:var(--chip);color:var(--accent)}
.chip-unused{background:var(--chip);color:var(--muted)}
.chip-note{background:var(--note-bg);color:var(--note)}
.tdetail{display:none;flex-direction:column;gap:.25rem;width:100%;font-size:.62rem;color:var(--muted)}
body.details .tdetail{display:flex}
.tdetail code{display:block;word-break:break-all;font-size:.6rem;color:var(--muted)}
.tapp{font-family:'TeX Gyre Heros',sans-serif;font-size:.68rem;line-height:1.35;color:var(--muted)}

.empty{padding:3rem 1rem;text-align:center;color:var(--muted)}
.empty[hidden]{display:none}

/* notes */
.notes{margin-top:3rem;padding:1.25rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface)}
.notes h2{font-size:1.05rem;font-weight:700;margin-bottom:.5rem}
.notes ul{margin:.5rem 0 0;padding-left:1.1rem;color:var(--muted);font-size:.88rem}
.notes li{margin:.35rem 0}
.notes code{font-size:.82rem;color:var(--ink);background:var(--chip);padding:.05rem .3rem;border-radius:.2rem}

.toast{position:fixed;left:50%;bottom:1.5rem;transform:translate(-50%,1rem);opacity:0;pointer-events:none;
  padding:.55rem .9rem;border-radius:.375rem;background:var(--accent);color:var(--accent-ink);
  font-size:.85rem;font-weight:700;transition:opacity .2s,transform .2s;z-index:50}
.toast.show{opacity:1;transform:translate(-50%,0)}

@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
</style>

<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">
${spriteInner}
</svg>

<div class="wrap">
  <header class="mast">
    <p class="eyebrow">Toys From Taiwan · src/assets/sprite.svg</p>
    <h1>Icon Guide</h1>
    <div class="rainbow-bar" aria-hidden="true"></div>
    <p class="lede">Every symbol in the sprite, rendered from the real file. Click any icon to copy its
      <code class="mono">&lt;SpriteIcon&gt;</code> snippet. Icons carry no fills, so they inherit
      <code class="mono">currentColor</code>.</p>
    <div class="stats">
      <div class="stat"><b>${icons.length}</b><span>icons</span></div>
      <div class="stat"><b>${icons.length - unused.length}</b><span>in use</span></div>
      <div class="stat"><b>${unused.length}</b><span>unused</span></div>
      <div class="stat"><b>${nonSquare.length}</b><span>non-square</span></div>
    </div>
  </header>

  <div class="bar">
    <label class="search">
      <svg class="ico" style="width:1rem;height:1rem;color:var(--muted)" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>
      <input id="q" type="search" placeholder="Search name, look, or keyword…" autocomplete="off">
    </label>
    <div class="fchips">
      <button class="fchip" type="button" data-filter="*" aria-pressed="true">All</button>
      ${chips}
    </div>
    <button class="tgl" type="button" id="tDetails" aria-pressed="false">Details</button>
    <button class="tgl" type="button" id="tTint" aria-pressed="false">Tint</button>
    <button class="tgl" type="button" id="tTheme" aria-pressed="false">Dark</button>
    <span class="count" id="count"></span>
  </div>

  <main id="results">${sections}</main>
  <p class="empty" id="empty" hidden>No icons match that search.</p>

  <section class="notes">
    <h2>Working notes</h2>
    <ul>
      <li>Sprite <code>&lt;svg&gt;</code>s have <b>no intrinsic aspect ratio</b> — <code>w-auto</code> balloons to the
        300px SVG default. The ${nonSquare.length} non-square icons need an explicit width; each tile's
        <b>Details</b> view carries a ready-made class (e.g. <code>icon-jam-cn</code> → <code>h-[1.5em] w-[3.06em]</code>).</li>
      <li>All ${icons.length} symbols have their fills stripped, so they take <code>currentColor</code>. Pass
        <code>tint</code> to <code>SpriteIcon</code> for a light-mode color; dark mode falls back to currentColor.</li>
      <li>Icon-only links must pass <code>label</code> to <code>SpriteIcon</code> — without it the icon renders
        <code>aria-hidden</code>.</li>
      <li>${unused.length} icons have no reference anywhere in <code>src/</code>: ${unused.map((i) => `<code>${esc(i.id)}</code>`).join(', ')}.</li>
      ${noted.length ? `<li>Art more specific than the name — worth knowing before you pick by id alone:
        ${noted.map((c) => `<code>${esc(c.id)}</code> is ${esc(c.appearance.replace(/^A /, '').replace(/^The /, ''))}`).join('; ')}.
        ${noted.length === 1 ? 'It was' : 'These were'} independently reviewed and judged terse rather than misleading, so nothing needs renaming.</li>` : ''}
    </ul>
  </section>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script>
(function(){
  var tiles=[].slice.call(document.querySelectorAll('.tile'));
  var groups=[].slice.call(document.querySelectorAll('.group'));
  var q=document.getElementById('q'), count=document.getElementById('count'),
      empty=document.getElementById('empty'), toast=document.getElementById('toast');
  var filter='*';

  // Rainbow rotation matching ICON_COLORS in src/lib/rainbow.ts.
  var TINTS=['#d6437f','#2a92c4','#2f9e53','#d97e2e','#7a63d8','#2fa39a','#c94747','#9b7d18'];
  tiles.forEach(function(t,i){ t.querySelector('.ico').style.setProperty('--tint',TINTS[i%TINTS.length]); });

  function apply(){
    var term=q.value.trim().toLowerCase(), shown=0;
    tiles.forEach(function(t){
      var okT=!term||t.dataset.search.indexOf(term)>-1;
      var okF=filter==='*'||t.closest('.group').dataset.group===filter;
      var vis=okT&&okF; t.hidden=!vis; if(vis) shown++;
    });
    groups.forEach(function(g){
      g.hidden=!g.querySelector('.tile:not([hidden])');
    });
    count.textContent=shown+' of '+tiles.length;
    empty.hidden=shown>0;
  }

  q.addEventListener('input',apply);
  document.querySelectorAll('.fchip').forEach(function(b){
    b.addEventListener('click',function(){
      filter=b.dataset.filter;
      document.querySelectorAll('.fchip').forEach(function(o){o.setAttribute('aria-pressed',String(o===b));});
      apply();
    });
  });

  function pop(msg){ toast.textContent=msg; toast.classList.add('show');
    clearTimeout(pop._t); pop._t=setTimeout(function(){toast.classList.remove('show');},1400); }

  tiles.forEach(function(t){
    t.addEventListener('click',function(){
      var snip=t.dataset.snippet;
      var done=function(){ t.classList.add('copied'); setTimeout(function(){t.classList.remove('copied');},600); pop('Copied '+t.dataset.id); };
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(snip).then(done,function(){fallback(snip,done);});
      } else fallback(snip,done);
    });
  });
  function fallback(text,done){
    var ta=document.createElement('textarea'); ta.value=text; ta.setAttribute('readonly','');
    ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
    try{document.execCommand('copy'); done();}catch(e){pop('Copy failed');}
    document.body.removeChild(ta);
  }

  function toggle(id,fn){
    var b=document.getElementById(id);
    b.addEventListener('click',function(){
      var on=b.getAttribute('aria-pressed')!=='true';
      b.setAttribute('aria-pressed',String(on)); fn(on,b);
    });
  }
  toggle('tDetails',function(on){document.body.classList.toggle('details',on);});
  toggle('tTint',function(on){document.body.classList.toggle('tint',on);});
  toggle('tTheme',function(on,b){
    document.documentElement.setAttribute('data-theme',on?'dark':'light');
    b.textContent=on?'Light':'Dark';
  });

  // Reflect the host/OS theme on load so the toggle starts truthful.
  try{
    if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){
      var b=document.getElementById('tTheme'); b.setAttribute('aria-pressed','true'); b.textContent='Light';
      document.documentElement.setAttribute('data-theme','dark');
    }
  }catch(e){}

  apply();
})();
</script>
`

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, html)
console.log('wrote', OUT, (html.length / 1024).toFixed(0) + 'KB')
console.log('groups:', groups.map((g) => `${g.title}(${g.ids.length})`).join(' '))
console.log('total tiles:', groups.reduce((n, g) => n + g.ids.length, 0), 'of', icons.length)
