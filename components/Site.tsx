"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import IntroScreen, { type IntroStage } from "./IntroScreen";
import HeroSignals from "./HeroSignals";
import HeroResearchLens from "./HeroResearchLens";
import StrategyShowcase from "./StrategyShowcase";
import FeatureSection from "./FeatureSection";
import { Arrow, BrandMark } from "./Brand";
import { BriefWall } from "./ResearchVisuals";
import GlyphFooter from "./GlyphFooter";
import { useTheme } from "./ThemeProvider";
import EnquiryForm from "./EnquiryForm";

const EMAIL="Ifagrithm@gmail.com";
const X_URL="https://x.com/ifagrithm?s=11";
const LINKEDIN_URL="https://www.linkedin.com/company/ifagrithm/";
const links=[{label:"Services",href:"#services"},{label:"Approach",href:"#approach"},{label:"Applications",href:"#focus"},{label:"FAQ",href:"#faq"},{label:"Join the network",href:"/application"}];
const stages=[
  {title:"Define the decision",label:"DEFINE",text:"Agree on the business question, the available data, the scope and what the findings need to inform.",nodes:["Q","S","D"]},
  {title:"Investigate the evidence",label:"RESEARCH",text:"Examine user behaviour, market information, competitors and commercial performance where relevant.",nodes:["U","M","P","C","A","D"]},
  {title:"Present the options",label:"ADVISE",text:"Deliver findings, limitations and recommendations. Agree on any follow-up or selected execution separately.",nodes:["B","M","D","S","C","A","R","L","N"]},
];
const questions=[
  {question:"What kind of company is IFAGRITHM?",answer:"IFAGRITHM is a Web3 research and business services company. We investigate business problems through market intelligence, behavioural research, analytics and strategic advisory."},
  {question:"Who can work with IFAGRITHM?",answer:"We work with Web3 founders and established teams. The stage of your business matters less than the question or challenge you need examined."},
  {question:"Do you run marketing campaigns?",answer:"Campaign architecture is one possible application of our research. We investigate the objective and user behaviour first. A campaign, product improvement or partnership may be appropriate depending on the findings and the agreed scope."},
  {question:"What do clients receive?",answer:"The agreed output may be a competitor study, research report, product or business analysis, partnership assessment or decision brief. We define the deliverable before starting. Dashboards and software tooling depend on engagement scope and availability."},
  {question:"Do you guarantee user growth or revenue?",answer:"No. We agree the scope and measurable deliverables, document the available evidence, and distinguish findings from projections or outcomes we cannot control."},
  {question:"How do we start?",answer:"Tell us what your business is trying to accomplish, what appears to be blocking progress, and which decision you need to make. The contact form prepares an email for you to review and send.",contact:true},
];

function Brand({ footer=false }: {footer?:boolean}) {
  return <a className={`brand${footer?" footer-brand":" corner-brand"}`} href="#top" aria-label="IFAGRITHM home"><span className="brand-turn"><BrandMark priority={!footer}/></span><span className="brand-name">IFAGRITHM</span></a>;
}

function PixelHeart() {
  const shape=[".XX.XX.","XXXXXXX","XXXXXXX",".XXXXX.","..XXX..","...X..."];
  return <div className="pixel-heart" aria-hidden="true">{shape.flatMap((row,y)=>[...row].map((pixel,x)=>pixel==="X"?<i key={`${x}-${y}`} style={{"--pixel":x+y*2,gridColumn:x+1,gridRow:y+1} as CSSProperties}/>:null))}</div>;
}

export default function Site() {
  const [introStage,setIntroStage]=useState<IntroStage>("pending");
  const [menu,setMenu]=useState(false);
  const {theme,toggleTheme}=useTheme();
  const [openQuestion,setOpenQuestion]=useState<number|null>(null);
  const menuButton=useRef<HTMLButtonElement>(null);
  const header=useRef<HTMLElement>(null);
  const content=useRef<HTMLDivElement>(null);
  const progress=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      const el=entry.target as HTMLElement;
      if(entry.isIntersecting)el.dataset.visible="true";
      else if(entry.boundingClientRect.bottom<0||entry.boundingClientRect.top>window.innerHeight)el.dataset.visible="false";
    }),{threshold:.08});
    document.querySelectorAll("[data-reveal-section]").forEach(el=>observer.observe(el));
    let frame=0;
    let previousY=Math.max(0,window.scrollY),travel=0;
    const update=()=>{
      frame=0;
      const y=Math.max(0,window.scrollY),vh=window.innerHeight,maximum=document.documentElement.scrollHeight-vh;
      const exit=reduced.matches?0:1-Math.pow(1-Math.min(1,y/(.6*vh)),3);
      content.current?.style.setProperty("--hero-exit",String(exit));
      if(progress.current)progress.current.style.transform=`scaleX(${maximum>0?y/maximum:0})`;
      if(header.current){
        header.current.dataset.scrolled=String(y>40);
        const delta=y-previousY;
        if(y<=40){travel=0;header.current.dataset.compact="false";}
        else if(delta!==0){
          travel=Math.sign(delta)===Math.sign(travel)?travel+delta:delta;
          if(Math.abs(travel)>=12)header.current.dataset.compact=String(travel>0);
        }
      }
      previousY=y;
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);reduced.addEventListener("change",schedule);update();
    return()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);reduced.removeEventListener("change",schedule);};
  },[]);

  useEffect(()=>{
    if(!menu)return;
    const el=header.current;if(!el)return;
    const root=document.documentElement,previous=root.style.overflow;root.style.overflow="hidden";
    el.querySelector<HTMLAnchorElement>("nav a")?.focus();
    const escape=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){setMenu(false);menuButton.current?.focus();}
      if(event.key==="Tab"){
        const items=Array.from(el.querySelectorAll<HTMLElement>("a,button")).filter(item=>item.getBoundingClientRect().width>0);
        const first=items[0],last=items[items.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    window.addEventListener("keydown",escape);
    return()=>{root.style.overflow=previous;window.removeEventListener("keydown",escape);};
  },[menu]);

  const introBlocks=introStage==="opening"||introStage==="revealing";

  return <>
    {introStage!=="ready"?<IntroScreen onStageChange={setIntroStage}/>:null}
    <div className="site-content" data-intro={introStage} ref={content} inert={introBlocks} aria-hidden={introBlocks}>
      <a className="skip-link" href="#main">Skip to content</a><div className="reading-progress" ref={progress} aria-hidden="true"/>
      <header className="site-header" ref={header} data-menu-open={menu}><div className="header-inner"><Brand/><nav id="primary-navigation" className={`navigation${menu?" is-open":""}`} aria-label="Main navigation">{links.map(link=><a key={link.href} href={link.href} onClick={()=>setMenu(false)}>{link.label}</a>)}</nav><div className="header-actions"><a className="button demo-cta header-cta" href="#contact" onClick={()=>setMenu(false)}>Book a Discovery Call <Arrow/></a><button className="theme-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`} title={`Switch to ${theme==="dark"?"light":"dark"} mode`}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M12 5a7 7 0 0 1 0 14Z" fill="currentColor"/></svg></button><button className="menu-button" ref={menuButton} type="button" onClick={()=>setMenu(current=>!current)} aria-label={menu?"Close menu":"Open menu"} aria-expanded={menu} aria-controls="primary-navigation"><span/><span/></button></div></div></header>
      {menu?<div className="menu-scrim" onClick={()=>setMenu(false)} aria-hidden="true"/>:null}
      <main id="main">
        <section className="hero" id="top" aria-label="IFAGRITHM Web3 research and business services"><HeroSignals/><div className="hero-content"><div className="hero-mark-motion"><div className="hero-mark hero-enter"><BrandMark priority/><span className="hero-logo-scan"/></div></div><div className="hero-copyblock"><span className="hero-company-kicker hero-enter">IFAGRITHM / WEB3 RESEARCH & BUSINESS SERVICES</span><h1 className="hero-headline hero-headline-static hero-enter">Research for the <span className="hero-accent">decisions</span> that shape your business.</h1><p className="hero-copy hero-summary hero-enter">IFAGRITHM investigates markets, customer behaviour, business performance and commercial opportunities to help Web3 teams make informed decisions.</p><HeroResearchLens running={introStage==="revealing"||introStage==="ready"}/><div className="hero-actions hero-enter"><a className="button network-cta" href="/application">Join the network <Arrow/></a><a className="button demo-cta" href="#contact">Book a Discovery Call <Arrow/></a></div></div></div><a className="scroll-cue hero-enter" href="#services" aria-label="Explore our research services"><span>Scroll to explore</span><i><span/></i></a></section>
        <FeatureSection/>
        <StrategyShowcase/>
        <section className="method-scroll" id="approach" aria-labelledby="approach-title"><span className="anchor-alias" id="method"/><span className="anchor-alias" id="about"/><div className="method-sticky shell" data-reveal-section><div className="method-grid"><div className="method-copy"><h2 className="section-heading enter-item" id="approach-title">Research the question.<br/>Recommend the next step.</h2><p className="enter-item">The scope, research methods and recommended actions depend on the business question.</p><div className="method-note enter-item">Market intelligence, product behaviour, competitor analysis and commercial data, as relevant. <strong>The findings guide the recommendation.</strong></div><a className="button demo-cta enter-item" href="#contact">Book a Discovery Call <Arrow/></a></div><div className="method-network"><div className="method-line"><i/></div>{stages.map((stage,index)=><div className={`method-row method-row-${index}`} key={stage.label} style={{"--stage":index} as CSSProperties}><span className="method-node"/><div className="method-row-copy"><div className="method-avatars" aria-hidden="true">{stage.nodes.map((node,nodeIndex)=><span className={`method-avatar avatar-tone-${nodeIndex%4}`} key={nodeIndex} style={{"--avatar":nodeIndex} as CSSProperties}>{node}</span>)}</div><span className="method-stage-label">{stage.title}</span><p>{stage.text}</p></div><span className="method-number">0{index+1}<span>{stage.label}</span></span></div>)}</div></div></div></section>
        <section className="faq-scroll" id="faq" aria-labelledby="faq-title"><div className="faq-sticky shell" data-reveal-section><div className="faq-heading enter-item"><h2 className="section-heading" id="faq-title">Questions, answered</h2><p>Have a different question? <a href={`mailto:${EMAIL}`}>Talk to us <Arrow/></a></p></div><div className="faq-list">{questions.map((item,index)=><article className={`faq-row${openQuestion===index?" is-open":""}`} key={item.question} style={{"--row":index} as CSSProperties}><h3><button type="button" className="faq-toggle" aria-expanded={openQuestion===index} aria-controls={`faq-answer-${index}`} onClick={()=>setOpenQuestion(current=>current===index?null:index)}><span className="faq-index">0{index+1}</span><span>{item.question}</span><span className="faq-plus" aria-hidden="true"><i/><i/></span></button></h3><div className="faq-answer" id={`faq-answer-${index}`} inert={openQuestion!==index} aria-hidden={openQuestion!==index}><div><p>{item.answer}</p>{item.contact?<a className="faq-contact-link" href="#contact">Book a Discovery Call <Arrow/></a>:null}</div></div></article>)}</div></div></section>
        <section className="outro-scroll" aria-labelledby="outro-title"><div className="outro-sticky" data-reveal-section><BriefWall backdrop/><div className="outro-content"><PixelHeart/><h2 className="section-heading enter-item" id="outro-title">Better research.<br/>Clearer business decisions.</h2><p className="enter-item">Web3 research and business services.<br/>From the question to the next decision.</p><a className="button demo-cta enter-item" href="#contact">Book a Discovery Call <Arrow/></a></div></div></section>
        <section className="contact-section shell" id="contact" aria-labelledby="contact-title" data-reveal-section><div className="contact-grid"><div className="contact-copy enter-item"><span className="eyebrow">Book a Discovery Call</span><h2 className="section-heading" id="contact-title">What does your business<br/>need to solve?</h2><p>Tell us about your business, the challenge you are facing and the decision you need to make.</p></div><EnquiryForm/></div></section>
      </main>
      <footer className="site-footer"><div className="shell"><div className="footer-top"><Brand footer/><nav aria-label="Footer navigation">{links.filter(link=>link.href!=="#focus").map(link=><a href={link.href} key={link.href}>{link.label}</a>)}<a href={X_URL} target="_blank" rel="noopener noreferrer">X / @ifagrithm <Arrow/></a><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn <Arrow/></a></nav><a className="back-to-top" href="#top">Back to top <Arrow direction="up"/></a></div><div className="footer-meta"><span>© 2026 IFAGRITHM LIMITED</span><span>Web3 Research & Business Services.</span></div></div><GlyphFooter/></footer>
    </div>
  </>;
}
