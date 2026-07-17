import React, { useState } from 'react';
import voucherImg from '../assets/voucher.jpg';

export default function Mechanics() {
  const [activeStep, setActiveStep] = useState(1);
  const [expandedNote, setExpandedNote] = useState(null);

  const toggleAccordion = (index) => {
    setExpandedNote(expandedNote === index ? null : index);
  };

  const steps = [
    { id: 1, label: 'Register' },
    { id: 2, label: 'We Assist' },
    { id: 3, label: 'Earn Reward' }
  ];

  const eligibility = [
    {
      icon: 'public',
      title: 'OFW Status & Age',
      desc: 'Open to all Overseas Filipino Workers (OFWs) aged 18 years old and above.'
    },
    {
      icon: 'how_to_reg',
      title: 'Complete Profile',
      desc: 'The referrer must register and complete the required account information through the application.'
    },
    {
      icon: 'new_releases',
      title: 'New Leads Only',
      desc: 'Each referred client must be a new prospect who has not previously inquired, reserved, or purchased from the company.'
    }
  ];

  const requirements = [
    { icon: 'badge', name: 'Full Name', note: 'As shown on official ID' },
    { icon: 'mail', name: 'Email Address', note: 'Used as account login' },
    { icon: 'phone', name: 'Mobile Number', note: 'Include country code' },
    { icon: 'photo_camera_front', name: 'Passport (Optional)', note: 'With immigration stamp for validation' }
  ];

  const importantNotes = [
    {
      icon: 'verified_user',
      title: 'Official Submission Only',
      desc: 'Only referrals submitted through the official referral application will be recognized for incentives and commission claims. Submissions outside the portal do not apply.'
    },
    {
      icon: 'block',
      title: 'No Lead Duplications',
      desc: 'Duplicate referrals or leads that already exist in the company database are not eligible. In the case of multiple referrers submitting the same lead, the first registered submitter is eligible.'
    },
    {
      icon: 'gavel',
      title: 'Validation & Terms',
      desc: 'Referral rewards are subject to company verification before release. The company reserves the right to validate all referrals and amend these mechanics when necessary.'
    },
    {
      icon: 'restaurant_menu',
      title: 'Royale\'s Teppanyaki Perk',
      desc: 'Upon successful registration, referrer can enjoy unlimited teppanyaki for 4 at Royale’s Teppanyaki Tagaytay Capital by presenting their digital voucher and passport at our office.'
    }
  ];

  return (
    <div className="mechanics-container animate-fade-in">
      {/* Header Section */}
      <header>
        <div className="mechanics-badge-container">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>workspace_premium</span>
          Referral Partner Guidelines
        </div>
        <h2 className="mechanics-header-title">OFW Refer & Earn Program Mechanics</h2>
        <p className="mechanics-header-desc">
          Get rewarded for your connections. Learn how to participate in our referral program, track your referred leads, and unlock rewards in three easy steps.
        </p>
      </header>

      {/* Section 1: Eligibility */}
      <section>
        <div className="mechanics-section-header">
          <h3 className="mechanics-section-title">
            <span className="material-symbols-outlined text-primary">verified</span>
            Who is Eligible?
          </h3>
          <p className="mechanics-section-desc">Review the prerequisites to qualify as a VHBC referral partner</p>
        </div>
        <div className="eligibility-grid">
          {eligibility.map((item, idx) => (
            <div key={idx} className="eligibility-card">
              <span className="material-symbols-outlined eligibility-check-badge">check_circle</span>
              <div className="eligibility-card-icon">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <h4 className="eligibility-card-title">{item.title}</h4>
              <p className="eligibility-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Interactive 3 Steps Stepper */}
      <section>
        <div className="mechanics-section-header">
          <h3 className="mechanics-section-title">
            <span className="material-symbols-outlined text-primary">rocket_launch</span>
            Refer & Earn in 3 Easy Steps
          </h3>
          <p className="mechanics-section-desc">Click on each step below to see how it works and view your rewards</p>
        </div>

        <div className="stepper-card-wrapper">
          {/* Stepper Navigation */}
          <div className="stepper-header-panel">
            <div className="stepper-timeline-container">
              <div className="stepper-progress-line">
                <div
                  className="stepper-progress-fill"
                  style={{ width: `${(activeStep - 1) * 50}%` }}
                />
              </div>
              {steps.map((s) => (
                <button
                  key={s.id}
                  className={`stepper-step-node ${activeStep === s.id ? 'active' : ''} ${activeStep > s.id ? 'completed' : ''
                    }`}
                  onClick={() => setActiveStep(s.id)}
                >
                  <div className="stepper-step-circle">
                    {activeStep > s.id ? (
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check</span>
                    ) : (
                      s.id
                    )}
                  </div>
                  <span className="stepper-step-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stepper Content */}
          <div className="stepper-content-body">
            {activeStep === 1 && (
              <div className="step-pane">
                <div className="step-pane-header">
                  <span className="step-pane-title">Step 1: Register and Secure Registration Reward</span>
                  <p className="step-pane-desc">
                    Create your referral account in the application. As an immediate welcome incentive upon successful registration, you will be awarded a premium dining voucher.
                  </p>
                </div>

                <div className="gift-cheque-preview-container">
                  <img src={voucherImg} alt="Royale's Teppanyaki Gift Cheque" className="teppanyaki-voucher-img" />
                </div>

                <div className="gift-card-details-grid">
                  <div className="gift-card-requirement-bullet">
                    <span className="material-symbols-outlined gift-card-bullet-icon">mail_lock</span>
                    <div className="gift-card-bullet-text">
                      <strong>Digital Delivery:</strong> A digital gift voucher will be automatically generated and can be viewed on Digital Gift Cheque Page.
                    </div>
                  </div>
                  <div className="gift-card-requirement-bullet">
                    <span className="material-symbols-outlined gift-card-bullet-icon">card_membership</span>
                    <div className="gift-card-bullet-text">
                      <strong>Office Redemption:</strong> To redeem, present the digital voucher personally at our office, together with your passport.
                    </div>
                  </div>
                  <div className="gift-card-requirement-bullet">
                    <span className="material-symbols-outlined gift-card-bullet-icon">shield</span>
                    <div className="gift-card-bullet-text">
                      <strong>Non-Transferable:</strong> The gift cheque is strictly non-transferable and can only be claimed by the registered referrer.
                    </div>
                  </div>
                  <div className="gift-card-requirement-bullet">
                    <span className="material-symbols-outlined gift-card-bullet-icon">restaurant_menu</span>
                    <div className="gift-card-bullet-text">
                      <strong>Experience Premium:</strong> Enjoy luxurious teppanyaki dining with family and friends at our Tagaytay branch.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="step-pane">
                <div className="step-pane-header">
                  <span className="step-pane-title">Step 2: Submit Details & We Assist Your Referral</span>
                  <p className="step-pane-desc">
                    Simply submit the complete contact details of your referred client through the portal. Our professional sales team takes over to guide your lead through a complete, stress-free sales pipeline.
                  </p>
                </div>

                {/* Flow Diagram */}
                <div className="sales-pipeline-flow">
                  <div className="pipeline-flow-step">
                    <div className="pipeline-step-badge">1</div>
                    <div className="pipeline-step-icon-circle">
                      <span className="material-symbols-outlined">chat</span>
                    </div>
                    <div className="pipeline-step-name">Client Consultation</div>
                    <p className="pipeline-step-desc">Personalized discussion of buyer preferences & budget</p>
                  </div>

                  <div className="pipeline-connector">
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>arrow_forward</span>
                  </div>

                  <div className="pipeline-flow-step">
                    <div className="pipeline-step-badge">2</div>
                    <div className="pipeline-step-icon-circle">
                      <span className="material-symbols-outlined">present_to_all</span>
                    </div>
                    <div className="pipeline-step-name">Virtual Presentations</div>
                    <p className="pipeline-step-desc">High-definition online property tours and design showcases</p>
                  </div>

                  <div className="pipeline-connector">
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>arrow_forward</span>
                  </div>

                  <div className="pipeline-flow-step">
                    <div className="pipeline-step-badge">3</div>
                    <div className="pipeline-step-icon-circle">
                      <span className="material-symbols-outlined">explore</span>
                    </div>
                    <div className="pipeline-step-name">Site Tripping</div>
                    <p className="pipeline-step-desc">Accompanied physical project site tours for their representatives</p>
                  </div>

                  <div className="pipeline-connector">
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>arrow_forward</span>
                  </div>

                  <div className="pipeline-flow-step">
                    <div className="pipeline-step-badge">4</div>
                    <div className="pipeline-step-icon-circle">
                      <span className="material-symbols-outlined">edit_document</span>
                    </div>
                    <div className="pipeline-step-name">Documentation</div>
                    <p className="pipeline-step-desc">Full contract administration and transaction processing</p>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="step-pane">
                <div className="step-pane-header">
                  <span className="step-pane-title">Step 3: Client Closes and You Earn Your Reward</span>
                  <p className="step-pane-desc">
                    When the referred client closes the purchase, your referral commission is calculated, verified, and released.
                  </p>
                </div>

                <div className="usd-reward-showcase">
                  {/* Glowing Reward Certificate Visual */}
                  <div className="usd-reward-card-preview">
                    <div className="usd-reward-logo">VHBC Referral Partner</div>

                    <div className="usd-reward-badge-circle">
                      <div>
                        <div className="usd-reward-value">$1,000</div>
                        <div className="usd-reward-label">USD Reward</div>
                      </div>
                    </div>

                    <div className="usd-reward-title">Referral Reward Certificate</div>
                    <div className="usd-reward-criteria">
                      Awarded upon 30% Down Payment completion & CTS / DOAS Execution
                    </div>
                  </div>

                  {/* Informational cards */}
                  <div className="usd-reward-info-details">
                    <div className="usd-info-row">
                      <div className="usd-info-icon-box">
                        <span className="material-symbols-outlined">payments</span>
                      </div>
                      <div className="usd-info-content">
                        <div className="usd-info-title">USD $1,000 Payout</div>
                        <p className="usd-info-desc">
                          Receive your reward once your referred client has completed the 30% down payment and the corresponding Contract to Sell (CTS) or Deed of Absolute Sale (DOAS) has been executed.
                        </p>
                      </div>
                    </div>

                    <div className="usd-info-row">
                      <div className="usd-info-icon-box">
                        <span className="material-symbols-outlined">contact_phone</span>
                      </div>
                      <div className="usd-info-content">
                        <div className="usd-info-title">Operations Coordination</div>
                        <p className="usd-info-desc">
                          Our dedicated Sales Operations Team will coordinate with you directly regarding the verification and release of the referral reward.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Registration Requirements */}
      <section>
        <div className="mechanics-section-header">
          <h3 className="mechanics-section-title">
            <span className="material-symbols-outlined text-primary">assignment_ind</span>
            Registration Requirements
          </h3>
          <p className="mechanics-section-desc">Ensure you have prepared these details before starting the registration process</p>
        </div>
        <div className="requirements-grid">
          {requirements.map((item, idx) => (
            <div key={idx} className="requirement-card">
              <div className="requirement-icon-wrapper">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div className="requirement-info">
                <div className="requirement-name">{item.name}</div>
                <div className="requirement-note">{item.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Important Notes Accordion */}
      <section>
        <div className="mechanics-section-header">
          <h3 className="mechanics-section-title">
            <span className="material-symbols-outlined text-primary">info</span>
            Important Program Notes
          </h3>
          <p className="mechanics-section-desc">Essential guidelines and rules governing the OFW Referral Program</p>
        </div>

        <div className="notes-accordion">
          {importantNotes.map((note, index) => (
            <div
              key={index}
              className={`accordion-item ${expandedNote === index ? 'expanded' : ''}`}
            >
              <button
                className="accordion-header"
                onClick={() => toggleAccordion(index)}
              >
                <div className="accordion-header-left">
                  <span className="material-symbols-outlined accordion-header-icon">
                    {note.icon}
                  </span>
                  <span className="accordion-header-title">{note.title}</span>
                </div>
                <span className="material-symbols-outlined accordion-arrow">
                  keyboard_arrow_down
                </span>
              </button>
              <div className="accordion-body">
                <div className="accordion-body-content">
                  <p>{note.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
