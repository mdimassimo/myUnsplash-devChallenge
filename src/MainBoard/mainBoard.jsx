import { useEffect, useState } from 'react';
import HeaderApp from './headerApp';
import PhotoBoard from './photoBoard';
import { supabase } from '../supabaseClient';

function MainBoard() {

  const [hasUploaded, setHasUploaded ] = useState(false)
  const [labelSearched, setLabelSearched] = useState("");

  const settingUploaded = (change) =>{
    setHasUploaded(change);
  }
  
  const settingLabel = (term) =>{
    setLabelSearched(term);
  }

  const [idUser, setIdUser] = useState();
  useEffect(() =>{
    async function fetchData(){
    const id = await getDataUser();
    setIdUser(id)
    }
    fetchData();
  },[])

  async function getDataUser(){
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', user.email)
    return data[0].id;
  }

  return (
    <>
      <HeaderApp 
        idUser={idUser}
        setHasUploaded={settingUploaded}
        setLabelSearched={settingLabel}/>
      <PhotoBoard 
        idUser={idUser}
        rendericeBoard={hasUploaded}
        setHasUploaded={settingUploaded}
        labelSearched={labelSearched}/>
    </>
  )
}

export default MainBoard;