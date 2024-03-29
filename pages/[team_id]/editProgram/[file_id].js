import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { firestore as db } from "firebase/firebase"
import useData from "context/data"
import Stepper from "src/[team_id]/editProgram/components/Stepper"
import Header from "src/public/components/Header"
import Navbar from "src/public/components/Navbar"
import styles from "src/[team_id]/index.module.css"
import EditPost from "src/[team_id]/editProgram/components/EditPost"
import NoAuthority from "src/[team_id]/index/components/NoAuthority"
import LoaderGif from "src/public/components/LoaderGif"
import CustomForm from "src/[team_id]/editProgram/components/CustomForm"

import { Button, Dialog, FormControlLabel } from "@mui/material"
import { MobileDateTimePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField } from "@mui/material"
import { CellphoneMessageOff } from "mdi-material-ui"
import { Switch } from "@mui/material"
import { Backdrop } from "@mui/material"
import Form from "src/form/Form"
import Article from "src/article/components/Article"
import SubContent from "src/public/subcontent/components/SubContent"
import Calendar from "src/public/components/Calendar"

import axios from "axios"
import { sendNotification } from "src/public/hooks/notification"
//stepper
const data = [
  "게시물 작성",
  "폼 작성",
  "저장 및 게재",
]

const EditProgram = () => {
  const router = useRouter()
  const {team_id, file_id} = router.query
  const {userData, setTeamId, teamId, setSubContent, alarmType, setAlarmType } = useData()

  const [step, setStep] = useState(0)

  const [calendar, setCalendar] = useState({colorValues: {}, data: []})

  const handleStep = (num) => {setStep(num)}

  const [postValues, setPostValues] = useState({
    isMain: false,
    condition: "unconfirm",
    history: [],
    author: userData.uid,
    team: [userData.uid],
    type: "common",
    sections: [],
    title: "",
    subtitle: "",
    mainBg: "",
    thumbnailBg: "",
    customBgURL:"",
    info:[],
    introduce: [],
    schedule: [],
    // calendar: {colorValues: {}, data: []},
    formData: [],
    deadline: undefined,
    programStartDate: undefined,
    publishStartDate: new Date(),
    hasLimit: false,
    limit: "0",
    hasSchedule: false,
    submitCount: 0,
  })
  const [sections, setSections] = useState([])
  const [rejectText, setRejectText] = useState("")
  const [openBackdrop, setOpenBackdrop] = useState(false)

  const [isSendAlarm, setIsSendAlarm] = useState(true)
  const [alarmText, setAlarmText] = useState("")

  const [isLoading, setIsLoading] = useState(true)

  const [selectedAlarmType, setSelectedAlarmType] = useState({})
  //켜져있으면 알림타입을 설정하지 않은 해당 센터의 사용자들에게도 알림발송(알림 끄기 인원 제외)
  const [selectAll, setSelectAll] = useState(false)


  //스케쥴 backdrop control
  const [openScheduleBackdrop, setOpenScheduleBackdrop] = useState("")
  //스케쥴 color 임시input 데이터
  const [colorInput, setColorInput] = useState({
    red:"",
    orange:"",
    yellow:"",
    green:"",
    blue:"",
    purple:""
  })
  //스케쥴 color 데이터 (backdrop에서 적용시 적용됨)
  // const [colorValues, setColorValues] = useState({
  //   red:"",
  //   orange:"",
  //   yellow:"",
  //   green:"",
  //   blue:"",
  //   purple:""
  // })

  const onColorValueChange= (color, value) => {
    setColorInput({...colorInput, [color]: value})
  }
  const onColorSubmit = async() => {
    if(confirm("적용하시겠습니까?\n(모든 프로그램 스케쥴에 동일 적용됩니다.)")){
      await db.collection("team").doc(team_id).update({
        programScheduleColorValues: colorInput
      })
      setCalendar({...calendar, colorValues: colorInput})
      alert("적용되었습니다.")
    }
  }



  const onAlarmValuesChange = (id) => {
    setSelectedAlarmType({...selectedAlarmType, [id]: !selectedAlarmType[id]})
  }

  // const onValuesChangeWithEvent = (event, type) => {
  //   setPostValues({...postValues, ["type"]: event.target.value})
  // }

  useEffect(()=>{
    setSubContent({
      id: file_id,
      type: "programEdit"
    })
    const fetchData = async () => {
      if(alarmType.length===0){
        await db.collection("team_admin").doc(team_id).get().then((doc) => {
          if(doc.data().alarmType)
            setAlarmType(doc.data().alarmType)
        })
      }
    }
    fetchData()
  },[postValues])


  useEffect(()=>{
    const fetchData = async () => {
      setTeamId(team_id)
      const sectionDoc = await db.collection("team").doc(team_id).collection("section").doc("program").get()
      if(sectionDoc.exists)
        setSections(sectionDoc.data().data)
      else{
        alert("아직 섹션이 없습니다. 프로그램 섹션을 1개 이상 추가한 후 다시 시도해주세요.")
        router.push(`/${team_id}/section/program`)
      }
      

      //기존 프로그램 데이터 받아오기
      const postDoc = await db.collection("team").doc(team_id).collection("programs").doc(file_id).get() 
      //스케쥴 타입 데이터 받아오기
      const calendarDoc = await db.collection("team").doc(team_id).get()
      if(postDoc.exists){
        setPostValues({...postDoc.data(),
          deadline: postDoc.data().deadline?.toDate(),
          programStartDate: postDoc.data().programStartDate?.toDate(),
          publishStartDate: postDoc.data().publishStartDate?.toDate(),
          // calendar: {data: postDoc.data().calendar}
        })
        console.log(postDoc.data().calendar)
        setCalendar({data: postDoc.data().calendar, colorValues: calendarDoc.data().programScheduleColorValues})
        setAlarmText(`[${postDoc.data().title}] 프로그램이 추가되었습니다.`)
        setSelectedAlarmType(postDoc.data().selectedAlarmType)
      }
      

      setIsLoading(false)
    }
    if(userData)
      fetchData()
    else
      router.push("/")
  },[])

  useEffect(()=>{
    console.log(calendar)
  },[calendar])

  const onPreviewClick = () => {
    setOpenBackdrop(true)
  }
  const onPreviousClick = () => {setStep(step-1)}
  const onNextClick = () => {setStep(step+1)}

  const handleFormData = (data) => {
    setPostValues({...postValues, ["formData"]: [...data]})
  }


  const onSubmitClick = async () => {
    console.log(postValues.deadline)
    for(const key in postValues){
      if(postValues.hasOwnProperty(key) && (postValues[key]===undefined || postValues[key]===null || postValues[key]==="")){
        if(key==="title"){
          alert(`제목은 빈칸일 수 없습니다.`); return}
        else if(postValues.isMain && key==="mainBg"){
          alert(`배경화면 색상을 선택해주세요.`); return}
        else if(key==="thumbnailBg"){
          alert("썸내일 배경을 선택해주세요."); return}
        else if(postValues.thumbnailBg==="/custom" && key==="customBgURL"){
          alert("썸네일 이미지를 등록해주세요."); return}
        else if(postValues.deadline===undefined){
          alert("신청 마감일을 입력해주세요.");return}
        else if(postValues.programStartDate===undefined){
          alert("프로그램 최초 시작일을 입력해주세요.");return}
        // else if(postValues.deadline > postValues.programStartDate){
        //   alert("프로그램 최초 시작일은 신청 마감일 이후여야 합니다."); return}
      }
    }
    if(postValues.hasLimit && postValues.limit==="0"){
      alert("인원수 제한은 0명 보다 많아야 합니다.")
      return
    }

    
    let location = sessionStorage.getItem("prevProgramLocId")?.split("/")
    //현재 위치가 루트폴더가 아니라면 폴더들을 탐색해 현재 위치가 존재하는지 확인해야함
    if(location?.length>1){
      //해당 프로그램을 저장하려는 location경로가 없는 경로라면(해당 프로그램을 편집할때 다른 유저가 해당 폴더를 삭제한 경우 보완) 루트위치에 저장.
      const folderLocationDoc = await db.collection("team_admin").doc(team_id).collection("folders").doc(location[location.length-1]).get()
      if(!folderLocationDoc.exists){
        location = ["program"]
        sessionStorage.setItem("prevProgramLoc", "PROGRAM")
        sessionStorage.setItem("prevProgramLocId", "program")
        
        if(!confirm("현재의 폴더 경로가 삭제되었습니다.\n(프로그램 편집중에 다른 유저가 해당 위치의 폴더를 삭제했을 가능성이 높습니다.)\n해당 프로그램을 최상단 경로에 저장하시겠습니까?"))
          return;
      }
    }
    //query를 위해 sections의 id만 따로 빼줌
    const sectionsId = postValues.sections.map((post)=>post.id)
    //첫 프로그램 등록이라면 location정보 작성위함.
    const doc = await db.collection("team").doc(team_id).collection("programs").doc(file_id).get()
    if(doc.exists){
      db.collection("team").doc(team_id).collection("programs").doc(file_id).update({
        ...postValues,
        sectionsId: sectionsId,
        history: [{type:"submit", date: new Date(), text:`"${userData.displayName}" 님에 의해 저장됨.`},...postValues.history],
        savedAt: new Date(),
        lastSaved: userData.displayName,
        selectedAlarmType: selectedAlarmType,
        calendar: calendar.data,
      }).then(()=>{
        alert("성공적으로 저장되었습니다!")
      })
    } else{
      db.collection("team").doc(team_id).collection("programs").doc(file_id).set({
        ...postValues,
        sectionsId: sectionsId,
        history: [{type:"create", date: new Date(), text:`"${userData.displayName}" 님에 의해 생성됨.`},...postValues.history],
        savedAt: new Date(),
        lastSaved: userData.displayName,
        location: location[location.length-1],
        selectedAlarmType: selectedAlarmType,
        calendar: calendar.data
      }).then(()=>{
        alert("성공적으로 저장되었습니다!")
      })
    }
  }

  const onApplyClick = async () => {
    const doc = await db.collection("team").doc(team_id).collection("programs").doc(file_id).get()
    if(doc.exists){
      db.collection("team").doc(team_id).collection("programs").doc(file_id).update({
        history: [{type:"apply", date: new Date(), text: `"${userData.displayName}" 님에 의해 승인신청.`}, ...postValues.history],
        condition: "waitingForConfirm"
      }).then(()=>{
        alert("성공적으로 승인신청되었습니다.")
        router.reload()
      })
    } else{
      alert("저장한 후 승인신청해주세요.")
    }
  }

  const onRejectClick = () => {
    if(rejectText==="" || rejectText===" ")
      alert("거절 사유를 입력해주세요.")
    else{
      db.collection("team").doc(team_id).collection("programs").doc(file_id).update({
        history: [{type:"reject", date: new Date(), text: `"${userData.displayName}" 님에 의해 승인거절됨.`, rejectText: rejectText}, ...postValues.history],
        condition: "decline"
      }).then(()=>{
        alert("승인 거절되었습니다.")
      })
    }
  }

  const onConfirmClick = async() => {
    //예약 게재일이 현재시각보다 미래에 있음(예약게재일 적용) postValues.publishStartDate > new Date()
    if(postValues.publishStartDate > new Date()){
      db.collection("team").doc(team_id).collection("programs").doc(file_id).update({
        condition: "confirm",
        history: [{type: "confirm", date: new Date(), text:`"${userData.displayName}" 님에 의해 승인후 예약게재되었습니다.`}, ...postValues.history]
      }).then(async()=>{
        alert("승인 완료 후 예약게재되었습니다.")

        //메세지 보낼 토큰 불러오기
        if(isSendAlarm){
          alert("알림 전송을 시작합니다. 시간이 소요될 수 있습니다.")
          if(alarmText==="" || alarmText===" "){
            alert("알림문구는 빈칸일 수 없습니다.")
          } else{
            const querySnapshot = await db.collection("user").where("isAlarmOn", "==", true).where("pushToken", ">", "").get()
            const tokenList = querySnapshot.docs.map((doc)=>{
              if(doc.data().alarmSetting && doc.data().alarmSetting[team_id]){
                //알람타입에 해당된다면 푸쉬
                const result = Object.keys(selectedAlarmType).every(key => {
                  if (selectedAlarmType[key]===true) {
                    if(doc.data().alarmDetail&&doc.data().alarmDetail[key]===true)
                      return true;
                  }
                });
                if(result===true || selectAll===true)
                  return doc.data().pushToken
              }else{
                //알람세팅이 되지 않은 초기상태라면 메세지 보내기
                return doc.data().pushToken
              }
            })
            
            //중복된 토큰 삭제
            const uniqueTokenList = [...new Set(tokenList)];
            console.log(uniqueTokenList)
            Promise.all(
              uniqueTokenList.map(async (token) => {
                try {
                  const result = await sendNotification(token,"예정 프로그램", alarmText);
                } catch (e) {
                  console.log(e);
                } 
              })
            ).then(() => {
              console.log("All notifications sent successfully");
              alert("알림을 성공적으로 전송했습니다.")
            }).catch((error) => {
              console.log("Error sending notifications: ", error);
            });
          }
        } 
      })
    } else{
      db.collection("team").doc(team_id).collection("programs").doc(file_id).update({
        condition: "confirm",
        publishStartDate: new Date(),
        history: [{type: "confirm", date: new Date(), text:`"${userData.displayName}" 님에 의해 승인후 게재되었습니다.`}, ...postValues.history]
      }).then(async()=>{
        
        alert("승인 완료 후 게재되었습니다.")
        
        //메세지 보낼 토큰 불러오기
        if(isSendAlarm){
          alert("알림 전송을 시작합니다. 시간이 소요될 수 있습니다.")
          if(alarmText==="" || alarmText===" "){
            alert("알림문구는 빈칸일 수 없습니다.")
          } else{
            const querySnapshot = await db.collection("user").where("isAlarmOn", "==", true).where("pushToken", ">", "").get()
            const tokenList = querySnapshot.docs.map((doc)=>{
              if(doc.data().alarmSetting && doc.data().alarmSetting[team_id]){
                //알람타입에 해당된다면 푸쉬
                const result = Object.keys(selectedAlarmType).every(key => {
                  if (selectedAlarmType[key]===true) {
                    if(doc.data().alarmDetail&&doc.data().alarmDetail[key]===true)
                      return true;
                  }
                });
                if(result===true || selectAll===true)
                  return doc.data().pushToken
              }else{
                //알람세팅이 되지 않은 초기상태라면 메세지 보내기
                return doc.data().pushToken
              }
            }).filter(Boolean)
            
            //중복된 토큰 삭제
            const uniqueTokenList = [...new Set(tokenList)];
            console.log(uniqueTokenList)
            Promise.all(
              uniqueTokenList.map(async (token) => {
                try {
                  const result = await sendNotification(token,"신규 프로그램", alarmText);
                } catch (e) {
                  console.log(e);
                }
              })
            ).then(() => {
              console.log("All notifications sent successfully");
              alert("알림을 성공적으로 전송했습니다.")
            }).catch((error) => {
              console.log("Error sending notifications: ", error);
            });
          }
        }
        
      })
    
    }

  }

  const onCancelClick = () => {
    if(confirm("게재취소하시겠습니까?")){
      db.collection("team").doc(team_id).collection("programs").doc(file_id).update({
        condition: "unconfirm",
        history: [{type:"cancelDeploy", date: new Date(), text:`"${userData.displayName}" 님에 의해 게재 취소되었습니다.`}, ...postValues.history]
      }).then(()=>{
        alert("게재취소되었습니다.")
      })
    }
  }


  if(isLoading)
    return <LoaderGif />

  if(userData?.roles[0]!==`admin_${team_id}`)
  return(<NoAuthority uid={userData?.uid} teamName={team_id} isTeamName={isTeamName}/>)

  return(
    <>
      <div className={styles.main_container}>
        <Header location="editProgram"/>
        <div className={styles.body_container}>
          <Navbar />
          <div className={styles.content_container}>
            <Stepper step={step} handleStep={handleStep} data={data}/>


            <div className={styles.steps_container}>

              {step === 0 && <EditPost values={postValues} setValues={setPostValues} sections={sections} fileId={file_id} teamId={team_id} type="program"/>}
              {step === 1 && <CustomForm formData={postValues.formData} setFormData={handleFormData} teamId={team_id} contentMode={true} id={file_id}/>}
              {step === 2 && 
                <div className={styles.submit_content_container}>
                  <div className={styles.submit_content_item}>
                    <Button variant="contained" size="small" style={{fontSize:"13px"}} sx={{padding: "3px 5px !important"}} onClick={onSubmitClick}>저 장</Button>
                    {/* <p>저장해도 승인신청되지 않습니다.</p> */}
                  </div>
                  <div style={{margin: "25px 0 7px 0", width:"100%", display:"flex", flexWrap:"wrap"}}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <MobileDateTimePicker
                        label="예약게재일을 선택해주세요."
                        value={postValues.publishStartDate}
                        onChange={(e)=>setPostValues({...postValues, ["publishStartDate"]: e})}
                        renderInput={params => <TextField {...params} />}
                      />
                    </LocalizationProvider>

                    <div style={{width:"15px"}} />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <MobileDateTimePicker
                        label="신청마감일을 선택해주세요."
                        value={postValues.deadline}
                        onChange={(e)=>setPostValues({...postValues, ["deadline"]: e})}
                        renderInput={params => <TextField {...params} />}
                      />
                    </LocalizationProvider>

                    <div style={{width:"15px", marginTop:"15px"}} />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <MobileDateTimePicker
                        label="프로그램 최초 시작일을 선택해주세요."
                        value={postValues.programStartDate}
                        onChange={(e)=>setPostValues({...postValues, ["programStartDate"]: e})}
                        renderInput={params => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                  </div>
                  <p style={{fontSize:"14px", marginBottom:"20px"}}>예약게재일을 현재시각보다 과거의 시간대로 설정하면 예약게재는 자동으로 취소됩니다.</p>


                  <div className={styles.limit_container}>
                    <Switch checked={postValues.hasLimit} onChange={(e)=>{setPostValues({...postValues, hasLimit: e.target.checked})}} size="small" />
                    <p>{postValues.hasLimit ? "인원제한 있음" : "인원제한 없음"}</p>
                    {postValues.hasLimit &&
                      <TextField label="인원수" size="small" value={postValues.limit} onChange={(e)=>{
                        if(!isNaN(e.target.value))
                          setPostValues({...postValues, limit: e.target.value})
                        else
                          alert("입력값은 숫자여야합니다.")}
                      }/>
                    }
                  </div>

                  <div style={{marginTop:"30px "}} />
                  <h1 style={{fontSize:"15px",marginBottom:"3px"}}>알림을 보낼 타입을 지정해주세요.</h1>
                  <p style={{fontSize:"11px", marginBottom:"10px"}}>*전체 알림을 선택하면 알림 타입을 지정하지 않은 사용자들을 포함해 센터내 모든 사용자들에게 발송됩니다.</p>
                  <FormControlLabel control={<Switch checked={selectAll} onChange={(e)=>setSelectAll(e.target.checked)} size="small" />} label="전체 알림" />
                  {!selectAll && alarmType.map((item, index) => {
                    return(
                      <FormControlLabel key={index} control={<Switch checked={selectedAlarmType[item.id]} onChange={()=>onAlarmValuesChange(item.id)} size="small" />} label={item.text} />
                    )
                  })}




                  <div style={{marginTop:"30px "}} />
                  <h1 style={{fontSize:"15px",marginBottom:"3px"}}>일정을 작성해주세요.</h1>
                  {/* <p style={{fontSize:"11px", marginBottom:"10px"}}>*프로그램 최초 시작일 기준 1년내의 일저.</p> */}
                  <FormControlLabel control={<Switch checked={postValues.hasSchedule} onChange={(e)=>setPostValues({...postValues, hasSchedule: e.target.checked})} size="small" />} label="스케쥴 사용 여부" />
                  {postValues.hasSchedule && 
                    <>
                      <div style={{marginTop:"20px", marginBottom:"10px"}}>
                        <Button variant="contained" onClick={()=>{
                          if(calendar.colorValues)
                            setColorInput(calendar.colorValues);
                          setOpenScheduleBackdrop("editColor")
                        }}
                        size="small"
                        sx={{bgcolor:"rgb(0,125,0)"}}
                        >
                          컬러 타입 편집
                        </Button>
                      </div>
                      <Calendar events={calendar} setEvents={setCalendar} editable={true} hasAddScheduleButton={true} autoUrl={`https://dahanda.netlify.app/article/${team_id}/${file_id}`}/>
                    </>
                  }







                  <div className={styles.submit_content_item}>
                    <Button variant="contained" size="small" style={{fontSize:"13px"}} sx={{padding: "3px 5px !important", backgroundColor:"rgb(239, 123, 60)"}}
                      onClick={onApplyClick} disabled={postValues.condition==="waitingForConfirm" || postValues.condition==="confirm"}
                    >
                      {postValues.condition==="waitingForConfirm" ? "승인대기중" : "승인신청"}
                    </Button>
                    <p>{postValues.condition==="waitingForConfirm" ? "승인대기중입니다. 승인이 완료되면 자동으로 게재됩니다." :
                      postValues.condition==="confirm" ? "승인완료되었습니다." : "승인신청이 완료될때까지 어플에 업로드되지 않습니다."}</p>
                  </div>

                  {(userData.roles[1]==="super" || userData.roles[1]==="high") && postValues.condition==="waitingForConfirm" &&
                    <>
                      <div className={styles.reject_container}>
                        <Button variant="contained" size="small" sx={{backgroundColor:"rgb(176, 36, 36)"}} onClick={onRejectClick}>
                          승인 거절
                        </Button>
                        <TextField sx={{marginLeft:"15px", width:"500px"}} label="거절사유" size="small" multiline value={rejectText} onChange={(e)=>setRejectText(e.target.value)}/>
                      </div>

                      <div className={styles.submit_content_item}>
                      <Button variant="contained" size="small" sx={{backgroundColor:"rgb(45, 45, 179)"}} onClick={onConfirmClick}>
                          승인 및 게재
                        </Button>
                        <h5 style={{fontSize:"14px", marginLeft:"15px"}}>알림 보내기</h5>
                        <Switch checked={isSendAlarm} onChange={(e)=>setIsSendAlarm(e.target.checked)} size="small"/>
                        {isSendAlarm &&
                          <TextField value={alarmText} onChange={(e)=>setAlarmText(e.target.value)} size="small" style={{width:"350px", marginLeft:"10px"}} />
                        }
                      </div>
                    </>
                  }
                  {(userData.roles[1]==="super" || userData.roles[1]==="high") && postValues.condition==="confirm" && 
                    <div className={styles.submit_content_item}>
                      <Button variant="contained" size="small" sx={{backgroundColor:"rgb(176, 36, 36)"}} onClick={onCancelClick}>게재취소</Button>
                    </div>
                  }
                </div>
              }
              
            
              <div className={styles.button_container}>
                {step===0 ? <div className={styles.button}> </div> : <Button onClick={onPreviousClick}>이전</Button>}
                {step===2 ? <div className={styles.button}> </div> : <Button onClick={onPreviewClick}>미리보기</Button>}
                {step===2 ? <div className={styles.button}> </div> : <Button onClick={onNextClick}>다음</Button>}
              </div>
            </div>
          </div>


          <div className={styles.sub_content_container}>
            <SubContent />
          </div>
        </div>
      </div>


      <Dialog
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}
        onClose={()=>setOpenBackdrop(false)}
      >
        {/* <Backdrop open={true}> */}
         {step === 0  && 
          <div style={{width:"400px", height:"700px",backgroundColor:"white", overflow:"scroll", padding: "10px"}}>
            <Article data={postValues} teamName={team_id} id={file_id} type="programs" mode="preview" />
          </div>
        }
        {step === 1 && 
          <div style={{width:"400px", height:"700px", backgroundColor:"white", overflow:"scroll", padding: "10px"}}>
            <Form formDatas={postValues.formData} data={[]} handleData={()=>{}} addMargin={true} />
          </div>
        }
        {/* </Backdrop> */}
      </Dialog>


      <Dialog
        // sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openScheduleBackdrop==="editColor"}
        onClose={()=>setOpenScheduleBackdrop("")}
      >
        <div style={{backgroundColor:"white", padding: "20px 30px", borderRadius:"4px"}}>
          <h1>색깔에 따른 타입 지정</h1>
          <p style={{fontSize:"13px", marginTop:"3px"}}>{`*모든 "프로그램 스케쥴"에 동일적용됩니다.`}</p>
          <div className={styles.color_container}>
            <div className={`${styles.dot} ${styles.red}`} />
            <p>빨강: </p>
            <TextField variant="standard" value={colorInput.red} onChange={(e)=>onColorValueChange("red",e.target.value)}/>
          </div>
          <div className={styles.color_container}>
            <div className={`${styles.dot} ${styles.yellow}`} />
            <p>노랑: </p>
            <TextField variant="standard" value={colorInput.yellow} onChange={(e)=>onColorValueChange("yellow",e.target.value)}/>
          </div>
          <div className={styles.color_container}>
            <div className={`${styles.dot} ${styles.green}`} />
            <p>초록: </p>
            <TextField variant="standard" value={colorInput.green} onChange={(e)=>onColorValueChange("green",e.target.value)}/>
          </div>
          <div className={styles.color_container}>
            <div className={`${styles.dot} ${styles.blue}`} />
            <p>파랑: </p>
            <TextField variant="standard" value={colorInput.blue} onChange={(e)=>onColorValueChange("blue",e.target.value)}/>
          </div>
          <div className={styles.color_container}>
            <div className={`${styles.dot} ${styles.purple}`} />
            <p>보라: </p>
            <TextField variant="standard" value={colorInput.purple} onChange={(e)=>onColorValueChange("purple",e.target.value)}/>
          </div>
          <Button variant="contained" size="small" onClick={onColorSubmit} fullWidth sx={{mt:"20px"}}>저 장</Button>
        </div>
      </Dialog>

      <Dialog
        // sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openScheduleBackdrop==="addSchedule"}
        onClose={()=>setOpenScheduleBackdrop("")}
      >
        
      </Dialog>
    </>
  )
}

export default EditProgram