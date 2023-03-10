// ** React Imports
import { useState, useEffect } from 'react'

import useData from 'context/data'
import { firestore as db } from 'firebase/firebase'
import styles from "../styles/section.module.css"

import SortableComponent from 'src/public/components/SortableComponent'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import AvatarGroup from '@mui/material/AvatarGroup'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog' 
import PageHeader from 'src/public/components/PageHeader'
import { TextField } from '@mui/material'
import { SeatIndividualSuite } from 'mdi-material-ui'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';


const Section = ({mode}) => {
  const {teamId} = useData()
  const [items, setItems] = useState([])
  const [components, setComponents] = useState([])
  const [value, setValue] = useState("")
  const [isOpenDialog, setIsOpenDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(()=>{
    const fetchData = async () => {
      console.log(teamId)
      setIsLoading(true)
      let tempItems = []
      const doc = await db.collection("team").doc(teamId).collection("section").doc(mode).get()
      if(doc.exists){
        setItems(doc.data().data)
        tempItems=doc.data().data
      } else{
        setItems([])
      }
      let temp = []
      for (let i =0 ; i<tempItems.length; i++){
        temp.push(renderComponent(tempItems[i]))
      }
      setComponents([...temp])
      setIsLoading(false)
    }
    fetchData()
  },[mode])


  useEffect(()=>{
    console.log(items)
  },[items])

  const onAddSectionClick = () => {
      setDialogMode("add")
      setIsOpenDialog(true)
  }
  const onAddClick = async() => {
    for(const item of items){
      if(item.name===value){
        alert("?????? ?????? ??????????????????.")
        setIsLoading(false)
        return
      }
    }
    if(value==="" || value===" "){
      alert("????????? ????????? ??? ????????????.")
      return
    }
 
    const doc = await db.collection("team").doc(teamId).collection("section").doc().get()
    const tempItems = [...items, {name: value, id: doc.id, createdAt: new Date().toLocaleDateString()}]
    setItems([...tempItems])
    let temp = []
    for (let i =0 ; i<tempItems.length; i++){
      temp.push(renderComponent(tempItems[i]))
    }
    setComponents([...temp])
    setIsOpenDialog(false)
    setValue("")
  }

  const onDeleteSectionClick = () => {
    setDialogMode("delete")
    setIsOpenDialog(true)
  }
  const onDeleteClick = () => {
    let hasItem = false
    let temp =[]
    let temp2 = []
    for(const item of items){
      if(item.name===value)
        hasItem = true
      else{
        temp.push(item)
        temp2.push(renderComponent(item))
      }
    }
    if(hasItem){
      if(!confirm("????????? ?????????????????????????"))
        return
      setItems([...temp])
      setComponents([...temp2])
      setValue("")
      setIsOpenDialog(false)
    }else
      alert("???????????? ???????????? ????????????.")
  }


  const renderComponent = (data) => {
    return(
      <div className={styles.item}>
        <h1>{data.name}</h1>
        <p>????????? : {data.createdAt}</p>
      </div>
    )
  }

  const onSubmitClick = () => {
    if(confirm("?????? ????????? ????????????????????????? (?????? ?????? ????????? ???????????????.)")){
      db.collection("team").doc(teamId).collection("section").doc(mode).set({
        data: items
      }).then(()=>{
        alert("?????????????????????.")
      })
    }
  }

  if(isLoading)
    return(<></>)

  return(
    <>
      <Grid container spacing={3} className='match-height'>


        <Grid item xs={14} sm={6} lg={6}>
          <Card
            sx={{ cursor: 'pointer', height: "125px" }}
          >
            <Grid container sx={{ height: '100%' }}>
              <Grid item xs={5}>
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <img width={65} height={120} alt='add-role' src='/david_standing.png' />
                </Box>
              </Grid>
              <Grid item xs={7}>
                <CardContent>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography style={{wordBreak: "keep-all"}}>?????? ?????? ??????</Typography>
                  </Box>
                  <Box sx={{textAlign:'right', mt: "10px"}}>
                    <h1 style={{fontSize:"30px"}}>{`${items.length}???`}</h1>
                  </Box>
                </CardContent>
              </Grid>
              
            </Grid>
          </Card>
        </Grid>


        <Grid item xs={14} sm={6} lg={6}>
          <Card
            sx={{ cursor: 'pointer', height: "125px" }}
            onClick={() => {
              onAddSectionClick()
            }}
          >
            <Grid container sx={{ height: '100%' }}>
              <Grid item xs={5}>
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <img width={65} height={120} alt='add-role' src='/john_standing.png' />
                </Box>
              </Grid>
              <Grid item xs={7}>
                <CardContent>
                  <Box sx={{ textAlign: 'right' }}>
                    <Button
                      variant='contained'
                      sx={{ mb: 1, whiteSpace: 'nowrap' }}
                      onClick={() => {
                        onAddSectionClick()
                      }}
                    >
                      ?????? ??????
                    </Button>
                    <Typography style={{wordBreak: "keep-all"}}>????????? ???????????????.</Typography>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Grid>


        <Grid item xs={14} sm={6} lg={6}>
          <Card
            sx={{ cursor: 'pointer', height: "125px" }}
            onClick={() => {
              onDeleteSectionClick()
            }}
          >
            <Grid container sx={{ height: '100%' }}>
              <Grid item xs={5}>
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <img width={65} height={120} alt='add-role' src='/john_standing.png' />
                </Box>
              </Grid>
              <Grid item xs={7}>
                <CardContent>
                  <Box sx={{ textAlign: 'right' }}>
                    <Button
                      variant='contained'
                      sx={{ mb: 1, whiteSpace: 'nowrap', backgroundColor:"rgb(133, 34, 25)" }}
                      onClick={() => {
                        onDeleteSectionClick()
                      }}
                    >
                      ?????? ??????
                    </Button>
                    <Typography style={{wordBreak: "keep-all"}}>????????? ???????????????.</Typography>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Grid>



      </Grid>


      <PageHeader title={mode==="program" ? "???????????? ??????": "???????????? ??????"}subtitle="" mt="40px"/>

      <SortableComponent items={items} setItems={setItems}
        components={components} setComponents={setComponents} mode="y" ulStyle={{ width: "100%" }} pressDelay={150} />
      <div className={styles.button_container}>
        <Button variant="contained" onClick={onSubmitClick}>??????</Button>
      </div>

      <Dialog open={isOpenDialog} onClose={()=>setIsOpenDialog(false)}>
        {dialogMode==="add" &&
          <div className={styles.dialog_container}>
            <h1>????????? ???????????? ??????????????????</h1>
            <TextField variant="standard" value={value} onChange={(e)=>setValue(e.target.value)}/>
            <Button onClick={onAddClick}>??????</Button>
          </div>
        }
        {dialogMode==="delete" &&
          <div className={styles.dialog_container}>
            <h1>????????? ???????????? ??????????????????</h1>
            <TextField variant="standard" value={value} onChange={(e)=>setValue(e.target.value)}/>
            <Button onClick={onDeleteClick}>??????</Button>
          </div>
        }
      </Dialog>

    </>
  )
}

export default Section