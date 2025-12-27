import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      <nav className="navbar">
        <div className="logo">
          <Image
            src="/Logo.png"
            alt="Rentora Logo"
            width={200}
            height={80}
            priority
          />
        </div>

        <ul className="nav-links">
          <li><Link href="#">Home</Link></li>
          <li><Link href="#">Properties</Link></li>
          <li><Link href="#">Pricing</Link></li>
          <li><Link href="#">Account</Link></li>
        </ul>

        <div className="nav-actions">
          <Link href="/login" className="btn-primary">Login</Link>
          <Link href="/signup" className="btn-primary">Sign Up</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-overlay">
          <h1>Find Your Dream Room with Rentora</h1>
          <p>Easily list flats, find roommates, and rent hassle-free</p>
        </div>
      </section>
    </div>
  );
}
