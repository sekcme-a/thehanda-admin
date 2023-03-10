import styles from "../styles/survey.module.css"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { firestore as db } from "firebase/firebase"
import useData from "context/data"
import LoaderGif from "src/public/components/LoaderGif"
import { Button } from "@mui/material"
import { Dialog } from "@mui/material"
import { TextField } from "@mui/material"
import FolderIcon from '@mui/icons-material/Folder';
import { CircularProgress } from "@mui/material"
import { Checkbox } from "@mui/material"
import Image from "next/image"

const Survey = () => {
  const router = useRouter()
  const {teamId, setSubContent} = useData()
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [path, setPath] = useState([{
    title:"SURVEY",
    id: "survey"
  }])
  const [backdropMode, setBackdropMode] = useState("hide")
  const [input, setInput] = useState("")

  const [selectedFolders, setSelectedFolders] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])

  const [triggerReload, setTriggerReload] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isContentLoading, setIsContentLoading] = useState(true)


  useEffect(()=>{
    const fetchData = async () => {
      // sessionStorage.setItem("prevSurveyLoc","SURVEY")
      // sessionStorage.setItem("prevSurveyLocId", "program")

      setIsContentLoading(true)
      //SURVEY/folderName/folderName2
      let prevSurveyLoc = sessionStorage.getItem("prevSurveyLoc")
      //program/folderId/folderId2
      let prevSurveyLocId = sessionStorage.getItem("prevSurveyLocId")

      if(prevSurveyLocId===null){
        sessionStorage.setItem("prevSurveyLoc","SURVEY")
        prevSurveyLoc = "SURVEY"
        sessionStorage.setItem("prevSurveyLocId", "survey")
        prevSurveyLocId = "survey"
      }

      let pathData = []
      const pathList = prevSurveyLoc.split("/")
      const pathIdList = prevSurveyLocId.split("/")
      console.log(prevSurveyLoc, prevSurveyLocId)
      for(let i = 0 ; i<pathList.length; i++){
        pathData.push({title: pathList[i], id: pathIdList[i]})
      }
      setPath(pathData)

      let folderData = []
      let foldersCheckedData = []
      const folderQuery = await db.collection("team_admin").doc(teamId).collection("folders").where("parent_node", "==", pathIdList[pathIdList.length-1]).get()
      folderQuery.docs?.map((doc) => {
        folderData.push({title: doc.data().title, id: doc.id, checked: false})
        foldersCheckedData.push({id: doc.id, checked: false})
      })
      setFolders(folderData)
      console.log(foldersCheckedData)


      let fileData = []
      const fileQuery = await db.collection("team").doc(teamId).collection("surveys").where("location","==",pathIdList[pathIdList.length-1]).get()
      fileQuery.docs?.map((doc) => {
        fileData.push({checked: false, id: doc.id, data: doc.data()})
      })
      setFiles(fileData)

      setIsLoading(false)
      setIsContentLoading(false)
    }
    fetchData()
  },[triggerReload])


  const onNewSurveyClick = async() => {
    const doc = await db.collection("team").doc(teamId).collection("surveys").doc()
    router.push(`/${teamId}/editSurvey/${doc.id}`)
  }

  const onNewFolderClick = async () => {

    setBackdropMode("newFolder")
  }
  const onSubmitClick = () => {
    if(input.includes("/"))
      alert("???????????? / ??? ????????? ??? ????????????.")
    else{
      setBackdropMode("hide")
      db.collection("team_admin").doc(teamId).collection("folders").doc().set({
        title: input,
        parent_node: path[path.length-1].id
      }).then(()=>{setTriggerReload(!triggerReload)})
      setInput("")
    }
  }

  const onFolderClick = (id,title, checked) => {
    if(backdropMode==="changeLocation" && selectedFolders.includes(id) )
      alert("????????? ????????? ????????? ??????????????? ????????? ??? ????????????.")
    else{
      sessionStorage.setItem("prevSurveyLocId", `${sessionStorage.getItem("prevSurveyLocId")}/${id}`)
      sessionStorage.setItem("prevSurveyLoc",  `${sessionStorage.getItem("prevSurveyLoc")}/${title}`)
      setTriggerReload(!triggerReload)
    }
  }

  const onPathClick = (floor)=>{
    let locId = ""
    let loc = ""
    path.map((item, index) => {
      if(index===0){
        locId = item.id
        loc = item.title
      }else if(index<=floor){
        locId = `${locId}/${item.id}`
        loc = `${loc}/${item.title}`
      }
    })
    sessionStorage.setItem("prevSurveyLocId", locId)
    sessionStorage.setItem("prevSurveyLoc", loc)
    setTriggerReload(!triggerReload)
  }


  const onFoldersCheckedChange = (index) => {
    if(backdropMode==="changeLocation"){
      alert("?????? ?????? ??????????????? ????????? ?????? ??? ????????????.")
      return
    }
    let temp = folders
    temp[index]={...folders[index], checked: !folders[index].checked}
    setFolders([...temp])
    console.log(temp)
  }
  const onFilesCheckedChange = (index) => {
    if(backdropMode==="changeLocation"){
      alert("?????? ?????? ??????????????? ????????? ?????? ??? ????????????.")
      return
    }
    let temp = files
    temp[index] = {...files[index], checked: !files[index].checked}
    setFiles([...temp])

  }

  const onChangeNameClick = () => {
    //????????? ??????, ?????? id ??????
    let foldersChecked = []
    for(let i =0 ; i<folders.length; i++){
      if(folders[i].checked)
        foldersChecked.push(folders[i].id)
    }
    let filesChecked = []
    for(let i = 0 ; i<files.length; i++){
      if(files[i].checked)
        filesChecked.push(files[i].id)
    }

    if(filesChecked.length!==0)
      alert("?????????????????? ????????????????????? ??????????????????.")
    else if (foldersChecked.length===0)
      alert("??????????????? ????????? ??????????????????.")
    else if( foldersChecked.length>1)
      alert("??????????????? ????????? ????????? ??????????????????.")
    else{
      setBackdropMode("titleChange")
    }
  }
  const onTitleChangeSubmitClick = () => {
    //????????? ??????, ?????? id ??????
    let foldersChecked = []
    for(let i =0 ; i<folders.length; i++){
      if(folders[i].checked)
        foldersChecked.push(folders[i].id)
    }
    setBackdropMode("hide")
    if(input.includes("/"))
      alert("???????????? / ??? ????????? ??? ????????????.")
    else{
      db.collection("team_admin").doc(teamId).collection("folders").doc(foldersChecked[0]).update({
        title: input
      }).then(()=>{setTriggerReload(!triggerReload)})
      setInput("")
    }
  }

  const onChangeLocationClick = () => {
    //????????? ??????, ?????? id ??????
    let foldersChecked = []
    for(let i =0 ; i<folders.length; i++){
      if(folders[i].checked){
        foldersChecked.push(folders[i].id)
      }
    }
    setSelectedFolders([...foldersChecked])
    let filesChecked = []
    for(let i = 0 ; i<files.length; i++){
      if(files[i].checked)
        filesChecked.push(files[i].id)
    }
    console.log(files)
    console.log(filesChecked)
    setSelectedFiles([...filesChecked])
    if(foldersChecked.length===0 && filesChecked.length===0)
      alert("????????? ????????? ?????? ?????? ??????????????????.")
    else
      setBackdropMode("changeLocation")
  }

  const onChangeLocationButtonClick = async() => {
    const locationId = path[path.length-1].id
    const batch = db.batch()
    for(let i = 0; i < selectedFolders.length; i++) {
      batch.update(db.collection("team_admin").doc(teamId).collection("folders").doc(selectedFolders[i]),{
        parent_node: locationId
      })
    }
    for (let i = 0; i<selectedFiles.length; i++){
      batch.update(db.collection("team").doc(teamId).collection("surveys").doc(selectedFiles[i]),{
        location: locationId
      })
    }
    try{
      await batch.commit()
      setTriggerReload(!triggerReload)
      onCancelPositionClick()
    } catch(e){
      console.log(e)
      alert(e.message)
      onCancelPositionClick()
    }
  }
  const onCancelPositionClick = () => {
    setBackdropMode("hide")
    setSelectedFiles([])
    setSelectedFolders([])
  }

  const onDeleteClick = async() => {
    if(!confirm("????????? ???????????? ?????????????????????????"))
      return
    setIsContentLoading(true)
    let foldersChecked = []
    for(let i =0 ; i<folders.length; i++){
      if(folders[i].checked)
        foldersChecked.push(folders[i].id)
    }
    let filesChecked = []
    for(let i = 0 ; i<files.length; i++){
      if(files[i].checked)
        filesChecked.push(files[i].id)
    }

    //?????? ?????? ????????? ??????
    let childFolders = [...foldersChecked]
    // for (let i = 0; i<50; i++){
    //   let foundChild = false
      for( let j = 0; j<childFolders.length; j++){
        const query = await db.collection("team_admin").doc(teamId).collection("folders").where("parent_node","==",childFolders[j]).get()
        query.docs.forEach((doc)=> {
          if(!childFolders.includes(doc.id)){
            childFolders.push(doc.id)
            // foundChild = true
            console.log(childFolders)
          }
        })
      }

    console.log(childFolders)
    const batch = db.batch()
    for(let i = 0; i < childFolders.length ; i ++ ){
      batch.delete(db.collection("team_admin").doc(teamId).collection("folders").doc(childFolders[i]))
      const query = await db.collection("team").doc(teamId).collection("surveys").where("location","==",childFolders[i]).get()
      query.docs.forEach((doc) => {
        // filesToDelete.push(doc.id)
        batch.delete(db.collection("team").doc(teamId).collection("surveys").doc(doc.id))
      })
    }
    for(const checkedFile of filesChecked){
      batch.delete(db.collection("team").doc(teamId).collection("surveys").doc(checkedFile))
    }
    try{
      await batch.commit()
      alert("??????????????? ?????????????????????.")
      setTriggerReload(!triggerReload)
    } catch(e) {
      console.log(e)
      alert(e.message)
    }
  }

  const onFileClick = (id) => {
    // router.push(`/${teamId}/editProgram/${id}`)
    setSubContent({type:"surveys", id: id})
  }

  if(isLoading)
    return <LoaderGif />
  return(
    <>
      <div className={styles.path_container}>
        <h1 onClick={()=>onPathClick(0)}>SURVEY</h1>
        {path.map((item, index) => {
          if(index!==0)
          return(
            <div key={index} className={styles.path_item}>
              <p>{`>`}</p>
              <h2 onClick={()=>onPathClick(index)}>{item.title}</h2>
            </div>
          )
        })}

      </div>
      
      <div className={styles.button_container}>
        <div className={styles.main_button} onClick={onNewSurveyClick}>
          ??? ????????????
        </div>
        <div className={styles.button} onClick={onNewFolderClick}>
          ??? ??????
        </div>
        <div className={styles.button} onClick={onChangeNameClick}>
          ?????? ??????
        </div>
        <div className={styles.button} onClick={onChangeLocationClick}>
          ??????
        </div>
        <div className={styles.button} onClick={onDeleteClick}>
          ??????
        </div> 
        {backdropMode==="changeLocation" && 
        <div className={styles.change_location_container}>
          <Button onClick={onChangeLocationButtonClick}>????????? ??????</Button>
          <Button onClick={onCancelPositionClick}><p style={{color:"red"}}>??????</p></Button>
        </div>
      }
      </div>

      <div className={styles.content_container}>
        {isContentLoading ?
           <div className={styles.item}>
            <div className={styles.item_loading}>
              <CircularProgress />
            </div>
            <p></p>
          </div>
         :
          <>
          {folders.map((item, index)=>{
            return(
              <div className={styles.item} key={index} >
                <div className={styles.checkbox_container}>
                  <Checkbox checked={folders[index].checked || (backdropMode==="changeLocation" && selectedFolders.includes(item.id))} onChange={()=>onFoldersCheckedChange(index)} size="small"/>
                </div>
                <div className={styles.item_img_container} onClick={()=>onFolderClick(item.id, item.title, folders[index].checked)}>
                  <FolderIcon style={{fontSize: "70px"}}/>
                </div>
                <p>{item.title}</p>
              </div>
            )
          })}
          {files.map((item, index)=>{
            return(
              <div className={styles.item} key={index}>
                <div className={styles.checkbox_container}>
                  <Checkbox checked={files[index].checked || (backdropMode==="changeLocation" && selectedFiles.includes(item.id))} onChange={()=>onFilesCheckedChange(index)} size="small"/>
                </div>
                <div className={styles.condition} style={item.data.condition==="confirm" ? {color: "blue"} : item.data.condition==="decline" ? {color:"red"} : {color:"black"}}>
                  {/* {item.data.condition==="unconfirm" ? "?????????" : item.data.condition==="confirm" ? "??????" : item.data.condition==="decline" ? "??????" : "????????????"} */}
                  {item.data.condition==="unconfirm" && "?????????"}
                  {item.data.condition==="confirm" && item.data.publishStartDate > new Date() && "????????????"}
                  {item.data.condition==="confirm" && item.data.publishStartDate <= new Date() && "?????????"}
                  {item.data.condition==="decline" && "??????"}
                  {item.data.condition==="waitingForConfirm" && "????????????"}
                </div>
                <div className={styles.item_img_container} onClick={()=>onFileClick(item.id)}>
                  <img src={item.data.thumbnailBg==="/custom" ? item.data.customBgURL : item.data.thumbnailBg} alt={item.data.title}/>
                </div>
                <p>{item.data.title}</p>
              </div>
            )
          })}
          </>
        }
      </div>


      {backdropMode==="newFolder" &&
      <Dialog open={true} onClose={()=>{setBackdropMode("hide")}} maxWidth="lg">
        <div className={styles.dialog_container}>
          <h1>????????? ???????????????.</h1>
          <TextField id="tf" label="?????? ???" variant="standard" className={styles.textField}
            value={input} onChange={(e)=>setInput(e.target.value)} 
          />
          <Button variant="text" onClick={onSubmitClick}>??????</Button>
        </div>
      </Dialog>
      }
      {backdropMode==="titleChange" &&
      <Dialog open={true} onClose={()=>{setBackdropMode("hide")}} maxWidth="lg">
        <div className={styles.dialog_container}>
          <h1>????????? ???????????????.</h1>
          <TextField id="tf" label="?????? ???" variant="standard" className={styles.textField}
            value={input} onChange={(e)=>setInput(e.target.value)} 
          />
          <Button variant="text" onClick={onTitleChangeSubmitClick}>??????</Button>
        </div>
      </Dialog>
      }

    </>
  )
}

export default Survey