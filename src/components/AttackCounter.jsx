import {useState,useEffect} from "react";

export default function AttackCounter(){

const [count,setCount]=useState(2841029);

useEffect(()=>{

const i=setInterval(()=>{

setCount(c=>c+Math.floor(Math.random()*5))

},200)

return ()=>clearInterval(i)

},[])

return(

<div style={{
textAlign:"center",
padding:"40px",
background:"rgba(0,255,200,0.05)",
border:"1px solid rgba(0,255,200,0.2)"
}}>

<div style={{
fontFamily:"var(--mono)",
letterSpacing:4,
color:"#6b7f8e",
fontSize:12
}}>
GLOBAL ATTACKS BLOCKED
</div>

<div style={{
fontSize:48,
color:"#00ffc8",
fontWeight:700
}}>
{count.toLocaleString()}
</div>

</div>

)

}