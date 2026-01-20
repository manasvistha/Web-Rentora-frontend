// server side processing of both actions
"use server";
import { register } from "../api/auth";

export const handleRegister = async (formData: FormData) => {
    try{
        //how to get data from component
        const result=await register(formData);
        // how to send back to component
        if(result.success){
            return {
                success: true,
                message: "Registration successful",
                data: result.data
                };
        }
        return {
            success: false,
            message: result.message  ||"Registration failed"
        };
    }catch(err: Error | any){
        return {
            success: false,
            message: err.message  ||"Registration failed"
        };
    }
}