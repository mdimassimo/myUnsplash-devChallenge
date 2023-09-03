import { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';
import deleteButton from '../assets/delete_FILL0_wght400_GRAD0_opsz48.svg'
import uploadAPhoto from '../assets/undraw_collection_re_4h7d.svg'
import notFound from '../assets/undraw_the_search_s0xf.svg'

export default function PhotoBoard(props){

  const [photos, setPhotos] = useState([])
  let namesPhotos = photos.length > 0 && photos.slice();
  const [dataCompleted, setDataCompleted] = useState([]);
  const [emptyData, setEmptyData] = useState(false);
  const [dataRenderized, setDataRenderized] = useState([]);
  const [errorMatch, setErrorMatch] = useState(false);
  const [deletingFile, setDeletingFile] = useState(false);

  useEffect (()=>{
    props.idUser != undefined && getPhotos(props.idUser);
  },[props.idUser != undefined, props.rendericeBoard])

  useEffect (()=>{
    namesPhotos.length > 0 && getDataPhotos(props.idUser);
  },[namesPhotos.length > 0, props.rendericeBoard])

  useEffect(()=>{
    props.labelSearched.length > 2 && searchPhotos(props.idUser, props.labelSearched);
  }, [props.labelSearched.length])

  useEffect(()=>{
    props.labelSearched.length < 3 && setDataRenderized(dataCompleted) && setErrorMatch(false);
  }, [props.labelSearched.length])

  useEffect(()=>{
    props.labelSearched.length < 3 && setErrorMatch(false);
  }, [props.labelSearched.length])

  async function getPhotos(id){
    setPhotos([]);
    const { data, error } = await supabase.storage.from('try').list(id, {
      sortBy: { column: 'created_at', order: 'desc' }
    });
    if (error) {
      console.error('Error listing files:', error.message);
    } else {
      const urls = data.map(item => {
        return supabase.storage.from('try').getPublicUrl(`${id}/${item.name}`);
      });
      setPhotos(urls);
      props.setHasUploaded(false);
      urls.length === 0 ? setEmptyData(true) : setEmptyData(false);
    }    
  }

  async function getDataPhotos(id) {
    setDeletingFile(false);
    setDataCompleted([]);
    let collectionDataRelation = [];
    for (const photo of namesPhotos) {
      let dataRelation = {
        url: '',
        labels: ''
      };
      dataRelation.url = photo.data.publicUrl;
      let nameFile = photo.data.publicUrl.toString().split('/');
      let nameFileFinal = nameFile[nameFile.length - 1];     
      const { data, error } = await supabase
        .from('labels')
        .select('name_label')
        .eq('id_user', id)
        .eq('url_image', nameFileFinal);     
      if (!error) {
        dataRelation.labels = data.map(item => item.name_label);
      }      
      collectionDataRelation.push(dataRelation);
    }    
    setDataCompleted(collectionDataRelation);
    setDataRenderized(collectionDataRelation);
  }

const deleteFile = async (urlFile, id) => {
  setDeletingFile(true)
  try {
    const nameFile = urlFile.split('/');
    const nameFileFinal = nameFile[nameFile.length - 1];

    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('try')
      .remove([`${id}/${nameFileFinal}`]);

    if (storageError) {
      console.log("Error al eliminar el archivo:", storageError);
    } else {
      const { error: deleteError } = await supabase
        .from('labels')
        .delete()
        .eq('id_user', id)
        .eq('url_image', nameFileFinal);

      if (deleteError) {
        console.log("Error al eliminar el registro:", deleteError);
      } else {
        setTimeout(() => {
          namesPhotos= [];
          getPhotos(id);
          getDataPhotos(id);
        }, "2000");
      }
    }
  } catch (error) {
    console.error("Error general:", error);
  }
}; 

const searchPhotos = async (id, searchTerm) =>{
  try {
    const { data, error } = await supabase
    .from('labels')
    .select('name_label, url_image')
    .eq('id_user', id)
    .like('name_label', `%${searchTerm}%`)  

    if(error){
      console.log(error)
    } else {
      let dataRelationFind = [];
      for (const photoFind of data) {
        const urlImage = `https://xwjgjhfisdybszkmxtkz.supabase.co/storage/v1/object/public/try/${id}/${photoFind.url_image}`
        dataRelationFind.indexOf(urlImage) === -1 && dataRelationFind.push(urlImage)
      }
      let matchingPhotos = [];
      dataRelationFind.map(match =>{
        dataCompleted.map(photo=>{
          photo.url === match && matchingPhotos.push(photo)
        })
      })     
      console.log(matchingPhotos)
      if (matchingPhotos.length != 0){
        setErrorMatch(false)
        setDataRenderized(matchingPhotos)
      } else {
        setErrorMatch(true)
      }
    }
  } catch (error) {
    console.error(error);
  }
}

  return(
      dataRenderized.length > 0 ?
      <main className="photoboard">
          {errorMatch ? 
          <div className="photoboard_notFound">
            <h1>No photos found!</h1>
            <img src={notFound}/>
          </div> : 
          <div className="photoboard_grid">
          <div className="photoboard_grid-column">
          {dataRenderized.map((photo, index) =>
            index % 3 === 0 ? (
              <figure key={index}>
                <img src={photo.url} alt={`Photo ${index}`} />
                <figcaption>
                  <ul>
                    {photo.labels.map((label, labelIndex) => (
                      <li key={labelIndex}>
                        {label}
                        {labelIndex === photo.labels.length - 1 ? null : ", "}
                      </li>
                    ))}
                  </ul>
                </figcaption>
                <div className="delete_image">
                <button onClick={() => deleteFile(photo.url, props.idUser)}>
                {deletingFile ? 
                    <div className="loader"></div>
                    :
                      <img src={deleteButton} alt="Delete" />
                    }
                </button>
                </div>
              </figure>
            ) : null
          )}
          </div>
          <div className="photoboard_grid-column">
          {dataRenderized.map((photo, index) =>
            index % 3 === 1 ? (
              <figure key={index}>
                <img src={photo.url} alt={`Photo ${index}`} />
                <figcaption>
                  <ul>
                    {photo.labels.map((label, labelIndex) => (
                      <li key={labelIndex}>
                        {label}
                        {labelIndex === photo.labels.length - 1 ? null : ", "}
                      </li>
                    ))}
                  </ul>
                </figcaption>
                <div className="delete_image">
                  <button onClick={() => deleteFile(photo.url, props.idUser)}>
                    {deletingFile ? 
                    <div className="loader"></div>
                    :
                      <img src={deleteButton} alt="Delete" />
                    }
                  </button>
                </div>
              </figure>
            ) : null
          )}
          </div>
          <div className="photoboard_grid-column">
          {dataRenderized.map((photo, index) =>
            index % 3 === 2 ? (
              <figure key={index}>
                <img src={photo.url} alt={`Photo ${index}`} />
                <figcaption>
                  <ul>
                    {photo.labels.map((label, labelIndex) => (
                      <li key={labelIndex}>
                        {label}
                        {labelIndex === photo.labels.length - 1 ? null : ", "}
                      </li>
                    ))}
                  </ul>
                </figcaption>
                <div className="delete_image">
                  <button onClick={() => deleteFile(photo.url, props.idUser)}>
                  {deletingFile ? 
                 <div className="loader"></div>
                 :
                      <img src={deleteButton} alt="Delete" />
                    }
                  </button>
                </div>
              </figure>
            ) : null
          )}
          </div>
      </div>}         
      </main> : 
      emptyData === true ?
      <main>
        <div className="empty_board">
          <h2>Your collection doesn't have any photos!</h2>
          <h1>Come on! Add the first one!</h1>
          <img src={uploadAPhoto}/>
        </div>
      </main> :
      <main>
        <div className="spinner">
          <div className="ripples"></div>
        <h2>Loading photos</h2>
        </div>
      </main>
  )
}