const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Poppins:wght@400;500;600;700;800;900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { display: none; }
    * { scrollbar-width: none; }

    /* ── Slideshow ── */
    .kb { position: absolute; inset: -12%; background-size: cover; background-position: center; will-change: transform; }
    .kb.active { animation: kbzoom 9s ease-out forwards; }
    @keyframes kbzoom { from { transform: scale(1.14) translate(2%,1.5%); } to { transform: scale(1.01) translate(0,0); } }
    .sl { position: absolute; inset: 0; opacity: 0; transition: opacity 2.2s cubic-bezier(.4,0,.2,1); }
    .sl.on { opacity: 1; }

    /* ── Hero animations ── */
    .fu { opacity: 0; animation: ru .9s cubic-bezier(.22,1,.36,1) forwards; }
    .d0 { animation-delay: .05s; } .d1 { animation-delay: .18s; }
    .d2 { animation-delay: .32s; } .d3 { animation-delay: .46s; }
    .d4 { animation-delay: .60s; }
    @keyframes ru { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }

    /* ── Live pulse dot ── */
    .pdot { animation: pg 2s ease-in-out infinite; }
    @keyframes pg { 0%,100% { box-shadow: 0 0 0 0 rgba(52,224,161,.7); } 50% { box-shadow: 0 0 0 9px rgba(52,224,161,0); } }

    /* ── Slideshow dots ── */
    .sdot { height: 8px; border-radius: 4px; background: rgba(255,255,255,.3); border: none; cursor: pointer; padding: 0; transition: all .35s; width: 8px; flex-shrink: 0; }
    .sdot.on { width: 28px; background: #34E0A1; box-shadow: 0 0 14px rgba(52,224,161,.75); }

    /* ── Navbar buttons ── */
    .np { padding: 7px 15px; border-radius: 100px; font: 500 .83rem/1 'Poppins',sans-serif; color: rgba(255,255,255,.82); background: transparent; border: none; cursor: pointer; transition: background .18s, color .18s; white-space: nowrap; }
    .np:hover { background: rgba(255,255,255,.16); color: #fff; }
    .np.on { background: #fff !important; color: #0f2d1a !important; font-weight: 700; }

    /* ── Search bar ── */
    .sbar { transition: box-shadow .28s; }
    .sbar:focus-within { box-shadow: 0 28px 70px rgba(0,0,0,.38), 0 0 0 3.5px rgba(0,170,108,.55) !important; }
    .si { border: none; outline: none; background: transparent; font: 500 .93rem/1 'Poppins',sans-serif; color: #111; flex: 1; min-width: 0; }
    .si::placeholder { color: #aaa; font-weight: 400; }

    /* ── Nav auth buttons ── */
    .bg { padding: 9px 22px; border-radius: 100px; background: rgba(255,255,255,.14); border: 1.5px solid rgba(255,255,255,.38); color: #fff; font: 600 .84rem/1 'Poppins',sans-serif; cursor: pointer; backdrop-filter: blur(10px); transition: all .2s; }
    .bg:hover { background: rgba(255,255,255,.26); border-color: rgba(255,255,255,.7); }
    .bc { padding: 10px 24px; border-radius: 100px; background: #00AA6C; border: none; color: #fff; font: 700 .84rem/1 'Poppins',sans-serif; cursor: pointer; transition: all .2s; box-shadow: 0 4px 20px rgba(0,170,108,.5); }
    .bc:hover { background: #008A56; transform: translateY(-1px); }

    /* ── Search submit button ── */
    .sb { background: #00AA6C; color: #fff; border: none; border-radius: 12px; padding: 12px 26px; font: 700 .88rem/1 'Poppins',sans-serif; cursor: pointer; display: flex; align-items: center; gap: 7px; white-space: nowrap; flex-shrink: 0; box-shadow: 0 4px 16px rgba(0,170,108,.42); transition: all .2s; }
    .sb:hover { background: #008A56; transform: translateY(-1px); }

    /* ── AI match shimmer bar ── */
    @keyframes shimmer { from { background-position: 200% center; } to { background-position: -200% center; } }
    .mbar { background: linear-gradient(90deg,#00AA6C,#34E0A1,#00AA6C); background-size: 200% auto; animation: shimmer 3s linear infinite; }

    /* ── Testimonial card hover ── */
    .tcard { transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s; }
    .tcard:hover { transform: translateY(-5px) !important; box-shadow: 0 20px 50px rgba(0,0,0,.09) !important; }

    /* ── Testimonial scroll strip ── */
    @keyframes scrollx { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .tscroll { display: flex; gap: 20px; animation: scrollx 42s linear infinite; width: max-content; padding-bottom: 8px; }
    .tscroll:hover { animation-play-state: paused; }
  `}</style>
);

export default GlobalStyles;
