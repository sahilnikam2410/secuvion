import { useEffect, useState } from "react";

const cities = [
  { n: "New York", x: 20, y: 35 },
  { n: "London", x: 45, y: 25 },
  { n: "Moscow", x: 60, y: 25 },
  { n: "Mumbai", x: 67, y: 48 },
  { n: "Tokyo", x: 85, y: 35 },
  { n: "São Paulo", x: 30, y: 70 },
  { n: "Sydney", x: 90, y: 80 },
  { n: "Dubai", x: 60, y: 42 },
  { n: "Singapore", x: 78, y: 55 }
];

export default function AttackMap(){

const [attacks,setAttacks] = useState([]);

useEffect(()=>{

const addAttack = ()=>{

const from = cities[Math.floor(Math.random()*cities.length)];
const to = cities[Math.floor(Math.random()*cities.length)];

if(from.n===to.n) return;

setAttacks(a=>[
...a.slice(-8),
{
id:Date.now(),
from,
to
}
]);

};

const interval = setInterval(addAttack,1800);

addAttack();

return ()=>clearInterval(interval);

},[]);

return(

<div
style={{
width:"100%",
height:420,
position:"relative",
marginTop:30,
marginBottom:50,
background:"#06080c",
border:"1px solid rgba(0,255,200,0.08)",
overflow:"hidden"
}}
>

{/* WORLD MAP */}

<img
src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
style={{
position:"absolute",
width:"100%",
height:"100%",
objectFit:"cover",
opacity:0.15
}}
/>

{/* ATTACK SVG */}

<svg
viewBox="0 0 100 100"
style={{
position:"absolute",
width:"100%",
height:"100%"
}}
>

{attacks.map(a=>{

const path = `M ${a.from.x} ${a.from.y}
Q ${(a.from.x+a.to.x)/2} ${(a.from.y+a.to.y)/2 - 10}
${a.to.x} ${a.to.y}`;

return(

<g key={a.id}>

<path
d={path}
stroke="#ff3355"
strokeWidth="0.4"
fill="none"
opacity="0.7"
>

<animate
attributeName="opacity"
values="1;0"
dur="2.2s"
repeatCount="indefinite"
/>

</path>

<circle r="0.6" fill="#ff3355">

<animateMotion
dur="2.2s"
repeatCount="indefinite"
path={path}
/>

</circle>

</g>

);

})}

</svg>

{/* CITY NODES */}

{cities.map((c,i)=>(
<div
key={i}
style={{
position:"absolute",
left:`${c.x}%`,
top:`${c.y}%`,
transform:"translate(-50%,-50%)"
}}
>

<div
style={{
width:6,
height:6,
borderRadius:"50%",
background:"#00ffc8",
boxShadow:"0 0 10px #00ffc8",
animation:`pulse 2s infinite`
}}
/>

</div>
))}

</div>

);

}