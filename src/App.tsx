import { useState } from 'react';
import { request } from '@stacks/connect';

const ORACLE_CONTRACT_ADDRESS = 'SP1GVG84HRYCBYEW59M0S4XGQF8TTVXRF8XNXGBMH';
const ORACLE_CONTRACT_NAME = 'oracle-readings';

const TAROT_CARDS = [
  { id: 0, num: 'O', name: 'THE FOOL', description: 'a figure stepping off a cliff edge into the unknown, a small bindle over their shoulder, a dog at their heels', meaning: 'New beginnings await. Your wallet stands at the edge of something extraordinary — leap with faith.' },
  { id: 1, num: 'I', name: 'THE MAGICIAN', description: 'a robed figure standing before a table with a wand, cup, sword and pentacle, one hand pointing to the sky, one to the earth', meaning: 'You hold all the tools. Your on-chain history reveals mastery — the blockchain bends to your will.' },
  { id: 2, num: 'II', name: 'THE HIGH PRIESTESS', description: 'a veiled woman seated between two pillars, a crescent moon at her feet, holding a scroll', meaning: 'Hidden knowledge surrounds you. What lies beneath your transactions tells a deeper story.' },
  { id: 3, num: 'III', name: 'THE EMPRESS', description: 'a crowned woman seated on a throne surrounded by wheat and pomegranates, a shield with a venus symbol beside her', meaning: 'Abundance flows from your wallet. Creation and growth are written in your chain.' },
  { id: 4, num: 'IV', name: 'THE EMPEROR', description: 'a bearded king on a stone throne, holding an ankh scepter, mountains behind him, a stern commanding presence', meaning: 'Structure and power. Your on-chain presence commands authority in this ecosystem.' },
  { id: 5, num: 'V', name: 'THE HIEROPHANT', description: 'a robed religious figure on a throne between two pillars, two acolytes kneeling before him, hand raised in blessing', meaning: 'Ancient wisdom speaks. You are a keeper of the protocol, a guardian of the chain.' },
  { id: 6, num: 'VI', name: 'THE LOVERS', description: 'a man and woman standing beneath a radiant angel, a mountain between them, the sun blazing above', meaning: 'A union of forces. Your wallet and the blockchain are deeply intertwined.' },
  { id: 7, num: 'VII', name: 'THE CHARIOT', description: 'an armored warrior in a chariot pulled by a black and white sphinx, holding a wand, stars on his canopy', meaning: 'Victory through determination. Your transactions speak of unstoppable momentum.' },
  { id: 8, num: 'VIII', name: 'STRENGTH', description: 'a woman gently closing the mouth of a lion, an infinity symbol above her head, flowers around her waist', meaning: 'Inner power reveals itself. The chain knows your resilience runs deep.' },
  { id: 9, num: 'IX', name: 'THE HERMIT', description: 'a cloaked elder standing alone on a mountain peak, holding a glowing lantern and a long staff', meaning: 'Solitude and inner light. Your wallet walks its own path, illuminating the way.' },
  { id: 10, num: 'X', name: 'WHEEL OF FORTUNE', description: 'a great wheel with mystical symbols turning in the sky, a sphinx at the top, a serpent and anubis on the sides', meaning: 'The cycle turns in your favor. Fortune and fate align with your on-chain destiny.' },
  { id: 11, num: 'XI', name: 'JUSTICE', description: 'a crowned figure seated between pillars holding a raised sword in one hand and balanced scales in the other', meaning: 'Balance and truth. The immutable ledger never lies — and it speaks well of you.' },
  { id: 12, num: 'XII', name: 'THE HANGED MAN', description: 'a serene figure hanging upside down by one foot from a T-shaped tree, arms behind their back, a halo of light around their head', meaning: 'A new perspective emerges. Pause, reflect, and let the chain reveal its hidden truths.' },
  { id: 13, num: 'XIII', name: 'DEATH', description: 'a skeleton knight in black armor on a white horse, a black flag with a white rose, figures falling before them', meaning: 'Transformation, not ending. A new chapter on the blockchain begins for you now.' },
  { id: 14, num: 'XIV', name: 'TEMPERANCE', description: 'a winged angel pouring liquid between two cups, one foot on land one in water, a sun rising on the horizon behind them', meaning: 'Perfect balance. Your wallet flows with the rhythm of the network in harmony.' },
  { id: 15, num: 'XV', name: 'THE DEVIL', description: 'a goat-headed horned figure on a pedestal, a man and woman chained below, an inverted pentagram above', meaning: 'Chains of your own making. Break free from what binds you — the oracle sees through it.' },
  { id: 16, num: 'XVI', name: 'THE TOWER', description: 'a tall stone tower struck by lightning, two figures falling from the top, a crown blasted off the summit', meaning: 'Revolution is here. Old structures fall and something magnificent rises from the ashes.' },
  { id: 17, num: 'XVII', name: 'THE STAR', description: 'a nude woman kneeling by a pool, pouring water from two jugs, eight stars shining above including one large central star', meaning: 'Hope and renewal shine bright. The stars align for your journey on the chain.' },
  { id: 18, num: 'XVIII', name: 'THE MOON', description: 'a full moon with a face between two towers, a crayfish emerging from a pool, a wolf and dog howling below', meaning: 'Hidden paths reveal themselves. Trust your intuition — the chain already knows.' },
  { id: 19, num: 'XIX', name: 'THE SUN', description: 'a radiant sun with a face, a child riding a white horse below, sunflowers in the background, pure joy and light', meaning: 'Radiant success and clarity. Your on-chain destiny shines with pure golden light.' },
  { id: 20, num: 'XX', name: 'JUDGEMENT', description: 'an angel blowing a trumpet from clouds above, figures rising from coffins below with arms outstretched toward the sky', meaning: 'A great awakening. Your wallet is called to rise — the blockchain has judged you worthy.' },
  { id: 21, num: 'XXI', name: 'THE WORLD', description: 'a dancing figure wrapped in a laurel wreath in the center of a large oval, four symbolic creatures in each corner', meaning: 'Completion and mastery. You have walked the full circle — the chain is yours.' },
];

type AppState = 'idle' | 'connected' | 'drawing' | 'revealed';

const C = {
  cream: '#f5f0e4',
  green: '#1a3d1a',
  gold: '#f0c060',
  orange: '#c8622a',
  copper: '#7a5c2e',
};

const font = {
  title: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 },
  italic: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' },
  body: { fontFamily: "'Cormorant Garamond', serif" },
};

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [wallet, setWallet] = useState<string | null>(null);
  const [card, setCard] = useState<typeof TAROT_CARDS[0] | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      const response = await request('getAddresses');
      const stxAccount = response.addresses.find((a: any) => a.symbol === 'STX');
      if (!stxAccount) throw new Error('No STX address found');
      setWallet(stxAccount.address);
      setState('connected');
    } catch (e: any) { setError(e.message); }
  };

  const drawCard = async () => {
    if (!wallet) return;
    setState('drawing');
    setError(null);
    setTxId(null);
    try {
      const hash = wallet.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const salt = Date.now();
      const drawn = TAROT_CARDS[(hash + salt) % TAROT_CARDS.length];
      setCard(drawn);

      const res = await fetch('https://gemini-proxy.wearedood.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: `Tarot card illustration for "${drawn.name}" (${drawn.num}). Single rectangular card centered on textured off-white parchment background. Minimalist hand-drawn vector style, clean thick black outlines, solid flat colors, no shading or gradients. Top of card features an ornate scrollwork header with a small circle containing the roman numeral ${drawn.num}. Central illustration depicts a symbolic minimalist scene representing ${drawn.name}: ${drawn.description}. A horizontal rule divides the illustration from the footer. Footer displays the card name in clean serif lettering: • ${drawn.name} •. Naive zine aesthetic, centered composition, cream background.`
        })
      });
      const data = await res.json() as any;
      if (data.imageUrl) setImageUrl(data.imageUrl);
      setState('revealed');
    } catch (e: any) {
      setError('The oracle could not be reached. Try again.');
      setState('connected');
    }
  };

  const reset = () => { setState('idle'); setWallet(null); setCard(null); setImageUrl(null); setError(null); setTxId(null); };

  const saveCard = () => {
    if (!imageUrl || !card) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${card.name.replace(/ /g, '-')}-oracle-card.png`;
    link.click();
  };

  const shareX = () => {
    if (!card) return;
    const text = `🔮 Drew ${card.name} from The Stacks Oracle!\n\n"${card.meaning}"\n\nOn-chain tarot on @Stacks — every reading recorded on the blockchain forever.\n\nBy @ddtrvlr 👇\nwearedood.github.io/stacks-oracle\n\n#StacksOracle #BuildOnStacks`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareFarcaster = () => {
    if (!card) return;
    const text = `🔮 I just drew ${card.name} from The Stacks Oracle!\n\n"${card.meaning}"\n\nBuilt this on-chain tarot app for the @stacks Builder Rewards challenge on @talentprotocol — every reading is recorded on the Stacks blockchain forever.\n\nBuilt by @ddtrvlr — cc @jesse.base.eth\n\nTry it yourself 👇\nwearedood.github.io/stacks-oracle\n\n#StacksOracle #BuildOnStacks`;
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, '_blank');
  };

  const cell = (bg: string, extra?: any) => ({ background: bg, border: `1px solid ${C.green}`, padding: 24, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', ...extra });

  return (
    <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } body { background: ${C.cream}; }`}</style>

      <nav style={{ background: C.cream, padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${C.green}` }}>
        <span style={{ ...font.body, fontSize: 13, letterSpacing: 3, color: C.green, opacity: 0.6 }}>BUILT ON STACKS</span>
        <span style={{ ...font.italic, fontSize: 26, color: C.green }}>The Stacks Oracle</span>
        <a href={`https://explorer.hiro.so/txid/${ORACLE_CONTRACT_ADDRESS}.${ORACLE_CONTRACT_NAME}?chain=mainnet`} target="_blank" rel="noreferrer" style={{ ...font.body, fontSize: 13, letterSpacing: 3, color: C.green, textDecoration: 'none', opacity: 0.6 }}>VIEW ON-CHAIN</a>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1fr', flex: 1, borderTop: `2px solid ${C.green}` }}>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...cell(C.gold), flex: 1, minHeight: 220 }}>
            <svg viewBox="0 0 100 100" width="90" height="90">
              <circle cx="50" cy="50" r="20" fill="none" stroke={C.green} strokeWidth="2"/>
              {[0,45,90,135,180,225,270,315].map(a => (
                <line key={a} x1={50+26*Math.cos(a*Math.PI/180)} y1={50+26*Math.sin(a*Math.PI/180)} x2={50+40*Math.cos(a*Math.PI/180)} y2={50+40*Math.sin(a*Math.PI/180)} stroke={C.green} strokeWidth="2" strokeLinecap="round"/>
              ))}
              {[22,67,112,157,202,247,292,337].map(a => (
                <line key={a} x1={50+26*Math.cos(a*Math.PI/180)} y1={50+26*Math.sin(a*Math.PI/180)} x2={50+34*Math.cos(a*Math.PI/180)} y2={50+34*Math.sin(a*Math.PI/180)} stroke={C.green} strokeWidth="1.5" strokeLinecap="round"/>
              ))}
            </svg>
            <div style={{ ...font.body, fontSize: 12, letterSpacing: 3, color: C.green, marginTop: 12, opacity: 0.6 }}>YOUR FATE AWAITS</div>
          </div>
          <div style={{ ...cell(C.orange), flex: 1, minHeight: 220 }}>
            <div style={{ ...font.title, fontSize: 20, color: C.cream, textAlign: 'center', lineHeight: 1.3, marginBottom: 8 }}>
              {wallet ? `${wallet.slice(0,6)}...${wallet.slice(-4)}` : 'CONNECT YOUR WALLET'}
            </div>
            <div style={{ width: 40, height: 1, background: C.cream, margin: '8px auto', opacity: 0.5 }}/>
            <div style={{ ...font.italic, fontSize: 16, color: C.cream, opacity: 0.8 }}>{wallet ? '● Connected' : 'Leather · Hiro'}</div>
          </div>
        </div>

        <div style={{ background: C.cream, borderLeft: `1px solid ${C.green}`, borderRight: `1px solid ${C.green}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px 0', position: 'relative', minHeight: 500 }}>
          <div style={{ ...font.body, fontSize: 11, letterSpacing: 4, color: C.green, opacity: 0.35, marginBottom: 12 }}>TAROT · STACKS · ORACLE</div>

          <div style={{ width: 200, height: 310, background: state === 'revealed' ? C.gold : C.green, border: `3px solid ${C.green}`, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 12px 10px', marginBottom: 16, transition: 'background 0.6s' }}>
            <div style={{ ...font.italic, fontSize: 18, color: state === 'revealed' ? C.green : C.gold, marginBottom: 6 }}>{card ? card.num : '?'}</div>
            <div style={{ flex: 1, width: '100%', border: `2px solid ${state === 'revealed' ? C.green : C.gold}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 10, background: state === 'revealed' ? C.cream : '#0a1f0a' }}>
              {state === 'drawing' && <div style={{ ...font.italic, fontSize: 18, color: C.gold, textAlign: 'center', padding: 16 }}>The oracle sees...</div>}
              {state === 'revealed' && imageUrl && <img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={card?.name}/>}
              {state === 'revealed' && !imageUrl && <div style={{ ...font.title, fontSize: 40, color: C.green }}>✦</div>}
              {(state === 'idle' || state === 'connected') && <div style={{ ...font.title, fontSize: 48, color: C.gold, opacity: 0.25 }}>✦</div>}
            </div>
            <div style={{ ...font.title, fontSize: 13, color: state === 'revealed' ? C.green : C.gold, letterSpacing: 4 }}>{card ? card.name : 'THE ORACLE'}</div>
          </div>

          {error && <div style={{ ...font.italic, fontSize: 15, color: C.orange, textAlign: 'center', marginBottom: 8 }}>{error}</div>}
          {txId && <a href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`} target="_blank" rel="noreferrer" style={{ ...font.body, fontSize: 12, letterSpacing: 2, color: C.green, opacity: 0.4, marginBottom: 8, textDecoration: 'none' }}>RECORDED ON-CHAIN ✦</a>}

          {state === 'revealed' && (
            <button onClick={saveCard} style={{ ...font.body, fontSize: 13, letterSpacing: 2, color: C.green, background: 'transparent', border: `1px solid ${C.green}`, borderRadius: 20, padding: '6px 18px', cursor: 'pointer', marginBottom: 60, opacity: 0.7 }}>
              SAVE CARD
            </button>
          )}

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: C.orange, padding: '14px 0', textAlign: 'center', borderTop: `2px solid ${C.green}` }}>
            <div style={{ ...font.title, fontSize: 16, letterSpacing: 4, color: C.cream }}>
              {state === 'revealed' ? `${card?.name} ✦` : 'CONSULT THE ORACLE'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...cell(C.cream), flex: 1, minHeight: 220 }}>
            <div style={{ ...font.title, fontSize: 22, color: C.gold, marginBottom: 10 }}>✦</div>
            <div style={{ ...font.body, fontSize: 12, letterSpacing: 3, color: C.green, opacity: 0.5, marginBottom: 10 }}>YOUR READING</div>
            <div style={{ ...font.italic, fontSize: 16, color: C.green, textAlign: 'center', lineHeight: 1.7 }}>
              {state === 'revealed' && card ? `"${card.meaning}"` : 'Connect your wallet to receive your reading from the oracle...'}
            </div>
          </div>
          <div style={{ ...cell(C.gold), flex: 1, minHeight: 220 }}>
            <div style={{ ...font.body, fontSize: 12, letterSpacing: 3, color: C.green, opacity: 0.6, marginBottom: 8 }}>STORED ON-CHAIN</div>
            <div style={{ ...font.title, fontSize: 18, color: C.green, textAlign: 'center', lineHeight: 1.5 }}>STACKS<br/>BLOCKCHAIN<br/>FOREVER</div>
            {state === 'revealed' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={shareX} style={{ background: C.green, color: C.cream, ...font.body, fontSize: 13, letterSpacing: 2, padding: '7px 16px', border: 'none', borderRadius: 20, cursor: 'pointer' }}>POST</button>
                <button onClick={shareFarcaster} style={{ background: C.green, color: C.cream, ...font.body, fontSize: 13, letterSpacing: 2, padding: '7px 16px', border: 'none', borderRadius: 20, cursor: 'pointer' }}>CAST</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', borderTop: `2px solid ${C.green}` }}>
        {state === 'idle' && <button onClick={connectWallet} style={{ flex: 1, background: C.green, color: C.cream, ...font.title, fontSize: 18, letterSpacing: 4, padding: 18, border: 'none', cursor: 'pointer' }}>CONNECT WALLET</button>}
        {state === 'connected' && <>
          <button onClick={drawCard} style={{ flex: 2, background: C.green, color: C.cream, ...font.title, fontSize: 18, letterSpacing: 4, padding: 18, border: 'none', cursor: 'pointer' }}>REVEAL MY FATE ✦</button>
          <button onClick={reset} style={{ flex: 1, background: C.cream, color: C.green, ...font.title, fontSize: 18, letterSpacing: 4, padding: 18, border: 'none', borderLeft: `2px solid ${C.green}`, cursor: 'pointer' }}>DISCONNECT</button>
        </>}
        {state === 'drawing' && <button disabled style={{ flex: 1, background: C.orange, color: C.cream, ...font.italic, fontSize: 18, letterSpacing: 2, padding: 18, border: 'none', cursor: 'wait' }}>The oracle speaks...</button>}
        {state === 'revealed' && <>
          <button onClick={drawCard} style={{ flex: 2, background: C.green, color: C.cream, ...font.title, fontSize: 18, letterSpacing: 4, padding: 18, border: 'none', cursor: 'pointer' }}>DRAW AGAIN ✦</button>
          <button onClick={reset} style={{ flex: 1, background: C.cream, color: C.green, ...font.title, fontSize: 18, letterSpacing: 4, padding: 18, border: 'none', borderLeft: `2px solid ${C.green}`, cursor: 'pointer' }}>START OVER</button>
        </>}
      </div>

      <div style={{ background: C.green, padding: '12px 28px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ ...font.body, fontSize: 13, letterSpacing: 3, color: C.gold, opacity: 0.6 }}>BUILT ON STACKS · 2026</span>
        <span style={{ ...font.italic, fontSize: 13, color: C.gold }}>On-chain forever ✦</span>
      </div>
    </div>
  );
}
