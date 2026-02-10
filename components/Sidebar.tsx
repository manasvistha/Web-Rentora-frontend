import Link from "next/link";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>Rentora</div>
      <nav className={styles.navLinks}>
        <Link href="/search" className={styles.navLink}>Search</Link>
        <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
        <Link href="/message" className={styles.navLink}>Message</Link>
        <Link href="/about" className={styles.navLink}>About</Link>
        <Link href="/user/profile" className={styles.navLink}>Account</Link>
        <Link href="/logout" className={styles.navLink}>Log Out</Link>
      </nav>
    </div>
  );
};

export default Sidebar;