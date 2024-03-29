import { useEffect, useState } from "react"
import styles from "../styles/comments.module.css"
import { useRouter } from "next/router"

import useData from "context/data"
import { firestore as db } from "firebase/firebase"

import PercentageRadial from "./PercentageRadial"

import Rating from '@mui/material/Rating';
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField';
import { Button } from "@mui/material"

const Comments = ({uid}) => {
  const router = useRouter()
  const { userData, teamId, user } = useData()
  const [inputRate, setInputRate] = useState(5)
  const [inputComment, setInputComment] = useState("")
  const [triggerReload, setTriggerReload] = useState(true)
  const [percentageData, setPercentageData] = useState({
    percentage: 0,
    title:`프로그램 중 0개 참여, 0개 미참여`,
    subtitle:"프로그램 참여율"
  })
  const [rateData, setRateData] = useState({
    percentage: 0,
    title:`총 0개의 평가`,
    subtitle:"평점"
  })
  const [comments, setComments] = useState([
    // {
    //     rate: 4,
    //     text: "asdfasdfasdf",
    //     author:"asdf"
    // },
    // {
    //     rate: 3,
    //     text: "laskjdfladskjfladskjf",
    //     author:"qwer"
    // }
  ])

  useEffect(() => {
    const fetchData = async () => {
      const doc = await db.collection("team_admin").doc(teamId).collection("users").doc(uid).get()
      if(doc.exists){
        let hasPart = 0
        let hasNotPart = 0
        if(doc.data().hasNotPart)
          hasNotPart = doc.data().hasNotPart
        if(doc.data().hasPart)
          hasPart = doc.data().hasPart

        let percent = (hasPart/(hasPart+hasNotPart)*100).toFixed(1)

        if(typeof percent === "string")
          percent = 0

        setPercentageData({
            ...percentageData,
            title:`프로그램 중 ${hasPart}개 참여, ${hasNotPart}개 미참여`,
            percentage: percent
        })
      }
      let tempComments = []
      if(doc.exists){
        db.collection("team_admin").doc(teamId).collection("users").doc(uid).collection("comment").orderBy("createdAt","desc").get().then((query)=>{
            query.forEach((item)=>{
                tempComments.push({...item.data(), docId: item.id })
            })
            setComments([...tempComments])

            //get rate
            let totalRate = 0
            for(let i = 0; i<tempComments.length; i++){
              totalRate = totalRate+tempComments[i].rate
            }
            console.log(tempComments)
            const rate = (totalRate/(tempComments.length)*20).toFixed(1)
            setRateData({
              ...rateData,
                title:`총 ${tempComments.length}개의 평가`,
                percentage: rate
            })
        })
      }
    }
    fetchData()
  }, [triggerReload])

  const onSubmitClick = async() => {
    if(inputComment==="" || inputComment===" "){
        alert("메모는 빈칸일 수 없습니다.")
    } else{
      await db.collection("team_admin").doc(teamId).collection("users").doc(uid).collection("comment").add({
        author: userData.displayName,
        createdAt: new Date(),
        text: inputComment,
        rate: inputRate,
        authorUid: user.uid
      })
      setInputComment("")
      setInputRate("")
      setTimeout(()=>{

      },500)
      setTriggerReload(!triggerReload)
    }
  }

  const onDeleteClick = async (docId) => {
    if(confirm("해당 평가를 삭제하시겠습니까?")){
      await db.collection("team_admin").doc(teamId).collection("users").doc(uid).collection("comment").doc(docId).delete()
      alert("삭제되었습니다")
      setTriggerReload(!triggerReload)
    }
  }
  return (
    <Card>
      <CardContent>
        <div className={styles.percentage_container}>
            <PercentageRadial data={percentageData} />
            <div style={{padding:"0 5px"}}/>
            <PercentageRadial data={rateData} />
        </div>
        <Card>
        <CardContent className={styles.comments_container}>
            <h1 className={styles.title}>유저 평가</h1>
            {comments.map((comment, index)=>{
                return(
                    <div key={index} className={styles.comment_container}>
                        <Rating
                            name="simple-controlled"
                            value={comment.rate}
                            size="small"
                        />
                        <h1>
                          {`${comment.createdAt.toDate().toLocaleString('ko-KR').replace(/\s/g, '')} `}
                          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                          {`작성자: ${comment.author}`}
                          {comment.authorUid === user.uid &&
                            <div className={styles.delete_button} onClick={()=>onDeleteClick(comment.docId)}>삭제</div>
                          }
                        </h1>
                        <h1>
                            
                        </h1>
                        <h1>
                            
                        </h1>
                        <h2>
                            {comment.text}
                        </h2>
                    </div>
                )
            })}
            <div className={styles.input_container}>
                <div className={styles.head}>
                    <Rating
                        name="simple-controlled"
                        value={inputRate}
                        onChange={(event, newValue) => {
                        setInputRate(newValue);
                        }}
                    />
                    <Button onClick={onSubmitClick}>제출</Button>
                </div>
                <TextField
                id="standard-multiline-static"
                label="유저 평가"
                multiline
                fullWidth
                rows={4}
                value={inputComment}
                onChange={(e)=>setInputComment(e.target.value)}
                variant="standard"
                />
            </div>
        </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default Comments