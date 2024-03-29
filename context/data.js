import { createContext, useState, useEffect, useContext } from "react";
import { firestore as db } from "firebase/firebase";

const dataContext = createContext()

export default function useData(){
    return useContext(dataContext)
}

export function DataProvider(props){
    const [user, setUser] = useState(null) //I'm
    const [userData, setUserData] = useState(null) //user data from db
    const [error, setError] = useState("")
    const [teamName, setTeamName] = useState("") //어드민 팀명
    const [teamId, setTeamId] = useState("") //어드민 팀 id


    const [userList, setUserList] = useState([]) //모든 유저 정보 한번만 불러오게 저장.
    const [userListCardData, setUserListCardData] = useState([])

    //for subcontent
    const [subContent, setSubContent] = useState({type:"index"})

    //team profile
    const [teamProfile, setTeamProfile] = useState("")

    //calendar [{colorValues:{red:"asdf", blue:"asdf"}, data: [{}] }]
    const [calendar, setCalendar] = useState()

    const [alarmType, setAlarmType] = useState([])

    //프로그램 스케쥴에 추가할 사용자지정 스케쥴 (프로그램에 포함되어있지 않은 스케쥴)
    const [programCustomSchedule, setProgramCustomSchedule] = useState()
    //프로그램 스케쥴들
    const [programSchedule, setProgramSchedule] = useState()

    useEffect(()=>{
        const fetchData = async() => {
            if(teamId!==""){
                db.collection("user").where("deleted","==",true).get().then((querySnapshot) => {
                    querySnapshot.docs.map((doc) => {
                      db.collection("user").doc(doc.id).delete()
                    })
                  })


                db.collection("team").doc(teamId).get().then((doc) => {
                    if(doc.exists){
                        setTeamProfile(doc.data().profile)
                        setTeamName(doc.data().teamName)
                    }

                })

                //fetching calendar
                db.collection("team_admin").doc(teamId).get().then((doc) => {
                    if(doc.exists && doc.data().calendar)
                        setCalendar(doc.data().calendar)
                    else
                        setCalendar({colorValues: {red:"",yellow:"",green:"",blue:"",purple:""}, data:[]})
                })


 
            }
        }
        fetchData() 
    },[teamId])

    const value = {
        user,
        userData,
        error,
        teamName,
        teamId,
        setTeamId,
        setTeamName,
        setError,
        setUser,
        setUserData,
        subContent,
        setSubContent,
        userList,
        setUserList,
        userListCardData,
        setUserListCardData,
        teamProfile,
        setTeamProfile,
        calendar,
        setCalendar,
        alarmType,
        setAlarmType,
        programCustomSchedule,
        setProgramCustomSchedule,
        programSchedule,
        setProgramSchedule
    }

    return <dataContext.Provider value={value} {...props} />
}