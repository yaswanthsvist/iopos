// opt_wrap is a boolean: True means that a callback-based wrapper for the promise-based function
// should be created.
exports = module.exports = {
    raw:{}
}
function addModuleProperty(module, symbol, modulePath, opt_wrap, opt_obj) {
    var val = null;
    if (opt_wrap) {
        module.exports[symbol] = function() {
            val = val || module.require(modulePath);
            if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
                // If args exist and the last one is a function, it's the callback.
                var args = Array.prototype.slice.call(arguments);
                var cb = args.pop();
                val.apply(module.exports, args).done(function(result) { cb(undefined, result); }, cb);
            } else {
                val.apply(module.exports, arguments).done(null, function(err) { throw err; });
            }
        };
    } else {
        Object.defineProperty(opt_obj || module.exports, symbol, {
            get : function() { val = val || module.require(modulePath); return val; },
            set : function(v) { val = v; }
        });
    }

    // Add the module.raw.foo as well.
    if(module.exports.raw) {
        Object.defineProperty(module.exports.raw, symbol, {
            get : function() { val = val || module.require(modulePath); return val; },
            set : function(v) { val = v; }
        });
    }
}

// Each of these APIs takes a final parameter that is a callback function.
// The callback is passed the error object upon failure, or undefined upon success.
// To use a promise instead, call the APIs via cordova.raw.FOO(), which returns
// a promise instead of using a final-parameter-callback.
addModuleProperty(module, 'db', './db/');
addModuleProperty(module, 'inventory', './inventory');
addModuleProperty(module, 'location', './location');
//addModuleProperty(module, 'order', './order');
addModuleProperty(module, 'product', './product/');
//addModuleProperty(module, 'shop', './shop');
//addModuleProperty(module, 'transaction', './transaction');
addModuleProperty(module, 'user', './user/');
