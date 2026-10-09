import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const OUTPUT=path.join(ROOT,"output"),FRAMES=path.join(OUTPUT,"frames"),HTML=path.join(ROOT,"index.html");
const args=process.argv.slice(2),preview=args.includes("--preview"),quality=args.includes("--quality"),check=args.includes("--check");
const WIDTH=1080,HEIGHT=1920,DURATION=30,FPS=preview?10:30;
const TARGET=path.join(OUTPUT,preview?"crousty-chips-preview.mp4":"crousty-chips.mp4");
function command(cmd,argv){const r=spawnSync(cmd,argv,{cwd:ROOT,encoding:"utf8",stdio:"inherit"});if(r.error)throw r.error;if(r.status!==0)throw new Error(`${cmd} a échoué : ${r.status}`)}
function available(cmd){return spawnSync(cmd,["-version"],{stdio:"ignore"}).status===0}
function assert(ok,message){if(!ok)throw new Error(message)}
async function main(){
 fs.mkdirSync(OUTPUT,{recursive:true});assert(fs.existsSync(HTML),"index.html introuvable.");assert(available("ffmpeg"),"FFmpeg doit être installé et accessible dans PATH.");
 if(check){console.log("Node.js :",process.version);console.log("OS :",os.platform(),os.arch());console.log("FFmpeg : disponible");console.log("FFprobe :",available("ffprobe")?"disponible":"absent");console.log("HTML :",HTML);return}
 fs.rmSync(FRAMES,{recursive:true,force:true});fs.mkdirSync(FRAMES,{recursive:true});let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--disable-dev-shm-usage","--no-sandbox","--enable-webgl","--ignore-gpu-blocklist"]});
  const page=await browser.newPage({viewport:{width:WIDTH,height:HEIGHT},deviceScaleFactor:1});
  page.on("pageerror",e=>console.error("[PAGE ERROR]",e.message));
  await page.goto(`file://${HTML.replaceAll("\\","/")}?render=1`,{waitUntil:"networkidle",timeout:120000});
  await page.waitForFunction(()=>typeof window.renderAt==="function");
  await page.evaluate(async()=>{if(document.fonts)await document.fonts.ready});
  const d=await page.evaluate(()=>({width:document.documentElement.clientWidth,height:document.documentElement.clientHeight,scenes:document.querySelectorAll(".scene").length}));
  assert(d.width===WIDTH&&d.height===HEIGHT,"Dimensions incorrectes.");assert(d.scenes===5,"Cinq scènes sont nécessaires.");console.log("Diagnostic :",d);
  const total=DURATION*FPS;
  for(let i=0;i<total;i++){await page.evaluate(t=>window.renderAt(t),i/FPS);await page.screenshot({path:path.join(FRAMES,`frame-${String(i).padStart(5,"0")}.png`),type:"png",timeout:30000});if(i%(FPS*2)===0)console.log(`Rendu : ${Math.floor(i/total*100)}%`)}
  await browser.close();browser=null;
  command("ffmpeg",["-hide_banner","-y","-framerate",String(FPS),"-start_number","0","-i",path.join(FRAMES,"frame-%05d.png"),"-t",String(DURATION),"-vf",`scale=${WIDTH}:${HEIGHT}:flags=lanczos,fps=30,format=yuv420p`,"-c:v","libx264","-preset",preview?"ultrafast":quality?"slow":"medium","-crf",preview?"30":quality?"16":"19","-profile:v","high","-level:v","4.2","-pix_fmt","yuv420p","-movflags","+faststart","-an",TARGET]);
  assert(fs.existsSync(TARGET),"Le MP4 n'a pas été créé.");const stat=fs.statSync(TARGET);assert(stat.size>10000,"Le fichier produit est trop petit.");
  console.log("MP4 créé :",TARGET);console.log("Taille :",`${(stat.size/1024/1024).toFixed(2)} Mo`);
  if(available("ffprobe")){const r=spawnSync("ffprobe",["-v","error","-select_streams","v:0","-show_entries","stream=codec_name,width,height,r_frame_rate,pix_fmt,duration","-of","default=noprint_wrappers=1",TARGET],{encoding:"utf8"});assert(r.status===0,"Échec de vérification FFprobe.");console.log("Vérification du fichier :\n"+r.stdout);fs.writeFileSync(path.join(OUTPUT,"video-report.txt"),r.stdout)}
 }finally{if(browser)await browser.close()}
}
main().catch(error=>{console.error("ERREUR :",error.message);process.exitCode=1});
