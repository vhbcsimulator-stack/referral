import React, { useEffect, useState, useRef } from 'react';
import rtcLogo from '../assets/rtc.png';
import vhbcLogo from '../assets/vhbc.png';
import { authSupabase } from '../supabaseClient';

export default function GiftCheque({ onNavigate, userId }) {
  const [serialNumber, setSerialNumber] = useState('00000');
  const [valueAmount, setValueAmount] = useState('8,000');
  const [validUntil, setValidUntil] = useState('July 2028');
  const canvasRef = useRef(null);

  // Continuous Canvas Confetti Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Metallic gold palette to match the premium theme
    const colors = ['#F5D061', '#E6B02E', '#C9962E', '#B38424', '#8C6614', '#FFE180'];
    const particleCount = 75;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 5 + 3,
        d: Math.random() * particleCount,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.06 + 0.02,
        tiltAngle: 0,
        speed: Math.random() * 1.5 + 1.2
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.speed;
        p.x += Math.sin(p.tiltAngle) * 0.4;
        p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;

        // Reset particle if it goes past the bottom
        if (p.y > canvas.height) {
          particles[index] = {
            ...p,
            x: Math.random() * canvas.width,
            y: -20,
            tilt: Math.random() * 10 - 5,
            tiltAngle: 0
          };
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Load Poppins font dynamically
  useEffect(() => {
    if (!document.getElementById('gc-poppins-font')) {
      const link = document.createElement('link');
      link.id = 'gc-poppins-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800;900&display=swap';
      document.head.appendChild(link);
    }

    const params = new URLSearchParams(window.location.search);
    const sn = params.get('sn');
    const val = params.get('val');
    const valid = params.get('valid');
    if (sn) setSerialNumber(sn);
    if (val) setValueAmount(val.replace('.00', ''));
    if (valid) setValidUntil(valid);
  }, []);

  // Fetch control number
  useEffect(() => {
    const fetchControlNumber = async () => {
      if (!userId) return;
      try {
        const { data: userProfile, error: profileErr } = await authSupabase
          .from('app_users')
          .select('control_number, created_at')
          .eq('id', userId)
          .maybeSingle();

        if (profileErr) throw profileErr;
        if (!userProfile) return;

        const userControlNum = Number(userProfile.control_number) || 0;

        if (userProfile.created_at) {
          const regDate = new Date(userProfile.created_at);
          if (!isNaN(regDate.getTime())) {
            const validityDate = new Date(regDate);
            validityDate.setFullYear(validityDate.getFullYear() + 2);
            const formattedValidity = validityDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            });
            setValidUntil(formattedValidity);
          }
        }

        const formattedCode = String(userControlNum).padStart(5, '0');
        setSerialNumber(formattedCode);
      } catch (err) {
        console.error('Error fetching control number:', err);
      }
    };
    fetchControlNumber();
  }, [userId]);

  const handlePrint = () => window.print();

  // Navigation handler
  const handleBack = (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('dashboard');
    }
  };



  // Burst specks around trophy center
  const burstSpecks = [
    { top: '10%', left: '15%', w: 4, h: 4, rot: 15 },
    { top: '15%', left: '30%', w: 6, h: 6, rot: -45 },
    { top: '8%', left: '50%', w: 3, h: 10, rot: 10 },
    { top: '12%', left: '70%', w: 5, h: 5, rot: 25 },
    { top: '20%', left: '85%', w: 4, h: 4, rot: -15 },
    { top: '35%', left: '92%', w: 5, h: 5, rot: 40 },
    { top: '55%', left: '95%', w: 3, h: 8, rot: 60 },
    { top: '75%', left: '88%', w: 6, h: 6, rot: -30 },
    { top: '85%', left: '75%', w: 4, h: 4, rot: -10 },
    { top: '92%', left: '50%', w: 3, h: 10, rot: 5 },
    { top: '88%', left: '30%', w: 5, h: 5, rot: 45 },
    { top: '80%', left: '15%', w: 4, h: 4, rot: -50 },
    { top: '60%', left: '8%', w: 3, h: 9, rot: 75 },
    { top: '40%', left: '5%', w: 6, h: 6, rot: -20 },
    { top: '25%', left: '8%', w: 5, h: 5, rot: 12 },
    { top: '50%', left: '92%', w: 5, h: 5, rot: -15 }
  ];



  return (
    <div className="gc-page-container">
      {/* Confetti Animation Canvas */}
      <canvas className="confetti-canvas" ref={canvasRef} />

      {/* Utility definitions for SVGs */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="gold-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D061" />
            <stop offset="50%" stopColor="#C9962E" />
            <stop offset="100%" stopColor="#8C6614" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Action Controls (Hidden on Print) */}
      <div className="utility-bar">
        {onNavigate && (
          <button className="utility-btn" onClick={handleBack}>
            <span className="material-symbols-outlined">arrow_back</span> Dashboard
          </button>
        )}
        <button className="utility-btn utility-btn-primary" onClick={handlePrint}>
          <span className="material-symbols-outlined">print</span> Print Cheque
        </button>
      </div>



      {/* Cheque Core Content Layout */}
      <main className="gc-cheque-card">
        {/* Header row */}
        <header className="gc-header-row">
          <div className="gc-header-left">
            <img src={vhbcLogo} alt="VHBC Logo" className="gc-header-logo-img" />
          </div>

          <div className="gc-header-center">
            <div className="gc-trophy-container">
              {/* Confetti Burst Specks around Trophy */}
              <div className="gc-trophy-burst">
                {burstSpecks.map((s, idx) => (
                  <div
                    key={idx}
                    className="gc-burst-speck"
                    style={{
                      top: s.top,
                      left: s.left,
                      width: s.w,
                      height: s.w,
                      transform: `rotate(${s.rot}deg)`,
                    }}
                  />
                ))}
              </div>

              {/* Vector Trophy Cup Illustration */}
              <svg className="gc-trophy-svg-graphic" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="t-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF275" />
                    <stop offset="35%" stopColor="#FFD93B" />
                    <stop offset="75%" stopColor="#E8A500" />
                    <stop offset="100%" stopColor="#9E6B00" />
                  </linearGradient>
                  <linearGradient id="t-gold-dark" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7F5300" />
                    <stop offset="50%" stopColor="#E8A500" />
                    <stop offset="100%" stopColor="#FFF275" />
                  </linearGradient>
                  <linearGradient id="t-star" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="40%" stopColor="#FFD93B" />
                    <stop offset="100%" stopColor="#D87A00" />
                  </linearGradient>
                  <linearGradient id="t-shine" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id="t-depth" cx="40%" cy="30%">
                    <stop offset="0%" stopColor="#FFE066" />
                    <stop offset="100%" stopColor="#CC8F00" />
                  </radialGradient>
                  <filter id="t-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.25" />
                  </filter>
                </defs>

                <g filter="url(#t-shadow)">
                  {/* Handles */}
                  <path d="M 50,60 C 20,60 20,95 50,95" fill="none" stroke="url(#t-gold-dark)" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 150,60 C 180,60 180,95 150,95" fill="none" stroke="url(#t-gold-dark)" strokeWidth="10" strokeLinecap="round" />

                  {/* Base */}
                  <path d="M 70,140 L 130,140 L 125,165 L 75,165 Z" fill="url(#t-gold-dark)" />
                  <rect x="55" y="165" width="90" height="15" rx="5" fill="url(#t-gold)" />

                  {/* Stem */}
                  <path d="M 80,120 L 120,120 L 115,145 L 85,145 Z" fill="url(#t-gold-dark)" />

                  {/* Cup Body */}
                  <path d="M 50,50 L 150,50 C 150,95 130,125 100,125 C 70,125 50,95 50,50 Z" fill="url(#t-gold)" />
                  <path d="M 50,50 L 150,50 C 150,95 130,125 100,125 C 70,125 50,95 50,50 Z" fill="url(#t-depth)" opacity="0.4" />

                  {/* Shiny Highlights */}
                  <path d="M 53,55 C 60,85 75,115 88,118 C 76,105 60,78 57,55 Z" fill="url(#t-shine)" opacity="0.7" />

                  {/* Rim */}
                  <ellipse cx="100" cy="50" rx="50" ry="8" fill="url(#t-gold-dark)" />

                  {/* Star (Tilted) */}
                  <polygon
                    points="100,60 104,74 118,74 107,82 111,96 100,88 89,96 93,82 82,74 96,74"
                    fill="url(#t-star)"
                    stroke="#B26B00"
                    strokeWidth="0.8"
                    transform="rotate(-8 100 78)"
                  />
                </g>
              </svg>
            </div>
          </div>

          <div className="gc-header-right">
            <img src={rtcLogo} alt="RTC Logo" className="gc-header-logo-img" />
          </div>
        </header>

        {/* Headline */}
        <h1 className="gc-headline-text">
          THANK YOU FOR YOUR REGISTRATION!
        </h1>

        {/* Sub-line */}
        <p className="gc-subline-text">
          YOU HAVE BEEN AWARDED:
        </p>

        {/* Hero Amount */}
        <div className="gc-hero-amount-wrapper">
          <span className="gc-hero-amount-text">₱{valueAmount}</span>
        </div>

        {/* Award Description Block */}
        <div className="gc-description-block">
          <p className="gc-desc-worth">WORTH OF GIFT CHEQUE</p>
          <p className="gc-desc-sponsored">
            <span className="sponsored-gradient-label">SPONSORED BY </span>
            <span className="sponsored-brand-label">VHBC</span>
          </p>
        </div>

        {/* Footer Call-to-Action */}
        <footer className="gc-cta-block">
          <p className="gc-cta-line1">
            ENJOY AN EXCLUSIVE UNLIMITED TEPPANYAKI FOR 4 AT
          </p>
          <p className="gc-cta-line2">
            ROYALE'S TEPPANYAKI CAPITAL
          </p>
        </footer>

        {/* Serial Number (Metadata) */}
        <div className="gc-metadata-code">
          Certificate Code: <span className="code-value">{serialNumber}</span>
        </div>

        {/* Validity Footer */}
        <div className="gc-validity-footer">
          *Valid until {validUntil}. Terms and conditions apply.
        </div>
      </main>

      {/* Styled Layout Stylesheets */}
      <style>{`
        .gc-page-container {
          box-sizing: border-box;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          padding: 80px 40px;
          color: #333333;
          font-family: 'Poppins', sans-serif;
          
          /* Layered background gradient */
          background: 
            radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%),
            linear-gradient(to bottom, #8A9A6B 0%, #9AAB7E 20%, #E8ECE4 50%, #5B8FD4 80%, #4A7EC7 100%);
        }

        .confetti-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        /* Floating utility control panel */
        .utility-bar {
          position: fixed;
          top: 24px;
          right: 24px;
          display: flex;
          gap: 12px;
          z-index: 100;
          opacity: 0.25;
          transition: opacity 0.3s ease;
        }
        .utility-bar:hover {
          opacity: 1;
        }
        .utility-btn {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          padding: 10px 20px;
          border-radius: 30px;
          cursor: pointer;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          color: #1A3FA8;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
        }
        .utility-btn-primary {
          background: #1A3FA8;
          color: #FFFFFF;
          border: 1px solid #1A3FA8;
        }
        .utility-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(26, 63, 168, 0.2);
        }
        .utility-btn-primary:hover {
          background: #133085;
          border-color: #133085;
        }

        /* Card Content Container */
        .gc-cheque-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-sizing: border-box;
        }

        /* Top Header Row */
        .gc-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 24px;
          gap: 20px;
        }
        .gc-header-left {
          flex: 1;
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }
        .gc-header-right {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        .gc-header-center {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .gc-header-logo-img {
          height: clamp(90px, 14vw, 160px);
          object-fit: contain;
          max-width: 100%;
        }

        /* Trophy SVG Container */
        .gc-trophy-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: clamp(115px, 15vw, 175px);
          height: clamp(115px, 15vw, 175px);
        }

        .gc-trophy-svg-graphic {
          width: 100%;
          height: auto;
          z-index: 5;
          animation: rotateAndFloatTrophy 4.5s ease-in-out infinite;
        }

        @keyframes rotateAndFloatTrophy {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-6px) rotate(-3deg); }
          50% { transform: translateY(-10px) rotate(0deg); }
          75% { transform: translateY(-6px) rotate(3deg); }
        }

        /* Trophy Confetti Burst */
        .gc-trophy-burst {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
          animation: spinBurst 12s linear infinite;
        }

        @keyframes spinBurst {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .gc-burst-speck {
          position: absolute;
          background: linear-gradient(135deg, #F5D061 0%, #C9962E 100%);
          border-radius: 50%;
          opacity: 0.85;
          animation: burstPulse 2s ease-in-out infinite alternate;
        }
        @keyframes burstPulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.15); opacity: 0.95; }
        }

        /* Headline styled with horizontal text-gradient */
        .gc-headline-text {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: clamp(1.6rem, 5.2vw, 4.6rem);
          margin: 16px 0;
          letter-spacing: 0.5px;
          line-height: 1.15;
          
          /* Gradient Fill */
          background: linear-gradient(to right, #1E4FD8 0%, #1E4FD8 40%, #1B5E33 60%, #1B5E33 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          
          /* Dimensional filter shadow overlaying gradient text */
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
        }

        /* Sub-line */
        .gc-subline-text {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: clamp(0.9rem, 2vw, 1.8rem);
          color: #2E7D32;
          margin: 8px 0;
          letter-spacing: 1px;
        }

        /* Hero Amount Wrapper */
        .gc-hero-amount-wrapper {
          margin: clamp(24px, 5vh, 48px) 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .gc-hero-amount-text {
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(4.5rem, 18vw, 16.5rem);
          color: #1E7D1E;
          line-height: 0.9;
          letter-spacing: -3px;
          
          /* Shadow effect and thinner appearance */
          text-shadow: 2px 4px 12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.15);
          filter: drop-shadow(0 8px 16px rgba(0, 70, 0, 0.25));
        }

        /* Award Description Block */
        .gc-description-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: clamp(24px, 4vh, 40px);
        }
        .gc-desc-worth {
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          font-size: clamp(1rem, 2.2vw, 1.8rem);
          color: #1B5E33;
          margin: 0;
          letter-spacing: 1px;
        }
        .gc-desc-sponsored {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(1.2rem, 2.8vw, 2.4rem);
          margin: 0;
          text-transform: uppercase;
        }
        .sponsored-gradient-label {
          font-weight: 600;
          background: linear-gradient(to right, #1B5E33 0%, #1A3FA8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .sponsored-brand-label {
          font-weight: 800;
          color: #1A3FA8;
        }

        /* Footer CTA Block */
        .gc-cta-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }
        .gc-cta-line1 {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: clamp(0.9rem, 2.2vw, 1.7rem);
          margin: 0;
          
          /* Blue to green text gradient */
          background: linear-gradient(to right, #1E4FD8 0%, #1B5E33 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .gc-cta-line2 {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: clamp(1.1rem, 2.6vw, 2rem);
          color: #123B5C;
          margin: 0;
          letter-spacing: 0.5px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
        }

        /* Certificate Code */
        .gc-metadata-code {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #1B5E33;
          margin-top: 40px;
          letter-spacing: 0.5px;
          opacity: 0.85;
        }
        .gc-metadata-code .code-value {
          font-weight: 800;
          color: #1A3FA8;
        }

        /* Validity Footer */
        .gc-validity-footer {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(0.75rem, 1.6vh, 0.95rem);
          font-weight: 500;
          font-style: italic;
          color: rgba(26, 63, 168, 0.7);
          margin-top: 16px;
        }

        /* Responsive styling tweaks */
        @media (max-width: 768px) {
          .gc-page-container {
            padding: 60px 20px;
          }
          .gc-header-row {
            flex-direction: row;
            justify-content: space-between;
          }
          .gc-header-logo-img {
            height: clamp(65px, 11vw, 95px);
          }
          .gc-trophy-container {
            width: clamp(90px, 12vw, 130px);
            height: clamp(90px, 12vw, 130px);
          }
        }

        /* Print Override Layouts */
        @media print {
          body {
            background: 
              radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%),
              linear-gradient(to bottom, #8A9A6B 0%, #E8ECE4 50%, #5B8FD4 100%) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .utility-bar, .confetti-canvas {
            display: none !important;
          }
          .gc-page-container {
            padding: 0 !important;
            background: 
              radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%),
              linear-gradient(to bottom, #8A9A6B 0%, #E8ECE4 50%, #5B8FD4 100%) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
