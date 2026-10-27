function renderPie(){
  var cv=document.getElementById("pieChart");
  var counts={pos:0,neg:0,neu:0};
  state.notes.forEach(function(n){counts[n.sent]++;});
  var total=counts.pos+counts.neg+counts.neu||1;
  var dpr=window.devicePixelRatio||1;
  var w=Math.max(cv.parentNode.clientWidth||300,240),h=220;
  cv.width=w*dpr; cv.height=h*dpr; cv.style.height=h+"px";
  var ctx=cv.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
  var cx=w/2,cy=h/2,r=Math.min(w,h)/2-14,ir=r*0.62;
  var segs=[{v:counts.pos,c:"#16a34a",n:"正向命中"},{v:counts.neg,c:"#dc2626",n:"疑似负面"},{v:counts.neu,c:"#c3c7cf",n:"未命中情绪词"}];
  var a0=-Math.PI/2;
  segs.forEach(function(s){
    if(!s.v)return;
    var a1=a0+2*Math.PI*s.v/total;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,a0,a1); ctx.closePath();
    ctx.fillStyle=s.c; ctx.fill(); a0=a1;
  });
  ctx.beginPath(); ctx.arc(cx,cy,ir,0,7); ctx.fillStyle="#fff"; ctx.fill();
  ctx.fillStyle="#1c1e26"; ctx.font="bold 20px sans-serif"; ctx.textAlign="center";
  ctx.fillText(String(counts.pos+counts.neg+counts.neu),cx,cy+2);
  ctx.fillStyle="#9aa0a8"; ctx.font="11px sans-serif"; ctx.fillText("笔记总数",cx,cy+20); ctx.textAlign="left";
  var lg=document.getElementById("pieLegend"); lg.textContent="";
  segs.forEach(function(s){
    var sp=el("span"); var i=el("i"); i.style.background=s.c; sp.appendChild(i);
    sp.appendChild(document.createTextNode(s.n+" "+s.v+" 篇（"+Math.round(s.v/total*100)+"%）"));
    lg.appendChild(sp);
  });
}
function renderTrend(){
 const cv=$('trendChart'),dpr=window.devicePixelRatio||1,w=Math.max(cv.parentElement.clientWidth,280),h=220;
 cv.width=w*dpr;cv.height=h*dpr;cv.style.height=h+'px';const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);
 const data=state.trend,values=data.flatMap(d=>[d.mentions,d.neg]).filter(v=>v!==null);
 if(!values.length){ctx.font='13px sans-serif';ctx.fillStyle='#9aa0a8';ctx.textAlign='center';ctx.fillText('暂无历史采集，缺失日期不按 0 计算',w/2,h/2);return;}
 const max=Math.max(1,...values)*1.2,left=34,right=w-20,top=20,bottom=h-32;
 const x=i=>left+(right-left)*i/Math.max(1,data.length-1),y=v=>bottom-(bottom-top)*v/max;
 ctx.font='10px sans-serif';ctx.fillStyle='#8a929e';
 for(let i=0;i<5;i++){const val=max*i/4;ctx.strokeStyle='#eef0f3';ctx.beginPath();ctx.moveTo(left,y(val));ctx.lineTo(right,y(val));ctx.stroke();ctx.fillText(Math.round(val),1,y(val));}
 [['mentions','#ff2442'],['neg','#7c8291']].forEach(([key,color])=>{ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;ctx.beginPath();let connected=false;data.forEach((d,i)=>{if(d[key]===null){connected=false;return;}if(connected)ctx.lineTo(x(i),y(d[key]));else ctx.moveTo(x(i),y(d[key]));connected=true;});ctx.stroke();data.forEach((d,i)=>{if(d[key]!==null){ctx.beginPath();ctx.arc(x(i),y(d[key]),3,0,Math.PI*2);ctx.fill();}});});
 ctx.fillStyle='#8a929e';ctx.textAlign='center';data.forEach((d,i)=>ctx.fillText(d.label,x(i),h-8));
}
