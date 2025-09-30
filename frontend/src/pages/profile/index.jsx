import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect, useState } from 'react'
import styles from './index.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { getAboutUser } from '@/config/redux/action/authAction'
import clientServer, { BASE_URL } from '@/config'
import { getAllPosts } from '@/config/redux/action/postAction'

export default function ProfilePage() {

    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);
    const postReducer = useSelector((state) => state.postReducer)


    const [userProfile, setUserProfile] = useState({});
    const [userPosts, setUserPosts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [inputData, setInputData] = useState({
      company:"",
      position:"",
      years:""
    })


    const handleWorkInputChange = (e)=>{
      const {name,value} = e.target
      setInputData({...inputData,[name]:value})

    }

    useEffect(()=>{
        dispatch(getAboutUser({token: localStorage.getItem("token")}));
        dispatch(getAllPosts());
    },[])

    useEffect(()=>{
        if(authState.user != undefined){
        setUserProfile(authState.user)
         let post = postReducer.posts.filter((post) => {
          return post.userId.username === authState.user.userId.username;
        });
        setUserPosts(post);
    }
    }, [authState.user,postReducer.posts])

    const updateProfilePicture = async(file) =>{
       const formData = new FormData();
       formData.append("profile_picture", file);
       formData.append("token", localStorage.getItem("token"));

       const response = await clientServer.post("/update_profile_picture", formData,{
        headers:{
          'Content-Type': 'multipart/form-data',
        }
       });
       dispatch(getAboutUser({token:localStorage.getItem("token")}))
    }

    const updateProfileData = async () =>{
      const request = clientServer.post("/user_update", {
        token: localStorage.getItem("token"),
        name: userProfile.userId.name
      });

      const response = await clientServer.post("/user_profile_data",{
        token: localStorage.getItem("token"),
        bio: userProfile.bio,
        currentPost: userProfile.currentPost,
        postWork: userProfile.postWork,
        education: userProfile.education
      })
      dispatch(getAboutUser({token: localStorage.getItem("token")}))
    }



  return (
    <UserLayout>
        <DashboardLayout>
            {authState.user && userProfile.userId && 
            <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <label htmlFor='profilePictureUpload' className={styles.backDrop_overlay}>
              <p>Edit</p>
            </label>
            <input onChange={(e)=>{
              updateProfilePicture(e.target.files[0]);
            }} hidden type="file" id='profilePictureUpload' />
            <img
              src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
              alt="backDrop"
            />
          </div>

          {/* profileContainer Detail */}
          <div className={styles.profileContainer_details}>
            <div style={{ display: "flex", gap: "0.7rem" }}>
              <div style={{ flex: "0.8" }}>
                <div
                  style={{
                    display: "flex",
                    width: "fit-content",
                    alignItems: "center",
                    gap: "1.2rem",
                  }}
                >
                  <input type="text" className={styles.nameEdit} value={userProfile.userId.name} onChange={(e)=>{
                    setUserProfile({...userProfile,userId:{...userProfile.userId, name: e.target.value}})
                  }} />
                  <p style={{ color: "gray" }}>
                    @{userProfile.userId.username}
                  </p>
                </div>

                <div>
                  <textarea value={userProfile.bio} onChange={(e)=>{
                    setUserProfile({...userProfile, bio: e.target.value})
                  }} rows={Math.max(3, Math.ceil(userProfile.bio.length/80))} style={{width:"100%"}}>
                  </textarea>
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
            <button className={styles.addWorkButton} onClick={()=>{
               setIsModalOpen(true)
            }}>Add Work</button>
          </div>
           </div>

           {userProfile != authState.user &&
             <div onClick={()=>{
                updateProfileData();
             }} className={styles.updateProfileBtn}>
              Update profile
             </div>
           }


        </div>
    }

    {isModalOpen && 
          
          <div onClick={()=>{
            setIsModalOpen(false)
          }} className={styles.commentsContainer}>

            <div onClick={(e)=>{
              e.stopPropagation()
            }} className={styles.allCommentsContainer}>
               <input
                    onChange={handleWorkInputChange}
                    className={styles.inputField}
                    name='company'
                    type="text"
                    placeholder="Enter Company"
                  />
               <input
                    onChange={handleWorkInputChange}
                    className={styles.inputField}
                    name='position'
                    type="text"
                    placeholder="Enter Position"
                  />
               <input
                    onChange={handleWorkInputChange}
                    className={styles.inputField}
                    name='years'
                    type="number"
                    placeholder="Years"
                  />

                  <div onClick={()=>{
                    setUserProfile({...userProfile, postWork:[...userProfile.postWork, inputData]})
                    setIsModalOpen(false)
                  }} className={styles.updateProfileBtn}>Add Work</div>

            </div>

          </div>
          
          }
        </DashboardLayout>
    </UserLayout>
  )
}
