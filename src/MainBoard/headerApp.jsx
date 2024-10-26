import { useState } from "react";
import { supabase } from "../supabaseClient";
import logotype from '../assets/my_unsplash_logo.svg';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function Logotype(){

    return(
        <div className="logotype_container">
            <img className="logotype_unsplash" src={logotype}/>
        </div>
    )
}

function Searcher({updateSearch}){
    const searchTerm = (event) =>{
        let term = event.target.value;
        updateSearch(term)
    }

    return(
        <div className="searcher_container">
            <label className="searcher_icon">
                <input 
                    id="searcherBox" 
                    className="searcher_input" 
                    placeholder="Search by label"
                    onChange={searchTerm}>
                </input>
            </label>
        </div>
    )
}

function ModalUpload({idUser, uploadingImage}){
    const [modalShown, setModalShown] = useState(true);   
    const [uploading, setUploading] = useState(false);   
    const showModal = () => {
        modalShown ? setModalShown(false) : setModalShown(true)
    }

    const uploadImage = async (event) => {
        event.preventDefault();
        const imageUrl = event.target.url.value;
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const proxyFunctionUrl = `${supabaseUrl}/functions/v1/proxyFunction?url=${encodeURIComponent(imageUrl)}`;
        const url = new URL(imageUrl);
        const pathWithoutParams = url.pathname;
        const labels = event.target.label.value;
        const labelsSeparated = labels.replace(/\s/g, '').split(',');
        const namePhoto = pathWithoutParams.split('/');
        const namePhotoUploaded = namePhoto[namePhoto.length - 1];
    
        setUploading(true);
    
        try {
            const response = await fetch(proxyFunctionUrl, {
                method: 'GET',
                headers: {
                    'apikey': supabaseKey
                },
            });
    
            if (!response.ok) {
                throw new Error('GET request failed');
            }
    
            const imageBlob = await response.blob();
    
            if (imageBlob.size > 0) {
                const { data, error } = await supabase.storage
                    .from('try')
                    .upload(`${idUser}/${namePhotoUploaded}`, imageBlob, {
                        cacheControl: '3600',
                        upsert: false,
                    });
    
                if (error) {
                    errorLoadingImage();
                    setUploading(false);
                } else {
                    event.target.label.value = '';
                    event.target.url.value = '';
                    setModalShown(true);
                    uploadingImage();
                    labelsSeparated.map(async (label, index) => {
                        const { error } = await supabase
                            .from('labels')
                            .insert({ id_user: idUser, name_label: label, url_image: namePhotoUploaded });
                    });
                    setUploading(false);
                }
            } else {
                errorLoadingImage();
                setUploading(false);
                return;
            }
    
        } catch (error) {
            console.error('Error:', error);
            errorLoadingImage();
            setUploading(false);
        }
    };
    

    const errorLoadingImage = () => {
        toast.error('Error uploading the image. Please try again or try another one.', {
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

    return (
        <>
        <div className="button_container">
            <button 
            type="button" 
            className="button_upload"
            onClick={showModal}
            >
                Add a photo
            </button>
        </div>
        <div className={modalShown ? "uploadModal-noshow" : "uploadModal"}>
            <form onSubmit={uploadImage} className="uploadModal_form">
                <p>Add a new photo</p>
                <label htmlFor="label">Label (separated with commas (','))</label>
                <input id="label" name="labelPhoto" placeholder="Suspendisse elit massa"/>
                <label htmlFor="url">Photo URL</label>
                <input id="url" name="urlPhoto" placeholder="https://images.unsplash.com/photo-1584395630827-860eee694d7b?ixlib=r..."/>
                <div>
                    <button className="uploadModal_form-cancel" type="button" onClick={showModal}>Cancel</button>
                    <button className="uploadModal_form-submit" type="submit">{uploading ? 
                        <div className="dot-pulse">
                            <div className="dot-pulse__dot"></div>
                        </div> : "Submit"}
                    </button>
                </div>
            </form>
        </div>
        </>
    )
}

export default function HeaderApp({idUser, setHasUploaded, setLabelSearched}){
    const [imageUploaded, setImageUploaded] = useState(false);
 
    const uploadingImage = () =>{
        setImageUploaded(true);
        setHasUploaded(true);
    }

    const updateSearch = (term) =>{
        setLabelSearched(term)
    } 

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        window.location.href = "https://munsplash-devchallenge.vercel.app/login";
    }

    return(
        <>
        <div className="logout">
            <a href="#" className="logout_option" onClick={logout}>Logout</a>
        </div>
        <header>
            <Logotype/>
            <Searcher
                updateSearch={updateSearch}
            />        
            <ModalUpload 
                idUser={idUser}
                uploadingImage={uploadingImage}
            />
        </header>
        <ToastContainer/>
        </> 
    )
}
