export default function InterfaceCard({title, children}){

return(

<div
style={{
border:"1px solid rgba(0,255,208,0.25)",
background:"rgba(7,12,18,0.75)",
padding:"40px",
position:"relative"
}}
>

{/* label */}

<div
style={{
position:"absolute",
top:"-12px",
left:"18px",
background:"var(--bg)",
padding:"0 8px",
fontFamily:"var(--font-mono)",
fontSize:"11px",
letterSpacing:"3px",
color:"var(--cyan)"
}}
>
{title}
</div>

{children}

</div>

)

}