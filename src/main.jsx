import React, {useEffect, useMemo, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {Stars, OrbitControls, Float, Sparkles, Text, Environment} from "@react-three/drei";
import {EffectComposer, Bloom, Vignette} from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";
import "./styles.css";

const story = [
 {key:"intro",chapter:"THE UNIVERSE AWAKENS",title:"Somewhere in this endless universe...",body:"There is a Moon.",button:"Find her ✨"},
 {key:"moon",chapter:"THE MOON",title:"Her name is Shailee.",body:"A Moon with a story, a laugh, and a universe of her own. Touch her world and look closer.",button:"Continue →"},
 {key:"venus",chapter:"VENUS",title:"And then there was Venus.",body:"His name is Andrew. She calls him Venus. And Venus has been searching for his Moon.",button:"Bring Venus closer ✨"},
 {key:"beginning",chapter:"THE BEGINNING",title:"Our story didn't begin in the stars.",body:"It began somewhere much more ordinary... with a badminton racket, a shuttle, and two people who didn't know what was coming.",button:"Enter the memory 🏸"},
 {key:"badminton",chapter:"THE FIRST CHAPTER",title:"The first flight.",body:"This is where it started. A game of badminton. One small moment that quietly became part of our story.",button:"Continue →"},
 {key:"question",chapter:"A MEMORY",title:"Then came a question.",body:"One day, the Moon asked Venus what she should take in Class 9.",button:"Choose for the Moon"},
 {key:"storms",chapter:"THE STORMS",title:"Every real story has storms.",body:"We faced challenges. More than once, we came close to losing our orbit. But somehow, we found our way back.",button:"Rebuild the constellation ✨"},
 {key:"voice",chapter:"A MESSAGE FROM VENUS",title:"Listen, Moon.",body:"The universe is quiet now. Venus has something to tell you.",button:"Continue →"},
 {key:"proposal",chapter:"THE QUESTION",title:"Shailee...",body:"I'm Andrew. Your Venus. And you're my Moon.",button:""},
];

function StarsField(){
 const group=useRef();
 useFrame((s)=>{if(group.current)group.current.rotation.y=s.clock.elapsedTime*.008;});
 return <group ref={group}><Stars radius={90} depth={55} count={4500} factor={3} saturation={0} fade speed={.35}/><Sparkles count={300} scale={[35,20,35]} size={1.5} speed={.3} opacity={.6}/></group>
}

function Moon({active,onTouch}){
 const ref=useRef(); const [hover,setHover]=useState(false);
 useFrame((s)=>{
  if(ref.current){
   ref.current.rotation.y+=.0018;
   ref.current.rotation.x=Math.sin(s.clock.elapsedTime*.25)*.015;
   const target=hover?1.08:1;
   ref.current.scale.lerp(new THREE.Vector3(target,target,target),.08)
  }
 });
 return <group ref={ref} onPointerOver={()=>setHover(true)} onPointerOut={()=>setHover(false)} onClick={onTouch} visible={active}>
   <mesh castShadow receiveShadow>
    <sphereGeometry args={[1.65,96,96]}/>
    <meshStandardMaterial color="#cfd1dc" roughness={.92} metalness={0}/>
   </mesh>
   <mesh scale={1.012}>
    <sphereGeometry args={[1.65,64,64]}/>
    <meshBasicMaterial color="#b8b9c5" wireframe transparent opacity={.025}/>
   </mesh>
   <pointLight intensity={hover?3.8:2.2} distance={10} color="#d8d7ff"/>
 </group>
}

function Venus({active,position,setPosition}){
 const ref=useRef(); const [drag,setDrag]=useState(false);
 useFrame((s)=>{
  if(ref.current){
   ref.current.rotation.y+=.012;
   ref.current.position.lerp(new THREE.Vector3(...position),.08)
  }
 });
 return <group ref={ref} visible={active} position={position}
  onPointerDown={(e)=>{e.stopPropagation();setDrag(true);}}
  onPointerUp={()=>setDrag(false)}
  onPointerMove={(e)=>{
   if(drag){
    e.stopPropagation();
    setPosition([e.point.x,e.point.y,e.point.z])
   }
  }}>
  <mesh castShadow>
   <sphereGeometry args={[.58,64,64]}/>
   <meshStandardMaterial color="#d86d56" roughness={.48} metalness={.12} emissive="#481c30" emissiveIntensity={.18}/>
  </mesh>
  <mesh scale={1.25}>
   <sphereGeometry args={[.58,32,32]}/>
   <meshBasicMaterial color="#ffad8b" transparent opacity={.08}/>
  </mesh>
  <pointLight color="#ff9b7c" intensity={2.4} distance={7}/>
 </group>
}

function BadmintonScene({active,onHit}){
 const [hit,setHit]=useState(false);
 return <group visible={active}>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-2,0]}>
   <planeGeometry args={[18,10]}/>
   <meshStandardMaterial color="#12353c" roughness={.8}/>
  </mesh>

  <mesh position={[0,0,0]}>
   <boxGeometry args={[.05,4,7]}/>
   <meshStandardMaterial color="#e6e8ef" emissive="#8fdcff" emissiveIntensity={.2}/>
  </mesh>

  <Float speed={2} rotationIntensity={.2} floatIntensity={.4}>
   <mesh
    position={[hit?2:-2,1,0]}
    onClick={()=>{
     setHit(true);
     onHit?.()
    }}
   >
    <coneGeometry args={[.28,.75,20]}/>
    <meshStandardMaterial color="#f5f5fa" emissive="#bfe8ff" emissiveIntensity={.5}/>
   </mesh>
  </Float>

  <Text position={[0,2.5,-1]} fontSize={.32} color="#ffffff" anchorX="center">
   THE DAY OUR STORY STARTED
  </Text>
 </group>
}

function Constellation({active,onComplete}){
 const points=useMemo(
  ()=>Array.from(
   {length:14},
   (_,i)=>{
    const a=i/14*Math.PI*2;
    return [
     Math.cos(a)*3.4,
     Math.sin(a)*1.8,
     .2*Math.sin(i)
    ]
   }
  ),
  []
 );

 const [found,setFound]=useState([]);

 useEffect(()=>{
  if(found.length===points.length)onComplete?.()
 },[found,points.length,onComplete]);

 return <group visible={active}>
  {points.map((p,i)=>
   <mesh
    key={i}
    position={p}
    onClick={()=>
     !found.includes(i)&&setFound(v=>[...v,i])
    }
   >
    <sphereGeometry args={[found.includes(i)?.11:.17,20,20]}/>
    <meshBasicMaterial
     color={found.includes(i)?"#ffd7f0":"#ffffff"}
     transparent
     opacity={found.includes(i)?1:.55}
    />
   </mesh>
  )}

  {found.length>1&&found.map((i,j)=>
   j>0?
   <line key={"l"+j}>
    <bufferGeometry>
     <bufferAttribute
      attach="attributes-position"
      count={2}
      array={
       new Float32Array([
        ...points[found[j-1]],
        ...points[i]
       ])
      }
      itemSize={3}
     />
    </bufferGeometry>
    <lineBasicMaterial
     color="#d8c7ff"
     transparent
     opacity={.55}
    />
   </line>
   :null
  )}
 </group>
}

function CameraRig({phase,venusPos}){
 const {camera}=useThree();

 useEffect(()=>{
  const targets=[
   {p:[0,0,9],l:[0,0,0]},
   {p:[0,.3,7],l:[0,0,0]},
   {p:[0,0,10],l:[0,0,0]},
   {p:[0,-.2,11],l:[0,0,0]},
   {p:[0,1,9],l:[0,0,0]},
   {p:[0,0,10],l:[0,0,0]},
   {p:[0,.2,11],l:[0,0,0]},
   {p:[0,0,9],l:[0,0,0]},
   {p:[0,0,7],l:[0,0,0]}
  ][phase]||[0,0,9];

  gsap.to(camera.position,{
   x:targets.p[0],
   y:targets.p[1],
   z:targets.p[2],
   duration:1.6,
   ease:"power3.inOut"
  });
 },[phase,camera]);

 useFrame(()=>camera.lookAt(0,0,0));

 return null;
}

function App(){
 const [started,setStarted]=useState(false),
 [phase,setPhase]=useState(0),
 [choice,setChoice]=useState(
  ()=>localStorage.getItem("moonVenusChoice")||""
 ),
 [discoveries,setDiscoveries]=useState(
  ()=>Number(localStorage.getItem("moonVenusDiscoveries")||0)
 ),
 [venusPos,setVenusPos]=useState([4,0,0]),
 [noCount,setNoCount]=useState(0),
 [reduced,setReduced]=useState(false),
 [celebrate,setCelebrate]=useState(false);

 const p=story[phase];

 const remember=(n=1)=>
  setDiscoveries(v=>{
   const x=v+n;
   localStorage.setItem("moonVenusDiscoveries",x);
   return x;
  });

 const choose=(v)=>{
  setChoice(v);
  localStorage.setItem("moonVenusChoice",v);
  remember();
  setPhase(6);
 };

 const advance=()=>{
  if(phase===2){
   setPhase(3)
  }else if(phase===5){
   return
  }else if(phase<7){
   setPhase(phase+1)
  }else{
   setPhase(8)
  }
 };

 return <div className={reduced?"app reduced":"app"}>

  {!started&&
   <div className="splash">
    <div className="splashMoon">🌙</div>
    <div className="kicker">A universe made for one Moon</div>
    <h1>Somewhere in this endless universe...</h1>
    <p>There is a story waiting for you.</p>
    <button onClick={()=>setStarted(true)}>
     Touch to enter the universe ✨
    </button>
   </div>
  }

  <Canvas
   camera={{position:[0,0,9],fov:50}}
   dpr={[1,2]}
   gl={{antialias:true,alpha:false}}
  >
   <color attach="background" args={["#02030a"]}/>
   <fog attach="fog" args={["#02030a",20,80]}/>

   <ambientLight intensity={.25}/>
   <directionalLight position={[5,5,5]} intensity={2}/>

   <StarsField/>
   <Environment preset="night"/>

   <CameraRig phase={phase} venusPos={venusPos}/>

   <Moon
    active={started&&phase<=2}
    onTouch={()=>remember(1)}
   />

   <Venus
    active={started&&phase===2}
    position={venusPos}
    setPosition={setVenusPos}
   />

   <BadmintonScene
    active={started&&(phase===3||phase===4)}
    onHit={()=>remember(1)}
   />

   <Constellation
    active={started&&phase===6}
    onComplete={()=>remember(3)}
   />

   <EffectComposer enabled={!reduced}>
    <Bloom
     intensity={1.25}
     luminanceThreshold={.35}
     luminanceSmoothing={.8}
    />
    <Vignette darkness={.7}/>
   </EffectComposer>
  </Canvas>

  {started&&
   <>
    <div className="hud">
     <div className="bar">
      <span style={{width:`${phase/8*100}%`}}/>
     </div>
     <div className="chapter">{p.chapter}</div>
    </div>

    <div className="memory">
     Moon Memory: {discoveries} discoveries
     {choice?` • ${choice} saved`:``}
    </div>

    <div className="panel">
     <div className="kicker">{p.chapter}</div>
     <h2>{p.title}</h2>
     <p>{p.body}</p>

     {phase===5?
      <div className="choices">
       <button onClick={()=>choose("AI")}>🤖 AI</button>
       <button onClick={()=>choose("IT")}>💻 IT</button>
      </div>
     :
      phase===8?
      <Proposal
       noCount={noCount}
       setNoCount={setNoCount}
       onYes={()=>{
        setCelebrate(true);
        setTimeout(()=>{},100)
       }}
      />
      :
      <button onClick={advance}>{p.button}</button>
     }
    </div>

    <button
     className="motion"
     onClick={()=>setReduced(v=>!v)}
    >
     Reduced motion: {reduced?"ON":"OFF"}
    </button>

    {celebrate&&
     <div className="celebrate">
      <div>✨ 🌙 ✨</div>
      <h1>THE MOON CHOSE VENUS</h1>
      <h2>SHAILEE × ANDREW</h2>
      <p>Different worlds. One orbit. One universe.</p>
     </div>
    }
   </>
  }

 </div>
}

function Proposal({noCount,setNoCount,onYes}){
 const playful=[
  "NO 😈",
  "Are you sure? 👀",
  "Wait... really?",
  "Venus is nervous 😭",
  "The Moon is escaping!",
  "Catch me if you can!"
 ];

 const runaway=noCount<5;

 return <div className="proposal">
  <div className="kicker">FROM VENUS TO HIS MOON</div>

  <p>I'm Andrew.</p>
  <h3>Your Venus.</h3>
  <p>And you're my Moon.</p>

  <h2>Will you be mine?</h2>

  <div className="proposalButtons">
   <button className="yes" onClick={onYes}>
    YES, VENUS ✨
   </button>

   {runaway?
    <button
     className="no"
     style={{
      transform:
       `translate(${Math.sin(noCount*2.3)*120}px,${Math.cos(noCount*1.7)*35}px)`
     }}
     onClick={()=>setNoCount(v=>v+1)}
    
     {playful[noCount]}
    </button>
    :
    <button
     className="no"
     onClick={()=>
       alert("Your choice is respected. Always. 🌙")
     }
    >
     NO — I really mean it
    </button>
   }
  </div>
 </div>
}

createRoot(document.getElementById("root")).render(<App/>);
