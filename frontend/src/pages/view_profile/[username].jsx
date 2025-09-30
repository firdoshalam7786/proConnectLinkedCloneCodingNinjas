import clientServer from "@/config";
import { BASE_URL } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import { useRouter } from "next/router";
import {
  getConnectionsRequest,
  getMyConnectionRequests,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

export default function ViewProfile({ userProfile }) {
  // const searchParams = useSearchParams();
  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);

  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUserPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionsRequest({ token: localStorage.getItem("token") }))
      dispatch(getMyConnectionRequests({token: localStorage.getItem("token")}))
  };

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });

    setUserPosts(post);
  }, [postReducer.posts]);

  useEffect(() => {
    console.log(
      "authStateConnections",
      authState.connections,
      "userProfile",
      userProfile?.userId?._id
    );

    if (
      Array.isArray(authState.connections) &&
      authState.connections.some(
        (user) => user?.connectionId?._id === userProfile?.userId?._id
      )
    ) {
      setIsCurrentUserInConnection(true);
      if (
        authState.connections.find(
          (user) => user.connectionId._id === userProfile.userId._id
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }
    if (
      Array.isArray(authState.connections) &&
      authState.connectionRequest.some(
        (user) => user?.userId?._id === userProfile?.userId?._id
      )
    ) {
      setIsCurrentUserInConnection(true);
      if (
        authState.connectionRequest.find(
          (user) => user.userId._id === userProfile.userId._id
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }
  }, [authState.connections, userProfile]);

  useEffect(() => {
    getUserPost();
  }, []);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop}
              src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
              alt="backDrop"
            />
          </div>

          {/* profileContainer Detail */}
          <div className={styles.profileContainer_details}>
            <div className={styles.profileContainer__flex}>
              <div style={{ flex: "0.8" }}>
                <div
                  style={{
                    display: "flex",
                    width: "fit-content",
                    alignItems: "center",
                    gap: "1.2rem",
                  }}
                >
                  <h2>{userProfile.userId.name}</h2>
                  <p style={{ color: "gray" }}>
                    @{userProfile.userId.username}
                  </p>
                </div>
                {/* buttons connected and connect */}
                <div style={{ display: "flex", alignItems:"center", gap:"1.2rem" }}>
                  {isCurrentUserInConnection ? (
                    <button className={styles.connectedButton}>
                      {isConnectionNull ? "Pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            user_id: userProfile.userId._id,
                          })
                        );
                      }}
                      className={styles.connectBtn}
                    >
                      Connect
                    </button>
                  )}
                  {/* resume download button */}
                  <div onClick={async()=>{
                     const response = await clientServer.get(`/user/download_resume?id=${userProfile.userId._id}`)
                     window.open(`${BASE_URL}/${response.data.message}`, "_blank")
                  }} style={{cursor:"pointer"}}>
                    <svg style={{width:"1.2em"}}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <p>{userProfile.bio}</p>
                </div>
              </div>

              <div style={{ flex: "0.2" }}>
                <h2>Recent Activity</h2>

                {userPosts.map((post) => {
                  return (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card_profileContainer}>
                          {post.media !== "" ? (
                            <img src={`${BASE_URL}/${post.media}`} alt="post" />
                          ) : (
                            <div
                              style={{ width: "3.4rem", height: "3.4rem" }}
                            ></div>
                          )}
                        </div>
                        <p>{post.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* work History */}

          <div className={styles.workHistory}>
            <h4>Work History</h4>
          </div>

          <div className={styles.workHistoryContainer}>
            {userProfile.postWork.map((work, index) => {
              return (
                <div key={index} className={styles.workHistoryCard}>
                  <p
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                    }}
                  >
                    {work.company} - {work.position}
                  </p>
                  <p>Experience {work.years} yr</p>
                </div>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  const request = await clientServer.get("/user/get_profile_based_username", {
    params: {
      username: context.query.username,
    },
  });

  const response = await request.data;
  // console.log(response)

  return { props: { userProfile: request.data.profile } };
}
 