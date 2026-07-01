import React, { useState, useEffect } from 'react';

export default function Support({ userName, userEmail }) {
  const [name, setName] = useState(userName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [tickets, setTickets] = useState([]);

  // Load tickets from localStorage on mount
  useEffect(() => {
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    console.log(
      '[Support] Web3Forms Key Status:',
      accessKey
        ? `Loaded (${accessKey.substring(0, 4)}...${accessKey.slice(-4)})`
        : 'Not Loaded/Undefined'
    );

    const savedTickets = localStorage.getItem('vhbc_support_tickets');
    if (savedTickets) {
      try {
        setTickets(JSON.parse(savedTickets));
      } catch (e) {
        console.error('Failed to parse saved tickets', e);
      }
    }
  }, []);

  // Update name/email if props change (e.g. when user logging in loads)
  useEffect(() => {
    if (userName) setName(userName);
    if (userEmail) setEmail(userEmail);
  }, [userName, userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitSuccess(false);

    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please enter a message.');
      return;
    }

    setIsSubmitting(true);

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

    // Helper to generate a new ticket item locally
    const generateLocalTicket = () => {
      const ticketId = `TKT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      return {
        id: ticketId,
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
        status: 'Pending',
        createdAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    };

    // If key is not configured or is the default placeholder, fallback to demo mode
    if (!accessKey || accessKey === 'your_access_key_here') {
      console.warn(
        'Support Contact Form: VITE_WEB3FORMS_ACCESS_KEY is not configured in your .env file. Falling back to Demo Mode.'
      );

      // Simulate API delay
      setTimeout(() => {
        const newTicket = generateLocalTicket();
        const updatedTickets = [newTicket, ...tickets];
        setTickets(updatedTickets);
        localStorage.setItem('vhbc_support_tickets', JSON.stringify(updatedTickets));

        setIsSubmitting(false);
        setSubmitSuccess(true);
        setMessage('');

        // Auto dismiss success banner
        setTimeout(() => setSubmitSuccess(false), 5000);
      }, 1000);
      return;
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: name.trim(),
          email: email.trim(),
          subject: subject,
          message: message.trim(),
          from_name: 'VHBC Referral App Support',
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newTicket = generateLocalTicket();
        const updatedTickets = [newTicket, ...tickets];
        setTickets(updatedTickets);
        localStorage.setItem('vhbc_support_tickets', JSON.stringify(updatedTickets));

        setSubmitSuccess(true);
        setMessage('');

        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setErrorMsg(data.message || 'Failed to submit the form. Please try again.');
      }
    } catch (err) {
      console.error('Web3Forms submit error:', err);
      setErrorMsg('A network error occurred. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearTickets = () => {
    if (window.confirm('Are you sure you want to clear your support ticket history?')) {
      setTickets([]);
      localStorage.removeItem('vhbc_support_tickets');
    }
  };

  return (
    <div className="support-page-container animate-fade-in">
      {/* Page Header */}
      <header className="support-header">
        <h2 className="support-header-title">Support Center</h2>
        <p className="support-header-desc">
          Have questions or need assistance? Reach out to our Sales Department directly or send us a message below, and our team will get back to you shortly.
        </p>
      </header>

      {/* Main Grid Layout */}
      <div className="support-grid">
        {/* Left Column: Contact Form */}
        <div className="support-main-col">
          <section className="profile-card">
            <div className="profile-card-header">
              <span className="material-symbols-outlined profile-card-icon">mail</span>
              <h3 className="profile-card-title">Send Us a Message</h3>
            </div>

            <div className="profile-card-body">
              {submitSuccess && (
                <div className="support-success-banner animate-fade-in">
                  <span className="material-symbols-outlined">check_circle</span>
                  <div>
                    <strong>Message Sent Successfully!</strong>
                    <p>We have logged your ticket. Our support team will respond to your email shortly.</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="profile-error-banner animate-fade-in">
                  <span className="material-symbols-outlined">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="support-form">
                <div className="profile-edit-grid">
                  {/* Name Input */}
                  <div className="profile-field-group">
                    <label className="profile-field-label" htmlFor="support-name">Your Name</label>
                    <div className="profile-input-wrap">
                      <span className="material-symbols-outlined profile-input-icon">person</span>
                      <input
                        id="support-name"
                        type="text"
                        className="profile-input"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="profile-field-group">
                    <label className="profile-field-label" htmlFor="support-email">Email Address</label>
                    <div className="profile-input-wrap">
                      <span className="material-symbols-outlined profile-input-icon">mail</span>
                      <input
                        id="support-email"
                        type="email"
                        className="profile-input"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div className="profile-field-group profile-field-full">
                    <label className="profile-field-label" htmlFor="support-subject">Subject</label>
                    <div className="profile-input-wrap">
                      <span className="material-symbols-outlined profile-input-icon">subject</span>
                      <select
                        id="support-subject"
                        className="profile-input profile-select"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Referral Payout Inquiry">Referral Payout Inquiry</option>
                        <option value="Lead/Client Tracking">Lead/Client Tracking</option>
                        <option value="Schedule/Appointment Issues">Schedule &amp; Appointment Issues</option>
                        <option value="Technical Support">Technical Support / System Bug</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="profile-field-group profile-field-full">
                    <label className="profile-field-label" htmlFor="support-message">Message</label>
                    <div className="profile-input-wrap">
                      <span className="material-symbols-outlined profile-input-icon" style={{ alignSelf: 'flex-start', paddingTop: '10px' }}>message</span>
                      <textarea
                        id="support-message"
                        className="profile-input profile-textarea"
                        placeholder="Describe your issue or question in detail..."
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="support-form-actions">
                  <button type="submit" className="profile-save-btn" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="profile-btn-spinner" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">send</span>
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>

        {/* Right Column: Phone Call Card & Ticket History */}
        <div className="support-side-col">
          {/* Direct Contact Card */}
          <section className="profile-card">
            <div className="profile-card-header">
              <span className="material-symbols-outlined profile-card-icon">call</span>
              <h3 className="profile-card-title">Direct Contact</h3>
            </div>
            <div className="profile-card-body support-contact-card">
              <div className="support-sales-badge">
                <span className="material-symbols-outlined">hub</span>
                <span>Sales Department</span>
              </div>
              <p className="support-call-text">
                Speak directly with our team to accelerate your referrals, verify payout timelines, or handle urgent queries.
              </p>

              <div className="support-phone-number">
                <span className="material-symbols-outlined phone-icon">phone_in_talk</span>
                <a href="tel:+639171897112" className="phone-link">+63 917 189 7112</a>
              </div>

              <a href="tel:+639171897112" className="support-call-btn">
                <span className="material-symbols-outlined">call</span>
                <span>Call Sales Now</span>
              </a>

              <div className="support-hours-note">
                <span className="material-symbols-outlined">schedule</span>
                <span>Available Mon-Fri 9:00 AM - 6:00 PM EST</span>
              </div>
            </div>
          </section>

          {/* Ticket History */}
          <section className="profile-card">
            <div className="profile-card-header support-history-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined profile-card-icon">history</span>
                <h3 className="profile-card-title">My Tickets ({tickets.length})</h3>
              </div>
              {tickets.length > 0 && (
                <button className="support-clear-btn" onClick={handleClearTickets} title="Clear history">
                  <span className="material-symbols-outlined">delete_sweep</span>
                </button>
              )}
            </div>
            <div className="profile-card-body support-tickets-list-container">
              {tickets.length === 0 ? (
                <div className="support-empty-state">
                  <span className="material-symbols-outlined">chat_bubble_outline</span>
                  <p>No messages sent yet. Use the contact form to submit a support ticket.</p>
                </div>
              ) : (
                <div className="support-tickets-list">
                  {tickets.map((t) => (
                    <div key={t.id} className="support-ticket-item animate-fade-in">
                      <div className="support-ticket-item-header">
                        <span className="support-ticket-id">{t.id}</span>
                        <span className="support-ticket-status-badge pending">
                          {t.status}
                        </span>
                      </div>
                      <h4 className="support-ticket-subject">{t.subject}</h4>
                      <p className="support-ticket-msg-preview">{t.message}</p>
                      <span className="support-ticket-date">{t.createdAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
