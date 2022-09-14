var blckdata = [
  {selector:".block1",name:"1",pitch:"1"},
  {selector:".block2",name:"2",pitch:"2"},
  {selector:".block3",name:"3",pitch:"3"},
  {selector:".block4",name:"4",pitch:"4"},
  {selector:".block5",name:"5",pitch:"5"},
  {selector:".block6",name:"6",pitch:"6"}
]
var soundsetdata = [
  {name:"current",sets:[1,3,5,8]},
  {name:"wrong",sets:[2,4,5.5,7]}
]
var leveldata = [
  "53342212345552222234333334553342212331",
  "11556654433221",
  "123242",
  "2244132",
  "2233123214234"
]
var Blocks = function(blockAssign,setAssign){
  this.allon = false
  this.blocks = blockAssign.map((d,i)=>({
    name:d.name,
    el: $(d.selector),
    audio: this.getAudioObject(d.pitch)
  }))
  this.soundSets=setAssign.map((d,i)=>({
    name:d.name,
    sets: d.sets.map((pitch)=>this.getAudioObject(pitch))
  }))
}
Blocks.prototype.flash = function(note){
  let block = this.blocks.find(d=>d.name==note)
  if(block){
    block.audio.currentTime = 0
    block.audio.play()
    block.el.addClass("active")
    setTimeout(()=>{
      if(this.allon==false){
        block.el.removeClass("active")
      }
    },100)
  }
}
Blocks.prototype.turnAll= function(block){
  this.allon = true
  this.blocks.forEach((block)=>{
    block.el.addClass("active")
  })
}
Blocks.prototype.turnAllOff= function(block){
  this.allon = false
  this.blocks.forEach((block)=>{
      block.el.removeClass("active")
  })
}
Blocks.prototype.getAudioObject = function(pitch){
   var audio =  new Audio("https://awiclass.monoame.com/pianosound/set/"+ pitch+".wav")
  audio.setAttribute("preload","auto")
  return audio
}
Blocks.prototype.playSet = function(type){
  let sets = this.soundSets.find(set=>set.name==type).sets
  sets.forEach((obj)=>{
    obj.currentTime = 0
    obj.play()
  })
}

var Game = function(){
   this.block = new Blocks(blckdata,soundsetdata)
   this.levels = leveldata
   this.currentLevel = 0
   this.playInterval = 400
   this.mode = "waiting"
 }
Game.prototype.loadLevels = function(){
  let _this = this
  $.ajax({
    url:"https://2017.awiclass.monoame.com/api/demo/memorygame/leveldata",
    success:function(res){
      _this.levels = res
    }
  })
  
}
Game.prototype.startLevel = function(){
  this.showMessage("Level:"+this.currentLevel)
  let leveldata = this.levels[this.currentLevel]
  this.startGame(leveldata)
}
Game.prototype.showMessage = function(mes){
  console.log(mes)
  $(".status").text(mes)
}
Game.prototype.startGame = function(answer){
   this.mode="gameplay"
   this.answer = answer
   let notes = this.answer.split("")
   this.showStatus("")
   this.timer = setInterval(()=>{
     let clear = notes.shift()
     this.playnote(clear)
     if(notes.length==0){
       clearInterval(this.timer)
       this.startUserInput()
     }
   },this.playInterval)
 }
Game.prototype.playnote = function(notes){
  console.log(notes)
  this.block.flash(notes)
}
Game.prototype.startUserInput = function(){
  this.userInput = ""
  this.mode = "userInput"
}
Game.prototype.userSendInput = function(inputChar){
  if(this.mode =="userInput"){
    let tempString = this.userInput + inputChar
    console.log(tempString)
    this.playnote(inputChar)
    this.showStatus(tempString)
    if(this.answer.indexOf(tempString)==0){
      console.log("good job")
      if(this.answer==tempString){
        console.log("成功相等了")
        this.showMessage("correct")
        this.currentLevel+=1
        this.mode="waiting"
        setTimeout(()=>{this.startLevel()},1000)
      }
    }else{
        console.log("wrong")
        this.showMessage("wrong")
        this.currentLevel=0
        this.mode="waiting"
        setTimeout(()=>{this.startLevel()},1000)
    }
  }
  this.userInput+=inputChar
}
Game.prototype.showStatus = function(tempString){
  $(".inputStatus").html("")
  console.log("showStatus的"+tempString)
  this.answer.split("").forEach((d,i)=>{
    var circle = $("<div class='circle'</div>")
    if(i<tempString.length){
      circle.addClass("correct")
    }
    $(".inputStatus").append(circle)
  })
  if(tempString=""){
    this.block.turnAllOff()
  }
  if(tempString == this.answer){
    console.log("成功跑進來了相等了")
    $(".inputStatus").addClass("correct")
    this.block.turnAll()
    setTimeout(()=>{
      this.block.turnAll()
      this.block.playSet("current")
    },500)
  }else{
    $(".inputStatus").removeClass("correct")
  }
  if(this.answer.indexOf(tempString)!=0){
    $(".inputStatus").addClass("wrong")
    setTimeout(()=>{
      this.block.turnAll()
      this.block.playSet("wrong")
    },500)
  }else{
     $(".inputStatus").removeClass("wrong")
  }
}

var game= new Game()
// game.loadLevels()
setTimeout(()=>{
  game.startLevel()
},1000)