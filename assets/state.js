"use strict";
const state = {local:false, token:'', keywords:[], notes:[], allNotes:[], reports:[],
  trend:[], alertStatus:{}, settings:{}, filterKw:'all', filterSent:'all',
  sortBy:'heat', filterAlert:'all', currentReport:null, data:{}};
const $ = id => document.getElementById(id);
function el(tag, cls, txt) { const e=document.createElement(tag); if(cls)e.className=cls; if(txt!==undefined)e.textContent=txt; return e; }
function toast(text) { $('toast').textContent=text; $('toast').classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>$('toast').classList.remove('show'),4000); }
async function api(path, payload) {
  const options={cache:'no-store',headers:{'Content-Type':'application/json','X-Monitor-Token':state.token}};
  if(payload!==undefined){options.method='POST';options.body=JSON.stringify(payload);}
  const response=await fetch(path,options);
  const data=await response.json(); if(!response.ok)throw Error(data.error||'请求失败'); return data;
}
function formatTime(value) { return value ? new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}):'未知'; }
function sentName(value) { return {neg:'疑似负面',pos:'正向命中',neu:'未命中情绪词'}[value]||'待判断'; }
function sentChip(value) {return el('span','chip chip-'+value,sentName(value));}
function alertSt(id) {return state.alertStatus[id]||'待处理';}
function download(text,name,type='text/plain;charset=utf-8') {const a=el('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),300);}
function safeUrl(url) {try{const u=new URL(url);return u.protocol==='https:'&&u.hostname==='www.xiaohongshu.com'?u.href:null;}catch{return null;}}
function dateKey(value) {if(!value)return '';return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));}
function filteredNotes() {return state.notes.filter(n=>(state.filterKw==='all'||n.keywords.includes(state.filterKw))&&(state.filterSent==='all'||n.sent===state.filterSent));}
function sortNotes(list) {const w={'高':3,'中':2,'低':1,'无':0};return list.slice().sort((a,b)=>state.sortBy==='time'?(Date.parse(b.time)||0)-(Date.parse(a.time)||0):state.sortBy==='risk'?w[b.risk]-w[a.risk]||b.likes-a.likes:(b.likes+b.comments*3)-(a.likes+a.comments*3));}
async function saveKeywords(next) {await api('/api/config',{keywords:next});await load();toast('关键词已保存，将在下次采集生效');}
async function load() {
  const payload=await api(state.local?'/api/dashboard':'data/dashboard.json');
  state.data=payload;state.keywords=payload.keywords||[];state.allNotes=payload.notes||[];
  state.reports=payload.reports||[];const ids=new Set(state.reports.at(-1)?.note_ids||[]);state.notes=state.allNotes.filter(n=>ids.has(n.id));state.trend=payload.trend||[];
  state.alertStatus=payload.alertStatus||{};state.currentReport=state.reports.at(-1)||null;
  if(state.local)state.settings=await api('/api/config');
  renderAll();
}
