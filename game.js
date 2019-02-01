
var dragged;
var all_cards = [];
var sounds = {};
var reset_available_cards_on_click = false;
var touching = false;
var game_over = false;
var muted;
var end_game_interval;

function sound_init() {
    sounds.sound_ok = new Audio('assets/win.wav');
    sounds.sound_jump = new Audio('assets/jump.wav');
    /* sounds.sound_explosion = new Audio('assets/explosion.wav'); */
    sounds.sound_powerup = new Audio('assets/powerup.wav');
    sounds.sound_3more = new Audio('assets/3more.wav');
}

function sound_play(sound) {
    if( muted ) return;

    sounds[sound].play();
}

function game_win() {
    game_over = true;

    __e(".card", function(e, index) {
        e.__x = 0; e.__y = 0; e.__r = 0;
        e.__dx = (Math.random() * 2) - 1;
        e.__dy = (Math.random() * 2) - 1;
        e.__dr = (Math.random() * 2) - 1;
    });

    end_game_interval = setInterval(function() {
        __e(".card", function(e, index) {

            e.__x += e.__dx;
            e.__y += e.__dy;
            e.__r += e.__dr;

            if( e.__r < 0 ) e.__r += 360;
            if( e.__r > 360 ) e.__r -= 360;

            var x = e.__x;
            var y = e.__y;
            e.style.left = x + "px";
            e.style.top = y + "px";
            e.style.transform = "rotate(" + e.__r + "deg)";
        });
    }, 10);
}

// setTimeout(function() {
//     game_win();
// }, 200);

function create_deck() {
    for( var i = 0; i < 13; i++ ) {
        for( var s = 0; s < 4; s++ ) {
            var temp = new Card();
            temp.num = i;
            temp.suit = s;
            all_cards.push( temp );
        }
    }
}

// take off the top and place wherever
function place_card(stack_div) {
    var c = __e(".cards-available .card");
    if( c.length === 0 ) return( false );

    var last = c[c.length-1];

    stack_div.append(last);
    return( last );
}


function lay_starting_cards() {

    // start with a pyramid of stacked cards
    for( var i = 0; i < 7; i++ ) {

        var stack = __e(".cards-table .card-column")[i];

        // place this many cards in each stack
        var last;
        for( var j = 0; j < i + 1; j++ ) {
            last = place_card(stack);
        }

        last.__entity.flip();
    }

    // put 3 on the table to start
    // lay_3_cards();
}

function lay_3_cards() {
    var destination = __e(".cards-stacked .card-column")[0];

    for( var i = 0; i < 3; i++ )(function(delay_num) {
        var a = place_card(destination);
        if( a !== false ) {
            setTimeout( function() {
                a.__entity.flip();
            }, delay_num);
        }
    })(i * 33);
}

function setup_options() {

    var links = __e(".nav a");

    function mute() {
        links[0].innerHTML = "&#x2611; Mute";
        localStorage["js-solitaire-muted"] = "yes";
        muted = true;
    }

    function unmute() {
        muted = false;
        links[0].innerHTML = "&#x2610; Mute";
        localStorage["js-solitaire-muted"] = "no";
    }

    // first load, set storage
    if( typeof localStorage["js-solitaire-muted"] == "undefined" ) {
        unmute();
    }

    // apply setting
    if( localStorage["js-solitaire-muted"] == "yes" ) {
        mute();
    } else {
        unmute();
    }

    links[0].addEventListener("click", function(e) {
        if( muted ) {
            unmute();
        } else {
            mute();
        }
        e.preventDefault();
    });

    links[1].addEventListener("click", function(e) {
        game_reset();
        e.preventDefault();
    });
}

function game_reset() {
    clearInterval(end_game_interval);
    game_over = false;

    __e(".card", function(e) {
        e.remove();
    });
    all_cards = [];

    create_deck();
    shuffle(all_cards);
    for( var i = 0; i < all_cards.length; i++ ) {
        all_cards[i].draw();
    }
    lay_starting_cards();
}

function setup() {

    sound_init();
    create_deck();
    setup_options();

    // shuffle it
    shuffle(all_cards);
    for( var i = 0; i < all_cards.length; i++ ) {
        all_cards[i].draw();
    }

    lay_starting_cards();

    __e(".cards-table .card-column", function(col, index) {
        col.addEventListener("dragover", function(e) {
            if( game_over ) return;

            e.preventDefault();
            return(false);
        });

        col.addEventListener("drop", function(e) {
            if( game_over ) return;

            var uppers = __e(".card",col);
            var lower = dragged;
            var pos = dragged.__entity.getPosition();

            var can_drop = lower.__entity.canDrop7(uppers);
            if( can_drop === false ) return;

            col.append( dragged );

            dragged.__entity.afterDrop7(col, pos);

            // if old column is empty, not a good sign
            var count_cards = __e(".card", pos.column);

            switch( count_cards.length ) {
                // case 0: sounds.sound_explosion.play(); break;
                case 1: sound_play("sound_powerup"); break;
                default: sound_play("sound_jump"); break;
            }

            dragged = null;
        });
    });

    __e(".cards-removed .card-column", function(col, index) {
        col.addEventListener("dragover", function(e) {
            if( game_over ) return;

            e.preventDefault();
            return(false);
        });

        col.addEventListener("drop", function(e) {
            if( game_over ) return;

            var uppers = __e(".card", col);
            var lower = dragged;
            var pos = dragged.__entity.getPosition();

            var can_drop = lower.__entity.canDrop4(uppers);
            if( can_drop === false ) return;

            col.append( dragged );
            sound_play("sound_ok");
            dragged.__entity.afterDrop4(col, pos);
        });
    });


    var right_col = __e(".cards-available .card-column")[0];
    right_col.addEventListener("click", function() {
        if( game_over ) return;

        if( reset_available_cards_on_click === true ) {

            // try reverse?
            // __e(".cards-stacked .card", function(e) {
            //     right_col.append(e);
            //     e.__entity.flip();
            // });
            var r_cards = __e(".cards-stacked .card");
            for( var i = r_cards.length-1; i >= 0; i-- ) {
                right_col.append(r_cards[i]);
                r_cards[i].__entity.flip();
            }

            reset_available_cards_on_click = false;
            sound_play("sound_3more");
            lay_3_cards();
        }

        var card_count = __e(".cards-available .card-column .card");
        if( card_count.length !== 0 ) {
            reset_available_cards_on_click = false;

            return;
        }

        reset_available_cards_on_click = true;

        // __e(".cards-available .card", function(e) {
        //     right_col.append(e);
        //     e.__entity.flip();
        // });

    });

}
