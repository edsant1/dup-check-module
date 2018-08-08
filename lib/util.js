
exports.isObject = function(value){
    return value === Object(value) && !Array.isArray(value);
}

exports.isString = function(value) {
    return (typeof value) == 'string' || (typeof value == 'object' && value != null && !Array.isArray(value));
}

exports.isNumber = function(value){
    return !isNaN(value);
}

exports.isEmpty = function(value){
    return value.length === 0;
}