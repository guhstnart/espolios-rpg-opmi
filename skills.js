const KEY="skills-opmi-db",$=(s,e=document)=>e.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let db,sel="todas",vis="cat",nv=new Set(),mestre=!!sessionStorage.sk,editId=null;
const cat=id=>db.cats.find(c=>c.id===id)||{nome:"?",icone:"✦"},niv=id=>db.niveis.findIndex(n=>n.id===id),sk=id=>db.skills.find(s=>s.id===id),salvar=()=>localStorage.setItem(KEY,JSON.stringify(db));
async function init(){
 try{const l=localStorage.getItem(KEY);db=l?JSON.parse(l):await(await fetch("skills.json")).json()}catch(e){db={cats:[],niveis:[],skills:[]}}
 pintar();
}
function lista(){
 const q=$("#q").value.trim().toLowerCase(),p=$("#pre").value;
 return db.skills.filter(s=>(sel==="todas"||s.cat===sel)&&(!nv.size||nv.has(s.nivel))&&(!p||(p==="sem")===!(s.prereq||[]).length)&&(!q||[s.nome,s.desc,s.custo,s.req,cat(s.cat).nome].join(" ").toLowerCase().includes(q)));
}
const card=s=>`<div class="sk n-${s.nivel}" data-id="${s.id}"><span class="grande">${cat(s.cat).icone}</span><span class="ic">${cat(s.cat).icone}</span>${(s.prereq||[]).length?'<span class="lk" title="Tem pré-requisito">🔗</span>':""}<div class="rod"><span class="est">${"★".repeat(niv(s.nivel)+1)}</span><b>${esc(s.nome)}</b><small>${esc(s.custo||"")}</small></div></div>`;
function pintar(){
 const n=c=>db.skills.filter(s=>s.cat===c).length;
 const grupo=(t,tt)=>{const l=db.cats.filter(c=>c.tipo===t);return l.length?`<h4>${tt}</h4>`+l.map(c=>`<button class="cat ${sel===c.id?"on":""}" data-cat="${c.id}"><span>${c.icone}</span>${esc(c.nome)}<i>${n(c.id)}</i></button>`).join(""):""};
 $("#lat").innerHTML=`<button class="cat ${sel==="todas"?"on":""}" data-cat="todas"><span>✦</span>Todas<i>${db.skills.length}</i></button>`+grupo("classe","Classes")+grupo("raca","Raças")+grupo("jogador","Jogadores");
 $("#niveis").innerHTML=db.niveis.map(x=>`<button class="nv n-${x.id} ${nv.has(x.id)?"on":""}" data-nv="${x.id}">${esc(x.nome)}</button>`).join("");
 const l=lista();let h="";
 if(vis==="cat")db.cats.filter(c=>sel==="todas"||c.id===sel).forEach(c=>{const g=l.filter(s=>s.cat===c.id);if(g.length)h+=`<h2>${c.icone} ${esc(c.nome)}</h2><div class="grade">${g.map(card).join("")}</div>`});
 else db.niveis.forEach((x,i)=>{const g=l.filter(s=>s.nivel===x.id);if(g.length)h+=`<h2 class="n-${x.id}">${"★".repeat(i+1)} ${esc(x.nome)}</h2><div class="grade">${g.map(card).join("")}</div>`});
 $("#lista").innerHTML=h||'<p class="vazio">Nenhuma skill encontrada.</p>';
 $("#mtool").hidden=!mestre;$("#coroa").classList.toggle("on",mestre);
}
function abrir(id){
 const s=sk(id);if(!s)return;
 const c=cat(s.cat),pre=(s.prereq||[]).map(sk).filter(Boolean),dep=db.skills.filter(x=>(x.prereq||[]).includes(id)),
 ch=l=>l.map(x=>`<button class="chip" data-open="${x.id}">${cat(x.cat).icone} ${esc(x.nome)}</button>`).join("")||"—";
 $("#detc").innerHTML=card(s);
 $("#dett").innerHTML=`<h2>${esc(s.nome)}</h2><div class="tags"><span class="tg n-${s.nivel}">${"★".repeat(niv(s.nivel)+1)} ${esc(db.niveis[niv(s.nivel)].nome)}</span><span class="tg">${c.icone} ${esc(c.nome)}</span></div><p><b>Custo:</b> ${esc(s.custo||"—")}</p><p><b>Como desbloquear:</b> ${esc(s.req||"—")}</p><p><b>Exige antes:</b> ${ch(pre)}</p><p><b>Libera:</b> ${ch(dep)}</p><p class="desc">${esc(s.desc||"")}</p><div class="bt">${mestre?`<button class="mini" data-ed="${id}">✏️ Editar</button><button class="mini" data-del="${id}">🗑️ Excluir</button>`:""}<button class="mini" data-fechar="1">Fechar</button></div>`;
 if(!$("#det").open)$("#det").showModal();
}
function abrirEd(id){
 const f=$("#edf"),s=id?sk(id):{nome:"",cat:db.cats[0]?.id,nivel:db.niveis[0].id,custo:"",req:"",desc:"",prereq:[]};editId=id;
 $("#edt").textContent=id?"Editar skill":"Nova skill";f.nome.value=s.nome;f.custo.value=s.custo||"";f.req.value=s.req||"";f.desc.value=s.desc||"";
 f.cat.innerHTML=db.cats.map(c=>`<option value="${c.id}" ${c.id===s.cat?"selected":""}>${c.icone} ${esc(c.nome)}</option>`).join("");
 f.nivel.innerHTML=db.niveis.map(n=>`<option value="${n.id}" ${n.id===s.nivel?"selected":""}>${esc(n.nome)}</option>`).join("");
 f.prereq.innerHTML=db.skills.filter(x=>x.id!==id).map(x=>`<option value="${x.id}" ${(s.prereq||[]).includes(x.id)?"selected":""}>${esc(x.nome)}</option>`).join("");
 $("#det").close();$("#ed").showModal();
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-cat],[data-nv],[data-vis],[data-id],[data-open],[data-ed],[data-del],[data-fechar]");if(!b)return;const d=b.dataset;
 if(d.cat){sel=d.cat;pintar()}
 else if(d.nv){nv.has(d.nv)?nv.delete(d.nv):nv.add(d.nv);pintar()}
 else if(d.vis){vis=d.vis;document.querySelectorAll("[data-vis]").forEach(x=>x.classList.toggle("on",x===b));pintar()}
 else if(d.ed)abrirEd(d.ed);
 else if(d.del){if(confirm("Excluir esta skill?")){db.skills=db.skills.filter(s=>s.id!==d.del);db.skills.forEach(s=>s.prereq=(s.prereq||[]).filter(p=>p!==d.del));salvar();$("#det").close();pintar()}}
 else if(d.fechar)$("#det").close();
 else if(d.open||d.id)abrir(d.open||d.id);
});
$("#q").oninput=pintar;$("#pre").onchange=pintar;
$("#coroa").onclick=()=>{if(mestre){mestre=false;delete sessionStorage.sk;pintar()}else{$("#senha").showModal();$("#sp").focus()}};
$("#sc").onclick=()=>$("#senha").close();$("#edc").onclick=()=>$("#ed").close();
$("#sf").onsubmit=e=>{e.preventDefault();if($("#sp").value.trim()==="ChaveMestra"){mestre=true;sessionStorage.sk=1;$("#sp").value="";$("#se").hidden=true;$("#senha").close();pintar()}else $("#se").hidden=false};
$("#nova").onclick=()=>abrirEd(null);
$("#ncat").onclick=()=>{const nome=(prompt("Nome da categoria:")||"").trim();if(!nome)return;const icone=prompt("Ícone (um emoji):","✦")||"✦",tipo=(prompt("Tipo: classe, raca ou jogador","classe")||"classe").trim();db.cats.push({id:"c"+Date.now().toString(36),nome,icone,tipo});salvar();pintar()};
$("#exp").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,1)],{type:"application/json"}));a.download="skills.json";a.click()};
$("#zera").onclick=()=>{if(confirm("Voltar ao skills.json publicado?")){localStorage.removeItem(KEY);location.reload()}};
$("#edf").onsubmit=e=>{e.preventDefault();const f=e.target,o={nome:f.nome.value.trim(),cat:f.cat.value,nivel:f.nivel.value,custo:f.custo.value.trim(),req:f.req.value.trim(),desc:f.desc.value.trim(),prereq:[...f.prereq.selectedOptions].map(x=>x.value)};
 if(editId)Object.assign(sk(editId),o);else db.skills.push({id:"s"+Date.now().toString(36),...o});salvar();$("#ed").close();pintar()};
init();
