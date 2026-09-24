import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { COMPANY_INFO } from '../config/companyInfo';

const IconLinkedIn = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const IconInstagram = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const IconYouTube = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);
const IconX = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const whatsappHref = `https://wa.me/${COMPANY_INFO.phone.replace(/\D/g, '')}`;

  const companyLinks = [
    { name: 'About', path: '/about' },
    { name: 'Home', path: '/' },
    { name: 'Wishlist', path: '/wishlist' },
    { name: 'My Account', path: '/profile' },
    { name: 'Contact', path: '/contact' },
  ];

  const shopLinks = [
    { name: 'Skin Essentials', path: '/category/beauty-and-hygiene/skin-care' },
    { name: 'Hair Essentials', path: '/category/beauty-and-hygiene/hair-care' },
    { name: 'Colour & Makeup', path: '/category/beauty-and-hygiene/makeup' },
    { name: 'Bath & Hands', path: '/category/beauty-and-hygiene/bath-and-hand-wash' },
    { name: 'Dental Care', path: '/category/beauty-and-hygiene/oral-care' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Use', path: '/terms' },
    { name: 'Shipping Policy', path: '/shipping' },
    { name: 'Refund & Cancellation', path: '/refund-cancellation' },
  ];

  const socialLinks = [
    { name: 'LinkedIn', icon: IconLinkedIn, url: 'https://linkedin.com' },
    { name: 'Instagram', icon: IconInstagram, url: 'https://instagram.com' },
    { name: 'YouTube', icon: IconYouTube, url: 'https://youtube.com' },
    { name: 'X', icon: IconX, url: 'https://x.com' },
  ];

  const linkClass =
    'text-[15px] text-white/90 hover:text-[#c39662] transition-colors duration-200';

  return (
    <>
      <footer className="relative w-full bg-[#0a0b10] text-white overflow-hidden mt-16">
        <div className="relative z-10 max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10 pt-16 sm:pt-20 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            <div className="space-y-5 lg:col-span-3">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <span className="w-8 h-8 rounded-[6px] bg-[#c39662] text-white flex items-center justify-center shadow-[0_0_18px_rgba(195,150,98,0.45)]">
                  <ShoppingBag className="w-4 h-4" strokeWidth={2.2} />
                </span>
                <span className="text-[22px] font-semibold tracking-tight text-white">
                  Shopzen<span className="text-[#c39662]">.</span>
                </span>
              </Link>
              <p className="text-[13px] leading-relaxed text-white/55 max-w-[240px]">
                A considered destination for everyday essentials, beauty, and wellness.
              </p>
              <div className="flex items-center gap-2.5 pt-1">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-[5px] border border-white/20 text-white/80 flex items-center justify-center hover:border-[#c39662] hover:text-[#c39662] transition-colors duration-200"
                      aria-label={social.name}
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-[11px] font-medium tracking-[0.18em] uppercase text-white/35 mb-5">
                Company
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className={linkClass}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-[11px] font-medium tracking-[0.18em] uppercase text-white/35 mb-5">
                Shop
              </h4>
              <ul className="space-y-3">
                {shopLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className={linkClass}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-[11px] font-medium tracking-[0.18em] uppercase text-white/35 mb-5">
                Legal
              </h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className={linkClass}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-[11px] font-medium tracking-[0.18em] uppercase text-white/35 mb-5">
                Contact & Support
              </h4>
              <ul className="space-y-3.5">
                <li>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="flex items-start gap-2.5 text-[15px] text-white/90 hover:text-[#c39662] transition-colors duration-200"
                  >
                    <Mail className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>
                    
                      <span className="break-all">{COMPANY_INFO.email}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${COMPANY_INFO.phone}`}
                    className="flex items-start gap-2.5 text-[15px] text-white/90 hover:text-[#c39662] transition-colors duration-200"
                  >
                    <Phone className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>
                     
                      {COMPANY_INFO.phone}
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-[15px] leading-relaxed text-white/90">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-white/70" strokeWidth={1.75} />
                  <span>
                   
                    {COMPANY_INFO.registeredAddress}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <p className="relative z-10 mt-16 sm:mt-20 max-w-3xl mx-auto text-center text-[12px] leading-relaxed text-white/35">
            {COMPANY_INFO.legalName} is an e-commerce retailer of beauty, wellness, and everyday
            essentials. Please review our policies before placing an order. GSTIN: {COMPANY_INFO.gstin}
            {' · '}CIN: {COMPANY_INFO.cin}.
          </p>

          <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-white/40">
            <p>
              © {currentYear} {COMPANY_INFO.brandName}. All Rights Reserved.
            </p>
            <p>India — Serving nationwide</p>
          </div>
        </div>

        <div
          className="pointer-events-none select-none absolute inset-x-0 bottom-[-0.15em] z-0 flex justify-center overflow-hidden"
          aria-hidden="true"
        >
          <span className="font-bold text-[clamp(4.5rem,18vw,13.5rem)] leading-[0.82] tracking-[-0.06em] text-white/[0.045] uppercase">
            Shopzen
          </span>
        </div>
      </footer>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-50 right-4 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] lg:bottom-6 lg:right-6 inline-flex items-center gap-2 rounded-full bg-[#1f6b4a] hover:bg-[#185c3f] text-white pl-3.5 pr-4 py-2.5 shadow-lg shadow-black/30 text-sm font-medium transition-colors"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-[18px] h-[18px]" />
        Chat on WhatsApp
      </a>
    </>
  );
};

export default Footer;
