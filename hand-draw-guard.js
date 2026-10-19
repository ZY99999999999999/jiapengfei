(function(root){
 'use strict';
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0));
 function classify(lm){
  if(!lm||lm.length!==21||lm.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return null;
  const palm=Math.max(distance(lm[0],lm[9]),.025);
  const extended=[8,12,16,20].map(t=>distance(lm[t],lm[0])>distance(lm[t-2],lm[0])*1.12&&distance(lm[t],lm[t-3])>palm*.52);
  const folded=[8,12,16,20].every(t=>distance(lm[t],lm[0])<distance(lm[t-2],lm[0])*1.04);
  const thumb=distance(lm[4],lm[5])>distance(lm[3],lm[5])*1.15&&distance(lm[4],lm[9])>palm*.58;
  return {index:extended[0]&&!extended.slice(1).some(Boolean),open:extended.every(Boolean)&&thumb,fist:folded&&!thumb};
 }
 function create(){
  let openSince=null,fistSince=null,indexSince=null,lastIndex=-Infinity,lastSeen=-Infinity,confirmed=false;
  return {reset(){openSince=fistSince=indexSince=null;lastIndex=lastSeen=-Infinity;confirmed=false;},
   update(lm,now,hasInk){
    const pose=classify(lm);
    if(!pose){openSince=fistSince=indexSince=null;return {draw:false,open:false,confirm:false,clear:false,lost:now-lastSeen>180};}
    if(now-lastSeen>220){openSince=fistSince=indexSince=null;lastIndex=-Infinity;}lastSeen=now;
    openSince=pose.open&&hasInk?(openSince??now):null;
    fistSince=pose.fist&&hasInk?(fistSince??now):null;
    indexSince=pose.index?(indexSince??now):null;
    if(pose.index)lastIndex=now;
    const confirm=!confirmed&&openSince!==null&&now-openSince>=350;
    if(confirm)confirmed=true;
    return {draw:pose.index&&now-indexSince>=65,continueStroke:!pose.open&&!pose.fist&&now-lastIndex<130,open:pose.open&&hasInk,confirm,clear:fistSince!==null&&now-fistSince>=1100,clearProgress:fistSince===null?0:Math.min(1,(now-fistSince)/1100),lost:false};
   }};
 }
 const api={classify,create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatternDrawGuard=api;
})(typeof window!=='undefined'?window:globalThis);
