let colors = ["#F0D9B5", "#B58863"]; // in the order [white, black]
function showNextMoveColor(){
	let boxWidth = $("#a1").innerWidth()/4;
	let boxHeight = $("#a1").innerHeight()/4;
	let offset = $("#chessboard").innerWidth()/2 - boxWidth/2; 
	let sideColor = $("#fen-field").val().split(' ')[1] == 'w' ? colors[0] : colors[1];
	$("#image-display").prepend('<div id="next-move-box"></div>');
	$("#next-move-box").css({
		"width": boxWidth,
		"height": boxHeight,
		"border": "solid 2px black",
		"transform": "translateX(" + offset.toString() + "px)",
		"border-radius" : "5px",
		"background-color": sideColor,
	});
}
function validateFEN(fen){
		const validateRank = (notation) => {
	  const hasContinuousNumbers = /\d{2}/.test(notation);
	
	  const letters = notation.split('');
	
	  const hasOnlyValidLetters = () => {
	    return !letters.some((letter) => {
	      return !/[1-8]|[pkqbnrPKQBNR]/.test(letter);
	    });
	  };
	
	  const totalSquares = letters.reduce((total, letter) => {
	    const parsedLetter = parseInt(letter, 10);
	    const isInteger = Number.isInteger(parsedLetter);
	    return isInteger? (total + parsedLetter) : (total + 1);
	  }, 0);
	
	  return ( hasOnlyValidLetters() &&
	           !hasContinuousNumbers &&
	           totalSquares === 8 );
	}
	
	const validatePiecePlacement = (notation) => {
	  var ranks = notation.split('/');
	  if (ranks.length !== 8) return false;
	
	  return ranks.reduce(
	    (lastVal, rank) => lastVal && validateRank(rank),
	  true);
	}
	
	const curry = f => a => b => f(a, b);
	
	const check = curry((regex, str) => regex.test(str));
	
	const validateSideToMove = check(/^(w|b)$/);
	
	const validateCastlingAbility = check(/^-$|^(KQ?k?q?|Qk?q?|kq?|q)$/);
	
	const validateEnPassantTarget = check(/^(-|[a-h][36])$/);
	
	const validateHalfMoveClock = check(/^([0-9]|[1-9][0-9])$/);
	
	const validateFullMoveCounter = check(/^([1-9][0-9]{0,1})$/);
	
	/* parse FEN */
  const fenArr = fen.split(' ');
  const [piecePlacement, sideToMove,
         castlingAbility, enPassantTarget,
         halfMoveClock, fullMoveCounter] = fenArr;

  return (fenArr.length === 6) &&
          validatePiecePlacement(piecePlacement) &&
          validateSideToMove(sideToMove) &&
          validateCastlingAbility(castlingAbility) &&
          validateEnPassantTarget(enPassantTarget) &&
          validateHalfMoveClock(halfMoveClock) &&
          validateFullMoveCounter(fullMoveCounter);

}
function showBoardCoordsFunc(){
	const files = "abcdefgh";
	const offset  = $("#a1").innerHeight()/2.75;
	const fontSize = Math.min($("#chessboard").innerWidth(), $("#chessboard").innerHeight()) /500 * 12; 
	/* coord-col */
	for (let i = 0; i < files.length; i++){
		$("#" + files.charAt(i) + "1").append('<div class="coord-col"></div>');
		$("#" + files.charAt(i) + "1")
			.children(".coord-col")
			.text(files.charAt(i))
		$(".coord-col").css({
				"position": "absolute",
				"transform": "translateY("+ offset.toString() + "px)",
				"font-size": fontSize,
			});
	}
	/* coord-row */
	for (let i = 0; i < 8; i++){
		$("#h" + (i+1).toString()).append('<div class="coord-row"></div>');
		$("#h" + (i+1).toString())
			.children(".coord-row")
			.text((i+1).toString())
		$(".coord-row").css({
				"position": "absolute",
				"transform": "translateX("+ offset.toString() + "px)",
				"font-size": fontSize,
			});
	}
}
function createChessBoard(width, height, showBoardCoords, showBorder, showWhoseMove, borderType){
	$('<div id="chessboard"></div>').appendTo("#image-display");
	$('#chessboard').css({
		"margin": "auto",
		"width": width,
		"height": height,
	});
	if(showBorder){
			$('#chessboard').css({
				"border": borderType + " 2px black",
			});
	}

	$('<div id="square-prototype"></div>').appendTo("#chessboard");
	const files = "abcdefgh";
	const numFiles = 8;
	const numRanks = 8;
	for(let i = 0; i < numRanks; i++){
		for(let j = 0; j < numFiles; j++){
			let idStr = files.charAt(j)+(numFiles - i).toString();
			let colorPref = (i+j)%2 == 0 ? colors[0] : colors[1];
			let colorNotPref = (i+j)%2 == 0 ? colors[1] : colors[0];
			$("#square-prototype")
				.clone()
				.attr("id", idStr)
				.attr("class", "square")
				.css({
					"display":"flex",
					"flex-direction":"row",
					"align-items":"center",
					"justify-content":"center",
					"background-color": colorPref,
					"min-width": $("#chessboard").innerWidth()/8,
					"min-height": $("#chessboard").innerHeight()/8,
					"color": colorNotPref,
					"font-size": "12px",
				})
				.appendTo("#chessboard");	
		}
	}
	$("#square-prototype").remove();

	if(showBoardCoords){
		showBoardCoordsFunc(width, height);
	}

	if(showWhoseMove){
		showNextMoveColor();
	}
}
function getPieceLocFromFEN(fen){
	let locObj = {
		white: [],
		black: []
	};
	const mainField = fen.split(' ')[0];
	const ranks = mainField.split('/');
	const lowP = "rnbqkp";
	const highP = lowP.toUpperCase();

	for(let rankIdx = 8; rankIdx >= 1; rankIdx--){
		let ranksArr = ranks[8-rankIdx].split('');
		let fileIdx = 1;
		for(let ranksArrIdx = 0; ranksArrIdx < ranksArr.length; ranksArrIdx++){
			if(lowP.indexOf(ranksArr[ranksArrIdx]) >= 0){
				locObj.black.push([fileIdx, rankIdx, ranksArr[ranksArrIdx]]);
				fileIdx++;
			}
			else if(highP.indexOf(ranksArr[ranksArrIdx]) >= 0){
				locObj.white.push([fileIdx, rankIdx, ranksArr[ranksArrIdx]]);
				fileIdx++;
			}
			else
				fileIdx += parseInt(ranksArr[ranksArrIdx]);
		}
	}
	//console.log(locObj);
	return locObj;
}
function updatePiecesArrToBoardCoords(obj){
	const coordMap = "abcdefgh";
	let newArr = [ [], [] ];
	const wLen = obj.white.length;
	const bLen = obj.black.length;
	for(let i = 0; i < wLen; i++){
		let removedIdx = obj.white.shift();
		newArr[0].push("" + removedIdx[2] + coordMap.charAt(removedIdx[0]-1) + removedIdx[1]);
	}
	for(let i = 0; i < bLen; i++){
		let removedIdx = obj.black.shift();
		newArr[1].push("" + removedIdx[2] + coordMap.charAt(removedIdx[0]-1) + removedIdx[1]);
	}
	return newArr;
}
function createPieces(){
	let fen = $("#fen-field").val() == '' ? $("#fen-field").attr('placeholder') : $("#fen-field").val();
	if(!validateFEN(fen)){
		$("#submit-button").text("Enter a valid FEN!");	
	}
	else{
		$("#submit-button").text("Convert FEN");	
		if($("#fen-field").val() == '')
			fen = $("#fen-field").attr('placeholder');
		else
			fen = $("#fen-field").val();
		let piecesObj = getPieceLocFromFEN(fen);
		let arr = updatePiecesArrToBoardCoords(piecesObj);
		for(let i = 0; i < arr.length; i++){
			for(let j = 0; j < arr[i].length; j++){
				let filePathStr = "assets/pieces/";
				if((/^[A-Z]/).test(arr[i][j].charAt(0)))
					filePathStr += 'w';	
				else
					filePathStr += 'b';
				filePathStr += arr[i][j].charAt(0).toLowerCase() + ".svg";
				let imgStr = '<img src=' + filePathStr + ' alt=""' + ' id=' + arr[i][j].slice(1) + '-piece></img>';
				//console.log(imgStr);
				let pieceWidth = $("#chessboard").innerWidth()/10;
				let pieceHeight = $("#chessboard").innerHeight()/10;
				$('#'+arr[i][j].slice(1,3)).append(imgStr);
				$('#'+arr[i][j].slice(1,3)+'-piece').css({
					"display":"relative",
					"width": pieceWidth,
					"height": pieceHeight,
					"z-index":2,
				});
				$('#'+arr[i][j].slice(1,3)+'-piece').addClass("piece");
			}
		}
	}
}
function removeChessBoard(){
	$("#image-display").children().remove();
}

$(document).ready(() => {
	let boardWidth = $("#board-width").val();
	let boardHeight = $("#board-height").val();
	let showBoardCoords = $("#show-board-coords").prop("checked");
	let showBorder = $("#show-border").prop("checked");
	let showWhoseMove = $("#show-whose-move").prop("checked");
	let borderType = $("#border-type").val();
	createChessBoard(boardWidth, boardHeight, showBoardCoords, showBorder, showWhoseMove, borderType);
	createPieces();
	function resetBoard(){
		removeChessBoard();
		createChessBoard(boardWidth, boardHeight, showBoardCoords, showBorder, showWhoseMove, borderType);
		createPieces();
	}
	/* Enter press event */
	$(document).on('keypress',function(e) {
	    if(e.which == 13) {
				boardWidth = $("#board-width").val();
				boardHeight = $("#board-height").val();
				resetBoard();
	    }
	});
	/* activate upon change of any properties */
	$("#show-border").click( ()=>{
		showBorder = $("#show-border").prop("checked");
		resetBoard();
	});
	$("#show-whose-move").click( ()=>{
		showWhoseMove = $("#show-whose-move").prop("checked");
		resetBoard();
	});
	$("#show-board-coords").click( ()=>{
		showBoardCoords = $("#show-board-coords").prop("checked");
		resetBoard();
	});
	$("#border-type").change( ()=>{
		borderType = $("#border-type").val();
		resetBoard();
	});
	$("#submit-button").click( ()=>{
		resetBoard();
	});
	$("#flip-board").click( ()=>{
		resetBoard();
		let offsetW  = $("#a1").innerWidth()/2.75;
		let offsetH  = $("#a1").innerHeight()/2.75;
		let flipOffsetW  = $("#chessboard").innerWidth() - $("#a1").innerWidth()/1.65;
		let flipOffsetH  = $("#chessboard").innerHeight() - $("#a1").innerHeight()/1.65;
		if($("#flip-board").prop("checked")){
			$("#chessboard").css("transform","rotateZ(180deg)");
			$(".piece").css("transform","rotateZ(180deg)");
			$(".coord-col").css({"transform":"rotateZ(180deg) translateY("+flipOffsetH.toString()+"px)","color":"black"});
			$(".coord-row").css({"transform":"rotateZ(180deg) translateX("+flipOffsetW.toString()+"px)","color":"black"});
		}
		else{
			$("#chessboard").css("transform","rotateZ(0deg)");
			$(".piece").css("transform","rotateZ(0deg)");
			$(".coord-col").css("transform","rotateZ(0deg) translateY("+offsetH.toString()+"px)");
			$(".coord-row").css("transform","rotateZ(0deg) translateX("+offsetW.toString()+"px)");
		}
	});
});
