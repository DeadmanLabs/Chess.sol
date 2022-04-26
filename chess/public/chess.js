$(document).ready(function(){
    var wRook = '<img src="chess_pieces\\Rook_White.png" class="piece">';
    let bRook = '<img src="chess_pieces\\Rook_Black.png" class="piece">';
    let wKnight = '<img src="chess_pieces\\Knight_White.png" class="piece">';
    let bKnight = '<img src="chess_pieces\\Knight_Black.png" class="piece">';
    let wBishop = '<img src="chess_pieces\\Bishop_White.png" class="piece">';
    let bBishop = '<img src="chess_pieces\\Bishop_Black.png" class="piece">';
    let wQueen = '<img src="chess_pieces\\Queen_White.png" class="piece">';
    let bQueen = '<img src="chess_pieces\\Queen_White.png" class="piece">';
    let wKing = '<img src="chess_pieces\\King_White.png" class="piece">';
    let bKing = '<img src="chess_pieces\\King_Black.png" class="piece">';
    let wPawn = '<img src="chess_pieces\\Pawn_White.png" class="piece">';
    let bPawn = '<img src="chess_pieces\\Pawn_Black.png" class="piece">';
    var pieces = [wRook, bRook, wKnight, bKnight, wBishop, bBishop, wQueen, bQueen, wKing, bKing, wPawn, bPawn];

    $(function() {
        $("td").click(function() {
            switch(this.innerHTML){
                case wRook:
                    alert(this.id);
                    break;
                case bPawn:
                    movePawn(this, this.id)
            }
        });
    });

    function movePawn(square, position){
        let col = position[0];
        let row = position[1];
        let firstMove = false;
        if(row == 7 || row == 2){
            firstMove = true;
        }
        if(firstMove){
            $("#" + col + row).html("k");
        }
        //square.innerHTML = ("");
    }
});