/*** VARIABLE DECLARATION ***/

var stackMove;//STACK FOR UNDO
var stackCount;
var currPos;////CURRENT POSITION IN X,Y STARTS AT 0
var arrTargetPos = [];//ARRAY POSITION TARGET IN X,Y STARTS AT 0
var arrPinkTiles = [];//ARRAY CANDIDATE PINK TILES
var table = document.getElementById("gameBoard");
var timerDelay;
var state;//STATE : splash, start_animation, playing, win , lose_animation
var timerForPurple;
var purpleBlinked = 0;
var counterDelay = 0;

/*** FUNCTION DECLARATION ***/

/* PRE-GAME FUNCTIONS */

// Game Initialization
function initGame(){
   resetAllImage();
   state = 'splash';
   $('#text-chart-1').removeClass("hidden");
   randomizeTile();
   stackMove = new Array();
   stackCount = 0;
   autoConnectorAlert();
   $('h2#counter-desc').html((14-stackCount)+'x');
   currPos = [0,1];
   $('.winning').addClass("hidden");
   $('#text-chart-2').addClass("hidden");
   $('#text-chart-3a').addClass("hidden");
   $('#text-chart-3b').addClass("hidden");
   $('#text-chart-3c').addClass("hidden");
   gameStart = false;
   randomizeTargetPos();
}

// Removing image additions
function resetAllImage(){
   for (var i = 2; i <= 7; i++) {
      for (var j = 1; j <= 6; j++) {
         $('table tr:nth-child('+ i +') td:nth-child('+ j +').cell').removeClass('up');
         $('table tr:nth-child('+ i +') td:nth-child('+ j +').cell').removeClass('down');
         $('table tr:nth-child('+ i +') td:nth-child('+ j +').cell').removeClass('left');
         $('table tr:nth-child('+ i +') td:nth-child('+ j +').cell').removeClass('right');
         $('table tr:nth-child('+ i +') td:nth-child('+ j +').cell').removeClass('purple');
         $('table tr:nth-child('+ i +') td:nth-child('+ j +').cell').removeClass('dotted');
      }
   }
}

// Randomize tile class
function randomizeTile() {
   for (var i = 2; i <= 7; i++) {
      for (var j = 1; j <= 6; j++) {
         var classes = ["man","woman1","man","woman2"];
         $('table tr:nth-child('+ i +') td:nth-child('+ j +').cell').addClass(classes[Math.round(Math.random()*(classes.length-1))]);
      }
   }
}

// Render the connector counter by checking the move count
function autoConnectorAlert(){
   if(stackCount == 14 && !(currPos[0] == 5 && currPos[1] == 6)){
      $('.counter').addClass('blinking');
   }else{
      $('.counter').removeClass('blinking');
   }
}

// Randomize some tiles to be a targeted tile
function randomizeTargetPos(){
   var row, col;
   
   do{
      var i = 0;
      while (i < 3)
      {
         row = Math.floor((Math.random() * 6) + 2);
         col = Math.floor((Math.random() * 5) + 1);
         if(isInArray2d(arrTargetPos,[col,row]) || (row == 2 && col == 1))
         {

         }
         else
         {
            arrTargetPos[i] = [col,row];
            i++;
         }
      }
      arrTargetPos[3] = [6,7];
   } while(!pinkTilesValidator(arrTargetPos));
   
   for (i = 0; i < arrTargetPos.length; i++)
   {
      $(".content table tr:nth-child("+ arrTargetPos[i][1] +") td:nth-child("+ arrTargetPos[i][0] +")").toggleClass("purple");
   }
}

// Checking whole targeted tiles for finding shortest path cost less than 14 moves
function pinkTilesValidator(arrPinkTiles){
   var dx = 0;
   var dy = 0;

   dx = dx + Math.abs(1 - arrPinkTiles[0][0]);
   dy = dy + Math.abs(2 - arrPinkTiles[0][1]);
   
   for(var i = 1; i < arrPinkTiles.length; i++)
   {
      dx = dx + Math.abs(arrPinkTiles[i-1][0] - arrPinkTiles[i][0]);
      dy = dy + Math.abs(arrPinkTiles[i-1][1] - arrPinkTiles[i][1]);
   }
   
   if ((dx+dy) <= 14)
   {
      return true;
   }
   else
   {
      return false;
   }
}

/* ANIMATIONS */

// Make the targeted tiles blinking purple-white continously for 2 seconds
function purpleBlip() {
   if(purpleBlinked > 4) {
      clearInterval(timerForPurple);
      timerDelay = setInterval(function(){delayedStart()},100);
     purpleBlinked = 0;
     return;
   } else {
      purpleBlinked++;
      for(var i = 0; i < arrTargetPos.length; i++) {
         $(".content table tr:nth-child("+ arrTargetPos[i][1] +") td:nth-child("+ arrTargetPos[i][0] +")").toggleClass("purple");
      }
   }
}

// Show users where to START and where to FINISH
function delayedStart() {
   if(counterDelay > 24) {
      counterDelay = 0;
      clearInterval(timerDelay);
      $('#text-chart-2').removeClass("hidden");
      timerDelay = setInterval(function(){anotherDelay()},100);
      return;
   } else if(counterDelay > 12) {
      if(counterDelay%2==0) {
         $('#btn-ziel img:nth-child(1)').css('margin-left','0px');
         $('#btn-ziel img:nth-child(2)').css('margin-left','18px');

      } else {
         $('#btn-ziel img:nth-child(1)').css('margin-left','9px');
         $('#btn-ziel img:nth-child(2)').css('margin-left','9px');
      }
      counterDelay++;
   } else {
      if(counterDelay%2==0) {
         $('#arrow-start').css('padding-left','10px');
      } else {
         $('#arrow-start').css('padding-left','20px');
      }
      counterDelay++;
   }
}

// Showing text-chart-2 for 0.5 second & showing first possible moves
function anotherDelay() {
   if(counterDelay > 5) {
      $('#text-chart-2').addClass("hidden");
     state = 'playing';
     $(".content table tr:nth-child(2) td:nth-child(2)").addClass("dotted");
     $(".content table tr:nth-child(3) td:nth-child(1)").addClass("dotted");
     clearInterval(timerDelay);
     counterDelay = 0;
     return;
   } else {
      counterDelay++;
   }
}

// Showing missed target tiles
function showMissed() {
   if(counterDelay > 5) {
      clearInterval(timerForPurple);
      counterDelay = 0;
      initGame();
   } else {
      counterDelay++;
      for(var i = 0; i < arrTargetPos.length-1; i++) {
         var found = false;
         for(var j = 0; j < stackMove.length; j++) {
            if(arrTargetPos[i][0] == stackMove[j][0]+1 && arrTargetPos[i][1] == stackMove[j][1]+1)
            {
               found = true;
            }
         }
         if(!found) {
            $(".content table tr:nth-child("+ arrTargetPos[i][1] +") td:nth-child("+ arrTargetPos[i][0] +")").toggleClass("purple");
         }
      }
   }
}

/* ON-GAME FUNCTIONS */

// Checking move validity by coordinate and move counter
function isMoveValid(x,y){
   if(stackCount > 13) {
      return false;
   }
   
   if(x >= 0 && x<6 && y > 0 && y<7){
      if(x == currPos[0]+1 && y == currPos[1]
         || x == currPos[0]-1 && y == currPos[1]
         || x == currPos[0] && y == currPos[1] + 1
         || x == currPos[0] && y == currPos[1] - 1)
      {
         var found = false;
         var i = 0;
         while(!found && i < stackCount)
         {
            if(stackMove[i][0] == x && stackMove[i][1] == y) {
               found = true;
            }
            i++;
         }
         return !found;
      }else{
         return false;
      }
   }else{
      return false;
   }
}

// Update the coordinate pointer(currPos) and moves then render some image
function move(newX,newY){
   stackMove.push(currPos);
   stackCount++;   

   currPos = [newX,newY];
   var x = currPos[0]+1;
   var y = currPos[1]+1;

   if(isInArray2d(arrTargetPos,[x,y])) {
      $('table tr:nth-child('+ y +') td:nth-child('+ x +').cell').addClass("purple");
   }
   $('h2#counter-desc').html((14-stackCount)+'x');
   autoConnectorAlert();
}

// Check if user can undo their move in the current state
function isCanUndo(x,y){
   if(stackCount != 0){
      if(x == currPos[0] && y == currPos[1]){
         return true;
      }else{
         return false;
      }
   }else{
      return false;
   }
}

// Undo user last move (rollback)
function undoLastMove(){
   if($('table tr:nth-child('+ (currPos[1]+1) +') td:nth-child('+ (currPos[0]+1) +').cell').hasClass("purple")) {
      $('table tr:nth-child('+ (currPos[1]+1) +') td:nth-child('+ (currPos[0]+1) +').cell').removeClass("purple");
   }
   currPos = stackMove.pop();
   stackCount--;
   $('h2#counter-desc').html((14-stackCount)+'x');
   autoConnectorAlert();
}

// Check user has solve the game or not
// If yes, then continue to winning sequences
// If not and lose, then restart the game
function isWin(){
   var count = 0;
   var fufilled = false;
   for(var i = 0; i < arrTargetPos.length; i++) {
      for(var j = 0; j < stackMove.length; j++) {
         if(arrTargetPos[i][0] == stackMove[j][0]+1 && arrTargetPos[i][1] == stackMove[j][1]+1)
         {
            count++;
         }
      }
   }

   if(count > 2) {
      fufilled = true;
   } else {
      fufilled = false;
   }
   //if(stackCount == 14 && currPos[0] == 5 && currPos[1] == 6 && fufilled){EARLIER VERSION, VALIDATE CONNECTOR COUNT
   if(currPos[0] == 5 && currPos[1] == 6 && fufilled){
      state='win';   
      $('#text-chart-3a').removeClass("hidden");
      $('#text-chart-3b').removeClass("hidden");
      $('#text-chart-3c').removeClass("hidden");
   } else if(stackCount == 14 && currPos[0] == 5 && currPos[1] == 6) {
      timerForPurple = setInterval(function(){showMissed()},500);
   }
}

// Render image for displaying possible next moves
function redrawDot() {
   for (var i = 2; i <= 7; i++) {
      for (var j = 1; j <= 6; j++) {
         $('table tr:nth-child('+ i +') td:nth-child('+ j +').cell').removeClass("dotted");
      }
   }
   var x = currPos[0]+1;
   var y = currPos[1]+1;

   if(x != 6 || y != 7 || stackCount != 14) {
      if(y != 2 && stackCount< 14) {
         $('table tr:nth-child('+ (y-1) +') td:nth-child('+ x +').cell').addClass("dotted");
      }
      if(y != 7 && stackCount< 14) {
         $('table tr:nth-child('+ (y+1) +') td:nth-child('+ x +').cell').addClass("dotted");
      }
      if(x != 1 && stackCount< 14) {
         $('table tr:nth-child('+ y +') td:nth-child('+ (x-1) +').cell').addClass("dotted");
      }
      if(x != 6 && stackCount< 14) {
         $('table tr:nth-child('+ y +') td:nth-child('+ (x+1) +').cell').addClass("dotted");
      }
   }
}

/* MISC. FUNCTION */

// Checking an element on table (2D Array)
function isInArray2d(array2d,element){
   var i;
   for(i = 0;i<array2d.length;i++){
      if(element[0] == array2d[i][0] && element[1] == array2d[i][1])
         return true;
   }
   return false;
}

/* EVENT HANDLING FUNCTION */

// Restart the game
function restart() {
   if(state == 'playing') {
      clearInterval(timerForPurple);
      counterDelay = 0;
      initGame();
      state = 'start_animation';
      $('#text-chart-1').addClass("hidden");
      timerForPurple = setInterval(function(){purpleBlip()},500);
   }
}

// Adding event listener to some element
$(document).ready(function(){
   initGame();

   $(document).click(function(){
      if(state =='splash') {
		    state = 'start_animation';
		    $('#text-chart-1').addClass("hidden");
          timerForPurple = setInterval(function(){purpleBlip()},500);
      } else if(state == 'win') {
         state = 'showing_form';
      } else if(state == 'showing_form') {
         $('.left-side').addClass("hidden");
         $('.content').addClass("hidden");
         $('.right-side').addClass("hidden");
         $('#text-chart-3a').addClass("hidden");
         $('#text-chart-3b').addClass("hidden");
         $('#text-chart-3c').addClass("hidden");
         $('.winning').removeClass("hidden");
      }
   });

   for (var i = 2; i <= 7; i++) {
      for (var j = 1; j <= 6; j++) {
         $('table tr:nth-child('+ i +') td:nth-child('+ j +').cell').click(function(){
			if(state=='playing'){
				if(isMoveValid(this.cellIndex,this.parentNode.rowIndex) && currPos[0]+1 == this.cellIndex) {
				   var x = currPos[0]+1;
				   var y = currPos[1]+1;
				   $(this).toggleClass("left");
				   $('table tr:nth-child('+ y +') td:nth-child('+ x +').cell').toggleClass("right");
				   move(this.cellIndex,this.parentNode.rowIndex);
				   isWin();
               redrawDot();
				} else if(isMoveValid(this.cellIndex,this.parentNode.rowIndex) && currPos[0]-1 == this.cellIndex) {
				   var x = currPos[0]+1;
				   var y = currPos[1]+1;
				   $(this).toggleClass("right");
				   $('table tr:nth-child('+ y +') td:nth-child('+ x +').cell').toggleClass("left");
				   move(this.cellIndex,this.parentNode.rowIndex);
				   isWin();
               redrawDot();
				} else if(isMoveValid(this.cellIndex,this.parentNode.rowIndex) && currPos[1]+1 == this.parentNode.rowIndex) {
				   var x = currPos[0]+1;
				   var y = currPos[1]+1;
				   $(this).toggleClass("up");
				   $('table tr:nth-child('+ y +') td:nth-child('+ x +').cell').toggleClass("down");
				   move(this.cellIndex,this.parentNode.rowIndex);
				   isWin();
               redrawDot();
				} else if(isMoveValid(this.cellIndex,this.parentNode.rowIndex) && currPos[1]-1 == this.parentNode.rowIndex) {
				   var x = currPos[0]+1;
				   var y = currPos[1]+1;
				   $(this).toggleClass("down");
				   $('table tr:nth-child('+ y +') td:nth-child('+ x +').cell').toggleClass("up");
				   move(this.cellIndex,this.parentNode.rowIndex);
				   isWin();
               redrawDot();
				} else if(isCanUndo(this.cellIndex,this.parentNode.rowIndex)) {
				  var tempCurrPos = currPos;
				  undoLastMove();
              redrawDot();
				  if(tempCurrPos[0]-1 == currPos[0] && tempCurrPos[1] == currPos[1]){
						$(".content table tr:nth-child("+ (this.parentNode.rowIndex+1) +") td:nth-child("+ (this.cellIndex+1) +").cell").toggleClass("left");
						$(".content table tr:nth-child("+ (currPos[1]+1) +") td:nth-child("+ (currPos[0]+1) +").cell").toggleClass("right");
				  }if(tempCurrPos[0]+1 == currPos[0] && tempCurrPos[1] == currPos[1]){
						$(".content table tr:nth-child("+ (this.parentNode.rowIndex+1) +") td:nth-child("+ (this.cellIndex+1) +").cell").toggleClass("right");
						$(".content table tr:nth-child("+ (currPos[1]+1) +") td:nth-child("+ (currPos[0]+1) +").cell").toggleClass("left");
				  }if(tempCurrPos[0] == currPos[0] && tempCurrPos[1] == currPos[1]+1){
						$(".content table tr:nth-child("+ (this.parentNode.rowIndex+1) +") td:nth-child("+ (this.cellIndex+1) +").cell").toggleClass("up");
						$(".content table tr:nth-child("+ (currPos[1]+1) +") td:nth-child("+ (currPos[0]+1) +").cell").toggleClass("down");
				  }if(tempCurrPos[0] == currPos[0] && tempCurrPos[1] == currPos[1]-1){
						$(".content table tr:nth-child("+ (this.parentNode.rowIndex+1) +") td:nth-child("+ (this.cellIndex+1) +").cell").toggleClass("down");
						$(".content table tr:nth-child("+ (currPos[1]+1) +") td:nth-child("+ (currPos[0]+1) +").cell").toggleClass("up");
				  }
				}
			}
		 });
      }  
   }
});