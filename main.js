//window.onload=function(){
  var method_type;//记录是哪个模式
  var snakeBody=[];
  var foodArr=[];
  var hazardArr=[];
  var nowX,nowY;//储存蛇头现在位置
  var level=1;
  var snake_timer;//蛇移动的计时器
  var counting_timer;//加速计算的计时器
  var speed;
  var currentKeyValue=39;
  var pause=false;
  var score=0;
  var time_counting=false;//判断是否开启加速
  var arriving=true;
  createInterface();//创建游戏页面
  btnBind();//按钮触发



  //定义$方法
  function $(id){return document.getElementById(id);}
  // 创建table游戏界面
  function createInterface(){
    var gamebox=$('game_box');
    var game_interface="<table frame='vsides' border='1px' collaspe>";
    for(var i=0;i<25;i++){
      game_interface+="<tr>";
      for(var j=0;j<25;j++){
        game_interface+="<td><div id='"+j+"_"+i+"' class='w'><div id="+j+"_"+i+"_food class='circle'></div></div></td>";
      }
      game_interface+="</tr>";
    }
    gamebox.innerHTML=game_interface;
  }
  //初始化的共同部分
  function commonInit(){
    createInterface();
    initSnake(5);
    saveHead();
    initFood();
    if(method_type==3){
      initHazard();
    }
    moveSnakeStage();
  }
  //各个按钮触发的函数
  //加速模式
  function speedUpMethod(){
    time_counting=false
    method_type=1;
    speed=250;
    $("score").innerHTML=0;
    $("speed").innerHTML=250;
    $("begin_interface").style.display="none";
    $("level_box").style.display="none";
    commonInit();
  }
  //闯关模式
  function throughPass(){
    method_type=2;
    speed=250;
    $("speed").innerHTML=speed;
    $("begin_interface").style.display="none";
    $("level_box").style.display="block";
    commonInit();
  }
  //障碍模式
  function hizardMethod(){
    method_type=3;
    speed=250;
    $("speed").innerHTML=speed;
    $("begin_interface").style.display="none";
    $("level_box").style.display="none";
    commonInit();
  }
  //返回菜单
  function returnMenu(){
    $("begin_interface").style.display="block";
    $("result_interface").style.display="none";
    $("score").innerHTML=0;
    $("speed").innerHTML=250;
    $("level_box").style.display="none";
    createInterface();
  }
  //重新开始
  function restart(){
    $("result_interface").style.display="none";
    switch(method_type){
      case 1:speedUpMethod();break;
      case 2:throughPass();break;
      case 3:hizardMethod();break;
    }
  }
  //下一关
  function nextPass(){
    $("result_interface").style.display="none";
    $("score").innerHTML=0;
    level++;
    $("level").innerHTML=level;
    speed-=20;
    $("speed").innerHTML=speed;
    createInterface();
    initSnake(5);
    saveHead();
    initFood();
    moveSnakeStage();
  }
  function btnBind(){
    var method_btns=document.querySelectorAll(".method button");
    method_btns[0].addEventListener("click",speedUpMethod);
    method_btns[1].addEventListener("click",throughPass);
    method_btns[2].addEventListener("click",hizardMethod);
    var result_btns=document.querySelectorAll(".result-operator button");
    result_btns[0].addEventListener("click",returnMenu);
    result_btns[1].addEventListener("click",restart);
    result_btns[2].addEventListener("click",nextPass);
  }
  //返回随机颜色
  function randomColor(){
    return "rgb("+Math.ceil(Math.random()*180)+","+Math.ceil(Math.random()*180)+","+Math.ceil(Math.random()*180)+")";
  }

  // 初始化小蛇
  function initSnake(len){
    if(len>0){
      var now_position=(len-1)+'_'+0;
      snakeBody.push(now_position);
      $(now_position).style.background=randomColor();
      len--;
      initSnake(len);
    }
    else{
      return 0;
    }
  }
  //判断食物是否与蛇重合和已有的食物重合
  function coincidence(x,y){
    var snakeBackground=$(x+"_"+y).style.background;
    var foodBackground=$(x+"_"+y+"_food").style.background;
    if((snakeBackground=="")&&(foodBackground=="")){
      return false;
    }else{
      return true;
    }
  }
  //是否吃到食物
  function eatFood(){
    var flag=false;
    var nexFood=nowX+"_"+nowY+"_food";
    if($(nexFood).style.background!=""){
      flag=true;
    }
    return flag;
  }
  //吃到食物后
  function afterEatfood(){
    var nexBox=nowX+"_"+nowY;
    var nexFood=nowX+"_"+nowY+"_food";
    for(var i=0;i<foodArr.length;i++){
      if(foodArr[i]==nexFood){
        snakeBody.unshift(nexBox);
        $(nexBox).style.background=$(nexFood).style.background;
        $(nexFood).style.background="";
      }
    }
    score+=100;
    $('score').innerHTML=score;
  }

  //生成另一个食物
  function anotherFood(){
    var foodX=parseInt(Math.random()*25);
    var foodY=parseInt(Math.random()*25);
    if(!coincidence(foodX,foodY)){
      foodArr.unshift(foodX+"_"+foodY+"_food");
      $(foodArr[0]).style.background=randomColor();
    }
  }
  //初始化食物
  function initFood(){
    for(var i=0;i<5;){
      var foodX=parseInt(Math.random()*25);
      var foodY=parseInt(Math.random()*25);
      if(!coincidence(foodX,foodY)){
        foodArr.push(foodX+"_"+foodY+"_food");
        $(foodArr[i]).style.background=randomColor();
        i++;
      }
    }
  }
  //初始化障碍
  function initHazard(){
    for(var i=0;i<3;){
      var x=parseInt(Math.random()*25);
      var y=parseInt(Math.random()*25);
      if(!coincidence(x,y)){
        hazardArr.push(x+"_"+y);
        $(hazardArr[i]).style.background="#000000";
        i++;
      }
    }
  }
  //小蛇移动阶段（游戏进行中）
  function moveSnakeStage(){
    document.addEventListener("keydown",keyDown);
  }
  //按下方向键
  function keyDown(event){
    if(arriving){
      arriving=false;
      if((!time_counting)&&method_type==1){//如果是模式1并且没有计时，开启计时使速度增加
        counting_timer=setInterval(function(){
          if(speed>20){
            speed-=20;
          }
          $("speed").innerHTML=speed;
        },5000);
        time_counting=!time_counting;
      }

      clearInterval(snake_timer);
      switch (event.keyCode) {
        case 37:
        case 38:
        case 39:
        case 40:
                if((currentKeyValue!=event.keyCode-2)&&(currentKeyValue!=event.keyCode+2)){
                  currentKeyValue=event.keyCode;
                }
                break;
        case 32:
          pause=!pause;
          break;
      }
        if(!pause){
            snake_timer=setInterval(function(){
              snakeMove();
            },speed);
        }
      }
  }
  //储存蛇头位置
  function saveHead(){
  nowX=parseInt(snakeBody[0].split('_')[0]);
  nowY=parseInt(snakeBody[0].split('_')[1]);
  }
  //判断是否吃到自己
  function eatYourself() {
  var flag=false;
  for(var i=0;i<snakeBody.length;i++){
    if((nowX+"_"+nowY)==snakeBody[i]){
      flag=true;
    }
  }
  return flag;
  }

  function hitHazard() {
  var flag=false;
  for(var i=0;i<hazardArr.length;i++){
    if((nowX+"_"+nowY)==hazardArr[i]){
      flag=true;
    }
  }
  return flag;
  }

  //蛇移动
  function snakeMove(){
  if(pause){
    window.clearInterval(snake_timer);
  }
  else{
    switch(currentKeyValue){
      case 37:nowX--;
              break;
      case 38:nowY--;
              break;
      case 39:nowX++;
              break;
      case 40:nowY++;
              break;
    }
      if(nowX<0||nowY<0||nowX>24||nowY>24){//判断是否撞墙
        endState("游戏结束<br>你撞到墙");
      }else if(eatYourself()){
        endState("游戏结束<br>吃到自己");
      }else if(eatFood()){
        afterEatfood();
        anotherFood();
      }else if(hitHazard()){
        endState("游戏结束<br>你撞到障碍物");
      }else if(score>=1000&&method_type==2){
        victory();
      }
      else{
        snakeBody.unshift(nowX+"_"+nowY);
        for(var i=0;i<snakeBody.length-1;i++){
          $(snakeBody[i]).style.background=$(snakeBody[i+1]).style.background;
        }
        $(snakeBody.pop()).style.background="";
      }
      arriving=true;
    }
  }
//游戏胜利
function victory(){
  document.removeEventListener("keydown",keyDown);//取消事件监听
  $("result_interface").style.display="block";
  $("gameResult").innerHTML="游戏胜利";
  $("nextStage").style.display="block";
  clearInterval(snake_timer);
  snakeBody=[];
  foodArr=[];
  hazardArr=[];
  currentKeyValue=39;
  score=0;
  counting_timer=false;
}
//游戏失败结束
function endState(str){
  document.removeEventListener("keydown",keyDown);//取消事件监听
  $("gameResult").innerHTML=str;
  $("result_interface").style.display="block";
  $("nextStage").style.display="none";
  clearInterval(snake_timer);
  clearInterval(counting_timer);
  snakeBody=[];
  foodArr=[];
  hazardArr=[];
  score=0;
  currentKeyValue=39;
  counting_timer=false;
}

//}
