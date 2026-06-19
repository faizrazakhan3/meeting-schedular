import { Navigate } from "react-router-dom";
import type{ ReactNode } from "react";

interface protectedRouteProps {
  children: ReactNode;
}
function protectedRoute({children}:protectedRouteProps){
    const token=localStorage.getItem("token");
    if(!token){
        return <Navigate to ="/login" replace/>
    }
    else{
        return children;
    }


}
export default protectedRoute;