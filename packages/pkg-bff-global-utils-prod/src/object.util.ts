export function isPlainObject function (obj) {
	return Object.prototype.toString.call(obj) === '[object Object]';
};