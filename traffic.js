function red() {
    console.log('red');
}

function green() {
    console.log('green');
}

function yellow() {
    console.log('yellow');
}

var tic = function( time, cb ) {
    return new Promise( ( resolve, reject ) => {
        setTimeout( function() {
	    cb();
	    resolve();
	}, time );
    } );
};

var d = new Promise( ( resolve, reject ) => {
    resolve();
} );

let circle = 0;

var step = function( def ) {
    def.then( function() {
        return tic( 1000, red );
    } ).then( function() {
        return tic( 1000, green );
    } ).then( function() {
        return tic( 1000, yellow )
    }).then( function() {
        circle = circle + 1;
        if( circle < 2 ) {
            step(def);
        }
    });

};

step(d);
