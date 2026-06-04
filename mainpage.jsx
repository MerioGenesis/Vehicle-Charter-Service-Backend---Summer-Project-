import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const SERVICES = [
  { icon: "◈", title: "Corporate Charter", desc: "Executive ground transport for business travel, conferences, and airport transfers." },
  { icon: "✦", title: "Event Transport", desc: "Seamless fleet coordination for weddings, galas, premieres, and private events." },
  { icon: "⬡", title: "Airport Transfers", desc: "Punctual, pre-scheduled pickups and drop-offs at all major airports." },
  { icon: "◉", title: "Long-Distance Hire", desc: "Comfortable intercity journeys with professional drivers and premium vehicles." },
];

const FLEET = [
  { name: "Phantom S-Class", type: "Luxury Saloon", seats: "3 passengers", tag: "PREMIUM" },
  { name: "Obsidian SUV",    type: "Executive SUV",  seats: "6 passengers", tag: "POPULAR" },
  { name: "Grand Voyager",   type: "Luxury Coach",   seats: "16 passengers",tag: "GROUP"   },
  { name: "Sovereign Van",   type: "Business Van",   seats: "8 passengers", tag: "BUSINESS"},
];

const STATS = [
  { value: "12K+", label: "Journeys Completed" },
  { value: "98%",  label: "On-Time Rate"        },
  { value: "250+", label: "Vehicles in Fleet"   },
  { value: "24/7", label: "Dedicated Support"   },
];

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Josefin+Sans:wght@200;300;400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black:       #050505;
    --black-2:     #0c0c0c;
    --black-3:     #111111;
    --black-4:     #161616;
    --black-5:     #1c1c1c;
    --purple-hint: #1a0e22;
    --purple-faint:#120a18;
    --gold:        #c49a0e;
    --gold-light:  #e0b020;
    --gold-bright: #f2c94c;
    --gold-dim:    #7a5f08;
    --cream:       #e8e0d0;
    --muted:       #6a6460;
    --muted-2:     #888080;
  }

  html { scroll-behavior: smooth; }
  body { background: var(--black); font-family: 'Cormorant Garamond', Georgia, serif; color: var(--cream); overflow-x: hidden; }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: var(--black-2); }
  ::-webkit-scrollbar-thumb { background: var(--gold-dim); }

  .reveal {
    opacity: 0; transform: translateY(28px);
    transition: opacity .75s cubic-bezier(.16,1,.3,1), transform .75s cubic-bezier(.16,1,.3,1);
  }
  .reveal.in { opacity: 1; transform: none; }
  .d1 { transition-delay: .08s; }
  .d2 { transition-delay: .18s; }
  .d3 { transition-delay: .28s; }
  .d4 { transition-delay: .38s; }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.6rem 4rem;
    transition: background .35s, padding .35s, border-color .35s;
    border-bottom: 1px solid transparent;
  }
  .nav.stuck {
    background: rgba(5,5,5,0.94);
    backdrop-filter: blur(20px);
    padding: 1rem 4rem;
    border-color: rgba(196,154,14,0.12);
  }
  .logo {
    font-family: 'Josefin Sans', sans-serif;
    font-weight: 600; font-size: .88rem;
    letter-spacing: .32em; text-transform: uppercase;
    color: var(--gold-light);
    display: flex; align-items: center; gap: .8rem;
    cursor: pointer; user-select: none;
  }
  .logo-gem {
    width: 22px; height: 22px;
    border: 1.5px solid var(--gold);
    transform: rotate(45deg);
    flex-shrink: 0;
    position: relative;
  }
  .logo-gem::after {
    content:''; position:absolute; inset:4px;
    background: var(--gold);
  }
  .nav-links { display: flex; gap: 2.6rem; list-style: none; }
  .nav-links a {
    font-family: 'Josefin Sans', sans-serif;
    font-weight: 300; font-size: .72rem;
    letter-spacing: .22em; text-transform: uppercase;
    color: var(--muted-2); text-decoration: none;
    transition: color .2s;
  }
  .nav-links a:hover { color: var(--gold-light); }
  .nav-actions { display: flex; gap: .8rem; }
  .btn-ghost {
    font-family: 'Josefin Sans', sans-serif;
    font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; font-weight: 300;
    background: transparent; border: 1px solid rgba(196,154,14,0.35);
    color: var(--gold-light); padding: .5rem 1.3rem;
    cursor: pointer; transition: border-color .2s, color .2s;
  }
  .btn-ghost:hover { border-color: var(--gold-light); color: var(--gold-bright); }
  .btn-gold {
    font-family: 'Josefin Sans', sans-serif;
    font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; font-weight: 400;
    background: var(--gold); border: none;
    color: var(--black); padding: .5rem 1.3rem;
    cursor: pointer; transition: background .2s, transform .15s;
    position: relative; overflow: hidden;
  }
  .btn-gold::after {
    content:''; position:absolute; inset:0;
    background: rgba(255,255,255,.15);
    transform: translateX(-110%) skewX(-18deg);
    transition: transform .35s;
  }
  .btn-gold:hover { background: var(--gold-bright); }
  .btn-gold:hover::after { transform: translateX(120%) skewX(-18deg); }

  /* HERO */
  .hero {
    min-height: 100vh;
    position: relative;
    display: flex; align-items: center;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 55% 65% at 72% 38%, rgba(25,12,35,0.7) 0%, transparent 60%),
      radial-gradient(ellipse 35% 40% at 88% 12%, rgba(196,154,14,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 40% 50% at 8% 85%, rgba(18,10,24,0.5) 0%, transparent 55%),
      linear-gradient(170deg, #050505 0%, #0c0808 45%, #050505 100%);
  }
  .hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(196,154,14,.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(196,154,14,.028) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(ellipse 80% 80% at 65% 45%, black 10%, transparent 70%);
  }
  .hero-stripe {
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, transparent 0%, var(--gold) 30%, var(--gold-dim) 70%, transparent 100%);
    opacity: .25;
  }
  .hero-content {
    position: relative; z-index: 2;
    padding: 0 4rem;
    margin-top: 6rem;
    max-width: 860px;
  }
  .hero-eyebrow {
    font-family: 'Josefin Sans', sans-serif;
    font-size: .68rem; letter-spacing: .38em; text-transform: uppercase;
    color: var(--gold); font-weight: 300;
    display: flex; align-items: center; gap: 1rem;
    margin-bottom: 2rem;
  }
  .hero-eyebrow::before { content:''; width: 36px; height: 1px; background: var(--gold); display:block; }
  .hero-h1 {
    font-size: clamp(3.4rem, 7.5vw, 6.8rem);
    font-weight: 300; line-height: 1.02;
    color: var(--cream); margin-bottom: 1.8rem;
  }
  .hero-h1 em { font-style: italic; color: var(--gold-light); font-weight: 300; }
  .hero-h1 strong { display: block; font-weight: 600; }
  .hero-sub {
    font-family: 'Josefin Sans', sans-serif;
    font-size: .88rem; font-weight: 300;
    letter-spacing: .06em; line-height: 1.85;
    color: var(--muted); max-width: 460px;
    margin-bottom: 3rem;
  }
  .hero-btns { display: flex; align-items: center; gap: 2rem; }
  .btn-primary-lg {
    font-family: 'Josefin Sans', sans-serif;
    font-size: .78rem; letter-spacing: .22em; text-transform: uppercase; font-weight: 400;
    background: var(--gold); border: none; color: var(--black);
    padding: 1rem 2.6rem; cursor: pointer;
    position: relative; overflow: hidden;
    transition: background .2s, transform .15s;
  }
  .btn-primary-lg::after {
    content:''; position:absolute; inset:0;
    background: rgba(255,255,255,.13);
    transform: translateX(-110%) skewX(-18deg);
    transition: transform .38s;
  }
  .btn-primary-lg:hover { background: var(--gold-bright); transform: translateY(-2px); }
  .btn-primary-lg:hover::after { transform: translateX(120%) skewX(-18deg); }
  .btn-link {
    font-family: 'Josefin Sans', sans-serif;
    font-size: .75rem; letter-spacing: .2em; text-transform: uppercase; font-weight: 300;
    background: none; border: none; color: var(--muted-2);
    cursor: pointer; display: flex; align-items: center; gap: .7rem;
    transition: color .2s;
  }
  .btn-link span { width: 28px; height: 1px; background: currentColor; display: inline-block; transition: width .25s; }
  .btn-link:hover { color: var(--cream); }
  .btn-link:hover span { width: 44px; }

  .hero-badge {
    position: absolute; right: 7%; bottom: 15%;
    width: 120px; height: 120px;
    border: 1px solid rgba(196,154,14,.22);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    animation: rot 22s linear infinite;
  }
  .hero-badge-inner { animation: rot 22s linear infinite reverse; text-align: center; }
  .hero-badge-num { font-size: 2rem; font-weight: 300; color: var(--gold-light); line-height: 1; }
  .hero-badge-lbl {
    font-family: 'Josefin Sans', sans-serif;
    font-size: .55rem; letter-spacing: .18em; text-transform: uppercase;
    color: var(--muted);
  }
  @keyframes rot { to { transform: rotate(360deg); } }

  /* STATS */
  .stats {
    background: var(--black-3);
    border-top: 1px solid rgba(196,154,14,.1);
    border-bottom: 1px solid rgba(196,154,14,.1);
    padding: 2.2rem 4rem;
    display: grid; grid-template-columns: repeat(4,1fr); gap: 2rem;
  }
  .stat { text-align: center; }
  .stat-v { font-size: 2.4rem; font-weight: 300; color: var(--gold-light); line-height: 1; margin-bottom: .35rem; }
  .stat-l { font-family: 'Josefin Sans', sans-serif; font-size: .62rem; letter-spacing: .22em; text-transform: uppercase; color: var(--muted); }

  /* SECTIONS */
  .section { padding: 8rem 4rem; }
  .sec-eye {
    font-family: 'Josefin Sans', sans-serif;
    font-size: .64rem; letter-spacing: .36em; text-transform: uppercase;
    color: var(--gold); font-weight: 300;
    display: flex; align-items: center; gap: .9rem;
    margin-bottom: 1rem;
  }
  .sec-eye::before { content:''; width: 24px; height: 1px; background: var(--gold); display:block; }
  .sec-h2 {
    font-size: clamp(2.2rem, 4vw, 3.4rem);
    font-weight: 300; line-height: 1.1; color: var(--cream);
    margin-bottom: 1rem;
  }
  .sec-h2 em { font-style: italic; color: var(--gold-light); }

  /* SERVICES */
  .svc-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3.5rem; }
  .svc-desc {
    font-family: 'Josefin Sans', sans-serif;
    font-size: .82rem; font-weight: 300; letter-spacing: .04em; line-height: 1.8;
    color: var(--muted); margin-top: .8rem; max-width: 420px;
  }
  .svc-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: rgba(196,154,14,.07); }
  .svc-card {
    background: var(--black-2); padding: 2.6rem 2rem;
    position: relative; overflow: hidden; cursor: default;
    transition: background .28s;
  }
  .svc-card::after {
    content:''; position:absolute; bottom:0; left:0; right:0; height:2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    transform: scaleX(0); transition: transform .38s;
  }
  .svc-card:hover { background: var(--black-4); }
  .svc-card:hover::after { transform: scaleX(1); }
  .svc-icon { font-size: 1.5rem; color: var(--gold); margin-bottom: 1.6rem; display: block; }
  .svc-title { font-size: 1.2rem; font-weight: 400; color: var(--cream); margin-bottom: .7rem; }
  .svc-text { font-family: 'Josefin Sans', sans-serif; font-size: .78rem; font-weight: 300; letter-spacing: .04em; line-height: 1.8; color: var(--muted); }
  .svc-more {
    font-family: 'Josefin Sans', sans-serif; font-size: .64rem; letter-spacing: .2em; text-transform: uppercase;
    color: var(--gold); margin-top: 1.8rem;
    display: flex; align-items: center; gap: .4rem;
    opacity: 0; transform: translateY(6px); transition: opacity .28s, transform .28s;
  }
  .svc-card:hover .svc-more { opacity: 1; transform: none; }

  /* FLEET */
  .fleet-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: start; }
  .fleet-tabs { display: flex; flex-direction: column; gap: 1px; background: rgba(196,154,14,.07); margin-top: 2.8rem; }
  .fleet-tab {
    background: var(--black-2); padding: 1.5rem 1.8rem;
    cursor: pointer; display: flex; align-items: center; justify-content: space-between;
    border-left: 3px solid transparent; transition: background .22s, border-color .22s;
  }
  .fleet-tab.on { background: var(--black-4); border-left-color: var(--gold); }
  .fleet-tab:hover:not(.on) { background: var(--black-3); }
  .ft-name { font-size: 1.1rem; font-weight: 400; color: var(--cream); }
  .ft-type { font-family: 'Josefin Sans', sans-serif; font-size: .66rem; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-top: .2rem; }
  .ft-tag {
    font-family: 'Josefin Sans', sans-serif; font-size: .55rem; letter-spacing: .2em; text-transform: uppercase;
    background: var(--gold); color: var(--black); padding: .18rem .5rem;
  }
  .fleet-vis {
    background: var(--black-2);
    border: 1px solid rgba(196,154,14,.1);
    padding: 3rem 2rem;
    display: flex; flex-direction: column; align-items: center; gap: 2rem;
    position: relative; overflow: hidden;
  }
  .fleet-vis::before {
    content:''; position:absolute; bottom:-40px; left:50%; transform:translateX(-50%);
    width: 240px; height: 80px;
    background: radial-gradient(ellipse, rgba(196,154,14,.12) 0%, transparent 70%);
    filter: blur(12px);
  }
  .car { width: 340px; height: 140px; position: relative; }
  .car-body {
    position: absolute; bottom:24px; left:12px; right:12px; height:72px;
    background: linear-gradient(135deg, var(--black-5), var(--black-3));
    border: 1px solid rgba(196,154,14,.2);
    clip-path: polygon(7% 100%, 0% 52%, 14% 18%, 34% 4%, 66% 4%, 82% 18%, 100% 52%, 93% 100%);
  }
  .car-roof {
    position: absolute; bottom:72px; left:76px; right:76px; height:50px;
    background: linear-gradient(135deg, var(--black-4), var(--black-5));
    border-top: 1px solid rgba(196,154,14,.25);
    clip-path: polygon(6% 100%, 16% 0%, 84% 0%, 94% 100%);
  }
  .car-wl, .car-wr {
    position: absolute; bottom:6px;
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid var(--gold-dim); background: var(--black);
  }
  .car-wl { left: 38px; } .car-wr { right: 38px; }
  .car-glow {
    position: absolute; bottom:20px; left:50%; transform:translateX(-50%);
    width: 160px; height: 16px;
    background: radial-gradient(ellipse, rgba(196,154,14,.25) 0%, transparent 70%);
    filter: blur(6px);
  }
  .fleet-info {
    text-align:center; width:100%;
    padding: 1.4rem 1.8rem;
    border-top: 1px solid rgba(196,154,14,.1);
  }
  .fi-name { font-size: 1.5rem; font-weight: 300; color: var(--cream); margin-bottom: .3rem; }
  .fi-detail {
    font-family: 'Josefin Sans', sans-serif;
    font-size: .68rem; letter-spacing: .18em; text-transform: uppercase; color: var(--muted);
  }
  .fi-detail b { color: var(--gold-light); margin: 0 .5rem; font-weight: 400; }

  /* BOOKING */
  .book-wrap {
    background: var(--black-3); border: 1px solid rgba(196,154,14,.12);
    padding: 4.5rem;
    display: grid; grid-template-columns: 1fr auto; gap: 4rem; align-items: center;
    position: relative; overflow: hidden;
  }
  .book-wrap::before {
    content:''; position:absolute; right:-80px; top:-80px;
    width: 220px; height: 220px;
    border: 1px solid rgba(196,154,14,.07); border-radius: 50%;
  }
  .book-wrap::after {
    content:''; position:absolute; right:-40px; top:-40px;
    width: 130px; height: 130px;
    border: 1px solid rgba(196,154,14,.05); border-radius: 50%;
  }
  .book-sub { font-family:'Josefin Sans',sans-serif; font-size:.82rem; font-weight:300; letter-spacing:.05em; line-height:1.8; color:var(--muted); margin-top:.9rem; max-width:440px; }
  .book-form { display:flex; flex-direction:column; gap:.9rem; min-width:290px; }
  .f-lbl { font-family:'Josefin Sans',sans-serif; font-size:.6rem; letter-spacing:.24em; text-transform:uppercase; color:var(--muted); margin-bottom:.3rem; display:block; }
  .f-inp {
    background: var(--black); border: 1px solid rgba(196,154,14,.18);
    color: var(--cream); font-family:'Josefin Sans',sans-serif;
    font-size: .8rem; font-weight:300; padding:.68rem 1rem;
    outline: none; width: 100%;
    transition: border-color .2s;
  }
  .f-inp:focus { border-color: var(--gold); }
  .f-inp::placeholder { color: rgba(106,100,96,.4); }
  .f-inp option { background: var(--black-2); }
  .btn-book {
    font-family:'Josefin Sans',sans-serif; font-size:.76rem; letter-spacing:.2em; text-transform:uppercase; font-weight:400;
    background: linear-gradient(90deg, var(--gold-light), var(--gold));
    border:none; color:var(--black); padding:.9rem; cursor:pointer;
    margin-top:.4rem; transition: opacity .2s, transform .15s;
  }
  .btn-book:hover { opacity:.88; transform:translateY(-1px); }

  /* FOOTER */
  .footer { background: var(--black-2); border-top: 1px solid rgba(196,154,14,.1); padding: 4rem; }
  .foot-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:3rem; margin-bottom:2.8rem; }
  .foot-desc { font-family:'Josefin Sans',sans-serif; font-size:.76rem; font-weight:300; letter-spacing:.04em; line-height:1.8; color:var(--muted); margin-top:.9rem; max-width:240px; }
  .foot-ht { font-family:'Josefin Sans',sans-serif; font-size:.62rem; letter-spacing:.3em; text-transform:uppercase; color:var(--gold); margin-bottom:1.2rem; }
  .foot-ul { list-style:none; display:flex; flex-direction:column; gap:.65rem; }
  .foot-ul a { font-family:'Josefin Sans',sans-serif; font-size:.76rem; font-weight:300; letter-spacing:.05em; color:var(--muted); text-decoration:none; transition:color .2s; }
  .foot-ul a:hover { color:var(--cream); }
  .foot-bot { border-top:1px solid rgba(196,154,14,.07); padding-top:1.8rem; display:flex; justify-content:space-between; align-items:center; }
  .foot-copy { font-family:'Josefin Sans',sans-serif; font-size:.68rem; letter-spacing:.1em; color:var(--muted); }
  .foot-copy span { color:var(--gold); }

  /* ── AUTH PAGES ──────────────────────────────────────────────────────────── */
  .auth-page {
    min-height: 100vh;
    display: grid; grid-template-columns: 1fr 1fr;
    background: var(--black);
  }
  .auth-left {
    position: relative; overflow: hidden;
    background:
      radial-gradient(ellipse 70% 70% at 40% 55%, rgba(22,10,30,.9) 0%, transparent 65%),
      linear-gradient(160deg, #090909 0%, #0e0a0a 100%);
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 3rem;
  }
  .auth-left-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(196,154,14,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(196,154,14,.03) 1px, transparent 1px);
    background-size: 64px 64px;
  }
  .auth-left-glow {
    position: absolute; bottom:-100px; left:-60px;
    width: 350px; height: 350px;
    background: radial-gradient(ellipse, rgba(20,8,28,.8) 0%, transparent 65%);
    border-radius: 50%;
  }
  .auth-left-content {
    position: relative; z-index: 2;
    margin: auto 0;
  }
  .auth-left-tag {
    font-family:'Josefin Sans',sans-serif; font-size:.64rem; letter-spacing:.36em; text-transform:uppercase;
    color:var(--gold); font-weight:300;
    display:flex; align-items:center; gap:.8rem; margin-bottom:2rem;
  }
  .auth-left-tag::before { content:''; width:24px; height:1px; background:var(--gold); display:block; }
  .auth-left-h {
    font-size: clamp(2.4rem, 4vw, 3.6rem);
    font-weight: 300; line-height: 1.1; color: var(--cream);
    margin-bottom: 1.2rem;
  }
  .auth-left-h em { font-style:italic; color:var(--gold-light); }
  .auth-left-p { font-family:'Josefin Sans',sans-serif; font-size:.82rem; font-weight:300; letter-spacing:.05em; line-height:1.8; color:var(--muted); max-width:360px; }
  .auth-left-stats {
    position: relative; z-index: 2;
    display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
    background: rgba(196,154,14,.08);
  }
  .als { background: rgba(5,5,5,.7); padding: 1.2rem 1.4rem; }
  .als-v { font-size:1.6rem; font-weight:300; color:var(--gold-light); line-height:1; margin-bottom:.3rem; }
  .als-l { font-family:'Josefin Sans',sans-serif; font-size:.6rem; letter-spacing:.2em; text-transform:uppercase; color:var(--muted); }

  .auth-right {
    display: flex; align-items: center; justify-content: center;
    padding: 3rem;
    background: var(--black-2);
  }
  .auth-box {
    width: 100%; max-width: 420px;
  }
  .auth-header { margin-bottom: 2.4rem; }
  .auth-title { font-size: 2.2rem; font-weight: 300; color: var(--cream); margin-bottom: .5rem; }
  .auth-title em { font-style:italic; color:var(--gold-light); }
  .auth-subtitle { font-family:'Josefin Sans',sans-serif; font-size:.78rem; font-weight:300; letter-spacing:.05em; line-height:1.7; color:var(--muted); }

  /* Role selector */
  .role-sel { display:grid; grid-template-columns:repeat(3,1fr); gap:.6rem; margin-bottom:1.8rem; }
  .role-btn {
    padding:.7rem .5rem; border:1px solid rgba(196,154,14,.18);
    background:var(--black-3); cursor:pointer;
    display:flex; flex-direction:column; align-items:center; gap:.4rem;
    transition: border-color .2s, background .2s;
  }
  .role-btn.sel { border-color:var(--gold); background:var(--black-4); }
  .role-btn:hover:not(.sel) { border-color:rgba(196,154,14,.35); background:var(--black-3); }
  .role-icon { font-size:1.2rem; }
  .role-lbl { font-family:'Josefin Sans',sans-serif; font-size:.6rem; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); }
  .role-btn.sel .role-lbl { color:var(--gold-light); }

  .auth-form { display:flex; flex-direction:column; gap:1rem; }
  .auth-row { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; }
  .auth-fg { display:flex; flex-direction:column; gap:.35rem; }
  .auth-lbl { font-family:'Josefin Sans',sans-serif; font-size:.6rem; letter-spacing:.24em; text-transform:uppercase; color:var(--muted); }
  .auth-inp {
    background:var(--black); border:1px solid rgba(196,154,14,.16);
    color:var(--cream); font-family:'Josefin Sans',sans-serif;
    font-size:.82rem; font-weight:300; padding:.72rem 1rem;
    outline:none; width:100%; transition:border-color .2s;
  }
  .auth-inp:focus { border-color:var(--gold); }
  .auth-inp::placeholder { color:rgba(106,100,96,.4); }
  .auth-divider {
    display:flex; align-items:center; gap:1rem; margin:.2rem 0;
  }
  .auth-divider::before,.auth-divider::after { content:''; flex:1; height:1px; background:rgba(196,154,14,.1); }
  .auth-divider-txt { font-family:'Josefin Sans',sans-serif; font-size:.6rem; letter-spacing:.2em; text-transform:uppercase; color:var(--muted); }
  .auth-submit {
    font-family:'Josefin Sans',sans-serif; font-size:.76rem; letter-spacing:.22em; text-transform:uppercase; font-weight:400;
    background:var(--gold); border:none; color:var(--black);
    padding:.9rem; cursor:pointer; margin-top:.3rem;
    transition:background .2s, transform .15s;
    position:relative; overflow:hidden;
  }
  .auth-submit::after {
    content:''; position:absolute; inset:0;
    background:rgba(255,255,255,.13);
    transform:translateX(-110%) skewX(-18deg); transition:transform .38s;
  }
  .auth-submit:hover { background:var(--gold-bright); transform:translateY(-1px); }
  .auth-submit:hover::after { transform:translateX(120%) skewX(-18deg); }
  .auth-foot {
    font-family:'Josefin Sans',sans-serif; font-size:.74rem; font-weight:300; letter-spacing:.04em;
    color:var(--muted); text-align:center; margin-top:1.4rem;
  }
  .auth-foot button {
    background:none; border:none; color:var(--gold-light); cursor:pointer;
    font-family:inherit; font-size:inherit; font-weight:400; letter-spacing:inherit;
    transition:color .2s;
  }
  .auth-foot button:hover { color:var(--gold-bright); }
  .auth-back {
    font-family:'Josefin Sans',sans-serif; font-size:.68rem; letter-spacing:.2em; text-transform:uppercase; font-weight:300;
    background:none; border:none; color:var(--muted); cursor:pointer;
    display:flex; align-items:center; gap:.5rem; margin-bottom:2.2rem;
    transition:color .2s;
  }
  .auth-back:hover { color:var(--gold-light); }
  .auth-note {
    font-family:'Josefin Sans',sans-serif; font-size:.7rem; font-weight:300; letter-spacing:.04em; line-height:1.6;
    color:var(--muted); margin-top:.4rem;
  }
  .auth-note span { color:var(--gold-dim); }
  .emp-note {
    background:var(--black-3); border:1px solid rgba(196,154,14,.14); border-left:3px solid var(--gold-dim);
    padding:1rem 1.2rem; margin-top:.4rem;
  }
  .emp-note p { font-family:'Josefin Sans',sans-serif; font-size:.74rem; font-weight:300; letter-spacing:.04em; line-height:1.7; color:var(--muted); }
  .emp-note strong { color:var(--gold-dim); font-weight:400; }

  @media(max-width:900px){
    .nav { padding:1.2rem 2rem; }
    .nav.stuck { padding:.8rem 2rem; }
    .nav-links { display:none; }
    .hero-content { padding:0 2rem; }
    .stats { grid-template-columns:repeat(2,1fr); padding:1.8rem 2rem; }
    .section { padding:5rem 2rem; }
    .svc-grid { grid-template-columns:1fr 1fr; }
    .fleet-wrap { grid-template-columns:1fr; }
    .fleet-vis-col { display:none; }
    .book-wrap { grid-template-columns:1fr; padding:2.5rem; }
    .foot-grid { grid-template-columns:1fr 1fr; }
    .footer { padding:2.5rem 2rem; }
    .hero-badge { display:none; }
    .auth-page { grid-template-columns:1fr; }
    .auth-left { display:none; }
    .auth-right { padding:2rem; }
  }
`;

// ─── HOOKS ───────────────────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── AUTH LEFT PANEL ─────────────────────────────────────────────────────────

function AuthLeft({ title, subtitle }) {
  return (
    <div className="auth-left">
      <div className="auth-left-grid" />
      <div className="auth-left-glow" />
      <div className="logo" style={{ position: "relative", zIndex: 2 }}>
        <div className="logo-gem" />
        VELOX CHARTER
      </div>
      <div className="auth-left-content">
        <div className="auth-left-tag">Premium Vehicle Charter</div>
        <h2 className="auth-left-h" dangerouslySetInnerHTML={{ __html: title }} />
        <p className="auth-left-p">{subtitle}</p>
      </div>
      <div className="auth-left-stats">
        {[{ v: "12K+", l: "Journeys" }, { v: "98%", l: "On-Time" }, { v: "250+", l: "Fleet" }, { v: "24/7", l: "Support" }].map((s) => (
          <div className="als" key={s.l}><div className="als-v">{s.v}</div><div className="als-l">{s.l}</div></div>
        ))}
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ──────────────────────────────────────────────────────────────

function LoginPage({ onNavigate }) {
  const [role, setRole] = useState("customer");
  const roles = [
    { id: "customer", icon: "👤", label: "Customer"  },
    { id: "driver",   icon: "🚗", label: "Driver"    },
    { id: "admin",    icon: "⚙️",  label: "Admin"    },
  ];

  return (
    <div className="auth-page">
      <AuthLeft
        title="Welcome<br/><em>Back.</em>"
        subtitle="Sign in to manage your bookings, track your journey, or access the operations dashboard."
      />
      <div className="auth-right">
        <div className="auth-box">
          <button className="auth-back" onClick={() => onNavigate("home")}>← Back to Home</button>
          <div className="auth-header">
            <h1 className="auth-title">Sign <em>In</em></h1>
            <p className="auth-subtitle">Access your Velox Charter account</p>
          </div>

          {/* Role selector */}
          <div className="role-sel">
            {roles.map((r) => (
              <button
                key={r.id}
                className={`role-btn${role === r.id ? " sel" : ""}`}
                onClick={() => setRole(r.id)}
              >
                <span className="role-icon">{r.icon}</span>
                <span className="role-lbl">{r.label}</span>
              </button>
            ))}
          </div>

          <div className="auth-form">
            <div className="auth-fg">
              <label className="auth-lbl">Email Address</label>
              <input className="auth-inp" type="email" placeholder="you@example.com" />
            </div>
            <div className="auth-fg">
              <label className="auth-lbl">Password</label>
              <input className="auth-inp" type="password" placeholder="••••••••" />
            </div>
            {role === "admin" && (
              <div className="auth-fg">
                <label className="auth-lbl">Admin Access Code</label>
                <input className="auth-inp" type="password" placeholder="Enter admin code" />
                <p className="auth-note"><span>⚠</span> Admin accounts require an additional verification code issued by your system administrator.</p>
              </div>
            )}
            {role === "driver" && (
              <div className="auth-fg">
                <label className="auth-lbl">Driver ID</label>
                <input className="auth-inp" type="text" placeholder="e.g. VLX-DR-0042" />
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={{ background: "none", border: "none", fontFamily: "'Josefin Sans',sans-serif", fontSize: ".7rem", letterSpacing: ".16em", color: "var(--gold-dim)", cursor: "pointer" }}>
                Forgot password?
              </button>
            </div>
            <button className="auth-submit">Sign In</button>
          </div>

          {role === "customer" && (
            <p className="auth-foot">
              Don't have an account?{" "}
              <button onClick={() => onNavigate("register")}>Create one</button>
            </p>
          )}
          {role === "driver" && (
            <p className="auth-foot" style={{ marginTop: "1.2rem" }}>
              Driver accounts are created by management. Contact your coordinator for access.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER PAGE ───────────────────────────────────────────────────────────

function RegisterPage({ onNavigate }) {
  const [step, setStep] = useState(1); // 1 = details, 2 = confirm

  return (
    <div className="auth-page">
      <AuthLeft
        title="Join<br/><em>Velox.</em>"
        subtitle="Create your account and experience premium vehicle charter services tailored to your lifestyle."
      />
      <div className="auth-right">
        <div className="auth-box">
          <button className="auth-back" onClick={() => onNavigate("login")}>← Back to Sign In</button>
          <div className="auth-header">
            <h1 className="auth-title">{step === 1 ? <>Create <em>Account</em></> : <>Almost <em>There</em></>}</h1>
            <p className="auth-subtitle">
              {step === 1 ? "New customers only. Driver & admin accounts are created by management." : "Review your details and confirm registration."}
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: ".4rem", marginBottom: "1.8rem" }}>
            {[1, 2].map((s) => (
              <div key={s} style={{
                flex: 1, height: "2px",
                background: s <= step ? "var(--gold)" : "rgba(196,154,14,.15)",
                transition: "background .3s"
              }} />
            ))}
          </div>

          {step === 1 ? (
            <div className="auth-form">
              <div className="auth-row">
                <div className="auth-fg">
                  <label className="auth-lbl">First Name</label>
                  <input className="auth-inp" type="text" placeholder="James" />
                </div>
                <div className="auth-fg">
                  <label className="auth-lbl">Last Name</label>
                  <input className="auth-inp" type="text" placeholder="Harrow" />
                </div>
              </div>
              <div className="auth-fg">
                <label className="auth-lbl">Email Address</label>
                <input className="auth-inp" type="email" placeholder="you@example.com" />
              </div>
              <div className="auth-fg">
                <label className="auth-lbl">Phone Number</label>
                <input className="auth-inp" type="tel" placeholder="+44 7700 000000" />
              </div>
              <div className="auth-divider"><span className="auth-divider-txt">Security</span></div>
              <div className="auth-fg">
                <label className="auth-lbl">Password</label>
                <input className="auth-inp" type="password" placeholder="Min. 8 characters" />
              </div>
              <div className="auth-fg">
                <label className="auth-lbl">Confirm Password</label>
                <input className="auth-inp" type="password" placeholder="Repeat password" />
              </div>
              <button className="auth-submit" onClick={() => setStep(2)}>Continue →</button>
            </div>
          ) : (
            <div className="auth-form">
              <div className="auth-fg">
                <label className="auth-lbl">Billing Address</label>
                <input className="auth-inp" type="text" placeholder="Street, City" />
              </div>
              <div className="auth-row">
                <div className="auth-fg">
                  <label className="auth-lbl">Postcode</label>
                  <input className="auth-inp" type="text" placeholder="SW1A 1AA" />
                </div>
                <div className="auth-fg">
                  <label className="auth-lbl">Country</label>
                  <input className="auth-inp" type="text" defaultValue="United Kingdom" />
                </div>
              </div>
              <div className="auth-fg">
                <label className="auth-lbl">Company (optional)</label>
                <input className="auth-inp" type="text" placeholder="Organisation name" />
              </div>
              <div className="emp-note">
                <p>
                  This registration is for <strong>customer accounts</strong> only.
                  If you are a driver or staff member, contact your coordinator — accounts are issued internally.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                <input type="checkbox" id="tos" style={{ accentColor: "var(--gold)", width:"14px", height:"14px" }} />
                <label htmlFor="tos" style={{ fontFamily: "'Josefin Sans',sans-serif", fontSize: ".72rem", letterSpacing: ".04em", color: "var(--muted)", lineHeight: 1.5 }}>
                  I agree to the <span style={{ color: "var(--gold-light)", cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: "var(--gold-light)", cursor: "pointer" }}>Privacy Policy</span>
                </label>
              </div>
              <div style={{ display: "flex", gap: ".7rem" }}>
                <button onClick={() => setStep(1)} style={{
                  flex: "0 0 auto", fontFamily: "'Josefin Sans',sans-serif", fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase",
                  background: "none", border: "1px solid rgba(196,154,14,.25)", color: "var(--muted)", padding: ".9rem 1.2rem", cursor: "pointer"
                }}>← Back</button>
                <button className="auth-submit" style={{ flex: 1 }}>Create Account</button>
              </div>
            </div>
          )}

          <p className="auth-foot">
            Already have an account? <button onClick={() => onNavigate("login")}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

function LandingPage({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeFleet, setActiveFleet] = useState(0);
  useScrollReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {/* NAV */}
      <nav className={`nav${scrolled ? " stuck" : ""}`}>
        <div className="logo">
          <div className="logo-gem" />
          VELOX CHARTER
        </div>
        <ul className="nav-links">
          {["Services", "Fleet", "About", "Contact"].map((l) => (
            <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>
          ))}
        </ul>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => onNavigate("login")}>Sign In</button>
          <button className="btn-gold"  onClick={() => onNavigate("register")}>Register</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-stripe" />
        <div className="hero-content">
          <div className="hero-eyebrow">Premium Vehicle Charter Services</div>
          <h1 className="hero-h1">
            <em>Arrive</em> with
            <strong>Distinction.</strong>
          </h1>
          <p className="hero-sub">
            White-glove ground transportation for executives, events, and discerning travellers. Every journey, precisely orchestrated.
          </p>
          <div className="hero-btns">
            <button className="btn-primary-lg" onClick={() => onNavigate("register")}>Book a Journey</button>
            <button className="btn-link"><span />Explore Fleet</button>
          </div>
        </div>
        <div className="hero-badge">
          <div className="hero-badge-inner">
            <div className="hero-badge-num">15</div>
            <div className="hero-badge-lbl">Years of<br />Excellence</div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats">
        {STATS.map((s, i) => (
          <div className={`stat reveal d${i + 1}`} key={s.label}>
            <div className="stat-v">{s.value}</div>
            <div className="stat-l">{s.label}</div>
          </div>
        ))}
      </div>

      {/* SERVICES */}
      <section className="section" id="services" style={{ background: "var(--black)" }}>
        <div className="svc-head reveal">
          <div>
            <div className="sec-eye">What We Offer</div>
            <h2 className="sec-h2">Charter Solutions<br /><em>Built Around You</em></h2>
            <p className="svc-desc">From a single executive transfer to large-scale event logistics — tailored to exceed expectation at every mile.</p>
          </div>
        </div>
        <div className="svc-grid">
          {SERVICES.map((s, i) => (
            <div className={`svc-card reveal d${i + 1}`} key={s.title}>
              <span className="svc-icon">{s.icon}</span>
              <div className="svc-title">{s.title}</div>
              <p className="svc-text">{s.desc}</p>
              <div className="svc-more">Discover →</div>
            </div>
          ))}
        </div>
      </section>

      {/* FLEET */}
      <section className="section" id="fleet" style={{ background: "var(--black-2)" }}>
        <div className="fleet-wrap">
          <div>
            <div className="sec-eye reveal">Our Fleet</div>
            <h2 className="sec-h2 reveal d1">Vehicles of<br /><em>Exceptional Calibre</em></h2>
            <div className="fleet-tabs reveal d2">
              {FLEET.map((v, i) => (
                <div key={v.name} className={`fleet-tab${activeFleet === i ? " on" : ""}`} onClick={() => setActiveFleet(i)}>
                  <div>
                    <div className="ft-name">{v.name}</div>
                    <div className="ft-type">{v.type} · {v.seats}</div>
                  </div>
                  <div className="ft-tag">{v.tag}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fleet-vis-col">
            <div className="fleet-vis reveal d2">
              <div className="car">
                <div className="car-body" />
                <div className="car-roof" />
                <div className="car-wl" />
                <div className="car-wr" />
                <div className="car-glow" />
              </div>
              <div className="fleet-info">
                <div className="fi-name">{FLEET[activeFleet].name}</div>
                <div className="fi-detail">{FLEET[activeFleet].type}<b>·</b>{FLEET[activeFleet].seats}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING CTA */}
      <section className="section" id="contact" style={{ background: "var(--black)" }}>
        <div className="book-wrap reveal">
          <div>
            <div className="sec-eye">Ready to Travel</div>
            <h2 className="sec-h2">Your Next Journey<br /><em>Starts Here</em></h2>
            <p className="book-sub">Reserve your vehicle in under two minutes. Our dispatch team is available around the clock.</p>
          </div>
          <div className="book-form">
            <div><label className="f-lbl">Pickup Location</label><input className="f-inp" placeholder="Enter address or airport" /></div>
            <div><label className="f-lbl">Date & Time</label><input className="f-inp" type="datetime-local" /></div>
            <div>
              <label className="f-lbl">Vehicle</label>
              <select className="f-inp" style={{ cursor: "pointer" }}>
                <option value="">Select a vehicle</option>
                {FLEET.map((v) => <option key={v.name}>{v.name} — {v.type}</option>)}
              </select>
            </div>
            <button className="btn-book" onClick={() => onNavigate("register")}>Request a Quote</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="foot-grid">
          <div>
            <div className="logo"><div className="logo-gem" />VELOX CHARTER</div>
            <p className="foot-desc">Premium vehicle charter services trusted by corporations, event planners, and private clients nationwide.</p>
          </div>
          {[
            { t: "Services", ls: ["Corporate Charter", "Event Transport", "Airport Transfers", "Long-Distance Hire"] },
            { t: "Company",  ls: ["About Us", "Our Fleet", "Careers", "News"] },
            { t: "Contact",  ls: ["+44 20 0000 0000", "bookings@velox.co", "Available 24/7", "Live Chat"] },
          ].map((col) => (
            <div key={col.t}>
              <div className="foot-ht">{col.t}</div>
              <ul className="foot-ul">{col.ls.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="foot-bot">
          <div className="foot-copy">© 2026 <span>Velox Charter</span>. All rights reserved.</div>
          <div className="foot-copy">Privacy · Terms</div>
        </div>
      </footer>
    </>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");

  const navigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {page === "home"     && <LandingPage  onNavigate={navigate} />}
      {page === "login"    && <LoginPage    onNavigate={navigate} />}
      {page === "register" && <RegisterPage onNavigate={navigate} />}
    </>
  );
}