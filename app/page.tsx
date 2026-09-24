"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { tiers, earn, type Perk, mobileCropTop, mobileY } from './tiers';

type Panel = 'directory'|'tier'|null;
// Relative to the deploy base so the static build works under a GitHub Pages subpath.
const asset=(path:string)=>`${import.meta.env.BASE_URL}assets/${path}`;
const sleep=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
export default function Home(){
 const [ready,setReady]=useState(false);
 const [entered,setEntered]=useState(false),[floor,setFloor]=useState(0),[closed,setClosed]=useState(true),[phase,setPhase]=useState('idle'),[direction,setDirection]=useState('up'),[target,setTarget]=useState(0);
 const [perk,setPerk]=useState<Perk|null>(null),[panel,setPanel]=useState<Panel>(null),[join,setJoin]=useState<'join'|'return'|null>(null);
 const [service,setService]=useState('earn'),[mobile,setMobile]=useState(false),[reduced,setReduced]=useState(false);
 const busy=useRef(false), floorRef=useRef(0), wheel=useRef({sum:0,last:0,latched:false}), touch=useRef({x:0,y:0}), restoreFocus=useRef<HTMLElement|null>(null);
 const tier=tiers[floor];
 useEffect(()=>{const mq=matchMedia('(max-width:900px)'),rm=matchMedia('(prefers-reduced-motion:reduce)');const update=()=>{setMobile(mq.matches);setReduced(rm.matches)};update();setReady(true);mq.addEventListener('change',update);rm.addEventListener('change',update);return()=>{mq.removeEventListener('change',update);rm.removeEventListener('change',update)}},[]);
 useEffect(()=>{for(const i of [floor-1,floor,floor+1]){if(!tiers[i])continue;const im=new Image();im.src=asset(`${tiers[i].id}${mobile?'-mobile':''}.webp`)}},[floor,mobile]);
 const travel=useCallback(async(next:number,first=false)=>{
  if(busy.current||next<0||next>3||(!first&&next===floorRef.current))return;
  busy.current=true;setPerk(null);setDirection(next>=floorRef.current?'up':'down');setTarget(next);setPhase('closing');setClosed(true);
  if(first){setEntered(true);await sleep(reduced?100:600)}else await sleep(reduced?160:460);
  // Swap only after the two persistent door layers have fully met.
  floorRef.current=next;setFloor(next);setPhase('travelling');
  const source=asset(`${tiers[next].id}${mobile?'-mobile':''}.webp`);
  const preload=new Image();preload.src=source;
  await Promise.all([preload.decode().catch(()=>{}),sleep(reduced?80:200)]);
  setClosed(false);setPhase('opening');await sleep(reduced?170:520);setPhase('idle');busy.current=false;
 },[mobile,reduced]);
 const openPanel=(p:Panel)=>{restoreFocus.current=document.activeElement as HTMLElement;setPanel(p)};
 const openPerk=(p:Perk)=>{restoreFocus.current=document.activeElement as HTMLElement;setPerk(p)};
 const openJoin=(type:'join'|'return')=>{restoreFocus.current=document.activeElement as HTMLElement;setJoin(type)};
 const returnFocus=(e:Event)=>{e.preventDefault();restoreFocus.current?.focus()};
 // Listen across the hotel, including the frame and controls. Overlay scrolling stays native.
 useEffect(()=>{
  const onWheel=(e:WheelEvent)=>{
   if(!entered||panel||perk||join||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
   e.preventDefault();
   const now=performance.now();const gesture=wheel.current;
   if(now-gesture.last>260){gesture.sum=0;gesture.latched=false;}
   gesture.last=now;
   if(busy.current||gesture.latched)return;
   const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
   if(Math.sign(delta)!==Math.sign(gesture.sum))gesture.sum=0;
   gesture.sum+=delta;
   if(Math.abs(gesture.sum)>=42){gesture.latched=true;void travel(floorRef.current+Math.sign(gesture.sum));}
  };
  window.addEventListener('wheel',onWheel,{passive:false});
  return()=>window.removeEventListener('wheel',onWheel);
 },[entered,panel,perk,join,travel]);
 // Optional progressive enhancement; browsers without WebMCP use the same visible buttons.
 useEffect(()=>{
  type Tool={name:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>Promise<unknown>};
  const ctx=(document as Document & {modelContext?:{registerTool:(tool:Tool,options:{signal:AbortSignal})=>unknown}}).modelContext;
  if(!ctx)return;const lifecycle=new AbortController();
  Promise.resolve(ctx.registerTool({name:'navigate_hotel_floor',description:'Enter the Heartbreak Hotel concept and travel to a loyalty floor. Does not create an account.',inputSchema:{type:'object',properties:{floor:{type:'integer',minimum:1,maximum:4}},required:['floor'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async(input)=>{const n=(input as {floor?:number})?.floor;if(!Number.isInteger(n)||n!<1||n!>4)throw new Error('Floor must be an integer from 1 to 4.');if(busy.current||panel||perk||join)throw new Error('Close the overlay or wait for arrival before travelling.');await travel(n!-1,!entered);return {floor:n,tier:tiers[n!-1].name,accountCreated:false}}},{signal:lifecycle.signal})).catch(()=>{});return()=>lifecycle.abort();
 },[travel,entered,panel,perk,join]);
 return <main className={`hotel ${entered?'entered':''} ${closed?'doors-closed':''} ${phase}`}>
  <header className="header"><button className="outcast" aria-label="Return to hotel welcome" onClick={()=>{if(!busy.current){setEntered(false);setClosed(true);setFloor(0);floorRef.current=0}}}><img src={asset('outcast-white.svg')} alt="Outcast" width="150" height="20"/></button><span className="header-caption">THE HEARTBREAK HOTEL <span>·</span> OUTCAST LOYALTY</span><button className="services-link" onClick={()=>openPanel('directory')}><span aria-hidden="true">✧</span> GUEST SERVICES</button></header>
  <section className={`elevator floor-${tier.id}`} aria-label="Heartbreak Hotel elevator" onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{if(!entered||panel||perk||join||busy.current||(e.target as HTMLElement).closest('button'))return;const dy=touch.current.y-e.changedTouches[0].clientY,dx=touch.current.x-e.changedTouches[0].clientX;if(Math.abs(dy)>65&&Math.abs(dy)>Math.abs(dx)*1.4)void travel(floor+Math.sign(dy))}}>
   <div className="floor-indicator" aria-live="polite" aria-atomic="true"><span className={phase==='travelling'?'indicator-moving':''}>{entered?(phase==='idle'?'—':direction==='up'?'↑':'↓'):'✧'}</span><b>{entered?tier.code:'WELCOME'}</b><span>{entered?(phase==='idle'?'YOU HAVE ARRIVED':'GOING '+direction.toUpperCase()):'YOUR STAY STARTS HERE'}</span></div>
   <div className="portal" style={{'--scene-ratio':mobile?`848 / ${1264-mobileCropTop[floor]}`:'1376 / 768'} as CSSProperties}>
    <div className="lift-frame">
    <div className={`floor-scene scene-${tier.id}`} key={tier.id} aria-hidden={!entered}>
     <div className="scene-stage">
     <picture><source media="(max-width:900px)" srcSet={asset(`${tier.id}-mobile.webp`)}/><img className="scene-image" src={asset(`${tier.id}.webp`)} alt={`${tier.name}: ${floor===3?'a private bar with an invitation, telephone and eveningwear':floor===2?'an oxblood lounge with gifts and a dressing rail':'a burgundy bedroom with a birthday gift and fashion accessories'}`} fetchPriority="high"/></picture>
     <div className="scene-shade"/>
     {entered&&<><div className="scene-top"><span>THE HEARTBREAK HOTEL</span><span>0{floor+1} / 04</span></div>
     <div className="hotspots" aria-label={`${tier.name} benefits`}>{tier.perks.map(p=><div className="hotspot-position" key={p.id} style={{'--x':`${p.x}%`,'--y':`${p.y}%`,'--mx':`${p.mobileX}%`,'--my':`${mobileY(floor,p.mobileY)}%`} as CSSProperties}><button className="hotspot" aria-label={`Explore ${p.label}`} onClick={()=>openPerk(p)} disabled={phase!=='idle'}><span aria-hidden="true">+</span><span className="hotspot-label">{p.label}</span></button></div>)}</div>
     <div className="explore-hint"><span>+</span> EXPLORE YOUR PRIVILEGES</div></>}
    </div>
    </div>
    <div className="door left" aria-hidden="true"/><div className="door right" aria-hidden="true"/>
    {entered&&closed&&<div className="travel-mark" aria-hidden="true"><img src={asset('logo.png')} alt=""/><span>{phase==='travelling'?tiers[target].name:'YOUR NEXT UPGRADE'}</span></div>}</div>
    {!entered&&<div className="intro"><span className="eyebrow">OUTCAST LOYALTY · YOU'RE INVITED</span><h1 className="sr-only">The Heartbreak Hotel loyalty programme</h1><img className="hotel-logo" src={asset('logo.png')} alt="The Heartbreak Hotel"/><p>Join Heartbreak Hotel and start earning toward<br className="desktop"/> upgrades, early access and exclusive drops.</p><button className="primary" disabled={!ready} onClick={()=>void travel(0,true)}>CHECK IN <span>↗</span></button><small>Join Heartbreak Hotel · Explore your privileges</small><button className="text-button" onClick={()=>openJoin('return')}>RETURNING GUEST</button><span className="intro-footnote">FOUR FLOORS. A LITTLE MORE ON EVERY LEVEL.</span></div>}
   </div>
   {entered&&<div className="tier-copy"><span className="eyebrow">FLOOR {tier.code} <span> / </span> SPEND {tier.spend}</span><h1>{tier.name}</h1><p>{tier.tagline}</p><div className="tier-stats"><span><strong>{tier.points}×</strong> points per $1</span><span><strong>{tier.birthday}%</strong> birthday voucher</span></div><button className="text-button benefits-link" onClick={()=>openPanel('tier')}>ALL SUITE PRIVILEGES <span>↗</span></button></div>}
   {entered&&<nav className="floor-controls" aria-label="Choose a hotel floor" onKeyDown={e=>{if(['ArrowUp','ArrowDown','Home','End'].includes(e.key)){e.preventDefault();void travel(e.key==='Home'?0:e.key==='End'?3:floorRef.current+(e.key==='ArrowUp'?1:-1));}}}><span className="control-caption">SELECT<br/>YOUR FLOOR</span>{[3,2,1,0].map(i=><button key={i} aria-label={`Travel to ${tiers[i].name}`} aria-pressed={floor===i} disabled={phase!=='idle'} className={`${floor===i?'active':''} ${target===i&&phase!=='idle'?'requested':''}`} onClick={()=>void travel(i)}><span className="floor-button">{tiers[i].code}</span><span className="floor-label">{tiers[i].name.replace(' Suite','')}</span></button>)}<span className="control-star" aria-hidden="true">✧</span></nav>}
   {entered&&<div className="journey-bar"><span className="journey-instruction">{mobile?'SWIPE UP TO GO HIGHER':'SCROLL DOWN TO GO UP'} <span aria-hidden="true">↕</span></span><span className="journey-status">{floor===3?'YOU’VE REACHED THE TOP.':'EVERY FLOOR, A LITTLE MORE.'}</span><button className="primary join-cta" onClick={()=>openJoin('join')}>JOIN LOYALTY <span>↗</span></button></div>}
  </section>
  <footer><span>STAY A LITTLE. WANT A LOT.</span><span>HEARTBREAK LOOKS GOOD ON YOU.</span><button onClick={()=>openPanel('directory')}>HOTEL DIRECTORY ↗</button></footer>
  <Sheet open={!!perk||!!panel} onOpenChange={o=>{if(!o){setPerk(null);setPanel(null)}}}><SheetContent side={mobile?'bottom':'right'} className={`hotel-sheet ${panel==='directory'?'directory-sheet':''}`} onCloseAutoFocus={returnFocus}>
   <span className="eyebrow sheet-kicker">THE HEARTBREAK HOTEL <span> / </span> {perk||panel==='tier'?`FLOOR ${tier.code}`:'GUEST SERVICES'}</span>
   <SheetTitle className="sheet-title">{perk?perk.title:panel==='tier'?tier.name:'Hotel directory'}</SheetTitle>
   <SheetDescription className="sheet-description">{perk?perk.description:panel==='tier'?`Spend ${tier.spend}. ${tier.tagline}`:'All the details. No room key required.'}</SheetDescription>
   {perk&&<><div className="benefit-value">{perk.value}</div><span className="benefit-tier">{tier.name.toUpperCase()} PRIVILEGE</span><button className="primary" onClick={()=>{setPerk(null);setPanel('tier')}}>EXPLORE ALL PRIVILEGES <span>↗</span></button></>}
   {panel==='tier'&&!perk&&<><ul className="benefit-list">{tier.benefits.map((b,i)=><li key={b}><span className="benefit-index">0{i+1}</span>{b}</li>)}</ul>{floor>0&&<p className="small-note">Your access grows with every floor. Higher tiers keep early sale access and add upgraded rewards.</p>}<button className="primary" onClick={()=>{setPanel(null);setJoin('join')}}>JOIN LOYALTY <span>↗</span></button></>}
   {panel==='directory'&&<Tabs value={service} onValueChange={setService} className="services-tabs"><TabsList className="directory-tabs" variant="line"><TabsTrigger value="earn">Ways to earn</TabsTrigger><TabsTrigger value="redeem">Redeem</TabsTrigger><TabsTrigger value="refer">Bring a guest</TabsTrigger><TabsTrigger value="faq">FAQ</TabsTrigger></TabsList>
    <TabsContent value="earn"><h3>A rewarding stay.</h3><div className="earn-list">{earn.map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><p className="small-note">Presidential guests earn 2 points per $1. Penthouse guests earn 3 points per $1.</p></TabsContent>
    <TabsContent value="redeem"><h3>Room service rewards.</h3><div className="rewards">{[[200,10],[400,20],[1000,50]].map(([points,off])=><div key={points}><span>{points.toLocaleString()} POINTS</span><strong>${off} OFF</strong></div>)}</div><h4>HOW TO REDEEM</h4><ol className="redeem-steps"><li>Add products to your cart</li><li>Log in to your account</li><li>Choose your reward</li><li>Redeem your reward</li></ol></TabsContent>
    <TabsContent value="refer"><img className="referral-tag" src={asset('tag.webp')} alt="Heartbreak Hotel luggage tags"/><h3>Good company. Great perks.</h3><p>Give a friend 10% off their first purchase of $100, and receive 10% off for each successful referral.</p><button className="primary" onClick={()=>{setPanel(null);setJoin('join')}}>JOIN & BRING A GUEST <span>↗</span></button></TabsContent>
    <TabsContent value="faq"><div className="faq-list"><details open><summary>What is Heartbreak Hotel?</summary><p>Outcast’s loyalty programme. Earn points, redeem rewards and unlock more access as you move through four suite levels.</p></details><details><summary>How do I move up a floor?</summary><p>Your spend determines your tier: Suite $0–$299, Deluxe $300–$599, Presidential $600–$1,999 and Penthouse $2,000+.</p></details><details><summary>What can I do with my points?</summary><p>Redeem 200 points for $10 off, 400 for $20 off, or 1,000 for $50 off.</p></details><details><summary>What makes Penthouse different?</summary><p>Earn 3 points per $1, get a 20% birthday voucher, surprise welcome points, early sale and collection access, exclusive event invitations and priority Heartbreak Concierge care.</p></details><details><summary>Can I join here?</summary><p>This is a concept preview. Check In lets you explore the hotel; account creation and returning-member sign-in will be connected in the final experience.</p></details></div></TabsContent>
   </Tabs>}
  </SheetContent></Sheet>
  <Dialog open={!!join} onOpenChange={o=>{if(!o)setJoin(null)}}><DialogContent className="join-dialog" onCloseAutoFocus={returnFocus}><img src={asset('logo.png')} alt="The Heartbreak Hotel"/><span className="eyebrow">{join==='return'?'RETURNING GUEST':'OUTCAST LOYALTY'}</span><DialogTitle>{join==='return'?'Welcome back.':'Your stay starts here.'}</DialogTitle><DialogDescription>{join==='return'?'Your room is waiting. Member sign-in will be available in the final experience.':'40 welcome points. Four floors of privileges. A wardrobe with rewards.'}</DialogDescription><div className="prototype-note">CONCEPT PREVIEW<p>{join==='return'?'Sign-in is not connected in this prototype.':'Account creation will open here in the final experience. No account has been created.'}</p></div><button className="primary" onClick={()=>{setJoin(null);if(!entered)void travel(0,true)}}>{entered?'BACK TO THE HOTEL':'EXPLORE THE HOTEL'} <span>↗</span></button></DialogContent></Dialog>
 </main>
}
