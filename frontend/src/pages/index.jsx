import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from '../layout/UserLayout'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          {/* Left container */}
          <div className={styles.maiContainer_left}>
            <p>Connect with friends without Exaggeration</p>
            <p>A true social media platform, with stores no blufs !</p>
          
            <div onClick={() =>{router.push("/login")}} className={styles.buttonJoin}>
              <p >
              Join Now
            </p>
            </div>
          </div>

          {/* Right container */}
          <div className={styles.maiContainer_right}>
            <img src="images/connecting.jpg" alt="" width={550} />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
