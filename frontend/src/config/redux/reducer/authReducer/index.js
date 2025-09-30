import { getAboutUser, getAllUsers, getConnectionsRequest, getMyConnectionRequests, loginUser, registerUser } from "../../action/authAction";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: undefined,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  isTokenThere: false,
  message: "",
  profileFetched: false,
  connections: [],
  connectionRequest: [],
  all_users:[],
  all_profiles_fetched:false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    handleLoginUser: (state) => {
      state.message = "Hello";
    },
    emptyMessage: (state) => {
      state.message = "";
    },
    setTokenIsThere: (state)=>{
      state.isTokenThere = true
    },
    setTokenIsNotThere:(state)=>{
      state.isTokenThere = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking the door...";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.message = "Login is successful";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering you...";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message = {
          message: "Register is successful, Please Login",
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        (state.isLoading = false),
          (state.isError = false),
          (state.profileFetched = true),
          (state.user = action.payload);
      })
      .addCase(getAllUsers.fulfilled, (state,action)=>{
          state.isLoading = false,
          state.isError = false,
          state.all_profiles_fetched = true,
          state.all_users = action.payload.profiles
      })
      .addCase(getConnectionsRequest.fulfilled,(state,action)=>{
        console.log("Reducer Payload", action.payload)
        state.connections = action.payload.connections
      })
      .addCase(getConnectionsRequest.rejected, (state,action)=>{
        state.message = action.payload
      })
      .addCase(getMyConnectionRequests.fulfilled,(state,action)=>{
        state.connectionRequest = action.payload
      })
      .addCase(getMyConnectionRequests.rejected,(state,action)=>{
        state.message = action.payload
      })
  },
});

export const { reset, emptyMessage, setTokenIsThere, setTokenIsNotThere } = authSlice.actions;

export default authSlice.reducer;
