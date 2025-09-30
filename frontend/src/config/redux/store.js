import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer"

/**
 * STEP for state management
 * Submit action
 * Handle action in it's reducer
 * Register here -> Reducer
 */

export const store = configureStore({  
  reducer: {
    auth: authReducer,
    postReducer: postReducer
  },
});
 