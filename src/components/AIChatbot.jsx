import React, { useState, useEffect, useRef } from 'react';

const RESPONSES = [
  {
    keywords: ['phishing', 'phish', 'fake email', 'suspicious email', 'scam email'],
    response: "Phishing is a social engineering attack where criminals send fraudulent messages designed to trick you into revealing sensitive information like passwords or credit card numbers. Always check the sender's email address carefully -- attackers often use domains that look similar to legitimate ones (e.g., 'g00gle.com' instead of 'google.com'). Never click links in unexpected emails; instead, navigate directly to the website. Look for red flags like urgent language, spelling errors, and requests for personal data. Enable email filtering and report suspicious messages to your IT team."
  },
  {
    keywords: ['malware', 'virus', 'trojan', 'worm', 'spyware', 'adware', 'infected'],
    response: "Malware is malicious software designed to damage, disrupt, or gain unauthorized access to your systems. Common types include viruses (self-replicating code), trojans (disguised as legitimate software), worms (spread across networks), and spyware (monitors your activity). To protect yourself, keep your operating system and software updated, use reputable antivirus software, avoid downloading files from untrusted sources, and never open unexpected email attachments. Regular system scans and network monitoring are essential for early detection."
  },
  {
    keywords: ['password', 'strong password', 'password tip', 'password manager', 'password security'],
    response: "Strong passwords are your first line of defense. Use at least 14 characters combining uppercase, lowercase, numbers, and special symbols. Avoid dictionary words, personal info like birthdays, and common patterns like '123456' or 'qwerty'. Use a unique password for every account -- if one gets breached, others stay safe. Consider using a password manager like Bitwarden or 1Password to generate and store complex passwords securely. Passphrases like 'correct-horse-battery-staple' can be both strong and memorable."
  },
  {
    keywords: ['vpn', 'virtual private network', 'vpn security'],
    response: "A VPN (Virtual Private Network) encrypts your internet traffic and routes it through a secure server, hiding your IP address and protecting your data from eavesdroppers. This is especially critical on public Wi-Fi networks where attackers can easily intercept unencrypted traffic. Choose a VPN provider with a strict no-logs policy, strong encryption (AES-256), and a kill switch feature. Be aware that free VPNs often monetize your data -- invest in a reputable paid service. A VPN doesn't make you anonymous, but it significantly improves your privacy."
  },
  {
    keywords: ['dark web', 'darknet', 'tor', 'deep web', 'dark net'],
    response: "The dark web is a part of the internet only accessible through special software like Tor. While it has legitimate uses for privacy and circumventing censorship, it's also a marketplace for stolen data, credentials, and hacking tools. Your personal information could end up there after a data breach. Use dark web monitoring services to check if your email or credentials have been exposed. If you find your data has been compromised, immediately change affected passwords, enable 2FA, and monitor your financial accounts for suspicious activity."
  },
  {
    keywords: ['breach', 'data breach', 'data leak', 'leaked', 'compromised', 'hacked'],
    response: "A data breach occurs when unauthorized individuals gain access to confidential data. If you suspect your data has been breached, act immediately: change passwords for all affected accounts, enable two-factor authentication, monitor your bank statements and credit reports, and consider freezing your credit. Use services like HaveIBeenPwned.com to check if your email appears in known breaches. Organizations should implement encryption at rest and in transit, conduct regular security audits, and have an incident response plan ready."
  },
  {
    keywords: ['firewall', 'network security', 'port', 'packet filter'],
    response: "A firewall monitors and controls incoming and outgoing network traffic based on predetermined security rules. It acts as a barrier between your trusted internal network and untrusted external networks. There are several types: packet-filtering firewalls, stateful inspection firewalls, proxy firewalls, and next-generation firewalls (NGFW). Always keep your firewall enabled, configure it to block all unnecessary inbound connections, regularly review firewall rules, and use both network-level and host-based firewalls for layered defense."
  },
  {
    keywords: ['ransomware', 'ransom', 'encrypt files', 'locked files', 'wannacry', 'cryptolocker'],
    response: "Ransomware encrypts your files and demands payment (usually in cryptocurrency) for the decryption key. It typically spreads through phishing emails, malicious downloads, or exploiting vulnerabilities. Prevention is crucial: maintain offline backups following the 3-2-1 rule (3 copies, 2 media types, 1 offsite), keep software patched, use endpoint detection, and train employees to recognize threats. If infected, isolate the affected systems immediately, do not pay the ransom (it doesn't guarantee recovery), and report to law enforcement. Organizations like No More Ransom offer free decryption tools for some variants."
  },
  {
    keywords: ['2fa', 'two factor', 'two-factor', 'mfa', 'multi factor', 'multi-factor', 'authenticator', 'authentication'],
    response: "Two-Factor Authentication (2FA) adds a critical second layer of security beyond just your password. Even if an attacker steals your password, they can't access your account without the second factor. The best options in order of security are: hardware security keys (YubiKey), authenticator apps (Google Authenticator, Authy), and SMS codes (least secure due to SIM swapping risks). Enable 2FA on all important accounts -- email, banking, social media, and cloud storage. Always save your backup codes in a secure location in case you lose access to your 2FA device."
  },
  {
    keywords: ['encryption', 'encrypt', 'aes', 'rsa', 'ssl', 'tls', 'https', 'end-to-end'],
    response: "Encryption converts readable data into an unreadable format that can only be decoded with the correct key. AES-256 is the gold standard for symmetric encryption (same key to encrypt/decrypt), while RSA is widely used for asymmetric encryption (public/private key pairs). Always use HTTPS websites (look for the padlock icon), encrypt sensitive files before storing or sharing them, use end-to-end encrypted messaging apps like Signal, and enable full-disk encryption on your devices (BitLocker for Windows, FileVault for Mac). Encryption protects your data both in transit and at rest."
  },
  {
    keywords: ['social engineering', 'pretexting', 'baiting', 'tailgating', 'impersonation'],
    response: "Social engineering exploits human psychology rather than technical vulnerabilities. Attackers manipulate people into divulging confidential information or performing actions that compromise security. Common techniques include pretexting (creating a fabricated scenario), baiting (leaving infected USB drives), tailgating (following authorized personnel into restricted areas), and vishing (voice phishing). Always verify the identity of anyone requesting sensitive information, be skeptical of unsolicited contacts, and remember that legitimate organizations will never ask for your password. Regular security awareness training is the best defense."
  },
  {
    keywords: ['ddos', 'dos', 'denial of service', 'distributed denial'],
    response: "A DDoS (Distributed Denial of Service) attack overwhelms a target server or network with a flood of traffic from multiple sources, making it unavailable to legitimate users. These attacks can use botnets -- networks of compromised devices -- to generate massive traffic volumes. Protection strategies include using a CDN like Cloudflare, implementing rate limiting, deploying Web Application Firewalls (WAF), having redundant infrastructure, and creating an incident response plan. Early detection through traffic monitoring is key to minimizing the impact of these attacks."
  },
  {
    keywords: ['sql injection', 'sql', 'injection', 'sqli', 'database attack'],
    response: "SQL injection is a code injection technique where attackers insert malicious SQL statements into input fields to manipulate your database. This can lead to unauthorized data access, data modification, or even complete system compromise. Prevention measures include using parameterized queries (prepared statements), implementing input validation and sanitization, applying the principle of least privilege for database accounts, using ORM frameworks, and regularly testing your applications with tools like SQLMap or Burp Suite. Never concatenate user input directly into SQL queries."
  },
  {
    keywords: ['xss', 'cross site', 'cross-site scripting', 'script injection'],
    response: "Cross-Site Scripting (XSS) attacks inject malicious scripts into web pages viewed by other users. There are three types: Stored XSS (persisted on the server), Reflected XSS (reflected off a web server in error messages or search results), and DOM-based XSS (occurs in the client-side code). Defend against XSS by sanitizing all user inputs, encoding output data, implementing Content Security Policy (CSP) headers, using HTTPOnly flags on cookies, and employing modern frameworks that auto-escape output. Regular security testing helps identify XSS vulnerabilities before attackers do."
  },
  {
    keywords: ['zero day', 'zero-day', '0day', '0-day', 'vulnerability', 'exploit'],
    response: "A zero-day vulnerability is a software flaw unknown to the vendor, meaning no patch exists when it's discovered or exploited. These are extremely dangerous because there's no direct fix available. Protect yourself by keeping all software updated (patches often fix recently discovered zero-days), using advanced endpoint protection with behavioral analysis, implementing network segmentation to limit blast radius, employing intrusion detection systems, and following the principle of least privilege. Bug bounty programs and responsible disclosure help the security community find and fix these vulnerabilities faster."
  },
  {
    keywords: ['wifi', 'wi-fi', 'wireless', 'public wifi', 'hotspot', 'network'],
    response: "Public Wi-Fi networks are hunting grounds for cybercriminals. Attackers can set up evil twin hotspots (fake networks mimicking legitimate ones), perform man-in-the-middle attacks, or sniff unencrypted traffic. Never access banking or sensitive accounts on public Wi-Fi without a VPN. Disable auto-connect to open networks, forget networks after use, and use your mobile hotspot when possible. At home, use WPA3 encryption, change the default router password, hide your SSID, and regularly update your router firmware to patch known vulnerabilities."
  },
  {
    keywords: ['safe', 'am i safe', 'check safe', 'security check', 'secure', 'protect myself'],
    response: "Here's a quick security checklist to assess your safety: (1) Are all your devices and software up to date? (2) Do you use unique, strong passwords for each account? (3) Is two-factor authentication enabled on critical accounts? (4) Do you have antivirus/anti-malware software running? (5) Is your firewall enabled? (6) Do you use a VPN on public networks? (7) Do you regularly back up important data? (8) Have you checked HaveIBeenPwned.com for compromised credentials? If you answered 'no' to any of these, I recommend addressing those areas immediately. Would you like help with any specific item?"
  },
  {
    keywords: ['backup', 'back up', 'data recovery', 'disaster recovery'],
    response: "Regular backups are your safety net against ransomware, hardware failure, and data loss. Follow the 3-2-1 backup rule: keep 3 copies of your data, on 2 different media types, with 1 copy stored offsite or in the cloud. Use automated backup solutions to ensure consistency, encrypt your backups to protect sensitive data, and most importantly -- test your backups regularly to verify they can be restored. Consider using versioned backups so you can recover from a specific point in time, which is particularly useful if malware corrupts your files gradually."
  },
  {
    keywords: ['iot', 'smart device', 'smart home', 'internet of things', 'connected device'],
    response: "IoT (Internet of Things) devices like smart cameras, thermostats, and speakers expand your attack surface significantly. Many IoT devices ship with weak default credentials and receive infrequent security updates. Secure your IoT devices by changing default passwords immediately, placing them on a separate network segment (VLAN), disabling features you don't use (like remote access or UPnP), keeping firmware updated, and researching a manufacturer's security track record before purchasing. Consider using a dedicated IoT security solution that monitors device behavior for anomalies."
  },
  {
    keywords: ['identity theft', 'identity', 'stolen identity', 'personal information'],
    response: "Identity theft occurs when someone uses your personal information -- like your Social Security number, credit card details, or login credentials -- without your permission. Protect yourself by shredding sensitive documents, monitoring your credit reports regularly, using identity theft protection services, being cautious about sharing personal info online, and setting up fraud alerts with credit bureaus. If you become a victim, report it to the FTC at IdentityTheft.gov, file a police report, place a credit freeze, and dispute fraudulent accounts immediately."
  },
  {
    keywords: ['incident', 'incident response', 'security incident', 'breach response', 'ir plan'],
    response: "An effective incident response plan follows these phases: (1) Preparation -- establish an IR team and define procedures; (2) Identification -- detect and confirm the incident; (3) Containment -- isolate affected systems to prevent spread; (4) Eradication -- remove the threat from your environment; (5) Recovery -- restore systems to normal operation; (6) Lessons Learned -- document findings and improve defenses. Having a well-rehearsed plan can reduce breach costs by over 50%. Conduct regular tabletop exercises and update your plan based on new threats and organizational changes."
  },
  {
    keywords: ['pentest', 'penetration test', 'pen test', 'ethical hack', 'red team', 'bug bounty'],
    response: "Penetration testing simulates real-world attacks to identify vulnerabilities before malicious actors do. There are several types: black box (no prior knowledge), white box (full access to source code), and gray box (partial knowledge). A thorough pentest covers network, web application, wireless, and social engineering vectors. Organizations should conduct pentests at least annually and after significant infrastructure changes. Tools commonly used include Metasploit, Burp Suite, Nmap, and Wireshark. Always ensure you have proper authorization before testing -- unauthorized testing is illegal."
  },
  {
    keywords: ['compliance', 'gdpr', 'hipaa', 'pci', 'soc2', 'iso 27001', 'regulation'],
    response: "Cybersecurity compliance frameworks help organizations protect data and meet legal obligations. Key frameworks include: GDPR (EU data privacy), HIPAA (US healthcare data), PCI DSS (payment card data), SOC 2 (service organization controls), and ISO 27001 (information security management). Compliance isn't the same as security -- it's the minimum baseline. Implement continuous monitoring, regular audits, employee training, and documented policies. Non-compliance can result in severe penalties: GDPR fines can reach 4% of global revenue. Start by identifying which regulations apply to your organization."
  },
  {
    keywords: ['cloud', 'cloud security', 'aws', 'azure', 'saas', 'cloud storage'],
    response: "Cloud security requires a shared responsibility model -- the cloud provider secures the infrastructure, but you're responsible for securing your data, access, and configurations. Key practices include: enforcing strong IAM (Identity and Access Management) policies, encrypting data at rest and in transit, enabling logging and monitoring (CloudTrail, Azure Monitor), avoiding public access to storage buckets, implementing network security groups, and conducting regular configuration audits. Misconfigured cloud services are one of the leading causes of data breaches today. Use tools like AWS Config or Azure Security Center for continuous compliance."
  },
  {
    keywords: ['email security', 'email', 'spam', 'spf', 'dkim', 'dmarc'],
    response: "Email is the #1 attack vector for cybercriminals. Strengthen your email security with these measures: implement SPF, DKIM, and DMARC records to prevent email spoofing; use email encryption (PGP or S/MIME) for sensitive communications; enable advanced threat protection to scan attachments and links; train employees to identify suspicious emails; and use email filtering to block known malicious senders. Be cautious with email forwarding rules -- attackers often create hidden rules to intercept messages. Regularly audit your email security settings and review access logs for unusual activity."
  },
  {
    keywords: ['mobile', 'phone security', 'smartphone', 'android', 'iphone', 'app security'],
    response: "Mobile devices are increasingly targeted by attackers. Protect your smartphone by: keeping the OS and apps updated, only downloading apps from official stores (App Store/Google Play), reviewing app permissions carefully, enabling biometric authentication and a strong PIN, using a mobile security app, enabling remote wipe capability, avoiding jailbreaking/rooting your device, and being cautious of public charging stations (juice jacking). Enable Find My Device features and encrypt your device storage. Consider using a mobile threat defense (MTD) solution for enterprise environments."
  },
  {
    keywords: ['threat', 'cyber threat', 'threat landscape', 'attack', 'cybersecurity'],
    response: "The cyber threat landscape is constantly evolving. Current major threats include: AI-powered phishing attacks that are harder to detect, ransomware-as-a-service (RaaS) making attacks accessible to less skilled criminals, supply chain attacks targeting trusted software vendors, IoT botnets, and state-sponsored advanced persistent threats (APTs). Stay informed by following sources like CISA alerts, SANS Internet Storm Center, and cybersecurity news outlets. Implement defense-in-depth with multiple security layers, conduct regular risk assessments, and foster a security-first culture in your organization."
  },
  {
    keywords: ['help', 'what can you do', 'commands', 'features', 'options'],
    response: "I can help you with a wide range of cybersecurity topics! Ask me about: password security, phishing detection, malware protection, VPN usage, two-factor authentication (2FA), encryption, social engineering, ransomware defense, firewall configuration, data breaches, dark web monitoring, SQL injection, XSS attacks, cloud security, mobile security, incident response, compliance frameworks (GDPR, HIPAA, PCI DSS), penetration testing, IoT security, Wi-Fi safety, identity theft prevention, email security, backup strategies, and general security best practices. Just type your question!"
  }
];

const DEFAULT_RESPONSE = "That's a great question! While I don't have a specific answer for that exact topic, I can help you with many cybersecurity subjects including phishing, malware, passwords, VPNs, 2FA, encryption, firewalls, ransomware, social engineering, DDoS attacks, SQL injection, cloud security, and more. Try asking about one of these topics, or type 'help' to see everything I can assist with.";

const QUICK_ACTIONS = [
  { label: 'Check if I\'m safe', query: 'Am I safe?' },
  { label: 'Password tips', query: 'Give me password tips' },
  { label: 'What is phishing?', query: 'What is phishing?' },
  { label: 'How to enable 2FA', query: 'How to enable 2FA?' },
];

function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getBotResponse(input) {
  const lower = input.toLowerCase();
  for (const entry of RESPONSES) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.response;
    }
  }
  return DEFAULT_RESPONSE;
}

const ShieldIcon = ({ size = 24, color = '#14e3c5' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ChatIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,255,255,0.15)" />
    <path d="M9 12h6M9 9h6" strokeWidth="1.5" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14e3c5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const TypingIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0' }}>
    <div style={{
      width: 30, height: 30, borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366f1, #14e3c5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <ShieldIcon size={16} color="#fff" />
    </div>
    <div style={{
      background: 'rgba(99,102,241,0.12)', borderRadius: '16px 16px 16px 4px',
      padding: '12px 18px', display: 'flex', gap: 5, alignItems: 'center',
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#94a3b8', display: 'inline-block',
          animation: `chatbotBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
    </div>
  </div>
);

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1, sender: 'bot',
      text: "Hi! I'm SECUVION AI Assistant. Ask me anything about cybersecurity -- from phishing and malware to encryption and incident response. I'm here to help you stay safe online!",
      time: getTimestamp(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [hoverBtn, setHoverBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text: text.trim(), time: getTimestamp() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowQuick(false);
    setIsTyping(true);

    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const botText = getBotResponse(text);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botText, time: getTimestamp() }]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Inject keyframe animation once
  useEffect(() => {
    const id = 'secuvion-chatbot-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes chatbotBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-6px); }
      }
      @keyframes chatbotSlideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes chatbotPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
        50% { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const panelStyle = {
    position: 'fixed', bottom: 90, right: 24, width: 380, height: 520,
    background: '#0a0f1e',
    border: '1px solid rgba(148,163,184,0.08)',
    borderRadius: 20,
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.08)',
    zIndex: 10000,
    animation: 'chatbotSlideUp 0.3s ease-out',
    overflow: 'hidden',
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
  };

  const headerStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(20,227,197,0.08))',
    borderBottom: '1px solid rgba(148,163,184,0.08)',
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div style={panelStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #14e3c5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldIcon size={18} color="#fff" />
              </div>
              <div>
                <div style={{
                  fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 15, color: '#f1f5f9',
                }}>SECUVION AI Assistant</div>
                <div style={{ fontSize: 11, color: '#14e3c5', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#14e3c5', display: 'inline-block',
                  }} />
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              background: 'rgba(148,163,184,0.08)', border: 'none', borderRadius: 8,
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(148,163,184,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(148,163,184,0.08)'}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
            display: 'flex', flexDirection: 'column', gap: 6,
            scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent',
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: 8, marginBottom: 4,
              }}>
                {/* Avatar */}
                {msg.sender === 'bot' ? (
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #6366f1, #14e3c5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ShieldIcon size={14} color="#fff" />
                  </div>
                ) : (
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 13, fontWeight: 700, color: '#fff',
                  }}>U</div>
                )}
                {/* Bubble */}
                <div style={{ maxWidth: '78%' }}>
                  <div style={{
                    background: msg.sender === 'user'
                      ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                      : 'rgba(99,102,241,0.1)',
                    borderRadius: msg.sender === 'user'
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                    padding: '10px 14px',
                    color: '#f1f5f9',
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize: 10, color: '#64748b', marginTop: 4,
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                    paddingLeft: msg.sender === 'bot' ? 4 : 0,
                    paddingRight: msg.sender === 'user' ? 4 : 0,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{msg.time}</div>
                </div>
              </div>
            ))}

            {/* Quick Actions */}
            {showQuick && messages.length === 1 && (
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 4,
              }}>
                {QUICK_ACTIONS.map((qa, i) => (
                  <button key={i} onClick={() => sendMessage(qa.query)} style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: 20, padding: '7px 14px',
                    color: '#14e3c5', fontSize: 12, cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)';
                    }}
                  >{qa.label}</button>
                ))}
              </div>
            )}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(148,163,184,0.08)',
            background: 'rgba(3,7,18,0.6)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(148,163,184,0.06)',
              borderRadius: 14, padding: '4px 4px 4px 16px',
              border: '1px solid rgba(148,163,184,0.1)',
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about cybersecurity..."
                disabled={isTyping}
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  color: '#f1f5f9', fontSize: 13.5,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  padding: '8px 0',
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                style={{
                  width: 38, height: 38, borderRadius: 12, border: 'none',
                  background: input.trim() && !isTyping
                    ? 'linear-gradient(135deg, #6366f1, #14e3c5)'
                    : 'rgba(148,163,184,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                  transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        onMouseEnter={() => setHoverBtn(true)}
        onMouseLeave={() => setHoverBtn(false)}
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 60, height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #14e3c5)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: hoverBtn
            ? '0 8px 32px rgba(99,102,241,0.5), 0 0 20px rgba(20,227,197,0.3)'
            : '0 4px 20px rgba(99,102,241,0.35)',
          transition: 'all 0.3s ease',
          transform: hoverBtn ? 'scale(1.08)' : 'scale(1)',
          zIndex: 10001,
          animation: !isOpen ? 'chatbotPulse 3s ease-in-out infinite' : 'none',
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  );
}
