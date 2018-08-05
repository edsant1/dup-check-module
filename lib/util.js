
exports.isObject = function(value){
    return value === Object(value) && !Array.isArray(value);
}

exports.isString = function(value) {
    return (typeof value) == 'string' || (type == 'object' && value != null && !Array.isArray(value));
}

exports.isNumber = function(value){
    return !isNaN(value);
}