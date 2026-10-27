function renderStats(){
  const row=$('statRow');row.replaceChildren();const neg=state.notes.filter(n=>n.sent==='neg').length;
  const values=[['本轮采集样本',state.notes.length+' 篇','仅搜索可见结果'],['疑似负面占比',(state.notes.length?Math.round(neg/state.notes.length*100)+'%':'—'),'规则命中，需人工复核'],['疑似高风险',state.notes.filter(n=>n.risk==='高').length+' 条','不代表已证实的事实'],['历史日报',state.reports.length+' 份','最近 90 天']];
  values.forEach(([k,v,d])=>{const c=el('div','card stat');c.append(el('div','k',k),el('div','v',v),el('div','d',d));row.append(c);});
}
function renderKw(){
  const box=$('kwList');box.replaceChildren();
  state.keywords.forEach((kw,index)=>{const c=el('span','kw'+(kw.on?'':' off'));c.append(el('span',null,kw.name));
    if(state.local){[['启停',()=>{const next=structuredClone(state.keywords);next[index].on=!next[index].on;return saveKeywords(next);}],['移除',()=>saveKeywords(state.keywords.filter((_,i)=>i!==index))]].forEach(([label,action])=>{const b=el('button',null,label);b.onclick=()=>action().catch(e=>toast(e.message));c.append(b);});}box.append(c);});
  if(!state.keywords.length)box.append(el('div','empty','尚未设置关键词'));
  const select=$('fKw'),previous=select.value;select.replaceChildren(new Option('全部关键词','all'));
  state.keywords.forEach(k=>select.add(new Option(k.name,k.name)));select.value=state.keywords.some(k=>k.name===previous)?previous:'all';state.filterKw=select.value;
}
function renderRank(){const box=$('kwRank');box.replaceChildren();const counts={};state.notes.forEach(n=>n.keywords.forEach(k=>counts[k]=(counts[k]||0)+1));
  const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]);entries.forEach(([name,count],i)=>{const row=el('div','rank-item'),bar=el('div','rank-bar'),fill=el('i');fill.style.width=count/entries[0][1]*100+'%';bar.append(fill);row.append(el('span','rank-no',i+1),el('span','rank-name',name),bar,el('span','rank-v',count+' 篇'));box.append(row);});if(!entries.length)box.append(el('div','empty','暂无采集样本'));}
function renderNotes(){const box=$('noteList');box.replaceChildren();const list=sortNotes(filteredNotes());$('noteCount').textContent='共 '+list.length+' 篇';$('noteEmpty').classList.toggle('hide',list.length>0);
  list.forEach(n=>{const c=el('button','note');c.style.textAlign='left';c.style.width='100%';const meta=el('div','note-meta');meta.append(el('span','chip chip-kw',n.keywords.join(' / ')),sentChip(n.sent),el('span','nums','赞 '+n.likes+' · 评 '+n.comments));c.append(el('div','nt',n.title),el('div','nm','发布：'+formatTime(n.time)),meta);c.onclick=()=>openDrawer(n);box.append(c);});}
function openDrawer(n){const box=$('drawerBd');box.replaceChildren(el('h3',null,n.title));
  [['规则分类',sentName(n.sent)],['疑似风险',n.risk],['命中依据',(n.evidence||[]).join('、')||'无'],['发布时间',formatTime(n.time)],['首次发现',formatTime(n.first_seen)],['详情获取',n.detail_available?'已获取':'未获取，仅搜索信息']].forEach(([k,v])=>{const row=el('div','kv');row.append(el('span','k',k),el('span',null,v));box.append(row);});
  box.append(el('div','excerpt',n.excerpt||'未获取正文摘要'));const url=safeUrl(n.url);if(url){const a=el('a','source','打开小红书原文 ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';box.append(a);}
  box.append(el('h4',null,'重点评论摘录'));(n.comment_excerpts||[]).forEach(c=>box.append(el('p','excerpt',c)));if(!n.comment_excerpts?.length)box.append(el('p',null,'未获取评论，不代表没有评论。'));
  $('drawer').classList.add('show');$('drawerMask').classList.add('show');}
function renderAlerts(){const box=$('alertList');box.replaceChildren();const list=sortNotes(state.notes.filter(n=>n.risk!=='无'&&(state.filterAlert==='all'||alertSt(n.id)===state.filterAlert)));$('alertEmpty').classList.toggle('hide',list.length>0);
  list.forEach(n=>{const row=el('div','alert-item'),bd=el('div','alert-bd'),actions=el('div','alert-acts');bd.append(el('div','t',n.title),el('div','s','规则依据：'+n.evidence.join('、')));actions.append(el('span','chip chip-risk','疑似'+n.risk+'风险'),el('span','st-chip',alertSt(n.id)));
    if(state.local){const select=el('select');['待处理','处理中','已闭环'].forEach(s=>select.add(new Option(s,s)));select.value=alertSt(n.id);select.onchange=async()=>{try{await api('/api/alerts',{id:n.id,status:select.value});await load();}catch(e){toast(e.message);}};actions.append(select);}
    const button=el('button','btn btn-ghost btn-sm','详情');button.onclick=()=>openDrawer(n);actions.append(button);row.append(bd,actions);box.append(row);});}
function renderReport(){const r=state.currentReport;$('reportPreview').textContent=r?.text||'';$('reportPreview').classList.toggle('hide',!r);$('reportEmpty').classList.toggle('hide',!!r);['copyReport','downloadReport','pushReport'].forEach(id=>$(id).classList.toggle('hide',!r));}
function renderHist(){const box=$('histList');box.replaceChildren();$('histEmpty').classList.toggle('hide',state.reports.length>0);state.reports.slice().reverse().forEach(r=>{const c=el('div','hist-item'),info=el('div');info.append(el('div','t',r.date+' 舆情日报'),el('div','s',r.summary));const b=el('button','hist-act','查看');b.onclick=()=>{state.currentReport=r;renderReport();};c.append(info,el('span','hist-st',r.status+' · 钉钉'+r.delivery),b);box.append(c);});}
function renderAll(){renderStats();renderKw();renderRank();renderNotes();renderAlerts();renderReport();renderHist();renderTrend();renderPie();
  const data=state.data,run=data.latest_run||{};$('modeLabel').textContent=state.local?'本机管理':'公开只读';$('hdDate').textContent='最后采集：'+formatTime(data.last_collection)+' · 北京时间';
  document.querySelector('.badge-demo').textContent=data.last_collection?'规则分析 · 真实采集记录':'待连接 · 尚无采集数据';
  $('runNotice').textContent=(run.message||'尚未采集')+'\n最后数据时间：'+formatTime(data.last_collection)+'。'+(run.errors||[]).join('；')+'\n'+data.coverage;
  $('runNotice').classList.toggle('ok',run.status==='success');
  const dates=$('fDate');dates.replaceChildren(new Option('最新报告样本','latest'));state.reports.slice().reverse().forEach(r=>dates.add(new Option(r.date,r.date)));
  $('setRepository').value=state.settings.repository||'';$('setSite').value=state.settings.site_url||'';$('excludeWords').value=state.keywords[0]?.exclude?.join('，')||'';
  $('secretStatus').textContent='钉钉 Webhook：'+(state.settings.webhook_configured?'已配置':'未配置')+'；加签密钥：'+(state.settings.secret_configured?'已配置':'未配置');
}
