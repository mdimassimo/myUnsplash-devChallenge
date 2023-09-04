import { supabase } from "../supabaseClient";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import logotype from '../assets/my_unsplash_logo.svg';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage(){
    const [createAccount, setCreateAccount] = useState(false);
    const [loginProcess, setLoginProcess] = useState(false);

    const switchMode = () => {
        createAccount ? setCreateAccount(false) : setCreateAccount(true);
    }

    const createUser = async (event) => {
        event.preventDefault();
        setLoginProcess(true);
        const email = event.target.emailcreate.value;
        const password = event.target.passcreate.value;
        const regex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;

        if (!regex.test(email)) {
            signUpErrorEmail()
            setLoginProcess(false);
            return; 
          }
        try {
            const { data, error } = await supabase.auth.signUp({ 
                email: email,
                password: password,
            })
            regex.test(email)
            if(error){
                signUpErrorLogin();
            } else {
                const { error } = await supabase
                .from('users')
                .insert({ 
                    name: event.target.namecreate.value, 
                    surname: event.target.surnamecreate.value,
                    email: event.target.emailcreate.value
                })
                if(error){
                    console.error(error)
                } else(
                    event.target.namecreate.value = '',
                    event.target.surnamecreate.value = '',
                    event.target.emailcreate.value = '',
                    event.target.passcreate.value = '',
                    setCreateAccount(false)
                )
                notifySuccessAccount()
            }
        } catch (error){
            signUpErrorLogin();
        }
        setLoginProcess(false);
    }

    const loginEmail = async  (event) =>{
        setLoginProcess(true);
        event.preventDefault();
        try{
            const { data, error } = await supabase.auth.signInWithPassword({
                email: event.target.email.value,
                password: event.target.pass.value,
            })
            if (error){
                notifyErrorLogin();
            } else{
                window.location.href = 'https://myunsplash-devchallenge.vercel.app/';                    
          }
        } catch(error){
            notifyErrorLogin();
        }
        setLoginProcess(false);
    }

    const notifyErrorLogin = () => {
        toast.error('Error logging in. Please try again', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
    };

    const notifySuccessAccount = () => {
        toast.success('Your account has been successfully created! Please log in', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
    };

    const signUpErrorLogin = () => {
        toast.error('Error subscribing. Please, check your data and try again.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
    };

    const signUpErrorEmail = () => {
        toast.error('Error in the email format. Please check it and try again.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
    };

    return(
        <main className="LoginPage">
                <div className="LoginPage_container-image">
                    <div>              
                        <h1>A site made for devChallenges.io</h1>
                        <h2>Dedicated to my doggy Leia, with love ❤️</h2>      
                    </div>                    
                </div>
                <div className="LoginPage_container-login">
                    <form onSubmit={createAccount ? createUser : loginEmail} className={createAccount ? "Login-form-noshow" : "Login-form"}>
                        <img src={logotype}></img>
                        <h3>Login to your Account</h3>
                        <label>Email</label>
                        <input id="email" type="email" required></input>
                        <label>Password</label>
                        <input id="pass" type="password" required></input>
                        <button type="submit" style={{ textAlign: '-webkit-center' }}>
                            {loginProcess ?
                            <div className="dot-pulse">
                                <div className="dot-pulse__dot"></div>
                            </div> : "Submit"}
                        </button>
                        <p>Not Registered Yet? <a className="create_acount" onClick={switchMode}>Create an account</a>
                        </p>
                    </form>
                    <form onSubmit={createAccount ? createUser : loginEmail} className={createAccount ? "Join-form" : "Join-form-noshow"}>
                        <img src={logotype}></img>
                        <h3>Join with us!</h3>
                        <label>Name</label>
                        <input id="namecreate" type="text" required></input>
                        <label>Surname</label>
                        <input id="surnamecreate" type="text" required></input>
                        <label>Email</label>
                        <input id="emailcreate" type="email" required></input>
                        <label>Password</label>
                        <input id="passcreate" type="password" required></input>
                        <button type="submit" style={{ textAlign: '-webkit-center' }}>
                        {loginProcess ?
                        <div className="dot-pulse">
                            <div className="dot-pulse__dot"></div>
                        </div> : "Create an account"}
                        </button>
                        <p>Do you have an account? <a className="login_into" onClick={switchMode}>Login</a>
                        </p>
                    </form>
                </div>
                <ToastContainer/>
        </main>
    )
}

export default LoginPage;
