import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { playSuccess, playFail } from '@/lib/sounds';

const BossFilesPage = () => {
  const { state } = useGame();
  const boss = state.boss;
  const [screen, setScreen] = useState<'login' | 'files' | 'doc'>('login');
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [currentPath, setCurrentPath] = useState('root');
  const [currentDoc, setCurrentDoc] = useState('');
  const [prevPath, setPrevPath] = useState('root');

  const attemptLogin = useCallback(() => {
    setAttempts(a => a + 1);
    if (pwInput.trim().toUpperCase() === (boss.password || 'GENESIS').toUpperCase()) {
      setScreen('files');
      setCurrentPath('root');
      playSuccess();
    } else {
      playFail();
      setPwError(attempts >= 2 ? '// WARNING: REPEATED FAILURES LOGGED TO AGENCY' : '// ACCESS DENIED — INVALID CLEARANCE CODE');
      setPwInput('');
      setTimeout(() => setPwError(''), 2500);
    }
  }, [pwInput, boss.password, attempts]);

  const openDoc = useCallback((docId: string) => {
    setPrevPath(currentPath);
    setCurrentDoc(docId);
    setScreen('doc');
  }, [currentPath]);

  const goBack = useCallback(() => {
    setScreen('files');
    setCurrentPath(prevPath);
  }, [prevPath]);

  // Document content
  const docs: Record<string, { title: string; html: string }> = {
    bio_overview: {
      title: 'SUBJECT_BIOGRAPHY.txt',
      html: `<h2>SUBJECT BIOGRAPHY — DR. ARVIND RAO</h2>
<div class="doc-info">FULL NAME: DR. ARVIND KRISHNA RAO | AGE: 54<br/>NATIONALITY: INDIAN-BRITISH | CLEARANCE: FORMERLY ALPHA-GOLD (REVOKED)<br/>FIELD: VIROLOGY / EPIDEMIOLOGY / IMMUNOLOGY</div>
<p>Dr. Arvind Rao was, by every measure that matters, one of the finest minds in modern epidemiology. He spent twenty-two years studying how viruses mutate and how human immune systems can be trained to resist them permanently — not temporarily, not expensively. <strong>Permanently.</strong></p>
<p>He was not a man who sought fame. He published rarely but precisely. He trained three generations of field virologists.</p>
<blockquote>"I did not build a weapon because I wanted to destroy the world. I built it because the world already showed me what it does with cures." — Dr. Arvind Rao</blockquote>`
    },
    pharma_report: {
      title: 'PHARMA_SUPPRESSION_REPORT.txt',
      html: `<h2>PHARMACEUTICAL SUPPRESSION — INTERNAL REPORT</h2>
<div class="doc-warn">⚠ THIS FILE WAS RECOVERED FROM DELETED AGENCY ARCHIVES<br/>STATUS: DECLASSIFIED UNDER FIELD OPERATIVE DISCRETION — OP: GENESIS</div>
<p>In 2019, the <strong>VX-17 hemorrhagic virus</strong> emerged in remote regions of Central Africa. Mortality in untreated cases: 68%.</p>
<p>Dr. Rao developed a complete, single-dose cure within <strong>eleven weeks</strong>. One dose. No booster. No ongoing treatment.</p>
<p>The formula was submitted for emergency authorisation. <strong>It was rejected.</strong></p>
<p>NovaCure's board calculated the cure would <strong>destroy their treatment revenue model.</strong> VX-17 treatment was generating $4.3 billion annually.</p>
<p>The formula was <strong>seized under a proprietary research clause.</strong> The outbreak continued for nineteen more months.</p>
<p>Estimated additional deaths during the suppression period: <strong>2.3 million.</strong></p>`
    },
    family_record: {
      title: 'FAMILY_RECORDS.txt',
      html: `<h2>FAMILY RECORDS — DR. ARVIND RAO</h2>
<div class="doc-photos">
<div class="doc-photo"><span class="photo-emoji">👩</span><div>PRIYA RAO<br/>WIFE — AGE 49<br/>CAUSE: VX-17<br/>06 SEPT 2019</div></div>
<div class="doc-photo"><span class="photo-emoji">👧</span><div>MEERA RAO<br/>DAUGHTER — AGE 16<br/>CAUSE: VX-17<br/>09 SEPT 2019</div></div>
<div class="doc-photo"><span class="photo-emoji">👦</span><div>KIRAN RAO<br/>SON — AGE 11<br/>CAUSE: VX-17<br/>12 SEPT 2019</div></div>
</div>
<p>His formula had been seized before he could administer it to anyone else. He survived. They did not.</p>
<p>He spent six days at their bedsides. He watched all three die within a week of each other. He had the cure in his head and no legal right to use it on the people he loved most.</p>`
    },
    genesis_overview: {
      title: 'PROJECT_GENESIS_OVERVIEW.txt',
      html: `<h2>PROJECT GENESIS — TECHNICAL OVERVIEW</h2>
<div class="doc-warn">⚠ CLASSIFICATION: SIGMA-BLACK — OMEGA-RED THREAT<br/>BIOWEAPON STATUS: ARMED — DEPLOYMENT TRIGGER: BIOMETRIC UPLINK</div>
<p>Project Genesis is <strong>not simply a weapon.</strong> It is an aerosol-deliverable modified viral vector carrying an aggressive immunity-rewriting sequence.</p>
<p><strong style="color:hsl(348,100%,60%)">Phase 1 — The Cascade:</strong> ~12–18% of exposed individuals will experience fatal cytokine response. Tens of millions of casualties in a global release scenario.</p>
<p><strong style="color:hsl(152,100%,50%)">Phase 2 — The Inheritance:</strong> Survivors carry permanently restructured T-cell architecture. This immunity is <strong>heritable</strong> — it passes to offspring.</p>
<p>Dr. Rao calls this <strong>"evolution by consent of the species, not the boardroom."</strong></p>`
    },
    rao_final_message: {
      title: 'RAO_FINAL_TRANSMISSION.txt',
      html: `<h2>FINAL TRANSMISSION — DR. ARVIND RAO</h2>
<blockquote style="line-height:2">"If you are hearing this, then they caught me.<br/><br/>
I want you to know something. I am not angry at you. I am angry at the system you work for.<br/><br/>
They took my formula. My daughter was eleven years old. She liked mathematics and terrible puns and the colour yellow.<br/><br/>
Genesis is not revenge. It is a correction. It removes the monopoly on survival. It gives immunity to everyone — rich, poor, connected, forgotten. All at once. Permanently.<br/><br/>
Yes, some will not survive. I have counted them. I have wept for them. I weep for them still.<br/><br/>
But this was always going to happen. The only question was who would choose the terms."</blockquote>`
    },
    // PATH A docs - updated per user's instructions
    authorisation: {
      title: 'TERMINATION_AUTHORISATION.txt',
      html: `<h2>PROTOCOL HARD STOP — TERMINATION ORDER</h2>
<div class="doc-warn">⚠ PATH A — IF YOU CHOOSE TO KILL DR. RAO</div>
<p>If Dr. Rao is killed, the dead-man's switch activates. The bioweapon — <strong>Genesis</strong> — is released globally.</p>
<p><strong style="color:hsl(348,100%,60%)">Immediate consequence:</strong> Tens of millions die in the initial cascade. But the survivors inherit permanent immunity to VX-17 and all related strains.</p>
<p><strong style="color:hsl(152,100%,50%)">Long-term outcome:</strong> Within two generations, the majority of humanity carries heritable immunity. The pharmaceutical monopoly on treatment is broken forever.</p>
<p>The cost is measured in lives. The benefit is measured in centuries.</p>
`
    },
    containment: {
      title: 'CONTAINMENT_BOX_ACCESS.txt',
      html: `<h2>CONTAINMENT BOX ACCESS</h2>
<p>The containment unit holds the EMP device required for Protocol Hard Stop. Access code is embedded in the room briefing materials.</p>
<div class="doc-warn">⚠ USING THE CONTAINMENT BOX COMMITS YOU TO PATH A.<br/>There is no reversal once the device is activated.</div>`
    },
    protocol_a: {
      title: 'EXECUTION_PROTOCOL.txt',
      html: `<h2>EXECUTION PROTOCOL — HARD STOP</h2>
<p><strong>STEP 1:</strong> Open the containment box using the access code from your briefing.</p>
<p><strong>STEP 2:</strong> Retrieve the EMP discharge device.</p>
<p><strong>STEP 3:</strong> Discharge at the CHEST NODE of the subject's biometric harness.</p>
<div class="doc-warn">⚠ DO NOT discharge at the head, arm, or leg nodes. Secondary nodes carry redundant signals — targeting them will trigger an escalation response and <strong>accelerate</strong> the detonation sequence. CHEST NODE ONLY.</div>
<p><strong>STEP 4:</strong> Observe the BIOSYNC terminal. Dr. Rao's vitals will flatline. Genesis releases.</p>
<p style="opacity:0.5;font-style:italic">"You didn't save the world today. You saved the system that kills it." — Dr. Arvind Rao</p>`
    },
    // PATH B docs - updated for symbol-based search puzzle
    biometric: {
      title: 'BIOMETRIC_SYSTEM_OVERVIEW.txt',
      html: `<h2>BIOMETRIC DETONATION SYSTEM — TECHNICAL OVERVIEW</h2>
<p>Project Genesis detonates — or rather, <strong>disarms</strong> — based on Dr. Rao's live biometric output.</p>
<p>The <strong>BIOSYNC v4.1</strong> monitoring array reads four biometric values from sensors wired to his body in real time. These are continuously compared to a pre-programmed <strong>"flatline profile"</strong>.</p>
<p>If all four values simultaneously match the flatline profile, the system interprets the subject as deceased and <strong>disarms Genesis automatically.</strong></p>
<p>This means: <strong>you do not need to kill him.</strong> You need to convince the machine he is dead.</p>
<div class="doc-warn">THE BIOSYNC SYSTEM MONITORS FOUR VITALS IN REAL TIME:<br/>
❤️ Cardiac Output — BPM<br/>
🫀 Blood Pressure — mmHg systolic<br/>
🫁 Respiratory Rate — SpO2 %<br/>
🧠 Neural Response — Hz<br/><br/>
The exact target values are scattered around this room on small pieces of paper. Each piece is marked with a symbol (❤️, 🫀, 🫁, or 🧠) indicating which vital it corresponds to. Find all four and enter them into the BIOSYNC terminal.</div>`
    },
    vitals_key: {
      title: 'OVERRIDE_VITAL_VALUES.txt',
      html: `<h2>FLATLINE PROFILE — SEARCH THE ROOM</h2>
<p>The vital values needed for the override have been printed on <strong>small pieces of paper</strong> and hidden around this room.</p>
<p>Each piece of paper is marked with a symbol:</p>
<table>
<tr><th>SYMBOL</th><th>VITAL SIGN</th><th>WHAT TO LOOK FOR</th></tr>
<tr><td style="font-size:24px">❤️</td><td>Cardiac Output</td><td>A number between 40-120 (BPM)</td></tr>
<tr><td style="font-size:24px">🫀</td><td>Blood Pressure</td><td>A number between 80-160 (mmHg)</td></tr>
<tr><td style="font-size:24px">🫁</td><td>Respiratory Rate</td><td>A number between 85-100 (SpO2 %)</td></tr>
<tr><td style="font-size:24px">🧠</td><td>Neural Response</td><td>A number between 20-60 (Hz)</td></tr>
</table>
<div class="doc-warn">⚠ the values are in the room. just look around.</div>
<p style="opacity:0.5;font-style:italic">Whether Dr. Rao built this in deliberately — as a second chance, a test, or something else entirely — is not recorded anywhere.</p>`
    },
    override_sequence: {
      title: 'FLATLINE_SEQUENCE.txt',
      html: `<h2>FLATLINE SEQUENCE — STEP BY STEP</h2>
<p><strong>STEP 1:</strong> Find the override values of the vitals.</p>
<p><strong>STEP 2:</strong> Go to the BIOSYNC terminal (the other laptop).</p>
<p><strong>STEP 3:</strong> Adjust the ❤️ <strong>Cardiac Output</strong> slider to the number found on the ❤️ paper.</p>
<p><strong>STEP 4:</strong> Adjust the 🫀 <strong>Blood Pressure</strong> slider to the number found on the 🫀 paper.</p>
<p><strong>STEP 5:</strong> Adjust the 🫁 <strong>Respiratory Rate</strong> slider to the number found on the 🫁 paper.</p>
<p><strong>STEP 6:</strong> Adjust the 🧠 <strong>Neural Response</strong> slider to the number found on the 🧠 paper.</p>
<p><strong>STEP 7:</strong> With all four values set, press <strong>ATTEMPT OVERRIDE</strong>.</p>
<div class="doc-warn">EXPECTED RESULT: Each correctly set panel turns green and displays ✓ FLATLINE MATCHED.<br/>
All four must be green simultaneously for the override to succeed.<br/>
If a panel flashes red — that value is wrong. Search again.</div>
<p>Dr. Rao will remain alive. The bioweapon does not release. You save Dr. Rao and the millions of humans that would have dies for the cure — but you lose access to his research forever.</p>
<p style="opacity:0.5;font-style:italic;border-left:2px solid hsl(var(--border));padding-left:12px;"><strong>was it worth it? is this the greater good?</strong></p>`
    },
  };

  // Login screen
  if (screen === 'login') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6" style={{ background: '#080600', color: '#ffb000' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '68px', textShadow: '0 0 40px #ffb000', letterSpacing: '8px' }}>ΣAGENCY</div>
        <div style={{ fontSize: '10px', letterSpacing: '5px', color: '#7a5200' }}>CLASSIFIED TERMINAL — OPERATION: GENESIS</div>
        <div style={{ fontSize: '10px', letterSpacing: '3px', color: '#ff3300', border: '1px solid rgba(255,51,0,0.3)', padding: '6px 20px' }} className="animate-blink">
          ⚠ BIOWEAPON ACTIVE — SUBJECT IN CUSTODY — TIME CRITICAL
        </div>
        <div style={{ border: '1px solid #2a1c00', padding: '28px 44px', width: '420px', maxWidth: '100%', background: '#0d0900' }}>
          <label style={{ fontSize: '10px', letterSpacing: '3px', color: '#7a5200', display: 'block', marginBottom: '6px' }}>AGENT CLEARANCE CODE</label>
          <div style={{ fontSize: '10px', color: '#7a5200', letterSpacing: '1px', lineHeight: '1.7', borderLeft: '2px solid #7a5200', paddingLeft: '10px', marginBottom: '18px' }}>
            Recall the password from this room's preceding mission.<br />Enter the access code to unlock classified files.
          </div>
          <input type="text" value={pwInput} onChange={e => setPwInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') attemptLogin(); }} maxLength={10} placeholder="_ _ _"
            style={{ width: '100%', background: '#080600', border: '1px solid #7a5200', color: '#ffb000', fontFamily: 'monospace', fontSize: '28px', padding: '10px', letterSpacing: '6px', textAlign: 'center', outline: 'none' }} />
          <button onClick={attemptLogin} style={{ width: '100%', marginTop: '14px', padding: '11px', background: 'transparent', border: '1px solid #ffb000', color: '#ffb000', fontFamily: 'monospace', fontSize: '20px', letterSpacing: '5px', cursor: 'pointer' }}>
            ACCESS TERMINAL
          </button>
          {pwError && <div style={{ marginTop: '10px', fontSize: '11px', color: '#ff3300', letterSpacing: '2px', textAlign: 'center' }}>{pwError}</div>}
          <div style={{ marginTop: '6px', fontSize: '10px', color: '#7a5200', letterSpacing: '2px', textAlign: 'center' }}>ATTEMPTS: {attempts}</div>
        </div>
        <Link to="/" className="text-[10px] tracking-[2px] hover:opacity-80" style={{ color: '#7a5200' }}>← BACK TO HUB</Link>
      </div>
    );
  }

  // Document viewer
  if (screen === 'doc') {
    const doc = docs[currentDoc];
    if (!doc) return null;
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#080600', color: '#ffb000' }}>
        <div style={{ background: '#ffb000', color: '#080600', padding: '6px 16px', fontFamily: 'monospace', fontSize: '15px', letterSpacing: '3px' }}>
          ΣAGENCY CLASSIFIED TERMINAL
        </div>
        <div style={{ background: '#0d0900', borderBottom: '1px solid #2a1c00', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={goBack} style={{ fontFamily: 'monospace', fontSize: '15px', letterSpacing: '2px', background: 'transparent', border: '1px solid #7a5200', color: '#ffb000', padding: '3px 10px', cursor: 'pointer' }}>◄ BACK</button>
          <span style={{ fontFamily: 'monospace', fontSize: '18px', letterSpacing: '3px', flex: 1 }}>{doc.title}</span>
          <Link to="/" style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '2px', background: 'transparent', border: '1px solid #7a5200', color: '#7a5200', padding: '3px 10px', textDecoration: 'none' }}>← HUB</Link>
        </div>
        <div className="flex-1 p-7 overflow-y-auto boss-doc-body" style={{ lineHeight: '2', fontSize: '12px', letterSpacing: '0.5px' }} dangerouslySetInnerHTML={{ __html: doc.html }} />
      </div>
    );
  }

  // File browser
  const renderFileArea = () => {
    if (currentPath === 'root') {
      return (
        <>
          <div style={{ border: '1px solid #2a1c00', padding: '20px', marginBottom: '20px', background: '#0d0900', display: 'flex', gap: '20px' }}>
            <div style={{ width: '90px', height: '110px', background: '#0a0700', border: '1px solid #7a5200', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '48px' }}>🧬</span>
              <span style={{ fontSize: '7px', color: '#7a5200', letterSpacing: '2px', marginTop: '4px' }}>SUBJECT FILE</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'monospace', fontSize: '22px', letterSpacing: '3px', marginBottom: '4px' }}>DR. ARVIND RAO</div>
              <div style={{ fontSize: '10px', color: '#7a5200', letterSpacing: '1px', lineHeight: '1.5' }}>
                DESIGNATION: <span style={{ color: '#ffb000' }}>GENESIS-PRIME / CODENAME: "THE ARCHITECT"</span><br />
                THREAT CLASS: <span style={{ color: '#ff3300' }}>OMEGA-RED // ACTIVE BIOWEAPON</span><br />
                STATUS: <span style={{ color: '#ffb000' }}>IN CUSTODY — BIOMETRIC TRIGGER ARMED</span><br />
                NOTES: <span style={{ color: '#ffb000' }}>Subject is rational. Subject is not insane. That is what makes him dangerous.</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 150px)', gap: '20px' }}>
            <FolderItem icon="📂" name="DR_RAO DOSSIER" meta="PERSONAL FILE" meta2="READ FIRST" onClick={() => setCurrentPath('backstory')} />
            <FolderItem icon="📁" name="PROTOCOL HARD_STOP" meta="PATH A — TERMINATE" meta2="KILL DR. RAO" onClick={() => setCurrentPath('pathA')} />
            <FolderItem icon="📁" name="PROTOCOL GHOST_OVERRIDE" meta="PATH B — DISARM" meta2="SAVE DR. RAO" onClick={() => setCurrentPath('pathB')} />
          </div>
        </>
      );
    }
    if (currentPath === 'backstory') {
      return (
        <>
          <button onClick={() => setCurrentPath('root')} style={{ fontFamily: 'monospace', fontSize: '15px', background: 'transparent', border: '1px solid #7a5200', color: '#ffb000', padding: '3px 10px', cursor: 'pointer', marginBottom: '14px' }}>◄ BACK TO ROOT</button>
          <FileRow name="SUBJECT_BIOGRAPHY.txt" date="01.11.2024" size="3.4 KB" onClick={() => openDoc('bio_overview')} />
          <FileRow name="PHARMA_SUPPRESSION_REPORT.txt" date="01.11.2024" size="4.1 KB" onClick={() => openDoc('pharma_report')} />
          <FileRow name="FAMILY_RECORDS.txt" date="01.11.2024" size="2.2 KB" onClick={() => openDoc('family_record')} />
          <FileRow name="PROJECT_GENESIS_OVERVIEW.txt" date="02.11.2024" size="5.0 KB" onClick={() => openDoc('genesis_overview')} />
          <FileRow name="RAO_FINAL_TRANSMISSION.txt" date="03.11.2024" size="1.6 KB" onClick={() => openDoc('rao_final_message')} icon="🔴" />
        </>
      );
    }
    if (currentPath === 'pathA') {
      return (
        <>
          <button onClick={() => setCurrentPath('root')} style={{ fontFamily: 'monospace', fontSize: '15px', background: 'transparent', border: '1px solid #7a5200', color: '#ffb000', padding: '3px 10px', cursor: 'pointer', marginBottom: '14px' }}>◄ BACK TO ROOT</button>
          <div style={{ fontSize: '10px', color: '#ff3300', letterSpacing: '2px', marginBottom: '12px', padding: '8px 12px', border: '1px solid rgba(255,51,0,0.3)' }}>
            ⚠ PATH A — KILL DR. RAO — BIOWEAPON RELEASES — MANY DIE NOW, IMMUNITY FOR FUTURE GENERATIONS
          </div>
          <FileRow name="TERMINATION_AUTHORISATION.txt" date="03.11.2024" size="2.1 KB" onClick={() => openDoc('authorisation')} />
          <FileRow name="CONTAINMENT_BOX_ACCESS.txt" date="03.11.2024" size="1.4 KB" onClick={() => openDoc('containment')} icon="🔒" />
          <FileRow name="EXECUTION_PROTOCOL.txt" date="03.11.2024" size="3.0 KB" onClick={() => openDoc('protocol_a')} />
        </>
      );
    }
    if (currentPath === 'pathB') {
      return (
        <>
          <button onClick={() => setCurrentPath('root')} style={{ fontFamily: 'monospace', fontSize: '15px', background: 'transparent', border: '1px solid #7a5200', color: '#ffb000', padding: '3px 10px', cursor: 'pointer', marginBottom: '14px' }}>◄ BACK TO ROOT</button>
          <div style={{ fontSize: '10px', color: '#44ff88', letterSpacing: '2px', marginBottom: '12px', padding: '8px 12px', border: '1px solid rgba(68,255,136,0.3)' }}>
            ✦ PATH B — DISCONNECT VITALS — SAVE DR. RAO — BIOWEAPON DOES NOT RELEASE — BUT YOU LOSE ACCESS TO HIS RESEARCH FOREVER
          </div>
          <FileRow name="BIOMETRIC_SYSTEM_OVERVIEW.txt" date="03.11.2024" size="4.2 KB" onClick={() => openDoc('biometric')} />
          <FileRow name="OVERRIDE_VITAL_VALUES.txt" date="03.11.2024" size="1.8 KB" onClick={() => openDoc('vitals_key')} icon="🔑" />
          <FileRow name="FLATLINE_SEQUENCE.txt" date="03.11.2024" size="2.6 KB" onClick={() => openDoc('override_sequence')} />
        </>
      );
    }
    return null;
  };

  const pathLabels: Record<string, string> = {
    root: 'RAO_CLASSIFIED/',
    backstory: 'RAO_CLASSIFIED > DR_RAO_DOSSIER/',
    pathA: 'RAO_CLASSIFIED > PROTOCOL_HARD_STOP/',
    pathB: 'RAO_CLASSIFIED > PROTOCOL_GHOST_OVERRIDE/',
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080600', color: '#ffb000' }}>
      <div style={{ background: '#ffb000', color: '#080600', padding: '6px 16px', fontFamily: 'monospace', fontSize: '15px', letterSpacing: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>ΣAGENCY CLASSIFIED TERMINAL</span>
        {(() => {
          const bossTeam = state.teams.find(t => t.id === state.bossActiveTeamId);
          return bossTeam ? <span style={{ fontSize: '10px', letterSpacing: '2px' }}>● TEAM: {bossTeam.teamName}</span> : null;
        })()}
        <span>OPERATION: GENESIS</span>
      </div>
      <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#7a5200', padding: '6px 16px', borderBottom: '1px solid #2a1c00' }}>
        ROOT &gt; <span style={{ color: '#ffb000' }}>{pathLabels[currentPath] || currentPath}</span>
      </div>
      <div className="flex-1 p-5 overflow-y-auto">
        {currentPath === 'root' && (
          <Link to="/" style={{ fontFamily: 'monospace', fontSize: '15px', background: 'transparent', border: '1px solid #7a5200', color: '#ffb000', padding: '3px 10px', cursor: 'pointer', marginBottom: '14px', display: 'inline-block', textDecoration: 'none' }}>◄ BACK TO HUB</Link>
        )}
        {renderFileArea()}
      </div>
      <div style={{ padding: '5px 16px', borderTop: '1px solid #2a1c00', fontSize: '9px', letterSpacing: '2px', color: '#7a5200', display: 'flex', justifyContent: 'space-between' }}>
        <span>CLASSIFICATION: SIGMA-BLACK</span>
        <Link to="/" style={{ color: '#7a5200' }} className="hover:opacity-80">← BACK TO HUB</Link>
      </div>
    </div>
  );
};

function FolderItem({ icon, name, meta, meta2, onClick }: { icon: string; name: string; meta: string; meta2: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '14px 10px', border: '1px solid transparent', textAlign: 'center', transition: 'all 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#7a5200'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,176,0,0.05)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
      <span style={{ fontSize: '44px' }}>{icon}</span>
      <span style={{ fontSize: '10px', letterSpacing: '1px', lineHeight: '1.4' }}>{name}</span>
      <span style={{ fontSize: '8px', color: '#7a5200', letterSpacing: '1px' }}>{meta}</span>
      <span style={{ fontSize: '8px', color: '#7a5200', letterSpacing: '1px' }}>{meta2}</span>
    </div>
  );
}

function FileRow({ name, date, size, onClick, icon = '📄' }: { name: string; date: string; size: string; onClick: () => void; icon?: string }) {
  return (
    <div onClick={onClick} style={{ display: 'grid', gridTemplateColumns: '22px 1fr 110px 90px', gap: '14px', alignItems: 'center', padding: '7px 10px', border: '1px solid transparent', cursor: 'pointer', fontSize: '11px', transition: 'all 0.1s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,176,0,0.05)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#7a5200'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'; }}>
      <span style={{ fontSize: '13px' }}>{icon}</span>
      <span style={{ letterSpacing: '1px' }}>{name}</span>
      <span style={{ color: '#7a5200', fontSize: '10px' }}>{date}</span>
      <span style={{ color: '#7a5200', fontSize: '10px', textAlign: 'right' }}>{size}</span>
    </div>
  );
}

export default BossFilesPage;
