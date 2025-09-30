import React from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";

export default function NavbarComponent() {
  const router = useRouter();

  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
   
  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        <h1
          style={{ cursor: "pointer" }}
          onClick={() => {
            router.push("/");
          }}
        >
          Pro Connect
        </h1>

        <div className={styles.nabBarOptionContainer}>

          {authState.profileFetched && 
            <div>
              <div style={{display:"flex", gap:"1.2rem"}}>
                <p style={{color:"blue"}}>{authState.user.userId.name}</p>
                <p onClick={()=>{
                  router.push("/profile")
                }} style={{fontWeight:"bold", cursor:"pointer"}}>Profile</p>

                <p onClick={()=>{
                  localStorage.removeItem("token")
                  router.push("/login")
                }} style={{fontWeight:"bold", cursor:"pointer"}}>Logout</p>
              </div>
            </div>
          }
 
        {!authState.profileFetched &&   
        <div
            onClick={() => {
              router.push("/login");
              dispatch(reset());
            }}
            className={styles.buttonJoin}
          >
            Be a part
          </div>
          
          }
        
        </div>
      </nav>
    </div>
  );
}
