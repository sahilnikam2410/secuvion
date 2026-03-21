export default function GlassDashboard(){

return(

<div style={{

backdropFilter:"blur(20px)",
background:"rgba(255,255,255,0.05)",
border:"1px solid rgba(255,255,255,0.1)",
borderRadius:20,
padding:40,
maxWidth:900,
margin:"auto"

}}>

<h2 style={{color:"#00ffc8"}}>Threat Overview</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:20,
marginTop:20
}}>

<div className="card">
<h3>Active Shields</h3>
<p>1,247,893</p>
</div>

<div className="card">
<h3>Threats Neutralized</h3>
<p>2841029</p>
</div>

<div className="card">
<h3>Protected Countries</h3>
<p>84</p>
</div>

</div>

</div>

)

}