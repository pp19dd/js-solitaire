
function Card() {
    this.flipped = true;
    this.num = 0; // 0 - 12
    this.suit = 0; // 0-s  1-d  2-c   3-h
}

Card.prototype.flip = function() {
    this.flipped = !this.flipped;

    if( this.flipped === false ) {
        this.div.classList.remove("flipped");
        this.div.draggable = "true";
    } else {
        this.div.classList.add("flipped");
        this.div.draggable = "false";
    }

    var that = this;
    this.div.addEventListener("dragstart", function(e) {
        if( game_over ) return;

        e.dataTransfer.setData("text/html", that.div);
        dragged = that.div;
    });
}

Card.prototype.getPosition = function() {
    var cards = __e(".card", this.div.parentNode);
    var my_card = false;
    for( var i = 0; i < cards.length; i++ ) {
        if( cards[i].isSameNode(this.div) ) my_card = i + 1;
    }
    return({
        self: my_card,
        column: this.div.parentNode,
        cards: cards
    });
}

Card.prototype.checkWin = function() {
    var card_count = __e(".cards-removed .card");
    if( card_count.length === 52 ) {
        game_win();
    }
}

Card.prototype.afterDrop4 = function(destination_col, pos) {

    // now this is just lazy programming
    // if move reveals a hidden card, flip it over
    try {
        pos.cards[pos.self-2].click();
    } catch( e ) {

    }

    this.checkWin();
}

Card.prototype.afterDrop7 = function(destination_col, pos) {

    // now this is just lazy programming
    // if move reveals a hidden card, flip it over
    try {
        pos.cards[pos.self-2].click();
    } catch( e ) {
        // console.warn( e );
    }

    // forgot no one
    if( pos.self === pos.cards.length ) {
        this.checkWin();
        return;
    }

    // erm, forgot ones below
    for( var i = pos.self; i < pos.cards.length; i++ ) {
        destination_col.append(pos.cards[i]);
    }

    // now this is just lazy programming
    // if move reveals a hidden card, flip it over
    try {
        pos.cards[pos.self-2].click();
    } catch( e ) {
        // console.info( e );
    }

    this.checkWin();
}

// setTimeout(function() {
//     a.__entity.flip();
// }), i * 250;

Card.prototype.nannyGetFreeCol = function(selector) {
    var cols = __e(selector);
    free_col = -1;
    for( var i = cols.length; i >= 0; i-- ) {
        var cards = __e(".card", cols[i]);
        if( cards.length === 0 ) free_col = i;
    }
    return({
        num: free_col,
        node: cols[free_col]
    });
}

Card.prototype.nannyGetLastCards = function(selector) {
    var ret = [];

    // var cols = __e(".cards-removed .card-column, .cards-table .card-column");
    var cols = __e(selector);

    for( var i = 0; i < cols.length; i++ ) {
        var cards = __e(".card", cols[i]);
        if( cards.length === 0 ) continue;

        var last = cards[cards.length-1];
        ret.push({
            col: cols[i],
            card: last
        });
    }

    return( ret );
}

Card.prototype.nannyClickTop = function() {

    // ace!
    if( this.num === 0 ) {
        var free_col = this.nannyGetFreeCol(".cards-removed .card-column");
        var pos = this.getPosition();
        free_col.node.append(this.div);
        this.afterDrop4(free_col, pos);
        sound_play("sound_ok");
        return( free_col.node );
    }

    // can we stack it up top?
    var possibilities = this.nannyGetLastCards(".cards-removed .card-column");
    for( var i = 0; i < possibilities.length; i++ ) {
        if( this.canDrop4([possibilities[i].card]) ) {
            var pos = this.getPosition();
            possibilities[i].col.append( this.div );
            this.afterDrop4(possibilities[i].col, pos);
            sound_play("sound_ok");
            return( possibilities[i].col );
        }
    }
}

Card.prototype.getNannyClick = function() {

    // sigh who are we and what can we do

    // ace!
    if( this.num === 0 ) {
        var free_col = this.nannyGetFreeCol(".cards-removed .card-column");
        // free_col.node.append(this.div);
        return( free_col.node );
    }

    // can we stack it up top?
    var possibilities = this.nannyGetLastCards(".cards-removed .card-column");
    for( var i = 0; i < possibilities.length; i++ ) {
        if( this.canDrop4([possibilities[i].card]) ) {
            var pos = this.getPosition();
            // possibilities[i].col.append( this.div );
            // this.afterDrop4(possibilities[i].col, pos);

            return( possibilities[i].col );
        }
    }

    // can we stack it up on pyramid?
    var possibilities = this.nannyGetLastCards(".cards-table .card-column");
    for( var i = 0; i < possibilities.length; i++ ) {

        if( this.canDrop7([possibilities[i].card]) ) {
            var pos = this.getPosition();
            // possibilities[i].col.append( this.div );
            // this.afterDrop7(possibilities[i].col, pos);
            return( possibilities[i].col );
        }
    }

    return( false );
}

Card.prototype.hint = function(show) {
    var moves = this.getNannyClick();
    if( show === false ) {
        __e(".card-column", function(e) {
            e.classList.remove("hint");
        });
        //moves.classList.remove("hint");
        return;
    }

    if( moves === false ) return;
    if( moves.length === 0 ) return;

    moves.classList.add("hint");
}

Card.prototype.clicked = function() {
    if( this.flipped === false ) {
        // make sure we're the bottom card
        var pos = this.getPosition();
        if( pos.self !== pos.cards.length ) return;
        this.nannyClickTop();
        return;
    }

    var dest = __e(".cards-stacked .card-column");
    var deck = __e(".cards-available .card-column");
    var pos = this.getPosition();

    // dish 3 cards out
    if( deck[0].isSameNode(pos.column) ) {
        lay_3_cards();
        sound_play("sound_3more");
        return false;
        // for( var i = 0; i < 3; i++ ) {
        //     try {
        //         var c = pos.cards[pos.self - i - 1 ];
        //         if( typeof c != "undefined" ) {
        //             dest[0].append(c);
        //         }
        //         c.__entity.flip();

        //     } catch( e ) {

        //     }
        // }
        // this.sound_3more.play();
        // return false;
    }

    // not the very last card on column
    if( pos.self !== pos.cards.length ) return( false );

    // are we in the bottom or top?


    this.flip();

}

Card.prototype.getColor = function() {
    if( this.suit % 2 ) return( "red" );
    return( "black" );
}

// 7 = lower 7 cols
Card.prototype.canDrop7 = function(uppers) {

    // can only drop a king on empty column
    if( uppers.length === 0 ) {
        if( this.num === 12 ) return( true );
        return( false );
    }

    // rest of rules assume there are cards underneath
    var on_card = uppers[uppers.length-1].__entity;

    // card is not yet flipped, how would you know?
    if( on_card.flipped === true ) return( false );

    // same color, so no
    if( this.getColor() === on_card.getColor() ) return( false );

    // top card needs to be bigger by one
    if( this.num + 1 != on_card.num ) return( false );

    return( true );
}

// 4 = upper 4 cols
Card.prototype.canDrop4 = function(uppers) {

    // bug: can't drop this if there are cards underneath
    // FIXME: ???

    // can only drop an ace on empty column
    if( uppers.length === 0 ) {
        if( this.num === 0 ) return( true );
        return( false );
    }

    // rest of rules assume there are cards underneath
    var on_card = uppers[uppers.length-1].__entity;

    // can only drop same suit
    if( on_card.suit !== this.suit ) return( false );

    // top card needs to be bigger by one
    if( on_card.num + 1 != this.num ) return( false );

    return( true );
}

Card.prototype.draw = function() {
    this.div = document.createElement("div");
    var sym = document.createElement("div");
    var sym2 = document.createElement("div");

    this.div.classList.add("card");
    this.div.classList.add("flipped");

    var suits = [ "spade", "heart", "club", "diamond" ];
    var suits_s = [ "&spades;", "&hearts;", "&clubs;", "&diams;" ];

    this.div.classList.add("suit-" + suits[this.suit]);
    this.sym = this.num + 1;
    switch( this.num + 1 ) {
        case 1: this.sym = "A"; break;
        case 11: this.sym = "J"; break;
        case 12: this.sym = "Q"; break;
        case 13: this.sym = "K"; break;
    }

    this.div.classList.add("card-" + this.sym);
    sym.innerHTML = this.sym;
    sym2.innerHTML = suits_s[this.suit];
    sym2.classList.add("icon");
    var anchor = __e(".cards-available .card-column")[0];

    this.div.appendChild(sym);
    this.div.appendChild(sym2);

    this.div.__entity = this;

    var that = this;
    // this.div.addEventListener("touchstart", function(e) {
    //     touching = true;
    //     e.preventDefault();
    //     // console.info( "TAP" );
    //     // that.clicked();
    // });
    // this.div.addEventListener("touchend", function(e) {
    //     touching = false;
    //     e.preventDefault();
    //     console.info( "TAP" );
    //     that.clicked();
    // });
    this.div.addEventListener("click", function(e) {
        if( game_over ) return;
        // if( touching ) return;
        // console.info( "CLICK" );
        that.clicked();
    });
    // this.div.addEventListener("mouseover", function(e) {
    //     that.hint(true);
    // });
    // this.div.addEventListener("mouseout", function(e) {
    //     that.hint(false);
    // });

    anchor.appendChild(this.div);
}
