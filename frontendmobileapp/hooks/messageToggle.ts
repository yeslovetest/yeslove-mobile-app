import { setMessage } from "@/app/store/authSlice";
import { useAppDispatch } from "@/app/store/hooks";
import { useState } from "react";

export const useMsgToggle = () => {
    const dispatch = useAppDispatch();
    const [errorMsg, setErrorMsg] = useState('');
    const [msg, setMsg] = useState('');

    const hideMsg = () => {
        setErrorMsg('');
        setMsg('');
        dispatch(setMessage(''));
    };

    const updateErrorMsg = (error: string) => {
        setErrorMsg(error);
    }; 

    const toggleMsg = (text?: string) => {
        if (text) {
            setMsg(text);
        };

        const timer = setTimeout(() => {
            hideMsg(); 
        }, 3000);
        return () => clearTimeout(timer);
    };
    


    return {
        msg,
        errorMsg,
        toggleMsg,
        updateErrorMsg,
  };  
}