(() => {
"use strict";
const $ = id => document.getElementById(id);
const cards = [...document.querySelectorAll(".activity-card")];
const labels = {sequence:["Number sequence","MEMORY EXERCISE"],stroop:["Colour focus","ATTENTION EXERCISE"],words:["Word recall","RECALL EXERCISE"],shape:["Shape memory","VISUAL MEMORY"],grid:["Pattern grid","PATTERN EXERCISE"],math:["Quick Maths","PROCESSING EXERCISE"],oddone:["Odd One Out","LOGIC EXERCISE"],sequencepattern:["Pattern Detective","REASONING EXERCISE"],react:["Reaction time","REACTION EXERCISE"]};
const colours=[{name:"Red",hex:"#d93b48"},{name:"Blue",hex:"#2775c9"},{name:"Green",hex:"#25835d"},{name:"Orange",hex:"#c86b14"},{name:"Purple",hex:"#7b4fd6"},{name:"Teal",hex:"#13877f"},{name:"Pink",hex:"#c2407f"},{name:"Brown",hex:"#7a5230"}];
const SHAPES=[{s:"◆",n:"diamond"},{s:"●",n:"circle"},{s:"▲",n:"triangle"},{s:"■",n:"square"},{s:"★",n:"star"},{s:"✚",n:"cross"},{s:"♥",n:"heart"},{s:"⬡",n:"hexagon"}];
const DIGITS="0123456789".split("");
const WORDS=["garden","planet","pencil","window","river","silver","pillow","candle","bridge","orange","forest","button","mountain","basket","lantern","compass","puzzle","thunder","blanket","feather","marble","harbor","jungle","kitchen","ladder","magnet","needle","oyster","parrot","rabbit","saddle","tunnel","umbrella","velvet","walnut","yogurt","zipper","anchor","bottle","camera","dragon","engine","falcon","glacier","helmet","island","jacket","kettle","lemon","meadow","napkin","ribbon","saucer","timber","violin","wallet","cactus","canyon","pepper","rocket","shadow","tiger","acorn","anvil","apricot","arrow","autumn","badge","balloon","bamboo","barrel","beacon","beetle","biscuit","blossom","boulder","breeze","bucket","cabin","cannon","carpet","cherry","cinnamon","clover","cobweb","comet","copper","crystal","cupboard","dagger","dandelion","diamond","donkey","dragonfly","eagle","emerald","envelope","fabric","fountain","gravel","hammock","hazel","honey","horizon","hurricane","icicle","iguana","ivory","jasmine","jigsaw","jersey","kangaroo","kayak","lagoon","lavender","lettuce","lighthouse","lobster","locket","maple","mosaic","muffin","nebula","nectar","nickel","nutmeg","obsidian","octopus","olive","onion","orchard","otter","paddle","pancake","panda","pebble","pelican","pickle","pigeon","pinecone","plum","poppy","pretzel","pumpkin","quail","quilt","raisin","raven","saffron","sailor","sapphire","scarecrow","sesame","sparrow","spinach","squirrel","starfish","sunflower","swallow","tadpole","tangerine","tapestry","teapot","thistle","thimble","tomato","trumpet","tulip","turnip","turtle","vanilla","vine","walrus","wicker","willow","wizard","yacht","zebra"];
const wordBank=WORDS;
let selected="sequence",answered=0,correct=0,completed=0,focusMinutes=0,locked=false,timerInterval=null,timerRemaining=300,timerTotal=300,timerRunning=false,toastTimeout=null;
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function rand(n){return Math.floor(Math.random()*n)}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function level(){return $("difficulty").value==="easy"?0:$("difficulty").value==="hard"?2:1}
function say(msg){$("feedback").textContent=msg}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove("show"),2600)}
function safeNickname(){return $("nickname").value.trim().replace(/[<>]/g,"").slice(0,24)}
function setGame(html){$("gameStage").innerHTML=html}
function updateStats(){
 $("activitiesStat").textContent=completed;$("accuracyStat").textContent=answered?`${Math.round(correct/answered*100)}%`:"—";
 $("focusStat").textContent=focusMinutes;$("journalStat").textContent=loadJournal().length;
 $("correctLabel").textContent=correct;$("incorrectLabel").textContent=answered-correct;
 const max=Math.max(answered,1);$("correctBar").style.width=`${correct/max*100}%`;$("incorrectBar").style.width=`${(answered-correct)/max*100}%`;
}
function loadJournal(){try{return JSON.parse(localStorage.getItem("cognisense-journal")||"[]")}catch{return []}}
function saveJournal(items){try{localStorage.setItem("cognisense-journal",JSON.stringify(items));return true}catch{toast("Browser storage is unavailable. Your note could not be saved.");return false}}
function updateName(){const name=safeNickname();$("welcomeTitle").innerHTML=`Welcome${name?", "+escapeHTML(name):" back, curious mind"} <span>✦</span>`;$("avatarText");const initial=name?name[0].toUpperCase():"A";$("profileButton").textContent=initial}
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("nickname").addEventListener("input",updateName);
$("editName").addEventListener("click",()=>{$("nickname").focus();$("nickname").scrollIntoView({behavior:reduced?"auto":"smooth",block:"center"})});
$("profileButton").addEventListener("click",()=>{$("nickname").focus();$("nickname").scrollIntoView({behavior:reduced?"auto":"smooth",block:"center"})});
cards.forEach(card=>card.addEventListener("click",()=>{selected=card.dataset.game;cards.forEach(c=>{let on=c===card;c.classList.toggle("selected",on);c.setAttribute("aria-pressed",String(on))});$("gameTitle").textContent=labels[selected][0];$("gameCategory").textContent=labels[selected][1];$("roundPill").textContent="READY";setGame(`<div class="empty-state"><div class="empty-icon" aria-hidden="true">✦</div><h3>${labels[selected][0]}</h3><p>Set your difficulty and press <strong>Start activity</strong>.</p></div>`);say("Your feedback will appear here.");document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.getAttribute("href")==="#activities"))}));
$("contrastToggle").addEventListener("click",e=>{const on=document.body.classList.toggle("high-contrast");e.currentTarget.setAttribute("aria-pressed",String(on));e.currentTarget.innerHTML=on?"◐ &nbsp; Standard contrast":"◐ &nbsp; High contrast"});
$("menuToggle").addEventListener("click",()=>{const open=$("sidebar").classList.toggle("open");$("menuToggle").setAttribute("aria-expanded",String(open))});
document.querySelectorAll(".nav-item").forEach(a=>a.addEventListener("click",()=>{document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n===a));$("pageName").textContent=a.textContent.trim();$("sidebar").classList.remove("open");$("menuToggle").setAttribute("aria-expanded","false")}));
function startRound(){roundToken++;locked=false;$("roundPill").textContent="IN PROGRESS";$("gameTitle").textContent=labels[selected][0];$("gameCategory").textContent=labels[selected][1];say(`Good luck${safeNickname()?", "+safeNickname():""}! Take your time.`);({sequence:startSequence,stroop:startStroop,words:startWords,shape:startShape,grid:startGrid,math:startMath,oddone:startOddOne,sequencepattern:startPatternDetective,react:startReact})[selected]()}
$("startButton").addEventListener("click",startRound);
let totalPoints=0,streak=0,bestStreak=0,roundToken=0;
const BEST_KEY="cognisense-best";
const DIFF_NAMES=["easy","medium","hard"];
const POINTS=[10,15,25];
function bestMap(){try{return JSON.parse(localStorage.getItem(BEST_KEY)||"{}")}catch{return {}}}
function saveBest(map){try{localStorage.setItem(BEST_KEY,JSON.stringify(map))}catch{}}
function renderScore(){
 if($("scoreNow"))$("scoreNow").textContent=totalPoints;
 if($("streakNow"))$("streakNow").textContent=streak;
 if($("bestNow"))$("bestNow").textContent=bestMap()[DIFF_NAMES[level()]]||0;
 if($("pointsLabel"))$("pointsLabel").textContent=totalPoints;
 if($("bestStreakLabel"))$("bestStreakLabel").textContent=bestStreak;
}
function pointsFor(ok){
 if(!ok)return 0;
 const bonus=Math.min(25,Math.max(0,streak-1)*5);
 return POINTS[level()]+bonus;
}
function motivate(ok,pts){
 const el=$("motivation");if(!el)return;
 const acc=answered?correct/answered:0;
 const d=DIFF_NAMES[level()];
 const best=bestMap();
 let tone,msg;
 if(totalPoints>(best[d]||0)&&totalPoints>0){
  best[d]=totalPoints;saveBest(best);
  tone="high";msg=`🏆 New high score: ${totalPoints} points on ${d}! You are setting the pace.`;
 }else if(ok&&streak>=3){
  tone="high";msg=`🔥 ${streak} correct in a row. Your focus is sharp!`;
 }else if(ok&&answered>=3&&acc>=0.8){
  tone="high";msg=`⭐ Outstanding accuracy (${Math.round(acc*100)}%). Ready for a harder level?`;
 }else if(ok){
  tone="good";msg=`👍 Nice work! +${pts} points. Keep the streak going.`;
 }else if(answered>=2&&acc<0.5){
  tone="low";msg="💪 Do not give up. Every round builds your memory. Try an Easy round to rebuild confidence.";
 }else{
  tone="low";msg="💡 Not this time. Read the answer, then try again. You are learning.";
 }
 el.className=`motivation ${tone}`;el.textContent=msg;el.hidden=false;
 renderScore();
}
function score(ok,explanation){
 if(locked)return;
 locked=true;answered++;completed++;
 if(ok){correct++;streak++;bestStreak=Math.max(bestStreak,streak)}else{streak=0}
 const pts=pointsFor(ok);
 totalPoints+=pts;
 saveResult(selected,ok,pts,explanation);
 updateStats();
 $("roundPill").textContent="ROUND COMPLETE";
 say(`${ok?"Correct! ":"Good try! "}${explanation}`);
 setGame(`<div class="game-prompt"><div class="empty-icon" aria-hidden="true">${ok?"✓":"↻"}</div><h3>${ok?"Well done!":"Keep practising!"}</h3><p>${escapeHTML(explanation)}</p>${ok?`<p><strong>+${pts} points</strong></p>`:""}<button class="button primary" id="playAgain" type="button">Play again →</button></div>`);
 $("playAgain").addEventListener("click",startRound);
 motivate(ok,pts);
}
function answerForm(prompt,placeholder,inputmode,callback){setGame(`<div class="game-prompt"><h3>${prompt}</h3><form class="answer-form" id="answerForm"><label for="answerInput" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">${placeholder}</label><input id="answerInput" type="text" inputmode="${inputmode}" autocomplete="off" placeholder="${placeholder}" required><button type="submit">Check</button></form></div>`);$("answerForm").addEventListener("submit",e=>{e.preventDefault();if(!locked)callback($("answerInput").value.trim())});$("answerInput").focus()}
function choiceButtons(containerId,items,labelOf,onPick){
 const box=$(containerId);if(!box)return;
 items.forEach(item=>{const b=document.createElement("button");b.type="button";b.className="choice-button";b.textContent=labelOf(item);b.addEventListener("click",()=>onPick(item));box.appendChild(b)});
}
const pick=arr=>arr[rand(arr.length)];
/* ===== Session-wide uniqueness: nothing repeats until its bank is used up ===== */
const used=new Map();
function fresh(bucket,make,keyOf){
 if(!used.has(bucket))used.set(bucket,new Set());
 const set=used.get(bucket);
 for(let t=0;t<400;t++){const item=make();const k=keyOf(item);if(!set.has(k)){set.add(k);return item}}
 set.clear();const item=make();set.add(keyOf(item));return item;
}
function takeWords(n,exclude=[]){
 const out=[];let guard=0;
 while(out.length<n&&guard++<800){const w=fresh("word",()=>pick(wordBank),x=>x);if(!exclude.includes(w)&&!out.includes(w))out.push(w)}
 return out;
}
const ODD_SETS=[
 {items:["Apple","Banana","Carrot","Mango"],odd:"Carrot",why:"Carrot is a vegetable; the others are fruits."},
 {items:["Triangle","Circle","Square","Blue"],odd:"Blue",why:"Blue is a colour; the others are shapes."},
 {items:["January","March","Sunday","August"],odd:"Sunday",why:"Sunday is a day of the week; the others are months."},
 {items:["2","4","7","8"],odd:"7",why:"7 is odd; the other numbers are even."},
 {items:["Piano","Guitar","Violin","Notebook"],odd:"Notebook",why:"Notebook is not a musical instrument."},
 {items:["Bird","Butterfly","Airplane","Dog"],odd:"Dog",why:"Dog cannot fly; the others can."},
 {items:["Red","Yellow","Green","Table"],odd:"Table",why:"Table is furniture; the others are colours."},
 {items:["Lion","Tiger","Wolf","Rose"],odd:"Rose",why:"Rose is a plant; the others are animals."},
 {items:["Monday","Friday","Sunday","Summer"],odd:"Summer",why:"Summer is a season; the others are days."},
 {items:["Pen","Pencil","Eraser","Spoon"],odd:"Spoon",why:"Spoon is cutlery; the others are stationery."},
 {items:["Circle","Square","Triangle","Cube"],odd:"Cube",why:"Cube is 3D; the others are flat shapes."},
 {items:["Gold","Silver","Copper","Wood"],odd:"Wood",why:"Wood is not a metal; the others are metals."},
 {items:["Doctor","Teacher","Nurse","Hammer"],odd:"Hammer",why:"Hammer is a tool; the others are people's jobs."},
 {items:["Rice","Wheat","Oats","Milk"],odd:"Milk",why:"Milk is not a grain; the others are grains."},
 {items:["Ruby","Emerald","Sapphire","Coal"],odd:"Coal",why:"Coal is not a gemstone; the others are gems."},
 {items:["Cup","Plate","Bowl","Pillow"],odd:"Pillow",why:"Pillow is for sleeping; the others are for food."},
 {items:["Violet","Lime","Crimson","Square"],odd:"Square",why:"Square is a shape; the others are colours."},
 {items:["Mars","Venus","Jupiter","Moon"],odd:"Moon",why:"Moon orbits Earth; the others are planets."}
];
function makeProblem(L){
 const max=[10,25,60][L],ops=L===0?["+","−"]:["+","−","×"];
 const op=ops[rand(ops.length)];
 let a,b;
 if(op==="×"){const m=[6,10,12][L];a=1+rand(m);b=1+rand(m)}else{a=1+rand(max);b=1+rand(max)}
 if(op==="−"&&b>a)[a,b]=[b,a];
 const answer=op==="+"?a+b:op==="−"?a-b:a*b;
 return {a,op,b,answer};
}
function makePattern(L){
 const n=L===2?5:4,kind=rand(4);
 let seq,ans,why;
 if(kind===0){const a=1+rand(20),d=2+rand(L===2?13:8);seq=Array.from({length:n},(_,i)=>a+d*i);ans=a+d*n;why=`Add ${d} each time.`}
 else if(kind===1){const a=1+rand(4),r=2+rand(L===2?3:2);seq=Array.from({length:n},(_,i)=>a*r**i);ans=a*r**n;why=`Multiply by ${r} each time.`}
 else if(kind===2){const a=1+rand(6);seq=Array.from({length:n},(_,i)=>(a+i)**2);ans=(a+n)**2;why=`These are square numbers, starting from ${a}².`}
 else{const a=2+rand(20),b=2+rand(6),c=1+rand(b-1);const full=[a];for(let i=1;i<=n;i++)full.push(full[i-1]+(i%2===1?b:-c));seq=full.slice(0,n);ans=full[n];why=`Add ${b}, then subtract ${c}, and repeat.`}
 const opts=new Set([ans]);
 for(const d of shuffle([-3,-2,-1,1,2,3])){if(opts.size>=4)break;const v=ans+d;if(v>0)opts.add(v)}
 return {seq,answer:ans,opts:shuffle([...opts]),why};
}
/* NUMBER SEQUENCE: distinct digits, never the same sequence twice in a session */
function startSequence(){
 const L=level(),len=[3,5,7][L],rev=L===2,token=roundToken;
 const seq=fresh("seq",()=>shuffle(DIGITS).slice(0,len).join(""),x=>x);
 const shown=seq.split("").join(" ");
 const ms=(reduced?1.4:1)*[2000,1200,800][L];
 setGame(`<div class="game-prompt"><h3>Remember this sequence</h3><p>${rev?"Hard: you will enter the digits in REVERSE order.":"Memorise the digits before they vanish."}</p><div class="big-sequence">${shown}</div><p role="status">Memorise now…</p></div>`);
 setTimeout(()=>{
  if(token!==roundToken)return;
  const expected=rev?seq.split("").reverse().join(""):seq;
  answerForm(rev?"Enter the digits in REVERSE order":"Enter the number sequence","Enter digits","numeric",v=>score(v===expected,`The sequence was ${shown}${rev?" (reverse: "+expected.split("").join(" ")+")":""}.`));
 },ms);
}
/* COLOUR FOCUS: word and ink pair never repeats in a session */
function startStroop(){
 const L=level(),ms=(reduced?1.3:1)*[1800,1000,500][L],n=[3,4,5][L],token=roundToken;
 const pair=fresh("stroop",()=>{const w=pick(colours);let i;do{i=pick(colours)}while(i.name===w.name);return {w,i}},p=>p.w.name+">"+p.i.name);
 const word=pair.w,ink=pair.i;
 const opts=shuffle([ink,...shuffle(colours.filter(c=>c!==ink)).slice(0,n-1)]);
 setGame(`<div class="game-prompt"><h3>Which colour is the ink?</h3><p>Ignore the word. ${L===2?"Hard: the word disappears quickly.":"Choose the text colour."}</p><div class="colour-word" id="stroopWord" style="color:${ink.hex}">${word.name.toUpperCase()}</div><div class="choice-grid" id="choices"></div></div>`);
 setTimeout(()=>{
  if(token!==roundToken)return;
  const w=$("stroopWord");if(!w)return;
  w.textContent="?";w.style.color="";
  choiceButtons("choices",opts,c=>c.name,c=>score(c.name===ink.name,`The ink colour was ${ink.name}.`));
 },ms);
}
/* WORD RECALL: words never repeat in a session; words appear one at a time */
function startWords(){
 const L=level(),count=[3,5,7][L],per=(reduced?1.3:1)*[1200,900,700][L],token=roundToken;
 const list=takeWords(count);
 setGame(`<div class="game-prompt"><h3>Remember these words</h3><p>Words appear one at a time. Remember them all.</p><div class="big-sequence" id="wordBox" style="font-size:clamp(28px,5vw,44px)">${escapeHTML(list[0])}</div><p role="status">Watching…</p></div>`);
 list.slice(1).forEach((w,i)=>setTimeout(()=>{if(token!==roundToken)return;const b=$("wordBox");if(b)b.textContent=w},(i+1)*per));
 setTimeout(()=>{if(token!==roundToken)return;askWords(list)},count*per);
}
function askWords(list){
 const hard=level()===2;
 let answer,opts,prompt,why;
 if(hard){
  answer=takeWords(1,list)[0];
  opts=shuffle([answer,...shuffle(list).slice(0,3)]);
  prompt="Which word was NOT in the list?";
  why=`“${answer}” was not in the list.`;
 }else{
  answer=list[rand(list.length)];
  opts=shuffle([answer,...takeWords(3,list)]);
  prompt="Which word was in the list?";
  why=`“${answer}” was in the list.`;
 }
 setGame(`<div class="game-prompt"><h3>${prompt}</h3><div class="choice-grid" id="wordChoices"></div></div>`);
 choiceButtons("wordChoices",opts,w=>w,w=>score(w===answer,why));
}
/* SHAPE MEMORY: shape+colour combo never repeats; more shapes and colours */
function startShape(){
 const L=level(),ms=(reduced?1.3:1)*[2500,1600,1000][L],token=roundToken;
 const target=fresh("shape",()=>({sh:pick(SHAPES),c:pick(colours)}),o=>o.sh.s+o.c.name);
 const n=[4,6,8][L];
 const opts=shuffle([target.c,...shuffle(colours.filter(c=>c!==target.c)).slice(0,n-1)]);
 setGame(`<div class="game-prompt"><h3>Remember the shape and colour</h3><p>It disappears shortly.</p><div class="shape-preview" id="shapeBox" style="color:${target.c.hex}">${target.sh.s}</div></div>`);
 setTimeout(()=>{
  if(token!==roundToken)return;
  if(!$("shapeBox"))return;
  setGame(`<div class="game-prompt"><h3>What colour was the ${target.sh.n}?</h3><div class="choice-grid" id="shapeChoices"></div></div>`);
  choiceButtons("shapeChoices",opts,c=>c.name,c=>score(c.name===target.c.name,`It was a ${target.c.name.toLowerCase()} ${target.sh.n}.`));
 },ms);
}
/* PATTERN GRID: the tile pattern never repeats in a session */
function startGrid(){
 const L=level(),len=[3,4,7][L],step=(reduced?1.3:1)*[800,650,450][L],hold=[520,420,300][L],token=roundToken;
 const seq=fresh("grid",()=>{const out=[];while(out.length<len){const n=rand(9);if(!out.includes(n))out.push(n)}return out},x=>x.join(","));
 setGame(`<div class="game-prompt"><h3>Watch the highlighted tiles</h3><p>Repeat the pattern by tapping the same tiles in order.</p><div class="grid-board" id="gridBoard"></div><p id="gridStatus" role="status">Watch the pattern…</p></div>`);
 const board=$("gridBoard");
 for(let i=0;i<9;i++){const b=document.createElement("button");b.type="button";b.className="grid-tile";b.textContent=String(i+1);b.setAttribute("aria-label",`Tile ${i+1}`);b.disabled=true;board.appendChild(b)}
 const tiles=[...board.children];
 seq.forEach((idx,i)=>setTimeout(()=>{if(token!==roundToken)return;tiles[idx].classList.add("active");setTimeout(()=>tiles[idx].classList.remove("active"),hold)},i*step));
 setTimeout(()=>{
  if(token!==roundToken)return;
  if(!$("gridStatus"))return;
  $("gridStatus").textContent="Your turn. Tap the pattern in order.";
  let pos=0;
  tiles.forEach((tile,idx)=>{tile.disabled=false;tile.addEventListener("click",()=>{
   if(locked)return;
   if(seq[pos]!==idx){score(false,`The pattern contained ${len} tiles. Try again to practise.`);return}
   tile.classList.add("active");pos++;
   if(pos===seq.length)score(true,`You repeated all ${len} tiles in the correct order.`);
  })});
 },seq.length*step+500);
}
/* QUICK MATHS: no repeated problem in a session; equation vanishes before answering */
function startMath(){
 const L=level(),ms=(reduced?1.3:1)*[6000,3500,1800][L],token=roundToken;
 const p=fresh("math",()=>makeProblem(L),q=>[q.op,...(q.op==="−"?[q.a,q.b]:[Math.min(q.a,q.b),Math.max(q.a,q.b)])].join(" "));
 const {a,op,b,answer}=p;
 setGame(`<div class="game-prompt"><h3>Solve this in your head</h3><p>${L===2?"Hard: the equation disappears quickly.":"No rush. Work it out."}</p><div class="big-sequence" id="eqBox" style="letter-spacing:.04em">${a} ${op} ${b} = ?</div></div>`);
 setTimeout(()=>{
  if(token!==roundToken)return;
  if(!$("eqBox"))return;
  setGame(`<div class="game-prompt"><h3>What is the answer?</h3><form class="answer-form" id="answerForm"><label for="answerInput" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">Your answer</label><input id="answerInput" type="number" inputmode="numeric" placeholder="Your answer" required><button type="submit">Check</button></form></div>`);
  $("answerForm").addEventListener("submit",e=>{e.preventDefault();score(Number($("answerInput").value)===answer,`The correct answer was ${answer}.`)});
  $("answerInput").focus();
 },ms);
}
/* ODD ONE OUT: each set appears once per session; Hard shows the items briefly */
function startOddOne(){
 const set=fresh("odd",()=>pick(ODD_SETS),x=>x.odd+"|"+x.items.join(","));
 const L=level(),token=roundToken;
 const ask=()=>{
  setGame(`<div class="game-prompt"><h3>Which item does not belong?</h3><p>Choose the one that is different from the other three.</p><div class="choice-grid" id="oddChoices"></div></div>`);
  choiceButtons("oddChoices",shuffle(set.items),i=>i,i=>score(i===set.odd,set.why));
 };
 if(L===2){
  setGame(`<div class="game-prompt"><h3>Memorise these four items</h3><div class="big-sequence" style="font-size:clamp(20px,4vw,30px)">${set.items.join("  ·  ")}</div></div>`);
  setTimeout(()=>{if(token!==roundToken)return;ask()},2200);
 }else ask();
}
/* PATTERN DETECTIVE: patterns are generated and never repeat in a session */
function startPatternDetective(){
 const L=level(),ms=(reduced?1.3:1)*[6000,4000,2400][L],token=roundToken;
 const item=fresh("pattern",()=>makePattern(L),x=>x.seq.join(","));
 setGame(`<div class="game-prompt"><h3>Find the missing number</h3><p>Memorise the pattern. It disappears shortly.</p><div class="big-sequence" id="patBox" style="letter-spacing:.08em">${item.seq.join("  ·  ")}  ·  <span style="color:var(--purple)">?</span></div></div>`);
 setTimeout(()=>{
  if(token!==roundToken)return;
  if(!$("patBox"))return;
  setGame(`<div class="game-prompt"><h3>What comes next?</h3><div class="choice-grid" id="patternChoices"></div></div>`);
  choiceButtons("patternChoices",item.opts,n=>String(n),n=>score(n===item.answer,`Answer: ${item.answer}. ${item.why}`));
 },ms);
}

function saveResult(game,ok,pts,detail){
 const participant=safeNickname()||"Guest";
 fetch("/api/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({participant,game,difficulty:DIFF_NAMES[level()],correct:ok?1:0,points:pts,detail:String(detail).slice(0,200)})}).catch(()=>{});
}
/* REACTION TIME: tap the GREEN box as fast as you can. Red is a trap. Tapping too early loses. */
const REACT={easy:{wait:[2000,4000],window:1200,decoy:0.15},medium:{wait:[1500,4000],window:900,decoy:0.35},hard:{wait:[1000,3500],window:700,decoy:0.5}};
function startReact(){
 const cfg=REACT[DIFF_NAMES[level()]],token=roundToken;
 const wait=cfg.wait[0]+rand(cfg.wait[1]-cfg.wait[0]);
 let colour="",goAt=0,gone=false,endTimer=null;
 setGame(`<div class="game-prompt"><h3>Reaction test</h3><p>Wait for the signal. Tap the GREEN box as fast as you can. Do NOT tap RED.</p><button class="react-box" id="reactBox" type="button" style="background:#6b7385;color:#fff;width:100%;min-height:160px;border:0;border-radius:16px;font-size:22px;font-weight:700;cursor:pointer">Wait…</button><p id="reactStatus" role="status">Get ready…</p></div>`);
 const goTimer=setTimeout(()=>{
  if(token!==roundToken||gone)return;
  const b=$("reactBox");if(!b)return;
  colour=Math.random()<cfg.decoy?"red":"green";
  goAt=performance.now();
  b.style.background=colour==="red"?"#d93b48":"#25835d";
  b.textContent=colour==="red"?"RED: do not tap":"GREEN: TAP!";
  $("reactStatus").textContent="Now!";
  endTimer=setTimeout(()=>{
   if(token!==roundToken||gone)return;
   gone=true;
   if(colour==="red")score(true,"Correct! You did not tap the red box.");
   else score(false,`Too slow. Tap the green box within ${cfg.window} ms.`);
  },cfg.window);
 },wait);
 $("reactBox").addEventListener("click",()=>{
  if(token!==roundToken||locked||gone)return;
  gone=true;clearTimeout(goTimer);clearTimeout(endTimer);
  if(!colour){score(false,"Too early! Wait for the signal before you tap.");return}
  if(colour==="red"){score(false,"You tapped RED. Only tap the green box.");return}
  const rt=Math.round(performance.now()-goAt);
  score(true,`Reaction time: ${rt} ms.`);
 });
}
// Focus timer
function renderTimer(){const m=Math.floor(timerRemaining/60),s=timerRemaining%60;$("timerDisplay").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;const p=timerTotal?1-timerRemaining/timerTotal:0;$("timerRing").style.background=`conic-gradient(var(--purple) ${p*360}deg,#eceaf7 ${p*360}deg)`;$("timerState").textContent=timerRunning?"FOCUS IN PROGRESS":timerRemaining===0?"SESSION COMPLETE":"READY TO FOCUS";$("timerStart").textContent=timerRunning?"Pause timer":timerRemaining<timerTotal?"Resume timer":"Start timer"}
function stopTimer(){if(timerInterval){clearInterval(timerInterval);timerInterval=null}timerRunning=false;renderTimer()}
$("timerStart").addEventListener("click",()=>{if(timerRunning){stopTimer();$("timerMessage").textContent="Timer paused. Resume when you are ready.";return}if(timerRemaining===0){timerRemaining=timerTotal}timerRunning=true;renderTimer();$("timerMessage").textContent="Focus interval is running. You can pause any time.";timerInterval=setInterval(()=>{timerRemaining--;renderTimer();if(timerRemaining<=0){stopTimer();focusMinutes+=Math.max(1,Math.round(timerTotal/60));updateStats();$("timerMessage").textContent="Focus interval complete — well done for making time for yourself.";toast("Focus session complete. Nice work!");$("timerState").textContent="SESSION COMPLETE"}},1000)});
function resetTimer(){stopTimer();timerTotal=Number($("timerLength").value)*60;timerRemaining=timerTotal;renderTimer();$("timerMessage").textContent="Timer reset. Ready when you are."}
$("timerReset").addEventListener("click",resetTimer);$("timerLength").addEventListener("change",resetTimer);renderTimer();
// Learning journal
function renderJournal(){
  const list=loadJournal();
  const container=$("journalList");
  container.innerHTML="";
  if(!list.length){container.innerHTML='<p class="empty-note">Your saved reflections will appear here.</p>';}
  list.slice().reverse().forEach(entry=>{
    const article=document.createElement("article"); article.className="journal-entry";
    const top=document.createElement("div"); top.className="entry-top";
    const mood=document.createElement("span"); mood.className="entry-mood"; mood.textContent=entry.mood;
    top.append(mood);
    const p=document.createElement("p"); p.textContent=entry.text;
    const del=document.createElement("button"); del.className="entry-delete"; del.type="button"; del.textContent="Delete note";
    del.addEventListener("click",()=>{saveJournal(loadJournal().filter(x=>x.id!==entry.id));renderJournal();updateStats();});
    article.append(top,p,del); container.appendChild(article);
  });
  updateStats();
}
$("journalForm").addEventListener("submit",e=>{e.preventDefault();const text=$("journalText").value.trim();if(!text){toast("Write a short reflection before saving.");$("journalText").focus();return}const entries=loadJournal();entries.push({id:`${Date.now()}-${rand(999999)}`,mood:$("journalMood").value,text});if(saveJournal(entries)){ $("journalText").value="";renderJournal();toast("Reflection saved on this device.")}});
$("clearJournal").addEventListener("click",()=>{if(!loadJournal().length){toast("There are no notes to clear.");return}if(confirm("Delete all saved reflections from this browser?")){saveJournal([]);renderJournal();toast("Journal cleared.")}});
$("resetProgress").addEventListener("click",()=>{if(!confirm("Reset your session statistics?"))return;answered=0;correct=0;completed=0;focusMinutes=0;totalPoints=0;streak=0;bestStreak=0;used.clear();const mt=$("motivation");if(mt)mt.hidden=true;renderScore();updateStats();toast("Session statistics reset.")});
updateName();renderJournal();updateStats();renderScore();
})();
