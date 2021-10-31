let VIDEO=null;  
let CANVAS=null;
let CONTEXT=null;
let SCALER=0.8;
let SIZE={x:0,y:0,width:0,height:0,rows:3,columns:3};
let PIECES=[];
let SELECTED_PIECE=null;
let START_TIME=null;
let END_TIME=null;

let POP_SOUND=new Audio('pop.mp3');
POP_SOUND.volume=0.5;

let WIN_SOUND=new Audio('win.mp3');
WIN_SOUND.volume=0.5;

function main(){
    console.log("gagasdg");
    CANVAS=document.getElementById("myCanvas");
    CONTEXT=CANVAS.getContext("2d");
    addEventListeners();
    let promise=navigator.mediaDevices.getUserMedia({video:true});
    promise.then(function(signal){
        VIDEO=document.createElement("video");
        VIDEO.srcObject=signal;
        VIDEO.play();

        VIDEO.onloadeddata=function(){
            handleResize();
            //window.addEventListener('resize',handleResize);
            initializePieces(SIZE.rows,SIZE.columns); 
            updateGame();
        }

    }).catch(function(err){
        alert("Camera error: "+err);
    });
}
function setDifficulty() {
    console.log("james");
    let diff=document.getElementById("difficulty").value;
    switch(diff){
        case "easy":
            initializePieces(2,2);
            break;
        
        case "medium":
            initializePieces(5,5);
            break;
        
        case "hard":
            initializePieces(10,10);
            break;

        case "insane":
            initializePieces(40,25);
            break;
    }
}

function restart() {
    START_TIME=new Date().getTime();
    END_TIME=null;
    randomPieces();
    document.getElementById("menuItem").style.display="none";
}

function updateTime(){
    let now=new Date().getTime();
    if(START_TIME!=null){
        if(END_TIME!=null){
            document.getElementById("time").innerHTML=
            formateTime(END_TIME-START_TIME);
        }else{
            document.getElementById("time").innerHTML=
            formateTime(now-START_TIME);
        }
    }
}
function isComplete() {
    for(let i=0;i<PIECES.length;i++){
        if(PIECES[i].correct==false){
            return false;
        }
    }
    return true;
}

function formateTime(duration) {
    var milliseconds = Math.floor((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }
// function formateTime(milliseconds){
//     let second=Math.floor(milliseconds/1000);
//     let s=Math.floor(second%60);
//     let m=Math.floor((second%(60*60))/60);
//     let h=Math.floor((second%(60*60*24))/(60*60));
    
//     let formattedTime=h.toString().padStart(2,'0');
//     formattedTime+=":";
//     formattedTime=m.toString().padStart(2,'0');
//     formattedTime+=":";
//     formattedTime=s.toString().padStart(2,'0');
//     return formattedTime;

// }



function addEventListeners(){
    CANVAS.addEventListener("mousedown",onMouseDown);
    CANVAS.addEventListener("mousemove",onMouseMove);
    CANVAS.addEventListener("mouseup",onMouseUp);
    CANVAS.addEventListener("touchstart",onTouchStart);
    CANVAS.addEventListener("touchmove",onTouchMove);
    CANVAS.addEventListener("touchend",onTouchEnd);
}
function onTouchStart(evt){
    let loc={x:evt.touches[0].clientX,
             y:evt.touches[0].clientY};
    onMouseDown(loc);
}

function onTouchMove(evt){
    let loc={x:evt.touches[0].clientX,
              y:evt.touches[0].clientY};
    onMouseMove(loc);
}

function onTouchEnd(){
    onMouseUp();
}

function onMouseDown(evt){
    SELECTED_PIECE=getPressedPiece(evt);
    if(SELECTED_PIECE!=null){
        const index=PIECES.indexOf(SELECTED_PIECE);
        if(index>-1){
            PIECES.splice(index,1);
            PIECES.push(SELECTED_PIECE);
        }
        SELECTED_PIECE.offset={
            x:evt.x-SELECTED_PIECE.x,
            y:evt.y-SELECTED_PIECE.y
        }
        SELECTED_PIECE.correct=false;
    }
}

function onMouseMove(evt){
    if(SELECTED_PIECE!=null){
        SELECTED_PIECE.x=evt.x-SELECTED_PIECE.offset.x;
        SELECTED_PIECE.y=evt.y-SELECTED_PIECE.offset.y;
    }
}

function onMouseUp(){
    if(SELECTED_PIECE.isClose()){
        SELECTED_PIECE.snap();
        if(isComplete() && END_TIME==null){
            let now =new Date().getTime();
            END_TIME=now;
            WIN_SOUND.play();
            setInterval(function(){window.location.reload();},3000);
    

        }
    }
    SELECTED_PIECE=null;
}

function getPressedPiece(loc){
    for(let i=PIECES.length-1;i>=0;i--){
        if(loc.x>PIECES[i].x && loc.x<PIECES[i].x+PIECES[i].width && 
            loc.y>PIECES[i].y && loc.y<PIECES[i].y+PIECES[i].height){
                return PIECES[i];
        }
    }
    return null;
}


function handleResize(){
    CANVAS.width=window.innerWidth;
    CANVAS.height=window.innerHeight;

    let resizer=SCALER*
    Math.min(
        window.innerWidth/VIDEO.videoWidth,
        window.innerHeight/VIDEO.videoHeight
        );
    SIZE.width=resizer*VIDEO.videoWidth;
    SIZE.height=resizer*VIDEO.videoHeight;
    SIZE.x=window.innerWidth/2-SIZE.width/2;
    SIZE.y=window.innerHeight/2-SIZE.height/2;
}
function updateGame(){
    CONTEXT.clearRect(0,0,CANVAS.width,CANVAS.height);
    CONTEXT.globalAlpha=0.5;
    CONTEXT.drawImage(VIDEO,
        SIZE.x,SIZE.y,
        SIZE.width,SIZE.height
        );
        CONTEXT.globalAlpha=1;
        CONTEXT.clearRect(0,0,CANVAS.width,CANVAS.heigh);
    for(let i=0;i<PIECES.length;i++){
        PIECES[i].draw(CONTEXT);
    }
    updateTime();
    window.requestAnimationFrame(updateGame);
    
}
function initializePieces(rows,cols){
    SIZE.rows=rows;
    SIZE.columns=cols;
    
    PIECES=[];
    for(let i=0;i<SIZE.rows;i++){
        for(let j=0;j<SIZE.columns;j++){
            PIECES.push(new Piece(i,j));
        }
    }

    let cnt=0;
    for(let i=0;i<SIZE.rows;i++){
        for(let j=0;j<SIZE.columns;j++){
           const piece=PIECES[cnt];
           if(i==SIZE.rows-1){
               piece.bottom=null;
           }else{
           const sgn=(Math.random()-0.5)<0?-1:1;
           piece.bottom=sgn*(Math.random()*0.4+0.3);
           }
           if(j==SIZE.columns-1){
               piece.right=null;
           }else{
           const sgn=(Math.random()-0.5)<0?-1:1;
           piece.right=sgn*(Math.random()*0.4+0.3);
           }

           if(j==0){
                piece.left=null;
            }else{
                 piece.left=-PIECES[cnt-1].right;
            }

           if(i==0){
                piece.top=null;
           }else{
                piece.top=-PIECES[cnt-SIZE.columns].bottom;
           }
           cnt++;
        }
    }

}

function randomPieces(){
    for(let i=0;i<PIECES.length;i++){
        let loc={
            x:Math.random()*(CANVAS.width-PIECES[i].width),
            y:Math.random()*(CANVAS.height-PIECES[i].height)
        }
        PIECES[i].x=loc.x;
        PIECES[i].y=loc.y;
        PIECES[i].correct=false;
    }
}

class Piece{
    constructor(rowIndex,colIndex){
        this.rowIndex=rowIndex;
        this.colIndex=colIndex;
        this.x=SIZE.x+SIZE.width*this.colIndex/SIZE.columns;
        this.y=SIZE.y+SIZE.height*this.rowIndex/SIZE.rows;
        this.width=SIZE.width/SIZE.columns;
        this.height=SIZE.height/SIZE.rows;
        this.xCorrect=this.x;
        this.yCorrect=this.y;
        this.correct=true;
        // this.x=SIZE.x+this.width*this.colIndex;
        // this.y=SIZE.y+this.height*this.rowIndex;
    }

    draw(context){
        context.beginPath();
        context.drawImage(VIDEO,
            this.colIndex*VIDEO.videoWidth/SIZE.columns,
            this.rowIndex*VIDEO.videoHeight/SIZE.rows,
            VIDEO.videoWidth/SIZE.columns,
            VIDEO.videoHeight/SIZE.rows,
            this.x,
            this.y,
            this.width,
            this.height
            );
        
            const sz=Math.min(this.width,this.height);
            const neck=0.1*sz;
            const tabWidth=0.2*sz;
            const tabHeight=0.2*sz;
        context.rect(this.x,this.y,this.width,this.height);
        }
    isClose(){
        if(distance({x:this.x,y:this.y},
            {x:this.xCorrect,y:this.yCorrect})<this.width/3){
                return true;
        }
        return false;
    }
    snap(){
        this.x=this.xCorrect;
        this.y=this.yCorrect;
        this.correct=true;
        POP_SOUND.play();
    }
}


function distance(p1,p2){
    return Math.sqrt(
        (p1.x-p2.x)*(p1.x-p2.x)+
        (p1.y-p2.y)*(p1.y-p2.y));
}

