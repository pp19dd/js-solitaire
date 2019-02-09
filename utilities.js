
// generic query and iterator
function __e(selector, node, delta) {
    var ret;

    if( typeof node === "object" ) {
        ret = node.querySelectorAll(selector);
    } else {
        ret = document.querySelectorAll(selector);
    }

    function __e_iterate(nodes, fname) {
        for( var i = 0; i < nodes.length; i++ ) {
            fname(nodes[i], i, nodes.length);
        }
    }

    if( typeof node === "function" ) __e_iterate(ret, node);
    if( typeof delta === "function" ) __e_iterate(ret, delta);

    return( Array.from(ret) );
}


function shuffle(arr, times) {
    function move(arr, fromIndex, toIndex) {
        var element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    }
    for( var i = 0; i < times; i++ ) {
        var r_from = parseInt(Math.random() * arr.length);
        var r_to = parseInt(Math.random() * arr.length);
        move( arr, r_from, r_to );
    }
}
