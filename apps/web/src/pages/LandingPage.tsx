import { useEffect } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle, ChatCircleDots, Key, LockKey, Paperclip, PaperPlaneTilt, UsersThree } from "@phosphor-icons/react";
import { Avatar } from "../components/ui/Avatar";
import { MessageBubble } from "../components/chat/MessageBubble";
import type { DemoMessage } from "../types/chat";

type AuthMode = "login" | "register";
type LandingPageProps = { onOpenAuth: (mode: AuthMode) => void };

const previewMessages: DemoMessage[] = [
  { id: "preview-1", senderId: "maya", senderName: "Maya Patel", content: "The release checklist is ready for review.", createdAt: "09:42 AM" },
  { id: "preview-2", senderId: "eli", senderName: "Eli Morgan", content: "I added the rollback notes and linked the staging run.", createdAt: "09:45 AM" },
  { id: "preview-3", senderId: "you", senderName: "You", content: "I’ll take the final pass before standup.", createdAt: "09:47 AM", own: true },
];

function ProductPreview() {
  return <div className="landing-preview-wrap landing-reveal">
    <img className="landing-signal-art" src="/landing-signal.png" alt="" width="1600" height="1000" />
    <div className="landing-product-preview" role="region" aria-label="Preview of a ChatOps room">
      <aside className="landing-preview-rail">
        <div className="landing-preview-brand"><span className="landing-mark">C</span><strong>ChatOps</strong></div>
        <div className="landing-preview-rail-label">Rooms</div>
        <div className="landing-preview-room active"><span>#</span><strong>engineering</strong><b>3</b></div>
        <div className="landing-preview-room"><span>#</span><strong>launch-plan</strong></div>
        <div className="landing-preview-room"><span>#</span><strong>design</strong></div>
        <div className="landing-preview-user"><Avatar name="Maya Patel" color="#42d9bd" size="sm" /><span><strong>Maya Patel</strong><small>Available</small></span></div>
      </aside>
      <div className="landing-preview-main">
        <header className="landing-preview-header"><div><small>ROOM</small><h3>engineering</h3></div><span className="landing-live-state"><i />Live</span></header>
        <div className="landing-preview-messages"><div className="landing-preview-date">Today</div>{previewMessages.map((message) => <MessageBubble key={message.id} message={message} />)}</div>
        <div className="landing-preview-composer" aria-hidden="true"><Paperclip size={16} /><span>Message #engineering</span><span className="landing-preview-send"><PaperPlaneTilt size={15} weight="fill" /></span></div>
      </div>
    </div>
  </div>;
}

export function LandingPage({ onOpenAuth }: LandingPageProps) {
  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>(".landing-reveal");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.16 });
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return <main className="landing-page">
    <nav className="landing-nav" aria-label="Main navigation">
      <a className="landing-brand" href="/" aria-label="ChatOps home"><span className="landing-mark">C</span><strong>ChatOps</strong></a>
      <div className="landing-nav-links"><a href="#why-chatops">Why ChatOps</a><a href="#how-it-works">How it works</a></div>
      <div className="landing-nav-actions"><button className="landing-text-button" onClick={() => onOpenAuth("login")}>Sign in</button><button className="landing-nav-cta" onClick={() => onOpenAuth("register")}>Create an account <ArrowUpRight size={15} /></button></div>
    </nav>

    <section className="landing-hero">
      <div className="landing-hero-copy landing-reveal is-visible"><p className="landing-eyebrow"><ChatCircleDots size={15} /> Private team rooms</p><h1>Keep the signal clear.</h1><p className="landing-hero-text">A focused workspace for live conversation, durable history, and decisions your team can find again.</p><div className="landing-hero-actions"><button className="landing-primary-cta" onClick={() => onOpenAuth("register")}>Create an account <ArrowRight size={17} /></button><button className="landing-secondary-cta" onClick={() => onOpenAuth("login")}>Sign in</button></div></div>
      <ProductPreview />
    </section>

    <section id="why-chatops" className="landing-section landing-promise landing-reveal"><div><h2>Less hunting. More moving forward.</h2></div><p>ChatOps keeps the conversation close to the context it creates, so your team can act without rebuilding the thread.</p></section>

    <section className="landing-feature-layout landing-section"><article className="landing-feature-primary landing-reveal"><div className="landing-feature-icon"><Key size={21} /></div><h3>Private by default</h3><p>Rooms stay out of sight until someone has the invite code. Share access deliberately.</p><div className="landing-room-line"><span>Invite-only room</span><span>Invite code required</span></div></article><div className="landing-feature-stack"><article className="landing-feature-row landing-reveal"><div className="landing-feature-icon warm"><UsersThree size={20} /></div><div><h3>Know who is there</h3><p>Presence and typing state keep live conversations legible without adding noise.</p></div><CheckCircle size={20} className="landing-feature-check" /></article><article className="landing-feature-row landing-reveal"><div className="landing-feature-icon"><LockKey size={20} /></div><div><h3>History that holds</h3><p>Messages persist in Neon-backed rooms, ready when the next decision depends on them.</p></div><CheckCircle size={20} className="landing-feature-check" /></article></div></section>

    <section id="how-it-works" className="landing-section landing-how"><div className="landing-how-heading landing-reveal"><h2>Start in a minute. Stay in the thread.</h2></div><ol className="landing-how-list"><li className="landing-reveal"><span className="landing-how-index" aria-hidden="true"><ArrowRight size={16} /></span><div><h3>Create a room</h3><p>Give the conversation a name and a clear boundary.</p></div><ArrowUpRight size={19} /></li><li className="landing-reveal"><span className="landing-how-index" aria-hidden="true"><ArrowRight size={16} /></span><div><h3>Share the code</h3><p>Invite only the people who need to be in the room.</p></div><ArrowUpRight size={19} /></li><li className="landing-reveal"><span className="landing-how-index" aria-hidden="true"><ArrowRight size={16} /></span><div><h3>Keep moving</h3><p>Talk, decide, and return to the history when it matters.</p></div><ArrowUpRight size={19} /></li></ol></section>

    <section className="landing-final-cta landing-reveal"><div><h2>Give the next decision somewhere to land.</h2></div><button className="landing-primary-cta" onClick={() => onOpenAuth("register")}>Create an account <ArrowRight size={17} /></button></section>
    <footer className="landing-footer"><a className="landing-brand" href="/" aria-label="ChatOps home"><span className="landing-mark">C</span><strong>ChatOps</strong></a><span>Private rooms for teams that ship.</span></footer>
  </main>;
}
