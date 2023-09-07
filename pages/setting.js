import { TextField, Button } from "@mui/material"
import { useState, useEffect } from "react"
import { firestore as db } from "firebase/firebase"
import { useRouter } from "next/router";

function joinWithDoubleSlash(arr) {
    if (!Array.isArray(arr)) {
      throw new Error("Input is not an array.");
    }
    return arr.join("//");
  }
  

const Newteam = () => {
    const router = useRouter()
    const [values, setValues] = useState({
        id: "",
        name: "",
        uid: "",
        teamLocation:"",
        location:""
    })
    const [locationList, setLocationList] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const doc = await db.collection("setting").doc("location").get()
            if(doc.exists){
                setLocationList(doc.data().data)
                setValues({...values, location: joinWithDoubleSlash(doc.data().data)})
            }
        }
        fetchData()
    },[])


    const onValuesChange = (prop) => (event) => {
        setValues({...values, [prop]: event.target.value})
    }

    const onAddClick = async() => {
        if(values.id!=="" && values.name!=="" && values.uid!==""){
            if(!locationList.includes(values.teamLocation)){
                alert("없는 지역입니다. 지역을 추가한 후 다시 시도해주세요.")
                return
            }
            db.collection("team_admin").doc(values.id).get().then(async(doc)=>{
                if(doc.exists){
                    alert("이미 있는 팀ID입니다.")
                } else{
                    await db.collection("team").doc(values.id).set({
                        id: values.id,
                        teamName: values.name,
                        profile: "/logo_purple_bg.png",
                        location: values.teamLocation
                    })
                    db.collection("team_admin").doc(values.id).set({
                        id: values.id,
                        teamName: values.name,
                        users: [values.uid]
                    }).then(()=>{
                        db.collection("user").doc(values.uid).get().then((doc2)=>{
                            if(doc2.exists){
                                db.collection("user").doc(values.uid).update({roles: [`admin_${values.id}`, `super`]}).then(()=>{
                                    alert("추가되었습니다.")
                                })
                            }else{
                                alert("없는 UID입니다")
                            }
                        })
                        
                    })
                }
            })
        }
    }

    const onSaveLocationClick = () => {
        const list_temp = values.location.split("//")
        if(list_temp){
            db.collection("setting").doc("location").set({data: list_temp}).then(()=> {
                setLocationList(list_temp)
                alert("성공적으로 적용되었습니다.")
            })
        }
    }

    return(
        <>
        <div style={{padding: "20px"}}>
            <TextField id="1" label="팀ID" variant="standard"
                value={values.id} onChange={onValuesChange("id")}
                fullWidth
            />
            <TextField id="2" label="팀명" variant="standard"
                value={values.name} onChange={onValuesChange("name")}
                fullWidth
            />
            <TextField id="3" label="UID" variant="standard"
                value={values.uid} onChange={onValuesChange("uid")}
                fullWidth
            />
            <TextField id="4" label="지역" variant="standard"
                value={values.teamLocation} onChange={onValuesChange("teamLocation")}
                fullWidth
                helperText="팀이 위치한 지역을 입력해주세요. 등록되어 있는 지역이여야 합니다."
            />
            <Button onClick={onAddClick}>팀 추가</Button>

            <div style={{margin:"20px 0 40px 0"}}>
                <TextField
                  label="지역"
                  variant="standard"
                  placeholder="수원시//안산시//..."
                  value={values.location}
                  fullWidth
                  onChange={onValuesChange("location")}
                  size="small"
                  helperText="지역명//지역명//지역명//... 형식으로 입력해주세요."
                />
                <Button onClick={onSaveLocationClick}>지역 저장</Button>
            </div>

            <Button onClick={()=>router.push("/request")}>제휴 승인관리로 이동</Button>
        </div>
        </>
    )
}

export default Newteam