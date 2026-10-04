"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import { BrandMark } from "./Brand";

const nodes = [{label:"Users",glyph:"U"},{label:"Markets",glyph:"M"},{label:"Growth",glyph:"G"},{label:"Decisions",glyph:"D"},{label:"Web3",glyph:"W"}];
const ringCounts = [5, 7, 9, 11, 13];
const ringTimes = [46, 64, 86, 110, 136];

export function OrbitField() {
  return <div className="orbit-field" aria-hidden="true"><div className="orbit-container">{ringCounts.map((count, ring) => <div className={`orbit-ring orbit-ring-${ring}`} key={ring} style={{"--radius": `${108 + ring * 78}px`, "--duration": `${ringTimes[ring]}s`, "--direction": ring % 2 ? "reverse" : "normal", "--ring": ring} as CSSProperties}><div className="orbit-line" /><div className="orbit-turn">{Array.from({length:count}, (_, index) => { const node = nodes[(index + 2 * ring) % nodes.length]; return <div className="orbit-position" key={index} style={{"--angle": `${ring * 23 + index * 360 / count}deg`, "--node": index} as CSSProperties}><div className="orbit-keep"><span className={`orbit-chip chip-${(index + ring) % nodes.length}`} title={node.label}>{node.glyph}</span></div></div>; })}</div></div>)}<div className="orbit-core"><BrandMark /><span className="orbit-core-glow" /></div></div></div>;
}

export function MarketFlow() {
  return <div className="market-flow" aria-hidden="true"><div className="flow-card flow-sources"><div className="flow-card-top"><span>Market signals <small>4 sources</small></span><span className="flow-caption">Evidence</span></div><div className="flow-path">{["Products", "Activity", "Audiences", "Alternatives"].map((label, index) => <span key={label} style={{"--node":index} as CSSProperties}>{label}</span>)}<i /></div></div><div className="flow-card flow-result"><div className="flow-card-top"><span><BrandMark />IFAGRITHM <small>One brief</small></span><span className="flow-caption">A clearer view</span></div><div className="flow-direct"><span>Evidence</span><i /><span>Decision</span></div><div className="flow-foot"><span>Product comparisons</span><span>Market briefs</span></div></div></div>;
}

const notes = [
  {label:"AUDIENCE RESEARCH",title:"Find your people",lines:["Where they spend time", "What brings them to a product", "What they want next"],tag:"Distribution map"},
  {label:"BEHAVIOUR SEGMENTS",title:"Follow the activity",lines:["First visit", "Product use", "Return behaviour"],tag:"User research"},
  {label:"COMPETITOR STUDY",title:"See the alternatives",lines:["Product differences", "Audience overlap", "Market positioning"],tag:"Market intelligence"},
  {label:"DECISION BRIEF",title:"Ask a better question",lines:["Research question", "Evidence and limitations", "Options for the team"],tag:"Decision research"},
  {label:"PARTNERSHIP ASSESSMENT",title:"Map the right channels",lines:["Relevant communities", "Audience fit", "Routes to test"],tag:"Growth research"},
  {label:"RETENTION RESEARCH",title:"What brings people back?",lines:["Activity over time", "Repeat use", "Points of drop off"],tag:"Behaviour research"},
];

export function BriefWall({ backdrop = false }: { backdrop?: boolean }) {
  return <div className={`brief-wall${backdrop ? " brief-wall-backdrop" : ""}`} aria-hidden="true" onPointerMove={event=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||event.pointerType!=="mouse")return;const el=event.currentTarget,box=el.getBoundingClientRect(),x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;el.style.setProperty("--wall-pan",`${x*16}px`);el.style.setProperty("--wall-tilt",`${y*-6}deg`);}} onPointerLeave={event=>{event.currentTarget.style.setProperty("--wall-pan","0px");event.currentTarget.style.setProperty("--wall-tilt","0deg");}}><div className="brief-wall-plane">{Array.from({length:5}, (_, column) => <div className="brief-column" key={column} style={{"--column":column,"--wall-duration":`${36 + column * 7}s`} as CSSProperties}><div className="brief-column-track">{[0,1].map(copy => <div className="brief-set" key={copy}>{Array.from({length:4}, (_, row) => { const note = notes[(column * 2 + row) % notes.length]; return <div className="research-note" key={row}><div className="note-brand"><BrandMark /><span>IFAGRITHM</span><i /></div><span className="note-label">{note.label}</span><h4>{note.title}</h4><div className="note-chart">{[30,58,40,74,53,88,70,95,81].map((height,index) => <i key={index} style={{height:`${height}%`}} />)}</div><ul>{note.lines.map(line => <li key={line}><span />{line}</li>)}</ul><div className="note-tag">{note.tag}</div></div>; })}</div>)}</div></div>)}</div><div className="brief-wall-shade" /></div>;
}

export function EvidenceRuler() {
  return <div className="evidence-ruler" aria-hidden="true"><div className="ruler-value"><span>01</span><span>Clear question</span></div><div className="ruler-bracket"><span>TEST & MEASURE</span><i /></div><div className="ruler-ticks">{Array.from({length:41}, (_, index) => <i key={index} style={{"--tick":index,height:`${index % 10 === 0 ? 64 : index % 5 === 0 ? 44 : 30}px`} as CSSProperties} />)}<span className="ruler-sweep" /></div><div className="ruler-labels"><span>Question</span><span>Evidence</span><span>Decision</span></div><div className="ruler-caption">A decision brief. An intervention. A result to measure.</div></div>;
}

export function SignalGraph({ active }: { active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    const context = el?.getContext("2d");
    if (!el || !context) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, frame = 0, last = 0, elapsed = 0;
    let light = document.documentElement.dataset.theme === "light";
    const points = Array.from({length:20}, (_, index) => {
      const angle = index * 2.399963;
      const y = 1 - index / 19 * 2;
      const radius = Math.sqrt(1 - y * y);
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
    });
    const dust = Array.from({length:150}, (_, index) => {const theta=index*2.399963,radius=Math.sqrt((index+.5)/150);return [Math.cos(theta)*radius,Math.sin(theta)*radius];});
    function paint(time: number) {
      if (!context) return;
      context.clearRect(0,0,width,height);
      const cx=width*.5,cy=height*.48,radius=Math.min(width,height)*.37;
      const ink=light?"94,63,0":"255,206,78";
      dust.forEach(([x,y],index)=>{context.fillStyle=`rgba(${ink},${.08+(Math.sin(time*.2+index)+1)*.06})`;context.fillRect(cx+x*radius*1.23,cy+y*radius*1.23,1,1);});
      const spin=time*.18;
      const projection=points.map(([x,y,z])=>{
        const rx=x*Math.cos(spin)+z*Math.sin(spin),rz=z*Math.cos(spin)-x*Math.sin(spin);
        const ry=y*Math.cos(.3)+rz*Math.sin(.3),depth=rz*Math.cos(.3)-y*Math.sin(.3),scale=1/(1.8-depth*.25);
        return [cx+rx*radius*scale*1.45,cy+ry*radius*scale*1.45,.3+(depth+1)*.3];
      });
      projection.forEach(([x,y,alpha],index)=>{
        [3,7].forEach(step=>{const target=projection[(index+step)%points.length];context.beginPath();context.moveTo(x,y);context.lineTo(target[0],target[1]);context.strokeStyle=`rgba(${ink},${alpha*.23})`;context.lineWidth=.8;context.stroke();});
        context.beginPath();context.arc(x,y,2.1,0,Math.PI*2);context.fillStyle=`rgba(${ink},${alpha})`;context.shadowBlur=12;context.shadowColor=`rgba(${ink},.7)`;context.fill();context.shadowBlur=0;
        if(index%4===0){context.beginPath();context.arc(x,y,6,0,Math.PI*2);context.strokeStyle=`rgba(${ink},${alpha*.3})`;context.stroke();}
      });
    }
    function tick(now:number){frame=0;if(!active||document.hidden||media.matches)return;if(now-last>=1000/30){elapsed+=Math.min((now-last)/1000,.06);last=now;paint(elapsed);}frame=requestAnimationFrame(tick);}
    function refresh(){cancelAnimationFrame(frame);frame=0;paint(elapsed);if(active&&!document.hidden&&!media.matches){last=performance.now();frame=requestAnimationFrame(tick);}}
    const resize=new ResizeObserver(([entry])=>{width=entry.contentRect.width;height=entry.contentRect.height;const dpr=Math.min(window.devicePixelRatio,1.5);el.width=Math.round(width*dpr);el.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);refresh();});
    const theme=new MutationObserver(()=>{light=document.documentElement.dataset.theme==="light";refresh();});
    resize.observe(el);theme.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});media.addEventListener("change",refresh);document.addEventListener("visibilitychange",refresh);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();theme.disconnect();media.removeEventListener("change",refresh);document.removeEventListener("visibilitychange",refresh);};
  },[active]);
  return <div className="signal-graph" aria-hidden="true"><canvas ref={canvas}/><span>Connect the evidence.</span></div>;
}
