import React, { useEffect, useState, useRef } from 'react';
import rtcLogo from '../assets/rtc.png';
import vhbcLogo from '../assets/vhbc.png';
import { authSupabase } from '../supabaseClient';

export default function GiftCheque({ onNavigate, userId }) {
  const [serialNumber, setSerialNumber] = useState('00000');
  const [valueAmount, setValueAmount] = useState('8,000.00');
  const [validUntil, setValidUntil] = useState('July 2028');
  const canvasRef = useRef(null);

  // Continuous Confetti Animation Effect
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

    // Palette: Blue, Green, Gold, Red/Coral accents
    const colors = ['#60a5fa', '#2563eb', '#78b078', '#3a7d44', '#a6894c', '#facc15', '#ef4444', '#f97316'];
    const particleCount = 70;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * particleCount,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
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
            x: Math.random() * canvas.width,
            y: -20,
            r: p.r,
            d: p.d,
            color: p.color,
            tilt: p.tilt,
            tiltAngleIncremental: p.tiltAngleIncremental,
            tiltAngle: p.tiltAngle,
            speed: p.speed
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

  // Load premium fonts dynamically
  useEffect(() => {
    // Check if fonts are already loaded
    if (!document.getElementById('gift-cheque-fonts')) {
      const link = document.createElement('link');
      link.id = 'gift-cheque-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap';
      document.head.appendChild(link);
    }

    // Parse query parameters if any to make the card dynamic
    const params = new URLSearchParams(window.location.search);
    const sn = params.get('sn');
    const val = params.get('val');
    const valid = params.get('valid');

    if (sn) setSerialNumber(sn);
    if (val) setValueAmount(val);
    if (valid) setValidUntil(valid);
  }, []);

  // Fetch control number and calculate certificate code
  useEffect(() => {
    const fetchControlNumber = async () => {
      if (!userId) return;

      try {
        // 1. Fetch user's profile to get control_number and created_at
        const { data: userProfile, error: profileErr } = await authSupabase
          .from('app_users')
          .select('control_number, created_at')
          .eq('id', userId)
          .maybeSingle();

        if (profileErr) throw profileErr;
        if (!userProfile) return;

        const userControlNum = Number(userProfile.control_number) || 0;

        // Calculate dynamic validity date: 2 years after registration (created_at)
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

        // Format code using control_number directly (e.g. pad with leading zeros to match 5 digits style)
        const formattedCode = String(userControlNum).padStart(5, '0');
        setSerialNumber(formattedCode);
      } catch (err) {
        console.error('Error fetching control number:', err);
      }
    };

    fetchControlNumber();
  }, [userId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="certificate-container font-sans-main">
      {/* Confetti Animation Canvas */}
      <canvas className="confetti-canvas" ref={canvasRef} />
      {/* Dynamic inline styles for the component to keep it isolated and self-contained */}
      <style>{`
        .certificate-container {
          background-color: #f7f5e9; /* Light Cream */
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          width: 100%;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(16px, 3vh, 48px) 16px;
          color: #374151;
          box-sizing: border-box;
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

        .font-script {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 700;
          letter-spacing: 0.1em;
        }
        .font-sans-main {
          font-family: 'Montserrat', sans-serif;
        }

        /* Brand Logos Row */
        .cert-logos-box {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 16px;
          flex-shrink: 0;
        }
        .cert-logo-img {
          height: clamp(52px, 7.5vh, 76px);
          object-fit: contain;
        }
        .cert-logo-divider {
          width: 1px;
          height: clamp(28px, 4.5vh, 48px);
          background-color: rgba(166, 137, 76, 0.35); /* gold color divider */
        }

        /* Abstract Wave Patterns */
        .wave-top-right {
          position: absolute;
          top: 0;
          right: 0;
          width: 40%;
          max-width: 400px;
          z-index: 1;
          pointer-events: none;
        }

        .wave-bottom-left {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40%;
          max-width: 400px;
          z-index: 1;
          pointer-events: none;
        }

        /* Watermark style */
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80%;
          opacity: 0.08;
          pointer-events: none;
          z-index: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        @media (max-width: 640px) or (max-height: 520px) {
          .watermark {
            display: none !important;
          }
        }

        .watermark-logo {
          width: clamp(260px, 45vw, 420px);
          opacity: 0.04;
          object-fit: contain;
          pointer-events: none;
        }
        .watermark-sub {
          font-size: clamp(0.9rem, 2.5vw, 1.5rem);
          font-style: italic;
          color: #6b7280;
          margin-top: 8px;
          font-weight: 300;
        }

        /* Main Content Card styling */
        .certificate-main {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 650px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 3vh, 36px);
          box-sizing: border-box;
          padding: 16px 8px;
        }

        .text-gold {
          color: #a6894c;
        }
        .text-blue-main {
          color: #0000ff;
        }
        .text-green-main {
          color: #006400;
        }

        /* Title & Header Section */
        .cert-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cert-title {
          font-size: clamp(2rem, 6vh, 4rem);
          text-transform: uppercase;
          margin: 0;
          line-height: 1.15;
        }
        .cert-subtitle {
          font-size: clamp(0.95rem, 2.2vh, 1.25rem);
          font-weight: 500;
          margin: 0;
          letter-spacing: 0.5px;
        }

        /* Value Section */
        .cert-value-section {
          display: flex;
          flex-direction: column;
          gap: clamp(8px, 1.8vh, 16px);
        }
        .cert-entitled {
          font-weight: 600;
          font-size: clamp(0.9rem, 2.1vh, 1.15rem);
          margin: 0;
          line-height: 1.4;
        }
        .cert-amount-box {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .cert-amount {
          font-size: clamp(2.5rem, 8vh, 5.5rem);
          font-weight: 850;
          line-height: 1;
          letter-spacing: -0.01em;
          word-break: break-all;
        }
        .cert-amount-sub {
          font-size: clamp(0.85rem, 2vh, 1.25rem);
          font-weight: 700;
          letter-spacing: 0.15em;
          margin-top: 4px;
        }
        .cert-description-box {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 4px;
        }
        .cert-description-title {
          font-size: clamp(1.15rem, 2.6vh, 1.5rem);
          font-weight: 750;
          margin: 0;
        }
        .cert-description-place {
          font-size: clamp(0.95rem, 2.2vh, 1.25rem);
          font-weight: 700;
          margin: 0;
        }

        /* Slogan and Action Section */
        .cert-action-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(10px, 2.2vh, 24px);
        }
        .cert-slogan {
          color: #9ca3af;
          font-size: clamp(0.95rem, 2.3vh, 1.35rem);
          margin: 0;
          opacity: 0.85;
          line-height: 1.4;
        }
        .cert-code {
          font-size: clamp(0.95rem, 2.2vh, 1.25rem);
          font-weight: 500;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .cert-code-value {
          font-weight: 750;
        }

        /* Responsive Action Buttons Container */
        .cert-actions-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          align-items: center;
          box-sizing: border-box;
        }
        @media (min-width: 480px) and (min-height: 480px) {
          .cert-actions-container {
            flex-direction: row;
            justify-content: center;
            gap: 16px;
          }
        }

        .btn-claim {
          background-color: #004d00; /* Dark Green */
          color: #ffffff;
          font-weight: 700;
          padding: clamp(10px, 2.1vh, 16px) clamp(24px, 4vw, 40px);
          border-radius: 0.75rem;
          font-size: clamp(0.95rem, 2.2vh, 1.15rem);
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 15px -3px rgba(0, 77, 0, 0.15);
          transition: all 0.3s ease;
          width: 100%;
          max-width: 280px;
          box-sizing: border-box;
        }
        @media (min-width: 480px) and (min-height: 480px) {
          .btn-claim {
            width: auto;
            min-width: 180px;
            max-width: none;
          }
        }
        .btn-claim:hover {
          background-color: #003300;
          transform: scale(1.05);
        }

        .btn-back-dashboard {
          border: 2px solid #004d00;
          color: #004d00;
          background-color: transparent;
          font-weight: 700;
          padding: clamp(8px, 1.8vh, 14px) clamp(24px, 4vw, 40px);
          border-radius: 0.75rem;
          font-size: clamp(0.9rem, 2vh, 1.1rem);
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 280px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        @media (min-width: 480px) and (min-height: 480px) {
          .btn-back-dashboard {
            width: auto;
            min-width: 180px;
            max-width: none;
          }
        }
        .btn-back-dashboard:hover {
          background-color: rgba(0, 77, 0, 0.05);
          transform: scale(1.05);
        }

        .back-link-custom {
          color: #2563eb;
          font-size: clamp(12px, 1.8vw, 14px);
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          transition: color 0.2s, transform 0.2s;
        }
        .back-link-custom:hover {
          color: #1d4ed8;
          transform: translateX(-4px);
        }

        /* Fine Print Footer */
        .cert-footer {
          margin-top: clamp(16px, 3vh, 32px);
        }
        .cert-fine-print {
          color: #60a5fa;
          font-style: italic;
          font-size: clamp(0.75rem, 1.8vh, 0.95rem);
          margin: 0;
        }

        @media print {
          body {
            background-color: #f7f5e9 !important;
          }
          
          #root > *:not(.certificate-container) {
            display: none !important;
          }

          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            min-height: 100vh;
            padding: 0 !important;
            margin: 0 !important;
            background-color: #f7f5e9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .wave-top-right, .wave-bottom-left, .watermark, .watermark-logo {
            display: block !important;
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .cert-actions-container, .back-link-custom, .confetti-canvas {
            display: none !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Background Decorations */}
      {/* Top-Right Wave SVG */}
      <svg className="wave-top-right" fill="none" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M400 0H150C200 50 100 150 250 200C350 230 380 280 400 300V0Z" fill="#78b078" fillOpacity="0.6"></path>
        <path d="M400 0H220C250 40 180 120 280 160C360 190 390 240 400 260V0Z" fill="#3a7d44" fillOpacity="0.8"></path>
      </svg>
      {/* Bottom-Left Wave SVG */}
      <svg className="wave-bottom-left" fill="none" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 300H250C200 250 300 150 150 100C50 70 20 20 0 0V300Z" fill="#60a5fa" fillOpacity="0.5"></path>
        <path d="M0 300H180C150 260 220 180 120 140C40 110 10 60 0 40V300Z" fill="#2563eb" fillOpacity="0.7"></path>
      </svg>
      {/* VHBC Watermark */}
      <div className="watermark">
        <img src={vhbcLogo} alt="VHBC Watermark" className="watermark-logo" />
        <p className="watermark-sub">Building Leisure Lifestyle Communities</p>
      </div>

      {/* Main Content Card */}
      <main className="certificate-main">
        {/* Header Section */}
        <section className="cert-header">
          {/* Brand Logos Row */}
          <div className="cert-logos-box">
            <img src={vhbcLogo} alt="VHBC Logo" className="cert-logo-img" />
            <div className="cert-logo-divider"></div>
            <img src={rtcLogo} alt="RTC Logo" className="cert-logo-img" />
          </div>
          <h1 className="font-script cert-title text-gold">Gift Certificate</h1>
          <p className="text-gold cert-subtitle">Thank you for your registration</p>
        </section>

        {/* Value Section */}
        <section className="cert-value-section">
          <p className="text-green-main cert-entitled">
            As one of our referrers, you are entitled to enjoy
          </p>
          <div className="cert-amount-box">
            <span className="text-blue-main cert-amount">
              ₱{valueAmount}
            </span>
            <span className="text-blue-main cert-amount-sub">
              WORTH OF GIFT CHEQUE
            </span>
          </div>
          <div className="cert-description-box">
            <h3 className="text-blue-main cert-description-title">
              Unlimited Teppanyaki Dining for Four
            </h3>
            <p className="text-blue-main cert-description-place">
              @Royale's Teppanyaki Capital
            </p>
          </div>
        </section>

        {/* Slogan and CTA Section */}
        <section className="cert-action-section">


          <div className="cert-actions-container">
            <button className="btn-claim" onClick={handlePrint}>
              Claim Your Privilege
            </button>
          </div>

          <p className="text-green-main cert-code">
            Certificate Code: <span className="cert-code-value">{serialNumber}</span>
          </p>

          <a
            href="/"
            className="back-link-custom"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('dashboard');
              }
            }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Go to Dashboard
          </a>
        </section>

        {/* Footer Section */}
        <footer className="cert-footer">
          <p className="cert-fine-print">
            *Valid until {validUntil}. Terms and conditions apply.
          </p>
        </footer>
      </main>
    </div>
  );
}
