const KEY="espolios-opmi-db",$=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const COR=["#9ca3af","#4ade80","#38bdf8","#c084fc","#fbbf24","#f472b6","#fb923c"];
let db,ctx="",res=[],sub="itens",fi={q:"",t:"",m:"",c:""},sel={tier:new Set(),mar:new Set(),cat:new Set()};
let hist=JSON.parse(localStorage.getItem("espolios-hist")||"[]");
const cor=t=>COR[Math.max(0,db.tiers.indexOf(t))%COR.length];
const salvar=()=>localStorage.setItem(KEY,JSON.stringify(db));
const lista=g=>g==="tier"?db.tiers:g==="mar"?db.mares:db.categorias;
const todos=()=>["tier","mar","cat"].forEach(g=>sel[g]=new Set(lista(g)));
const fmt=i=>`${i.nome} [${i.tier} · ${i.mar} · ${i.cat}]${i.desc?" — "+i.desc:""}`;
async function init(){
 try{const l=localStorage.getItem(KEY);db=l?JSON.parse(l):await(await fetch("data.json")).json()}
 catch(e){db={tiers:["Tier 1"],mares:[],categorias:["Outro"],contextos:{Saque:{"Tier 1":1}},itens:[]}}
 ctx=Object.keys(db.contextos)[0]||"";todos();desenhar();
}
const casa=i=>sel.tier.has(i.tier)&&sel.cat.has(i.cat)&&(i.mar==="Todos"?sel.mar.size>0:sel.mar.has(i.mar));
function desenhar(){
 $("#ctx").innerHTML=Object.keys(db.contextos).map(c=>`<button class="chip ${c===ctx?"on":""}" data-ctx="${esc(c)}">${esc(c)}</button>`).join("");
 const T={tier:"Tiers",mar:"Mares",cat:"Categorias"};
 $("#filtros").innerHTML=["tier","mar","cat"].map(g=>`<div class="grp"><div class="gh"><h3>${T[g]}</h3><span><button class="mini" data-all="${g}">Todas</button><button class="mini" data-none="${g}">Nenhuma</button></span></div><div class="chips">${lista(g).map(x=>`<button class="chip ${sel[g].has(x)?"on":""}" data-g="${g}" data-v="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>`).join("");
 $("#n").textContent=db.itens.filter(casa).length+" itens possíveis";mostrar();
}
function sortear(ex){
 const pool=db.itens.filter(i=>casa(i)&&!(ex&&ex.has(i))),w=db.contextos[ctx]||{},g={};
 pool.forEach(i=>(g[i.tier]=g[i.tier]||[]).push(i));
 const ts=Object.keys(g);if(!ts.length)return null;
 let p=ts.map(t=>+w[t]||0);if(!p.some(x=>x>0))p=ts.map(()=>1);
 let r=Math.random()*p.reduce((a,b)=>a+b,0),t=ts[ts.length-1];
 for(let i=0;i<ts.length;i++){if((r-=p[i])<0){t=ts[i];break}}
 return g[t][Math.floor(Math.random()*g[t].length)];
}
function card(i){return `<div class="card" style="--c:${cor(i.tier)}"><b>${esc(i.nome)}</b><div class="tags"><span class="t">${esc(i.tier)}</span><span>${esc(i.mar)}</span><span>${esc(i.cat)}</span></div>${i.desc?`<p>${esc(i.desc)}</p>`:""}<button class="mini" data-copy="${esc(fmt(i))}">Copiar</button></div>`}
function mostrar(){
 $("#res").innerHTML=res.length?res.map(card).join("")+`<div class="vazio"><button class="mini" data-copy="${esc(res.map(fmt).join("\n"))}">Copiar tudo</button></div>`:`<div class="vazio">Escolha a origem e role. Nada apareceu ainda.</div>`;
}
function rolar(){
 const n=Math.max(1,Math.min(20,+$("#qtd").value||1)),ex=$("#semrep").checked?new Set():null;res=[];
 for(let k=0;k<n;k++){const i=sortear(ex);if(!i)break;if(ex)ex.add(i);res.push(i)}
 if(!res.length){$("#res").innerHTML='<div class="vazio">Nenhum item combina com esses filtros.</div>';return}
 hist.unshift({h:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}),ctx,it:res.map(r=>({...r}))});
 hist=hist.slice(0,30);localStorage.setItem("espolios-hist",JSON.stringify(hist));mostrar();
}
function desenharHist(){
 $("#hist-l").innerHTML=hist.length?hist.map(h=>`<div class="h"><small>${h.h} · ${esc(h.ctx)}</small><br>${h.it.map(i=>esc(i.nome)).join(" · ")} <button class="mini" data-copy="${esc(h.it.map(fmt).join("\n"))}">Copiar</button></div>`).join(""):"<p>Nenhum sorteio ainda.</p>";
}
function aba(a){
 if(a==="mestre"&&!sessionStorage.mestre){$("#senha").showModal();$("#sp").focus();return}
 $$("main>section").forEach(s=>s.hidden=s.id!==a);$$(".abas button").forEach(b=>b.classList.toggle("on",b.dataset.aba===a));
 if(a==="hist")desenharHist();if(a==="mestre")mestre();
}
// ---------- Área do Mestre ----------
const opts=(l,v,extra="")=>extra+l.map(x=>`<option ${x===v?"selected":""}>${esc(x)}</option>`).join("");
function mestre(){
 $$("#subabas button").forEach(b=>b.classList.toggle("on",b.dataset.sub===sub));const el=$("#mestre-corpo");
 if(sub==="itens"){
  el.innerHTML=`<div class="barra"><input id="q" placeholder="Buscar item…" value="${esc(fi.q)}"><select data-f="t">${opts(db.tiers,fi.t,'<option value="">Todos os tiers</option>')}</select><select data-f="m">${opts(["Todos",...db.mares],fi.m,'<option value="">Todos os mares</option>')}</select><select data-f="c">${opts(db.categorias,fi.c,'<option value="">Todas as categorias</option>')}</select><button class="mini ok" data-ed="-1">+ Novo item</button></div>
  <div class="barra"><label><input type="checkbox" id="ck-all"> Marcar visíveis</label><select id="b-t">${opts(db.tiers,"",'<option value="">Tier…</option>')}</select><select id="b-m">${opts(["Todos",...db.mares],"",'<option value="">Mar…</option>')}</select><select id="b-c">${opts(db.categorias,"",'<option value="">Categoria…</option>')}</select><button class="mini" data-bulk="set">Aplicar aos marcados</button><button class="mini" data-bulk="del">Excluir marcados</button></div><div class="w" id="tbl"></div>`;tabela();
 }else if(sub==="listas"){
  const T={tier:"Tiers",mar:"Mares",cat:"Categorias"};
  el.innerHTML=["tier","mar","cat"].map(g=>`<div class="grp"><h2>${T[g]}</h2><div class="chips">${lista(g).map(x=>`<span class="chip">${esc(x)}<span class="x" data-rm="${g}" data-v="${esc(x)}">✕</span></span>`).join("")}</div><div class="barra"><input id="nv-${g}" placeholder="Novo nome"><button class="mini ok" data-add="${g}">Adicionar</button></div></div>`).join("");
 }else if(sub==="ctx"){
  el.innerHTML=`<p>Peso de cada tier por origem (maior = mais comum; 0 = nunca sai). Só valem os tiers marcados na hora de rolar.</p><div class="w"><table><tr><th>Origem</th>${db.tiers.map(t=>`<th>${esc(t)}</th>`).join("")}<th></th></tr>${Object.keys(db.contextos).map(c=>`<tr><td>${esc(c)}</td>${db.tiers.map(t=>`<td><input type="number" min="0" step="any" data-w="${esc(c)}" data-t="${esc(t)}" value="${+db.contextos[c][t]||0}"></td>`).join("")}<td><span class="x" data-rmc="${esc(c)}">✕</span></td></tr>`).join("")}</table></div><div class="barra"><input id="nc" placeholder="Nova origem (ex.: Navio naufragado)"><button class="mini ok" data-addc="1">Adicionar origem</button></div>`;
 }else{
  el.innerHTML=`<h2>Publicar alterações</h2><p>Suas edições ficam salvas neste navegador. Para os jogadores verem, baixe o arquivo e substitua o <b>data.json</b> no GitHub.</p><div class="barra"><button class="mini ok" data-ex="1">⬇ Baixar data.json</button><label class="mini">Importar JSON <input type="file" id="fj" accept=".json" hidden></label><button class="mini" data-reset="1">Descartar edições deste navegador</button></div>
  <h2>Importar do gerador antigo (Perchance)</h2><p>Cole a lista completa (com tier1, tier2…). O programa lê tiers, nomes e descrições e adivinha a categoria. Depois ajuste o Mar em lote na aba Itens.</p><textarea class="g" id="pc" placeholder="tier1&#10;  🍖 Carne (Consumível - ...)"></textarea><div class="barra"><button class="mini ok" data-pc="1">Importar</button><span id="pcr"></span></div>`;
 }
}
function tabela(){
 const q=fi.q.toLowerCase(),l=[];
 db.itens.forEach((i,k)=>{if((!fi.t||i.tier===fi.t)&&(!fi.m||i.mar===fi.m)&&(!fi.c||i.cat===fi.c)&&(!q||(i.nome+" "+i.desc).toLowerCase().includes(q)))l.push([i,k])});
 $("#tbl").innerHTML=`<table><tr><th></th><th>Item (${l.length})</th><th>Tier</th><th>Mar</th><th>Categoria</th><th></th></tr>${l.slice(0,400).map(([i,k])=>`<tr><td><input type="checkbox" data-ck="${k}"></td><td>${esc(i.nome)}</td><td class="tg" style="--c:${cor(i.tier)}">${esc(i.tier)}</td><td>${esc(i.mar)}</td><td>${esc(i.cat)}</td><td><button class="mini" data-ed="${k}">✏️</button><button class="mini" data-del="${k}">🗑️</button></td></tr>`).join("")}</table>`;
}
function abrirEd(k){
 const i=k<0?{nome:"",desc:"",tier:db.tiers[0],mar:"Todos",cat:db.categorias[0]}:db.itens[k],f=$("#edf");
 $("#edt").textContent=k<0?"Novo item":"Editar item";f.dataset.k=k;f.nome.value=i.nome;f.desc.value=i.desc;
 f.tier.innerHTML=opts(db.tiers,i.tier);f.mar.innerHTML=opts(["Todos",...db.mares],i.mar);f.cat.innerHTML=opts(db.categorias,i.cat);$("#ed").showModal();
}
function adivinhar(n,d){
 const m=d.match(/^(Consumível|Loot|Utilitário|Arma|Equipamento|Narrativo|Artefato|Item Especial)/i),t=(n+" "+d).toLowerCase();
 if(m){const k=m[1].toLowerCase();return k==="loot"?"Loot (Berries)":/artefato|especial/.test(k)?"Especial":k[0].toUpperCase()+k.slice(1)}
 if(/berries/.test(t))return"Loot (Berries)";if(/recupera|cura /.test(t))return"Consumível";
 if(/dial|log pose|bússola|corda|vela/.test(t))return"Utilitário";if(/espada|katana|adaga|besta|rifle|faca|manopla|soco/.test(t))return"Arma";return"Equipamento";
}
function importarPc(txt){
 let tier=null,novos=0,dup=0;
 txt.split(/\r?\n/).forEach(l=>{
  if(!l.trim()||l.trim().startsWith("//"))return;
  if(!/^\s/.test(l)){const m=l.trim().match(/^tier\s*(\d+)$/i);tier=m?"Tier "+m[1]:null;return}
  if(!tier)return;
  const s=l.trim().replace(/\^[\d.]+$/,"").trim(),a=s.indexOf("("),z=s.lastIndexOf(")"),nome=(a>0?s.slice(0,a):s).trim();let desc=a>0&&z>a?s.slice(a+1,z).trim():"";
  if(!nome)return;
  if(db.itens.some(i=>i.nome===nome&&i.tier===tier)){dup++;return}
  const cat=adivinhar(nome,desc);desc=desc.replace(/^(?:Consumível|Loot|Utilitário|Arma|Equipamento|Narrativo|Artefato|Item Especial|Upgrade)[^-(]{0,25}-\s*/i,"");
  if(!db.tiers.includes(tier))db.tiers.push(tier);if(!db.categorias.includes(cat))db.categorias.push(cat);
  db.itens.push({nome,desc,tier,mar:"Todos",cat});novos++;
 });
 salvar();todos();return`${novos} importados, ${dup} já existiam.`;
}
// ---------- Eventos ----------
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-aba],[data-ctx],[data-g],[data-all],[data-none],[data-copy],[data-sub],[data-ed],[data-del],[data-bulk],[data-rm],[data-add],[data-rmc],[data-addc],[data-ex],[data-reset],[data-pc]");if(!b)return;const d=b.dataset;
 if(d.aba)aba(d.aba);
 else if(d.ctx){ctx=d.ctx;desenhar()}
 else if(d.g){sel[d.g].has(d.v)?sel[d.g].delete(d.v):sel[d.g].add(d.v);desenhar()}
 else if(d.all){sel[d.all]=new Set(lista(d.all));desenhar()}
 else if(d.none){sel[d.none]=new Set();desenhar()}
 else if(d.copy!==undefined){navigator.clipboard.writeText(d.copy);const t=b.textContent;b.textContent="Copiado!";setTimeout(()=>b.textContent=t,1200)}
 else if(d.sub){sub=d.sub;mestre()}
 else if(d.ed!==undefined)abrirEd(+d.ed);
 else if(d.del!==undefined){if(confirm("Excluir este item?")){db.itens.splice(+d.del,1);salvar();tabela()}}
 else if(d.bulk){
  const ks=$$("[data-ck]:checked").map(c=>+c.dataset.ck);if(!ks.length)return alert("Marque itens primeiro.");
  if(d.bulk==="del"){if(!confirm(`Excluir ${ks.length} itens?`))return;db.itens=db.itens.filter((_,k)=>!ks.includes(k))}
  else ks.forEach(k=>{const t=$("#b-t").value,m=$("#b-m").value,c=$("#b-c").value;if(t)db.itens[k].tier=t;if(m)db.itens[k].mar=m;if(c)db.itens[k].cat=c});
  salvar();tabela();
 }
 else if(d.rm){const n=db.itens.filter(i=>i[d.rm==="tier"?"tier":d.rm==="mar"?"mar":"cat"]===d.v).length;
  if(n)return alert(`${n} itens usam "${d.v}". Mude esses itens antes.`);if(!confirm(`Remover "${d.v}"?`))return;
  const l=lista(d.rm);l.splice(l.indexOf(d.v),1);salvar();todos();mestre()}
 else if(d.add){const v=$("#nv-"+d.add).value.trim(),l=lista(d.add);if(v&&!l.includes(v)){l.push(v);salvar();todos();mestre()}}
 else if(d.rmc){if(confirm(`Remover a origem "${d.rmc}"?`)){delete db.contextos[d.rmc];ctx=Object.keys(db.contextos)[0]||"";salvar();mestre()}}
 else if(d.addc){const v=$("#nc").value.trim();if(v&&!db.contextos[v]){db.contextos[v]=Object.fromEntries(db.tiers.map(t=>[t,1]));salvar();mestre()}}
 else if(d.ex){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,1)],{type:"application/json"}));a.download="data.json";a.click()}
 else if(d.reset){if(confirm("Voltar ao data.json publicado?")){localStorage.removeItem(KEY);location.reload()}}
 else if(d.pc){$("#pcr").textContent=importarPc($("#pc").value)}
});
document.addEventListener("input",e=>{
 const t=e.target;
 if(t.id==="q"){fi.q=t.value;tabela()}
 else if(t.id==="ck-all")$$("[data-ck]").forEach(c=>c.checked=t.checked);
 else if(t.dataset.w){db.contextos[t.dataset.w][t.dataset.t]=+t.value||0;salvar()}
});
document.addEventListener("change",e=>{
 const t=e.target;
 if(t.dataset.f){fi[t.dataset.f]=t.value;tabela()}
 else if(t.id==="fj"&&t.files[0]){const r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);salvar();todos();ctx=Object.keys(db.contextos)[0]||"";mestre();desenhar()}catch{alert("JSON inválido.")}};r.readAsText(t.files[0])}
});
$("#rolar-btn").onclick=rolar;
$("#limpar-hist").onclick=()=>{hist=[];localStorage.removeItem("espolios-hist");desenharHist()};
$("#sc").onclick=()=>$("#senha").close();$("#edc").onclick=()=>$("#ed").close();
$("#sf").onsubmit=e=>{e.preventDefault();if($("#sp").value.trim()==="ChaveMestra"){sessionStorage.mestre=1;$("#sp").value="";$("#se").hidden=true;$("#senha").close();aba("mestre")}else $("#se").hidden=false};
$("#edf").onsubmit=e=>{e.preventDefault();const f=e.target,k=+f.dataset.k,i={nome:f.nome.value.trim(),desc:f.desc.value.trim(),tier:f.tier.value,mar:f.mar.value,cat:f.cat.value};
 k<0?db.itens.push(i):db.itens[k]=i;salvar();$("#ed").close();tabela()};
init();
