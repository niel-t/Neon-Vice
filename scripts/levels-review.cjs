'use strict';
// Static review page for level research: every docs/levels brief, its research sketch
// (docs/levels/*.layout.json), the current authored plan (plans/*.js via plan.js) and the
// legacy in-game grid, plus MATERIALS and BALLISTICS. Docs tooling only; not part of the build.
// Usage: node scripts/levels-review.cjs [--out review/levels.html]
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('node:fs');
const { resolve, dirname } = require('node:path');
const { parseArgs } = require('node:util');

const root = resolve(__dirname, '..');
const read = f => readFileSync(resolve(root, f), 'utf8');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// [slug, title, doc, sidecar, plan id, legacy level index]
const LEVELS = [
  ['motel', 'Motel Sunset', 'docs/levels/motel-sunset.md', null, 'motel', 0],
  ['club', 'Club Flamingo', 'docs/levels/club.md', 'docs/levels/club.layout.json', 'club', 1],
  ['penthouse', 'The Penthouse', 'docs/levels/penthouse.md', 'docs/levels/penthouse.layout.json', 'penthouse', 2],
  ['marina', 'Vice Marina', 'docs/levels/marina.md', 'docs/levels/marina.layout.json', 'marina', 3],
  ['arcade', 'Starlight Arcade', 'docs/levels/arcade.md', 'docs/levels/arcade.layout.json', 'arcade', 4],
  ['mall', 'Ocean View Mall', 'docs/levels/mall.md', 'docs/levels/mall.layout.json', 'mall', 5],
  ['studio', 'The Recording Studio', 'docs/levels/studio.md', 'docs/levels/studio.layout.json', 'studio', 6],
  ['yacht', 'The Royal Flush', 'docs/levels/yacht.md', 'docs/levels/yacht.layout.json', 'yacht', 7],
];
const REFS = [
  ['style-levels', 'Level style guide', 'docs/STYLE-LEVELS.md'],
  ['materials', 'MATERIALS', 'docs/research/MATERIALS.md'],
  ['ballistics', 'BALLISTICS', 'docs/research/BALLISTICS.md'],
  ['plan-format', 'Plan format', 'docs/PLAN-FORMAT.md'],
];

// ---- minimal markdown -------------------------------------------------------------------------
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(esc(c)) - 1}\u0000`);
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+|[^)\s]+)\)/g, (_, t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
  s = s.replace(/&lt;(https?:\/\/[^&\s]+(?:&amp;[^&\s]+)*)&gt;/g, (_, u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_, p, u) => `${p}<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
}
const slugify = s => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function markdown(src, prefix) {
  const lines = src.replace(/\r/g, '').split('\n'), out = [], toc = [];
  let i = 0;
  const cells = l => l.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(c => c.trim());
  while (i < lines.length) {
    const l = lines[i];
    if (/^```/.test(l)) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; out.push(`<pre>${esc(buf.join('\n'))}</pre>`); continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(l);
    if (h) {
      const id = `${prefix}-${slugify(h[2])}`, n = h[1].length;
      if (n <= 3) toc.push([n, id, h[2]]);
      out.push(`<h${n} id="${id}">${inline(h[2])}</h${n}>`); i++; continue;
    }
    if (/^\s*\|/.test(l) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const head = cells(l); i += 2; const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push(`<div class="tw"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${
        rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^>/.test(l)) {
      const buf = [];
      while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${markdown(buf.join('\n'), prefix + '-q').html}</blockquote>`); continue;
    }
    const li = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(l);
    if (li) {
      const ordered = /\d/.test(li[2]), items = [];
      while (i < lines.length) {
        const m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (m && m[1].length <= li[1].length) { items.push(m[3]); i++; continue; }
        if (lines[i].trim() && /^\s+/.test(lines[i]) && items.length) { items[items.length - 1] += ' ' + lines[i].trim(); i++; continue; }
        break;
      }
      const t = ordered ? 'ol' : 'ul';
      out.push(`<${t}>${items.map(x => `<li>${inline(x.replace(/^\[ \]\s*/, '☐ ').replace(/^\[x\]\s*/i, '☑ '))}</li>`).join('')}</${t}>`); continue;
    }
    if (/^---+\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (!l.trim()) { i++; continue; }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#|```|\s*\||>|\s*([-*]|\d+\.)\s)/.test(lines[i]) && !/^---+\s*$/.test(lines[i])) buf.push(lines[i++].trim());
    if (!buf.length) buf.push(lines[i++].trim());
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return { html: out.join('\n'), toc };
}

// ---- research sketch from a .layout.json sidecar ----------------------------------------------
const KIND = { exterior: '#3b4252', pier: '#5b6b7a', circulation: '#8a8f98', core: '#4a4a55', service: '#7a6a55', bath: '#4f8fa8',
  closet: '#6d6450', bedroom: '#a06a8f', living: '#b9895a', lounge: '#c05f8a', dining: '#c9a24a', kitchen: '#8aa84f', office: '#6a7fc0',
  secure: '#b04a4a', retail: '#4fa88a', assembly: '#9b5fc0', studio: '#5fa0c0', guest: '#a06a8f' };
const SOFT = new Set(['sofa', 'mattress', 'counter_cabinet', 'particle_divider', 'dock_box', 'grp_hull']);
function sketch(lay, title) {
  const R = lay.R, D = lay.D || [], W = lay.W || [], B = lay.B || [], S = lay.S || [];
  const xs = R.flatMap(r => [r[3], r[5]]), zs = R.flatMap(r => [r[4], r[6]]);
  const x0 = Math.min(...xs), z0 = Math.min(...zs), x1 = Math.max(...xs), z1 = Math.max(...zs);
  const k = Math.max(10, Math.min(24, 1100 / (x1 - x0))), m = 24, top = 40;
  const Wd = Math.round((x1 - x0) * k + 2 * m), Ht = Math.round((z1 - z0) * k + top + m + 40);
  const X = x => (m + (x - x0) * k).toFixed(1), Z = z => (top + (z - z0) * k).toFixed(1);
  const open = r => r[2] === 'exterior' || r[2] === 'pier';
  const ent = id => D.filter(d => d[1] === id || d[2] === id).length;
  const b = [];
  b.push(`<rect x="0" y="0" width="${Wd}" height="${Ht}" fill="#14141c"/>`);
  for (const r of R) {
    const c = KIND[r[2]] || '#666', a = (r[5] - r[3]) * (r[6] - r[4]);
    b.push(`<rect x="${X(r[3])}" y="${Z(r[4])}" width="${((r[5] - r[3]) * k).toFixed(1)}" height="${((r[6] - r[4]) * k).toFixed(1)}" fill="${c}" fill-opacity="${open(r) ? .3 : .55}" stroke="${open(r) ? c : 'none'}" stroke-dasharray="4 3"><title>${esc(`${r[0]} — ${r[1]} (${r[2]}) ${+a.toFixed(1)} m², ${ent(r[0])} entrances`)}</title></rect>`);
  }
  for (const r of R) if (!open(r))
    b.push(`<rect x="${X(r[3])}" y="${Z(r[4])}" width="${((r[5] - r[3]) * k).toFixed(1)}" height="${((r[6] - r[4]) * k).toFixed(1)}" fill="none" stroke="#e8e8ee" stroke-width="2.2"/>`);
  const seg = (o, color, w, dash, tip) => {
    const [, , , ax, c, mid, wd] = o, h = wd / 2;
    const [ax0, az0, ax1, az1] = ax === 'x' ? [c, mid - h, c, mid + h] : [mid - h, c, mid + h, c];
    return `<line x1="${X(ax0)}" y1="${Z(az0)}" x2="${X(ax1)}" y2="${Z(az1)}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}><title>${esc(tip)}</title></line>`;
  };
  for (const w of W) { b.push(seg(w, '#14141c', 4)); b.push(seg(w, w[7] === 'glass_block' ? '#9fd8ff' : '#5fe0ff', 3, w[7] === 'glass_block' ? '' : '5 2', `${w[0]} window ${w[1]}↔${w[2]} (${w[7]})`)); }
  for (const d of D) {
    b.push(seg(d, '#14141c', 5));
    const col = d[7] === 'open' ? '#14141c' : d[7] === 'glass' ? '#5fe0ff' : d[7] === 'door_metal' || d[7] === 'door_vault' ? '#ff9f43' : '#ffd36b';
    if (d[7] !== 'open') b.push(seg(d, col, 3, '', `${d[0]} ${d[1]}↔${d[2]} ${d[6]} m (${d[7]})`));
    else b.push(seg(d, '#7dff9a', 1.2, '2 2', `${d[0]} ${d[1]}↔${d[2]} ${d[6]} m (open)`));
    const [, , , ax, c, mid] = d, [lx, lz] = ax === 'x' ? [c, mid] : [mid, c];
    b.push(`<text x="${X(lx)}" y="${Z(lz)}" class="dl">${esc(d[0])}</text>`);
  }
  for (const p of B) {
    const soft = SOFT.has(p[6]);
    b.push(`<rect x="${X(p[2])}" y="${Z(p[3])}" width="${((p[4] - p[2]) * k).toFixed(1)}" height="${((p[5] - p[3]) * k).toFixed(1)}" fill="${soft ? '#d9c08c' : '#9aa3b5'}" fill-opacity=".85" stroke="#111" stroke-width=".8"><title>${esc(`${p[0]} ${p[1]} (${p[6]})`)}</title></rect>`);
    if ((p[4] - p[2]) * k > 26) b.push(`<text x="${X((p[2] + p[4]) / 2)}" y="${Z((p[3] + p[5]) / 2)}" class="pl">${esc(p[0])}</text>`);
  }
  for (const s of S) {
    const clear = s[3] === 'clear', [a, c] = [s[1], s[2]];
    b.push(`<g class="sl"><line x1="${X(a[0])}" y1="${Z(a[1])}" x2="${X(c[0])}" y2="${Z(c[1])}" stroke="${clear ? '#7dff9a' : '#ff5c7a'}" stroke-width="1.6"${clear ? '' : ' stroke-dasharray="5 3"'}><title>${esc(`${s[0]} expected ${s[3]}`)}</title></line><circle cx="${X(a[0])}" cy="${Z(a[1])}" r="2.5" fill="${clear ? '#7dff9a' : '#ff5c7a'}"/><text x="${X(a[0])}" y="${Z(a[1]) - 4}" class="sll" fill="${clear ? '#7dff9a' : '#ff5c7a'}">${esc(s[0])}</text></g>`);
  }
  for (const r of R) {
    const w = (r[5] - r[3]) * k, hgt = (r[6] - r[4]) * k, a = (r[5] - r[3]) * (r[6] - r[4]), cx = X((r[3] + r[5]) / 2), cz = +Z((r[4] + r[6]) / 2);
    if (w < 22 || hgt < 14) continue;
    const big = w > 70 && hgt > 30;
    b.push(`<text x="${cx}" y="${cz - (big ? 3 : -3)}" class="rl">${esc(r[0])}</text>`);
    if (big) b.push(`<text x="${cx}" y="${cz + 10}" class="rs">${+a.toFixed(1)} m² · ${ent(r[0])} ent</text>`);
  }
  // scale bar and axes
  b.push(`<line x1="${m}" y1="${Ht - 18}" x2="${m + 5 * k}" y2="${Ht - 18}" stroke="#eee" stroke-width="2"/><text x="${m + 5 * k + 6}" y="${Ht - 14}" class="ax">5 m · x east →, z south ↓ · origin (${x0}, ${z0})</text>`);
  b.push(`<text x="${m}" y="24" class="tt">${esc(title)}</text>`);
  return `<svg class="plan" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${Ht}" width="${Wd}" height="${Ht}">${b.join('')}</svg>`;
}

// ---- current authored plans and legacy grids ---------------------------------------------------
let uid = 0;
const scope = svg => { const p = `s${++uid}`; return svg.replace(/id="(title|desc)"/g, `id="${p}$1"`).replace(/aria-labelledby="title desc"/, `aria-labelledby="${p}title ${p}desc"`).replace(/^<svg /, '<svg class="plan" '); };
function currentPlans(planId) {
  let wp, ctx;
  try { wp = require('./world-plan.cjs'); ctx = require('./plan-check.cjs').loadPlans(); } catch (e) { return `<p class="err">Plan tooling failed to load: ${esc(e.message)}</p>`; }
  const plan = ctx.PLANS[planId];
  if (!plan) return '<p class="none">No authored plan yet (plans/' + esc(planId) + '.js). The research sketch above is the latest layout.</p>';
  let rep; try { rep = ctx.PLAN.validate(plan); } catch (e) { return `<p class="err">PLAN.validate threw: ${esc(e.message)}</p>`; }
  const parts = [`<p class="meta">plans/${esc(planId)}.js · ${rep.errors.length} errors, ${rep.warnings.length} warnings</p>`];
  if (rep.errors.length) parts.push(`<details><summary>Errors</summary><pre>${esc(rep.errors.join('\n'))}</pre></details>`);
  for (const sid of Object.keys(plan.stages)) {
    try { parts.push(`<h4>Stage <code>${esc(sid)}</code></h4><div class="svgw">${scope(wp.renderStage(wp.loadStagePlan(planId, sid, { ...ctx, reports: { [planId]: rep } }), null))}</div>`); }
    catch (e) { parts.push(`<p class="err">Stage ${esc(sid)}: ${esc(e.message)}</p>`); }
  }
  return parts.join('\n');
}
function legacy(idx) {
  try { const wp = require('./world-plan.cjs'); return `<div class="svgw">${scope(wp.renderPlan(wp.loadPlan(idx), null))}</div>`; }
  catch (e) { return `<p class="err">Legacy render failed: ${esc(e.message)}</p>`; }
}

// ---- page ----------------------------------------------------------------------------------------
function page() {
  const nav = [], secs = [];
  const tocHtml = toc => `<nav class="toc">${toc.filter(t => t[0] >= 2).map(([n, id, t]) => `<a class="l${n}" href="#${id}">${inline(t)}</a>`).join('')}</nav>`;
  nav.push('<div class="ng">Levels</div>');
  for (const [slug, title, doc, side, planId, idx] of LEVELS) {
    nav.push(`<a href="#${slug}" data-s="${slug}">${esc(title)}</a>`);
    const md = existsSync(resolve(root, doc)) ? markdown(read(doc), slug) : { html: '<p class="none">No brief.</p>', toc: [] };
    let sk = '<p class="none">No sidecar: this brief predates the layout.json convention (STYLE-LEVELS §7.1). The authored plan below is the layout.</p>';
    if (side && existsSync(resolve(root, side))) { try { sk = `<div class="svgw">${sketch(JSON.parse(read(side)), `${title} — research sketch (${side.split('/').pop()})`)}</div>`; } catch (e) { sk = `<p class="err">${esc(e.message)}</p>`; } }
    secs.push(`<section id="${slug}" class="pg"><h1>${esc(title)}</h1>
<div class="tabs"><a href="#${slug}-layouts">Layouts</a><a href="#${slug}-brief">Brief</a><span class="src">${esc(doc)}</span></div>
<h2 id="${slug}-layouts">Layouts</h2>
<h3><span class="tag rs">research sketch</span> from the W3 sidecar</h3>${sk}
<p class="legend"${sk.startsWith('<div') ? '' : ' hidden'}><b>Sketch legend:</b> rooms coloured by kind (dashed = exterior/pier, unwalled between them); white = walls; <span style="color:#ffd36b">yellow</span> wood doors, <span style="color:#ff9f43">orange</span> metal doors, <span style="color:#5fe0ff">cyan</span> glass doors and windows (dashed = clear, solid = glass block), <span style="color:#7dff9a">green dotted</span> open doorways; props: <span style="color:#9aa3b5">grey</span> hard, <span style="color:#d9c08c">tan</span> soft; sightlines <span style="color:#7dff9a">green = expected clear</span>, <span style="color:#ff5c7a">red dashed = expected blocked</span>. Hover for ids, builds and m². Spawns are by role in the brief (§6), not in the sidecar.</p>
<h3><span class="tag pc">plan (current)</span> authored stage plan</h3>${currentPlans(planId)}
<details><summary><span class="tag lg">legacy grid</span> what the game runs today (levels.js index ${idx})</summary>${legacy(idx)}</details>
<h2 id="${slug}-brief">Brief</h2>${tocHtml(md.toc)}<article>${md.html}</article></section>`);
  }
  nav.push('<div class="ng">Research</div>');
  for (const [slug, title, doc] of REFS) {
    nav.push(`<a href="#${slug}" data-s="${slug}">${esc(title)}</a>`);
    const md = markdown(read(doc), slug);
    secs.push(`<section id="${slug}" class="pg"><div class="tabs"><span class="src">${esc(doc)}</span></div>${tocHtml(md.toc)}<article>${md.html}</article></section>`);
  }
  let head = ''; try { head = require('node:child_process').execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); } catch { head = '?'; }
  const css = `*{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,Segoe UI,sans-serif;background:#101016;color:#e4e4ea}
#nav{position:fixed;top:0;left:0;bottom:0;width:210px;overflow:auto;background:#1a1a24;padding:12px 0;border-right:1px solid #2c2c3a}
#nav .hd{padding:0 14px 8px;font-weight:700;color:#ff6fae}#nav .sub{padding:0 14px 10px;font-size:12px;color:#888}
#nav .ng{padding:10px 14px 4px;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#888}
#nav a{display:block;padding:5px 14px;color:#cfd;text-decoration:none}#nav a:hover,#nav a.on{background:#2c2c3e;color:#fff}
main{margin-left:210px;padding:16px 28px 80px;max-width:1500px}.pg{display:none}.pg.on{display:block}
h1{color:#ff6fae;margin:.2em 0}h2{border-bottom:1px solid #333;padding-bottom:4px;margin-top:1.6em;color:#2de2e6}h3{color:#ffd36b}h4{color:#ccc}
a{color:#7dc8ff}code{background:#24243a;padding:0 4px;border-radius:3px;font-size:.92em}pre{background:#0b0b10;border:1px solid #2a2a38;padding:10px;overflow:auto;font-size:13px;line-height:1.15}
.tw{overflow:auto;margin:8px 0}table{border-collapse:collapse;font-size:13px}th,td{border:1px solid #333;padding:3px 7px;vertical-align:top}th{background:#22222e;position:sticky;top:0}tr:nth-child(even) td{background:#16161e}
blockquote{border-left:3px solid #ff6fae;margin:8px 0;padding:2px 12px;color:#bbb;background:#17171f}
.svgw{overflow:auto;border:1px solid #2a2a38;background:#14141c;margin:6px 0 14px}.svgw svg{display:block;max-width:100%;height:auto}.svgw.full svg{max-width:none}
.dl{font:9px sans-serif;fill:#ffe9a8;text-anchor:middle;dominant-baseline:middle;paint-order:stroke;stroke:#14141c;stroke-width:2.5px}
.pl{font:8px sans-serif;fill:#111;text-anchor:middle;dominant-baseline:middle}.rl{font:bold 11px sans-serif;fill:#fff;text-anchor:middle;paint-order:stroke;stroke:#000;stroke-width:3px}
.rs{font:10px sans-serif;fill:#ddd;text-anchor:middle;paint-order:stroke;stroke:#000;stroke-width:3px}.sll{font:bold 9px sans-serif;paint-order:stroke;stroke:#000;stroke-width:2.5px}
.ax{font:11px sans-serif;fill:#bbb}.tt{font:bold 15px sans-serif;fill:#fff}.sl{opacity:.85}body.nosl .sl{display:none}
.tag{font-size:11px;padding:1px 7px;border-radius:9px;margin-right:6px;vertical-align:middle;text-transform:uppercase;letter-spacing:.05em}.rs.tag{background:#ffd36b;color:#000}.pc{background:#2de2e6;color:#000}.lg{background:#666;color:#fff}
.tabs{display:flex;gap:14px;align-items:center;margin:4px 0 8px}.tabs .src{color:#777;font-size:12px}.legend{font-size:12px;color:#aaa}
.toc{columns:3;font-size:12px;background:#17171f;padding:8px 12px;border:1px solid #2a2a38;margin:8px 0}.toc a{display:block;color:#9bd}.toc .l3{padding-left:12px;color:#8aa}
.none{color:#999;font-style:italic}.err{color:#ff5c7a}.meta{color:#aaa;font-size:12px}details{margin:8px 0}summary{cursor:pointer;color:#ccc}
.ctl{position:fixed;top:8px;right:12px;font-size:12px;background:#1a1a24;padding:4px 8px;border:1px solid #333;border-radius:4px}.ctl label{margin-left:8px}`;
  const js = `const P=[...document.querySelectorAll('.pg')],N=[...document.querySelectorAll('#nav a')];
function go(){const h=decodeURIComponent(location.hash.slice(1))||'motel';const t=document.getElementById(h);const pg=t?(t.classList.contains('pg')?t:t.closest('.pg')):P[0];
P.forEach(p=>p.classList.toggle('on',p===pg));N.forEach(a=>a.classList.toggle('on',a.dataset.s===pg.id));if(t&&t!==pg)t.scrollIntoView();else scrollTo(0,0);}
addEventListener('hashchange',go);go();
document.getElementById('sl').onchange=e=>document.body.classList.toggle('nosl',!e.target.checked);
document.getElementById('fs').onchange=e=>document.querySelectorAll('.svgw').forEach(w=>w.classList.toggle('full',e.target.checked));`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Neon Vice — level research review</title><style>${css}</style></head>
<body><div id="nav"><div class="hd">NEON VICE levels</div><div class="sub">Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · ${esc(head)}</div>${nav.join('')}</div>
<div class="ctl"><label><input type="checkbox" id="sl" checked> sightlines</label><label><input type="checkbox" id="fs"> plans 1:1</label></div>
<main>${secs.join('\n')}</main><script>${js}</script></body></html>\n`;
}

if (require.main === module) {
  const { values } = parseArgs({ options: { out: { type: 'string', default: 'review/levels.html' } } });
  const out = resolve(root, values.out);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page());
  console.log(`Wrote ${out}`);
}
module.exports = { markdown, sketch, page };
