import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";

// const INITIAL_STATE = {
//   user: {
//     "_id":"66bc4459ce31091025ba1eda",
//     "username": "Rounak",
//     "email": "rounak@gmail.com",
//     "profilePicture": "person/team-1.jpg",
//     "coverpicture": "",
//     "followers":[],
//     "followings": [],
//     "isAdmin": false,
//   },
//   isFetching: false,
//   error: false,
// };

const INITIAL_STATE = {
  user:JSON.parse(localStorage.getItem("user")) || null,
  isFetching: false,
  error: false,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  useEffect(()=>{
    localStorage.setItem("user", JSON.stringify(state.user))
  },[state.user])
  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        error: state.error,
        dispatch
      }}
    >
        {children}
    </AuthContext.Provider>
  );
};
