"use client";

import { useState, type KeyboardEvent } from "react";
import { Arrow } from "./Brand";

const examples = [
  {
    tab: "Product adoption",
    context: "A payments product attracts signups, but few users make a first useful payment.",
    desire: "More people getting real value from the product.",
    behaviour: "Identify where onboarding stalls and what leads to a completed first payment.",
    business: "Examine activation, early retention, support friction and acquisition costs.",
    research: "Review the product journey, customer feedback and relevant user cohorts.",
    decision: "Recommend product fixes, partner onboarding or a focused activation test based on the findings."
  },
  {
    tab: "Customer retention",
    context: "A consumer application sees first-time activity, then a sharp drop in repeat use.",
    desire: "More customers choosing to return.",
    behaviour: "Study which actions predict repeat use and when people stop engaging.",
    business: "Assess returning-user cohorts, repeat actions, satisfaction signals and costs.",
    research: "Compare user segments, alternatives in the market and points of friction.",
    decision: "Prioritise the causes worth testing before recommending retention initiatives."
  },
  {
    tab: "Distribution & partners",
    context: "A Web3 team wants to reach a more relevant audience but lacks evidence about channels.",
    desire: "Qualified users discovering and adopting the product.",
    behaviour: "Examine where potential users are, what earns their trust and what prompts meaningful use.",
    business: "Assess channel fit, partner overlap, conversion quality and likely operating costs.",
    research: "Map competitors, communities, potential partners and available performance data.",
    decision: "Present a distribution shortlist. A behaviour-led campaign may be one option, not the default."
  }
];

export default function StrategyShowcase() {
  const [active, setActive] = useState(0);
  const selected = examples[active];

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % examples.length;
    else if (event.key === "ArrowLeft") next = (index + examples.length - 1) % examples.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = examples.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    document.getElementById(`strategy-tab-${next}`)?.focus();
  }

  return <section className="strategy-section" id="focus" aria-labelledby="strategy-title">
    <div className="shell">
      <div className="strategy-heading">
        <div>
          <span className="eyebrow">THE IFAGRITHM STRATEGY</span>
          <h2 id="strategy-title" className="section-heading">Desire. Behaviour. Business.</h2>
        </div>
        <p>A business problem sets the question. Research examines the behaviour and evidence behind it. The findings inform what happens next.</p>
      </div>
      <div className="strategy-shell">
        <div className="strategy-topline">
          <span>RESEARCH APPLICATION / ILLUSTRATIVE</span>
          <span>SELECT A BUSINESS CHALLENGE</span>
        </div>
        <div className="strategy-tabs" role="tablist" aria-label="Example business challenges">
          {examples.map((example, index) => <button type="button" key={example.tab} role="tab" id={`strategy-tab-${index}`} aria-selected={active === index} aria-controls="strategy-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => onTabKey(event, index)}>{example.tab}<span aria-hidden="true">0{index + 1}</span></button>)}
        </div>
        <div className="strategy-panel" id="strategy-panel" role="tabpanel" aria-labelledby={`strategy-tab-${active}`} key={active} tabIndex={0}>
          <p className="strategy-context"><span>THE BUSINESS QUESTION</span>{selected.context}</p>
          <div className="strategy-columns">
            <article className="strategy-card"><span>01 / DESIRE</span><h3>What does the business need?</h3><p>{selected.desire}</p></article>
            <article className="strategy-card"><span>02 / BEHAVIOUR</span><h3>What should we investigate?</h3><p>{selected.behaviour}</p></article>
            <article className="strategy-card strategy-card-accent"><span>03 / BUSINESS</span><h3>What evidence informs value?</h3><p>{selected.business}</p></article>
          </div>
          <div className="strategy-next">
            <div><span>RESEARCH DIRECTION</span><p>{selected.research}</p></div>
            <div><span>POSSIBLE NEXT STEP</span><p>{selected.decision}</p></div>
          </div>
        </div>
        <div className="strategy-bottom"><p>These are sample reasoning exercises, not completed client projects or promised outcomes.</p><a href="#contact">Discuss your business question <Arrow/></a></div>
      </div>
    </div>
  </section>;
}
