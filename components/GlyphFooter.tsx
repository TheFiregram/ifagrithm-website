"use client";

import { useEffect, useRef } from "react";

const glyphs="0189%#&S5B+";

export default function GlyphFooter() {
  const background=useRef<HTMLCanvasElement>(null);
  const word=useRef<HTMLCanvasElement>(null);
  const holder=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const bg=background.current,front=word.current,host=holder.current,footer=host?.closest("footer");
    const bgContext=bg?.getContext("2d"),context=front?.getContext("2d");
    if(!bg||!front||!host||!footer||!bgContext||!context)return;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    const mask=document.createElement("canvas"),maskContext=mask.getContext("2d");
    if(!maskContext)return;
    let width=0,height=0,footerHeight=0,cell=10,dpr=1,frame=0,last=0,elapsed=0,visible=false,alive=true;
    let light=document.documentElement.dataset.theme==="light",pointer=-1000;
    let cells:{x:number;y:number;alpha:number;glyph:number}[]=[];
    function draw(time:number){
      if(!context||!bgContext)return;
      context.clearRect(0,0,width,height);bgContext.clearRect(0,0,width,footerHeight);
      const ink=light?"70,63,50":"224,225,229",gold=light?"132,91,0":"255,196,37";
      const phase=Math.floor(time*6);
      context.font=bgContext.font=`600 ${cell*1.15}px ui-monospace,monospace`;
      context.textAlign=bgContext.textAlign="center";context.textBaseline=bgContext.textBaseline="middle";
      for(let y=cell/2,row=0;y<footerHeight;y+=cell,row++){
        for(let x=cell/2,col=0;x<width;x+=cell,col++){
          const alpha=.018+(.5+.5*Math.sin(col*.27+row*.31+time*.15))*.035;
          bgContext.fillStyle=`rgba(${ink},${alpha})`;bgContext.fillText(glyphs[(row*7+col*13+phase)%glyphs.length],x,y);
        }
      }
      const sweep=time%7.5/7.5*(width+200)-100;
      cells.forEach((point,index)=>{
        const pulse=Math.max(0,1-Math.abs(point.x-sweep)/100),hover=Math.max(0,1-Math.abs(point.x-pointer)/120);
        context.fillStyle=`rgba(${hover>.2?gold:ink},${Math.min(.95,point.alpha*(.42+.35*pulse+.25*hover))})`;
        context.fillText(glyphs[(point.glyph+(index%8===0?phase:Math.floor(phase/4)))%glyphs.length],point.x,point.y);
      });
    }
    function tick(now:number){frame=0;if(!visible||document.hidden||reduced.matches)return;if(now-last>=80){elapsed+=Math.min((now-last)/1000,.1);last=now;draw(elapsed);}frame=requestAnimationFrame(tick);}
    function refresh(){cancelAnimationFrame(frame);frame=0;draw(elapsed);if(visible&&!document.hidden&&!reduced.matches){last=performance.now();frame=requestAnimationFrame(tick);}}
    function resize(){
      if(!alive||!host||!front||!bg||!context||!bgContext||!maskContext||!footer)return;
      width=host.clientWidth;height=host.clientHeight;footerHeight=footer.clientHeight;if(!width||!height)return;
      cell=width<700?4:width<1200?9:11;dpr=Math.min(window.devicePixelRatio,1.5);
      front.width=Math.round(width*dpr);front.height=Math.round(height*dpr);bg.width=Math.round(width*dpr);bg.height=Math.round(footerHeight*dpr);context.setTransform(dpr,0,0,dpr,0,0);bgContext.setTransform(dpr,0,0,dpr,0,0);
      mask.width=Math.round(width);mask.height=Math.round(height);maskContext.font="600 100px Geist,Arial,sans-serif";const size=width*.94/maskContext.measureText("IFAGRITHM").width*100;
      maskContext.font=`600 ${size}px Geist,Arial,sans-serif`;maskContext.textAlign="center";maskContext.textBaseline="middle";maskContext.fillStyle="#fff";maskContext.fillText("IFAGRITHM",width/2,height/2+size*.055);
      const pixels=maskContext.getImageData(0,0,mask.width,mask.height).data;cells=[];
      for(let y=cell/2,row=0;y<height;y+=cell,row++)for(let x=cell/2,col=0;x<width;x+=cell,col++){const alpha=pixels[(Math.floor(y)*mask.width+Math.floor(x))*4+3]/255;if(alpha>.2)cells.push({x,y,alpha,glyph:(row*7+col*13)%glyphs.length});}
      host.dataset.rendered="true";refresh();
    }
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;refresh();});observer.observe(footer);
    const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(host);sizeObserver.observe(footer);
    const themeObserver=new MutationObserver(()=>{light=document.documentElement.dataset.theme==="light";refresh();});themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
    const move=(event:PointerEvent)=>{pointer=event.clientX-host.getBoundingClientRect().left;if(reduced.matches)draw(elapsed);};const leave=()=>{pointer=-1000;if(reduced.matches)draw(elapsed);};
    host.addEventListener("pointermove",move);host.addEventListener("pointerleave",leave);reduced.addEventListener("change",refresh);document.addEventListener("visibilitychange",refresh);document.fonts.ready.then(()=>{if(alive)resize();});resize();
    return()=>{alive=false;cancelAnimationFrame(frame);observer.disconnect();sizeObserver.disconnect();themeObserver.disconnect();host.removeEventListener("pointermove",move);host.removeEventListener("pointerleave",leave);reduced.removeEventListener("change",refresh);document.removeEventListener("visibilitychange",refresh);};
  },[]);
  return <><canvas ref={background} className="footer-digital-background" aria-hidden="true"/><div className="footer-word" ref={holder} aria-hidden="true"><span>IFAGRITHM</span><canvas ref={word}/></div></>;
}
